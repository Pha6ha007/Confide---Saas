#!/usr/bin/env node
/**
 * Confide — RAG Knowledge Ingestion Script
 *
 * Загружает PDF книги в Pinecone для RAG системы
 *
 * Usage:
 *   npx tsx scripts/ingest-knowledge.ts \
 *     --file="path/to/book.pdf" \
 *     --namespace="anxiety_cbt" \
 *     --title="Feeling Good" \
 *     --author="David Burns"
 */

// IMPORTANT: Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { getPineconeIndex, NAMESPACES, type Namespace } from '../lib/pinecone/client'
import { PrismaClient } from '@prisma/client'

// pdf-parse uses CommonJS - need to import the main function
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf: (dataBuffer: Buffer) => Promise<{ text: string; numpages: number }> = require('pdf-parse')

// Инициализация клиентов
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const prisma = new PrismaClient()

const EMBEDDING_MODEL = 'text-embedding-3-small'
const CHUNK_SIZE = 800 // токенов (increased from 500 for better context)
const CHUNK_OVERLAP = 150 // токенов (increased from 50 for better continuity)

interface ChunkData {
  text: string
  index: number
}

/**
 * Парсинг аргументов командной строки
 * Улучшенная версия - корректно обрабатывает пробелы, апострофы, и специальные символы
 */
function parseArgs(): {
  filePath: string
  namespace: Namespace
  title: string
  author: string
} {
  const args = process.argv.slice(2)
  const parsed: any = {}

  args.forEach((arg) => {
    // Split only on the FIRST '=' to preserve '=' in values
    const equalIndex = arg.indexOf('=')
    if (equalIndex === -1) return

    const key = arg.substring(0, equalIndex)
    const value = arg.substring(equalIndex + 1)

    const cleanKey = key.replace(/^-+/, '')

    // Remove ONLY surrounding quotes (both " and '), preserve internal ones
    let cleanValue = value
    if (
      (cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
      (cleanValue.startsWith("'") && cleanValue.endsWith("'"))
    ) {
      cleanValue = cleanValue.slice(1, -1)
    }

    parsed[cleanKey] = cleanValue
  })

  if (!parsed.file || !parsed.namespace || !parsed.title || !parsed.author) {
    console.error('❌ Missing required arguments')
    console.log('Usage:')
    console.log('  npx tsx scripts/ingest-knowledge.ts \\')
    console.log('    --file="path/to/book.pdf" \\')
    console.log('    --namespace="anxiety_cbt" \\')
    console.log('    --title="Book Title" \\')
    console.log('    --author="Author Name"')
    console.log('\nAvailable namespaces:', Object.values(NAMESPACES).join(', '))
    process.exit(1)
  }

  // Валидация namespace
  if (!Object.values(NAMESPACES).includes(parsed.namespace)) {
    console.error(`❌ Invalid namespace: ${parsed.namespace}`)
    console.log('Available namespaces:', Object.values(NAMESPACES).join(', '))
    process.exit(1)
  }

  return {
    filePath: parsed.file,
    namespace: parsed.namespace,
    title: parsed.title,
    author: parsed.author,
  }
}

/**
 * Приблизительный подсчёт токенов (1 токен ≈ 4 символа)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Проверить является ли chunk "мусорным" (endorsements, TOC, copyright, etc.)
 * @returns true если chunk нужно пропустить
 */
function isJunkChunk(text: string): boolean {
  const lowerText = text.toLowerCase()

  // Паттерны мусорных chunks
  const junkPatterns = [
    // Endorsements / praise
    /praise for|acclaim for|what (?:people|readers|critics) are saying/i,
    /^"\s*[^"]{20,200}"\s*—\s*[A-Z]/i, // Quote with attribution (likely endorsement)
    /highly recommend|must-read|essential reading|groundbreaking work/i,

    // Table of contents
    /^contents?\s*$/i,
    /^chapter \d+/i,
    /^part [ivxlc]+:/i,
    /^\d+\.\s+[A-Z][^.]{10,50}\s+\d+$/m, // "1. Chapter Title 23"

    // "Also by" lists
    /^also by|by the same author|other books by/i,
    /^works by [a-z\s]+:/i,

    // Copyright / publication info
    /copyright ©|all rights reserved/i,
    /published by|printing history/i,
    /library of congress|isbn|cataloging-in-publication/i,
    /^\s*©\s*\d{4}/,

    // Preface boilerplate
    /^this book is dedicated to/i,
    /^about the author/i,
    /^acknowledgments?/i,

    // Index / bibliography fragments
    /^index\s*$/i,
    /^bibliography/i,
    /^references?\s*$/i,

    // Empty or too short (less than 50 chars)
    /^\s*.{0,50}\s*$/,
  ]

  // Проверить все паттерны
  for (const pattern of junkPatterns) {
    if (pattern.test(text)) {
      return true
    }
  }

  // Дополнительная проверка: слишком много заглавных букв (вероятно заголовок)
  const upperCaseRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (upperCaseRatio > 0.3 && text.length < 200) {
    return true
  }

  // Дополнительная проверка: слишком много цифр (вероятно TOC или index)
  const digitRatio = (text.match(/\d/g) || []).length / text.length
  if (digitRatio > 0.15 && text.length < 300) {
    return true
  }

  return false
}

/**
 * Разбить текст на чанки по 800 токенов с overlap 150
 */
