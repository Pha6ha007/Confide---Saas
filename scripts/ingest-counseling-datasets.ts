#!/usr/bin/env node
/**
 * Confide — Counsel-Chat Dataset Ingestion Script
 *
 * Downloads the nbertagnolli/counsel-chat dataset from HuggingFace
 * and ingests Q&A pairs into Pinecone `counseling_qa` namespace.
 *
 * Usage:
 *   npx tsx scripts/ingest-counseling-datasets.ts
 *
 * Options:
 *   --min-upvotes=N   Minimum upvotes to include (default: 1)
 *   --dry-run         Parse and show stats without uploading
 */

// IMPORTANT: Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import https from 'https'
import http from 'http'
import OpenAI from 'openai'
import { getPineconeIndex, NAMESPACES } from '../lib/pinecone/client'
import { PrismaClient } from '@prisma/client'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const prisma = new PrismaClient()

const EMBEDDING_MODEL = 'text-embedding-3-small'
const NAMESPACE = NAMESPACES.COUNSELING_QA
const DATASET_URL =
  'https://huggingface.co/datasets/nbertagnolli/counsel-chat/resolve/main/20200325_counsel_chat.csv'

interface CounselChatRow {
  questionID: string
  questionTitle: string
  questionText: string
  questionLink: string
  topic: string
  therapistInfo: string
  therapistURL: string
  answerText: string
  upvotes: number
  split: string
}

interface QAChunk {
  id: string
  text: string
  metadata: {
    questionID: string
    topic: string
    therapistInfo: string
    upvotes: number
    source: string
  }
}

/**
 * Parse CLI arguments
 */
function parseArgs(): { minUpvotes: number; dryRun: boolean } {
  const args = process.argv.slice(2)
  let minUpvotes = 1
  let dryRun = false

  for (const arg of args) {
    if (arg.startsWith('--min-upvotes=')) {
      minUpvotes = parseInt(arg.split('=')[1], 10)
    }
    if (arg === '--dry-run') {
      dryRun = true
    }
  }

  return { minUpvotes, dryRun }
}

/**
 * Download file from URL, following redirects
 */
function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const handler = (response: http.IncomingMessage) => {
      // Follow redirects (HuggingFace uses 302)
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }

      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      response.on('error', reject)
    }

    const client = url.startsWith('https') ? https : http
    client.get(url, handler).on('error', reject)
  })
}

/**
 * Parse CSV content into rows.
 * Handles quoted fields with commas and newlines inside quotes.
 */
