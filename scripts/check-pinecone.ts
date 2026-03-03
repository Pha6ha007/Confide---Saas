#!/usr/bin/env node
/**
 * Check Pinecone index stats
 */

// Load .env.local BEFORE any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { getPineconeIndex } from '../lib/pinecone/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPinecone() {
  console.log('🔍 Checking Pinecone index...\n')

  // Get index stats
  const index = getPineconeIndex()
  const stats = await index.describeIndexStats()

  console.log('📊 Pinecone Stats:')
  console.log(JSON.stringify(stats, null, 2))
  console.log()

  // Get database records
  console.log('💾 Database Records:')
  const knowledgeEntries = await prisma.knowledgeBase.findMany({
    select: {
      sourceTitle: true,
      author: true,
      namespace: true,
      chunkIndex: true,
    },
    orderBy: [{ sourceTitle: 'asc' }, { chunkIndex: 'asc' }],
  })

  // Group by book
  const bookMap = new Map<string, { author: string; namespace: string; chunks: number }>()

  knowledgeEntries.forEach((entry) => {
    const key = entry.sourceTitle
    if (!bookMap.has(key)) {
      bookMap.set(key, {
        author: entry.author || 'Unknown',
        namespace: entry.namespace,
        chunks: 0,
      })
    }
    bookMap.get(key)!.chunks++
  })

  if (bookMap.size === 0) {
    console.log('   No books loaded yet')
  } else {
    bookMap.forEach((info, title) => {
      console.log(`   📚 ${title} by ${info.author}`)
      console.log(`      Namespace: ${info.namespace}`)
      console.log(`      Chunks: ${info.chunks}`)
      console.log()
    })
  }

  console.log(`✅ Total books: ${bookMap.size}`)
  console.log(`✅ Total chunks in DB: ${knowledgeEntries.length}`)

  await prisma.$disconnect()
}

checkPinecone().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
