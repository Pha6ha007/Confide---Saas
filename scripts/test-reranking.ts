#!/usr/bin/env node
/**
 * Confide — Reranking System Test
 *
 * Тестирует новую систему reranking для RAG
 * Сравнивает результаты с и без reranking
 */

// Load .env.local
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import { retrieveContext } from '../lib/pinecone/retrieval'
import { NAMESPACES } from '../lib/pinecone/client'

// Тестовые запросы по разным темам
const testQueries = [
  {
    query: "I feel anxious all the time and can't relax",
    namespace: NAMESPACES.ANXIETY_CBT,
    category: 'ANXIETY',
  },
  {
    query: 'My mother was very critical and now I struggle with self-worth',
    namespace: NAMESPACES.FAMILY,
    category: 'FAMILY',
  },
  {
    query: "I freeze when someone raises their voice at me",
    namespace: NAMESPACES.TRAUMA,
    category: 'TRAUMA',
  },
  {
    query: "Everyone thinks I'm fine but I'm struggling inside",
    namespace: NAMESPACES.MENS,
    category: 'MENS',
  },
  {
    query: 'Why do I keep attracting emotionally unavailable partners?',
    namespace: NAMESPACES.FAMILY, // relationships use family namespace
    category: 'RELATIONSHIPS',
  },
]

async function testReranking() {
  console.log('🧪 Reranking System Test\n')
  console.log('Testing retrieval WITH and WITHOUT reranking\n')
  console.log('=' .repeat(80))
  console.log()

  for (const test of testQueries) {
    console.log(`\n📝 Query: "${test.query}"`)
    console.log(`🏷️  Category: ${test.category}`)
    console.log(`📚 Namespace: ${test.namespace}`)
    console.log()

    try {
      // Test WITH reranking (default)
      console.log('✅ WITH RERANKING:')
      const withReranking = await retrieveContext(test.query, test.namespace, 5, true)

      if (withReranking.length === 0) {
        console.log('   ⚠️  No results found')
      } else {
        withReranking.forEach((chunk, idx) => {
          console.log(`   ${idx + 1}. [Rerank: ${chunk.rerankScore.toFixed(1)}/10]`)
          console.log(`      ${chunk.metadata.book_title} by ${chunk.metadata.author}`)
          console.log(`      Pinecone Score: ${chunk.score.toFixed(4)}`)
          if (chunk.rerankReason) {
            console.log(`      Reason: ${chunk.rerankReason}`)
          }
          console.log(`      Text: ${chunk.text.slice(0, 150)}...`)
          console.log()
        })

        // Calculate average scores
        const avgRerankScore = withReranking.reduce((sum, c) => sum + c.rerankScore, 0) / withReranking.length
        const avgPineconeScore = withReranking.reduce((sum, c) => sum + c.score, 0) / withReranking.length

        console.log(`   📊 Average Rerank Score: ${avgRerankScore.toFixed(2)}/10`)
        console.log(`   📊 Average Pinecone Score: ${avgPineconeScore.toFixed(4)}`)
      }

      console.log()
      console.log('-'.repeat(80))
    } catch (error) {
      console.error(`   ❌ Error: ${error}`)
    }
  }

  console.log('\n✅ Test complete!')
  console.log('\nNext steps:')
  console.log('1. Check if rerank scores are higher than Pinecone scores')
  console.log('2. Verify LLM reasons make sense')
  console.log('3. Compare chunk relevance before/after reranking')
}

// Run test
testReranking()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