function parseCSV(content: string): CounselChatRow[] {
  const rows: CounselChatRow[] = []
  const lines = content.split('\n')

  // Parse header to get column indices
  const header = parseCSVLine(lines[0])
  const colIndex: Record<string, number> = {}
  header.forEach((col, i) => {
    colIndex[col.trim()] = i
  })

  // Validate expected columns
  const requiredCols = ['questionID', 'questionTitle', 'questionText', 'topic', 'therapistInfo', 'answerText', 'upvotes']
  for (const col of requiredCols) {
    if (!(col in colIndex)) {
      throw new Error(`Missing required column: ${col}. Found columns: ${header.join(', ')}`)
    }
  }

  // Parse data rows — handle multi-line quoted fields
  let currentLine = ''
  let inQuotedField = false

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    if (!inQuotedField) {
      currentLine = line
    } else {
      currentLine += '\n' + line
    }

    // Count unescaped quotes to determine if we're still in a quoted field
    const quoteCount = (currentLine.match(/"/g) || []).length
    inQuotedField = quoteCount % 2 !== 0

    if (!inQuotedField && currentLine.trim()) {
      try {
        const fields = parseCSVLine(currentLine)
        if (fields.length >= requiredCols.length) {
          const row: CounselChatRow = {
            questionID: fields[colIndex['questionID']]?.trim() || '',
            questionTitle: fields[colIndex['questionTitle']]?.trim() || '',
            questionText: fields[colIndex['questionText']]?.trim() || '',
            questionLink: fields[colIndex['questionLink']]?.trim() || '',
            topic: fields[colIndex['topic']]?.trim() || '',
            therapistInfo: fields[colIndex['therapistInfo']]?.trim() || '',
            therapistURL: fields[colIndex['therapistURL']]?.trim() || '',
            answerText: fields[colIndex['answerText']]?.trim() || '',
            upvotes: parseInt(fields[colIndex['upvotes']]?.trim() || '0', 10) || 0,
            split: fields[colIndex['split']]?.trim() || '',
          }

          if (row.questionID && row.answerText) {
            rows.push(row)
          }
        }
      } catch {
        // Skip malformed rows
      }
      currentLine = ''
    }
  }

  return rows
}

/**
 * Parse a single CSV line into fields, handling quoted values.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }

  fields.push(current)
  return fields
}

/**
 * Build a Q&A chunk from a dataset row.
 * Each chunk is a self-contained question + therapist answer.
 */
function buildChunk(row: CounselChatRow, index: number): QAChunk {
  const questionPart = row.questionTitle
    ? `Question: ${row.questionTitle}\n${row.questionText}`
    : `Question: ${row.questionText}`

  const answerPart = `Therapist Answer: ${row.answerText}`

  const text = `${questionPart}\n\n${answerPart}`

  const id = `${NAMESPACE}_q${row.questionID}_chunk_${index}`

  return {
    id,
    text,
    metadata: {
      questionID: row.questionID,
      topic: row.topic || 'general',
      therapistInfo: row.therapistInfo || 'Unknown Therapist',
      upvotes: row.upvotes,
      source: 'counsel-chat',
    },
  }
}

/**
 * Check if a Q&A chunk is too short or junk
 */
function isJunkChunk(chunk: QAChunk): boolean {
  // Skip if answer is too short (< 50 chars = not useful)
  if (chunk.text.length < 100) return true

  // Skip if answer is essentially empty
  const answerPart = chunk.text.split('Therapist Answer:')[1]?.trim()
  if (!answerPart || answerPart.length < 30) return true

  return false
}

/**
 * Create embeddings in batches
 */
async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const batchSize = 100
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    console.log(`   Creating embeddings for chunks ${i + 1}-${Math.min(i + batchSize, texts.length)}...`)

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    })

    embeddings.push(...response.data.map((d) => d.embedding))
  }

  return embeddings
}

/**
 * Main ingestion function
 */