function chunkText(text: string, chunkSize: number, overlap: number): ChunkData[] {
  const words = text.split(/\s+/)
  const chunks: ChunkData[] = []

  let currentChunk: string[] = []
  let currentTokens = 0
  let chunkIndex = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const wordTokens = estimateTokens(word)

    if (currentTokens + wordTokens > chunkSize && currentChunk.length > 0) {
      // Сохранить текущий чанк (если не мусорный)
      const chunkText = currentChunk.join(' ')

      if (!isJunkChunk(chunkText)) {
        chunks.push({
          text: chunkText,
          index: chunkIndex,
        })
        chunkIndex++
      } else {
        // Log filtered junk chunk (только первые 100 символов)
        console.log(`   [FILTERED] Junk chunk: "${chunkText.slice(0, 100)}..."`)
      }

      // Начать новый чанк с overlap
      const overlapWords = Math.floor((overlap / chunkSize) * currentChunk.length)
      currentChunk = currentChunk.slice(-overlapWords)
      currentTokens = estimateTokens(currentChunk.join(' '))
    }

    currentChunk.push(word)
    currentTokens += wordTokens
  }

  // Последний чанк
  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join(' ')

    if (!isJunkChunk(chunkText)) {
      chunks.push({
        text: chunkText,
        index: chunkIndex,
      })
    } else {
      console.log(`   [FILTERED] Junk chunk: "${chunkText.slice(0, 100)}..."`)
    }
  }

  return chunks
}

/**
 * Создать embeddings для массива текстов
 */
async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const batchSize = 100 // OpenAI limit
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
 * Основная функция загрузки
 */
async function ingestKnowledge() {
  console.log('🚀 Confide RAG Knowledge Ingestion\n')

  const { filePath, namespace, title, author } = parseArgs()

  console.log('📄 File:', filePath)
  console.log('📚 Title:', title)
  console.log('✍️  Author:', author)
  console.log('🏷️  Namespace:', namespace)
  console.log()

  // 1. Проверить что файл существует
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  // 2. Проверить дубликаты в базе данных
  console.log('🔍 Checking for duplicates...')
  const existingBook = await prisma.knowledgeBase.findFirst({
    where: {
      sourceTitle: title,
      author: author,
    },
  })

  if (existingBook) {
    const count = await prisma.knowledgeBase.count({
      where: {
        sourceTitle: title,
        author: author,
      },
    })
    console.log(`⚠️  Warning: Book already exists in database`)
    console.log(`   Title: ${title}`)
    console.log(`   Author: ${author}`)
    console.log(`   Existing chunks: ${count}`)
    console.log(`   This will ADD duplicate vectors to Pinecone!`)
    console.log(`   Press Ctrl+C to cancel or wait 5 seconds to continue...\n`)

    // Wait 5 seconds before continuing
    await new Promise((resolve) => setTimeout(resolve, 5000))
  } else {
    console.log('   ✓ No duplicates found')
    console.log()
  }

  // 3. Прочитать PDF
  console.log('📖 Reading PDF...')
  const dataBuffer = fs.readFileSync(filePath)
  const pdfData = await pdf(dataBuffer)
  const fullText = pdfData.text

  console.log(`   Pages: ${pdfData.numpages}`)
  console.log(`   Characters: ${fullText.length.toLocaleString()}`)
  console.log()

  // 4. Разбить на чанки
  console.log('✂️  Chunking text...')
  const chunks = chunkText(fullText, CHUNK_SIZE, CHUNK_OVERLAP)
  console.log(`   Created ${chunks.length} chunks`)
  console.log()

  // 5. Создать embeddings
  console.log('🔢 Creating embeddings...')
  const embeddings = await createEmbeddings(chunks.map((c) => c.text))
  console.log(`   ✓ Created ${embeddings.length} embeddings`)
  console.log()

  // 6. Загрузить в Pinecone
  console.log('☁️  Uploading to Pinecone...')
  const index = getPineconeIndex()

  const vectors = chunks.map((chunk, i) => ({
    id: `${namespace}_${title.replace(/\s+/g, '_')}_chunk_${chunk.index}`,
    values: embeddings[i],
    metadata: {
      text: chunk.text,
      book_title: title,
      author: author,
      namespace: namespace,
      chunk_index: chunk.index,
    },
  }))

  // Загружать батчами по 100
  const batchSize = 100
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize)
    await index.namespace(namespace).upsert(batch)
    console.log(`   Uploaded ${Math.min(i + batchSize, vectors.length)}/${vectors.length} vectors`)
  }

  console.log('   ✓ Upload complete')
  console.log()

  // 7. Сохранить метаданные в БД
  console.log('💾 Saving metadata to database...')
  for (const chunk of chunks) {
    await prisma.knowledgeBase.create({
      data: {
        sourceTitle: title,
        author: author,
        namespace: namespace,
        chunkIndex: chunk.index,
        pineconeId: `${namespace}_${title.replace(/\s+/g, '_')}_chunk_${chunk.index}`,
      },
    })
  }
  console.log(`   ✓ Saved ${chunks.length} entries`)
  console.log()

  console.log('✅ Knowledge ingestion complete!')
  console.log(`📊 Summary:`)
  console.log(`   Book: ${title} by ${author}`)
  console.log(`   Namespace: ${namespace}`)
  console.log(`   Chunks: ${chunks.length}`)
  console.log(`   Vectors: ${embeddings.length}`)

  await prisma.$disconnect()
}

// Запуск
ingestKnowledge().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