async function ingestCounselChat() {
  console.log('🚀 Confide — Counsel-Chat Dataset Ingestion\n')

  const { minUpvotes, dryRun } = parseArgs()

  console.log(`📊 Settings:`)
  console.log(`   Min upvotes: ${minUpvotes}`)
  console.log(`   Dry run: ${dryRun}`)
  console.log(`   Namespace: ${NAMESPACE}`)
  console.log()

  // 1. Download dataset from HuggingFace
  console.log('📥 Downloading counsel-chat dataset from HuggingFace...')
  const csvContent = await downloadFile(DATASET_URL)
  console.log(`   ✓ Downloaded ${(csvContent.length / 1024).toFixed(1)} KB`)
  console.log()

  // 2. Parse CSV
  console.log('📋 Parsing CSV...')
  const allRows = parseCSV(csvContent)
  console.log(`   Total rows: ${allRows.length}`)

  // 3. Filter by upvotes
  const filteredRows = allRows.filter((row) => row.upvotes >= minUpvotes)
  console.log(`   After upvotes >= ${minUpvotes} filter: ${filteredRows.length}`)

  // 4. Show topic distribution
  const topicCounts: Record<string, number> = {}
  filteredRows.forEach((row) => {
    const topic = row.topic || 'unknown'
    topicCounts[topic] = (topicCounts[topic] || 0) + 1
  })
  console.log(`\n   📊 Topic distribution:`)
  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([topic, count]) => {
      console.log(`      ${topic}: ${count}`)
    })
  console.log()

  // 5. Build chunks (each Q&A pair is one chunk)
  console.log('✂️  Building Q&A chunks...')
  const allChunks: QAChunk[] = []
  let junkCount = 0

  filteredRows.forEach((row, index) => {
    const chunk = buildChunk(row, index)
    if (isJunkChunk(chunk)) {
      junkCount++
    } else {
      allChunks.push(chunk)
    }
  })

  console.log(`   Total chunks: ${allChunks.length}`)
  console.log(`   Filtered junk: ${junkCount}`)
  console.log()

  if (dryRun) {
    console.log('🔍 DRY RUN — showing sample chunks:\n')
    allChunks.slice(0, 3).forEach((chunk, i) => {
      console.log(`--- Chunk ${i + 1} ---`)
      console.log(`ID: ${chunk.id}`)
      console.log(`Topic: ${chunk.metadata.topic}`)
      console.log(`Upvotes: ${chunk.metadata.upvotes}`)
      console.log(`Text (first 200 chars): ${chunk.text.slice(0, 200)}...`)
      console.log()
    })
    console.log('✅ Dry run complete. Remove --dry-run to ingest.')
    await prisma.$disconnect()
    return
  }

  // 6. Check for duplicates
  console.log('🔍 Checking for duplicates...')
  const existingCount = await prisma.knowledgeBase.count({
    where: {
      namespace: NAMESPACE,
      sourceTitle: 'Counsel-Chat Dataset',
    },
  })

  if (existingCount > 0) {
    console.log(`⚠️  Warning: ${existingCount} entries already exist for counsel-chat in database`)
    console.log(`   This will ADD duplicate vectors to Pinecone!`)
    console.log(`   Press Ctrl+C to cancel or wait 5 seconds to continue...\n`)
    await new Promise((resolve) => setTimeout(resolve, 5000))
  } else {
    console.log('   ✓ No duplicates found')
    console.log()
  }

  // 7. Create embeddings
  console.log('🔢 Creating embeddings...')
  const embeddings = await createEmbeddings(allChunks.map((c) => c.text))
  console.log(`   ✓ Created ${embeddings.length} embeddings`)
  console.log()

  // 8. Upload to Pinecone
  console.log('☁️  Uploading to Pinecone...')
  const index = getPineconeIndex()

  const vectors = allChunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: {
      text: chunk.text,
      book_title: 'Counsel-Chat Dataset',
      author: 'Various Therapists',
      namespace: NAMESPACE,
      chunk_index: i,
      topic: chunk.metadata.topic,
      therapist_info: chunk.metadata.therapistInfo,
      upvotes: chunk.metadata.upvotes,
      question_id: chunk.metadata.questionID,
      source: 'counsel-chat',
    },
  }))

  const batchSize = 100
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize)
    await index.namespace(NAMESPACE).upsert(batch)
    console.log(`   Uploaded ${Math.min(i + batchSize, vectors.length)}/${vectors.length} vectors`)
  }

  console.log('   ✓ Upload complete')
  console.log()

  // 9. Save metadata to database
  console.log('💾 Saving metadata to database...')
  for (const chunk of allChunks) {
    await prisma.knowledgeBase.create({
      data: {
        sourceTitle: 'Counsel-Chat Dataset',
        author: 'Various Therapists',
        namespace: NAMESPACE,
        chunkIndex: allChunks.indexOf(chunk),
        pineconeId: chunk.id,
      },
    })
  }
  console.log(`   ✓ Saved ${allChunks.length} entries`)
  console.log()

  // 10. Summary
  console.log('✅ Counsel-Chat ingestion complete!')
  console.log(`📊 Summary:`)
  console.log(`   Source: nbertagnolli/counsel-chat (HuggingFace)`)
  console.log(`   Namespace: ${NAMESPACE}`)
  console.log(`   Total rows parsed: ${allRows.length}`)
  console.log(`   After upvotes filter: ${filteredRows.length}`)
  console.log(`   After junk filter: ${allChunks.length}`)
  console.log(`   Vectors uploaded: ${embeddings.length}`)
  console.log(`   Topics: ${Object.keys(topicCounts).length}`)

  await prisma.$disconnect()
}

// Run
ingestCounselChat().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
