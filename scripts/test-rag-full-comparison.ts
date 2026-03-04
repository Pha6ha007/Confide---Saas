#!/usr/bin/env node
/**
 * Confide — Full RAG Comparison Test
 *
 * Тестирует RAG систему на 21 запрос в трёх конфигурациях:
 * 1. Before (no expansion) — базовый Pinecone retrieval
 * 2. After Expansion — Query Expansion + Pinecone
 * 3. After Expansion+Reranking — Query Expansion + Pinecone + LLM Reranking
 */

// Load .env.local
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })

import OpenAI from 'openai'
import { getPineconeIndex } from '../lib/pinecone/client'
import { NAMESPACES } from '../lib/pinecone/constants'
import type { Namespace } from '../lib/pinecone/constants'

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EXPANSION_MODEL = 'gpt-4o-mini'

interface TestQuery {
  category: string
  query: string
  namespace: Namespace
}

const testQueries: TestQuery[] = [
  // ANXIETY (3)
  {
    category: 'ANXIETY',
    query: "I keep having panic attacks at work and I don't know how to stop them",
    namespace: NAMESPACES.ANXIETY_CBT,
  },
  {
    category: 'ANXIETY',
    query: "My mind won't stop racing with worst-case scenarios about everything",
    namespace: NAMESPACES.ANXIETY_CBT,
  },
  {
    category: 'ANXIETY',
    query: "I feel anxious all the time but I can't pinpoint why",
    namespace: NAMESPACES.ANXIETY_CBT,
  },

  // FAMILY (3)
  {
    category: 'FAMILY',
    query: "My mother criticizes everything I do and I can't take it anymore",
    namespace: NAMESPACES.FAMILY,
  },
  {
    category: 'FAMILY',
    query: 'My husband and I keep having the same fight over and over',
    namespace: NAMESPACES.FAMILY,
  },
  {
    category: 'FAMILY',
    query: "My parents are getting divorced and I feel like it's tearing me apart",
    namespace: NAMESPACES.FAMILY,
  },

  // TRAUMA (3)
  {
    category: 'TRAUMA',
    query: "Sometimes I freeze up when someone raises their voice and I can't move",
    namespace: NAMESPACES.TRAUMA,
  },
  {
    category: 'TRAUMA',
    query: "I had something happen to me as a child that I've never told anyone",
    namespace: NAMESPACES.TRAUMA,
  },
  {
    category: 'TRAUMA',
    query: "I keep having nightmares about what happened and I wake up in a sweat",
    namespace: NAMESPACES.TRAUMA,
  },

  // RELATIONSHIPS (3)
  {
    category: 'RELATIONSHIPS',
    query: 'My boyfriend goes quiet for hours and I spiral into panic',
    namespace: NAMESPACES.FAMILY, // relationships use family namespace
  },
  {
    category: 'RELATIONSHIPS',
    query: "He cheated and I want to forgive him but I can't stop checking his phone",
    namespace: NAMESPACES.FAMILY,
  },
  {
    category: 'RELATIONSHIPS',
    query: 'I feel like I always choose the wrong people to date',
    namespace: NAMESPACES.FAMILY,
  },

  // MENS (3)
  {
    category: 'MENS',
    query: "I don't really have anyone to talk to about how I'm actually feeling",
    namespace: NAMESPACES.MENS,
  },
  {
    category: 'MENS',
    query: "I feel like if I'm not providing for my family I'm worthless",
    namespace: NAMESPACES.MENS,
  },
  {
    category: 'MENS',
    query: "Everyone thinks I'm fine but I'm falling apart inside",
    namespace: NAMESPACES.MENS,
  },

  // WOMENS (3)
  {
    category: 'WOMENS',
    query: 'I do everything at home and at work and I feel guilty for being exhausted',
    namespace: NAMESPACES.GENERAL, // womens uses general for now
  },
  {
    category: 'WOMENS',
    query: "He told me I'm overreacting and now I'm questioning my own feelings",
    namespace: NAMESPACES.GENERAL,
  },
  {
    category: 'WOMENS',
    query: "I love my kids but I've completely lost who I am",
    namespace: NAMESPACES.GENERAL,
  },

  // CROSS-AGENT (3)
  {
    category: 'CROSS-AGENT',
    query: "I don't see the point of anything anymore",
    namespace: NAMESPACES.GENERAL,
  },
  {
    category: 'CROSS-AGENT',
    query: "I hate myself and I don't think I deserve to be loved",
    namespace: NAMESPACES.GENERAL,
  },
  {
    category: 'CROSS-AGENT',
    query: 'I feel completely alone even though I have people around me',
    namespace: NAMESPACES.GENERAL,
  },
]

interface TestResult {
  category: string
  query: string
  beforeScore: number
  afterExpansionScore: number
  afterRerankingScore: number
}

/**
 * Query expansion function (copied from retrieval.ts)
 */
async function expandQuery(userQuery: string, namespace: Namespace): Promise<string> {
  const namespaceContext: Record<Namespace, string> = {
    anxiety_cbt:
      'Focus on anxiety, panic, worry, CBT concepts, cognitive distortions, safety behaviors, exposure therapy',
    family:
      'Focus on family dynamics, attachment styles, communication patterns, boundaries, relationship conflicts',
    trauma:
      'Focus on PTSD, childhood trauma, freeze/fight/flight, body sensations, dissociation, trauma recovery',
    crisis: 'Focus on suicidal ideation, self-harm, crisis intervention, safety planning, emergency resources',
    general:
      'Focus on general mental health, self-esteem, meaning, loneliness, identity, personal growth',
    mens: 'Focus on male depression, masculinity, emotional expression, provider role, hidden suffering, male identity',
    womens:
      'Focus on female experiences, maternal identity, emotional labor, gaslighting, self-care, gender roles',
  }

  const contextHint = namespaceContext[namespace] || 'Focus on general psychological concepts'

  const systemPrompt = `You are a query expansion assistant for a psychology RAG (Retrieval-Augmented Generation) system.

Your task: Transform a user's conversational query into a rich set of psychological keywords, concepts, and related terms that will help semantic search find the most relevant content in our knowledge base.

Guidelines:
- Expand short queries into 50-100 words of relevant search terms
- Include: clinical terms, symptom descriptions, theoretical concepts, treatment approaches, related emotions
- Use both professional terminology AND everyday language
- Include synonyms and related concepts
- ${contextHint}
- Output ONLY keywords and short phrases, separated by spaces
- NO full sentences, NO explanations, NO formatting`

  try {
    const response = await openai.chat.completions.create({
      model: EXPANSION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    return response.choices[0]?.message?.content?.trim() || userQuery
  } catch (error) {
    console.error('Query expansion failed:', error)
    return userQuery
  }
}

/**
 * Simple reranking using LLM scoring
 */
async function simpleRerank(
  userQuery: string,
  chunks: any[],
  topN: number = 5
): Promise<number> {
  if (chunks.length === 0) return 0

  try {
    const chunksForEvaluation = chunks
      .slice(0, 10) // Only evaluate top 10 from Pinecone
      .map((chunk, idx) => {
        const truncatedText =
          chunk.text.length > 300 ? chunk.text.slice(0, 300) + '...' : chunk.text
        return `[CHUNK ${idx + 1}]\nText: ${truncatedText}`
      })
      .join('\n\n')

    const systemPrompt = `You are a relevance scoring assistant. Rate how well these text chunks answer the user's query on a 0-10 scale.

Output format: JSON with "average_score" field (0-10).

Be selective:
- 9-10: Perfect match, directly addresses query
- 7-8: Good match, relevant therapeutic content
- 5-6: Somewhat relevant
- 3-4: Tangentially related
- 0-2: Not relevant`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `User Query: "${userQuery}"\n\nRate these chunks:\n\n${chunksForEvaluation}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{"average_score": 0}')
    return parsed.average_score || 0
  } catch (error) {
    console.error('Reranking failed:', error)
    // Fallback: average Pinecone score normalized to 0-10
    const avgPineconeScore = chunks.slice(0, topN).reduce((sum, c) => sum + (c.score || 0), 0) / Math.min(topN, chunks.length)
    return avgPineconeScore * 10
  }
}

/**
 * Test single query in all three modes
 */
async function testQuery(test: TestQuery): Promise<TestResult> {
  const index = getPineconeIndex()

  // 1. Before (no expansion) - базовый retrieval
  const embedding1 = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: test.query,
  })
  const result1 = await index.namespace(test.namespace).query({
    vector: embedding1.data[0].embedding,
    topK: 10,
    includeMetadata: true,
  })
  const chunks1 = result1.matches
    .filter((m) => m.metadata && m.metadata.text)
    .map((m) => ({
      score: m.score || 0,
      text: m.metadata!.text as string,
    }))
  const beforeScore = chunks1.length > 0
    ? chunks1.slice(0, 5).reduce((sum, c) => sum + c.score, 0) / Math.min(5, chunks1.length)
    : 0

  // 2. After Expansion - query expansion + retrieval
  const expandedQuery = await expandQuery(test.query, test.namespace)
  const embedding2 = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: expandedQuery,
  })
  const result2 = await index.namespace(test.namespace).query({
    vector: embedding2.data[0].embedding,
    topK: 10,
    includeMetadata: true,
  })
  const chunks2 = result2.matches
    .filter((m) => m.metadata && m.metadata.text)
    .map((m) => ({
      score: m.score || 0,
      text: m.metadata!.text as string,
    }))
  const afterExpansionScore = chunks2.length > 0
    ? chunks2.slice(0, 5).reduce((sum, c) => sum + c.score, 0) / Math.min(5, chunks2.length)
    : 0

  // 3. After Expansion+Reranking - query expansion + retrieval + LLM reranking
  const rerankScore = await simpleRerank(test.query, chunks2, 5)

  return {
    category: test.category,
    query: test.query,
    beforeScore,
    afterExpansionScore,
    afterRerankingScore: rerankScore / 10, // Normalize to 0-1 scale for comparison
  }
}

/**
 * Main test runner
 */
async function runFullTest() {
  console.log('🧪 Full RAG Comparison Test')
  console.log('Testing 21 queries in 3 configurations')
  console.log('=' .repeat(100))
  console.log()

  const results: TestResult[] = []

  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i]
    console.log(`[${i + 1}/21] ${test.category}: "${test.query.slice(0, 60)}..."`)

    try {
      const result = await testQuery(test)
      results.push(result)

      console.log(
        `  Before: ${result.beforeScore.toFixed(4)} | ` +
          `After Expansion: ${result.afterExpansionScore.toFixed(4)} | ` +
          `After Reranking: ${result.afterRerankingScore.toFixed(4)}`
      )
    } catch (error) {
      console.error(`  ❌ Error: ${error}`)
      results.push({
        category: test.category,
        query: test.query,
        beforeScore: 0,
        afterExpansionScore: 0,
        afterRerankingScore: 0,
      })
    }

    console.log()
  }

  // Print summary table
  console.log('\n' + '='.repeat(100))
  console.log('📊 RESULTS TABLE')
  console.log('='.repeat(100))
  console.log()

  console.log(
    'Agent'.padEnd(15) +
      '| Query'.padEnd(50) +
      '| Before'.padEnd(10) +
      '| +Expansion'.padEnd(12) +
      '| +Reranking'.padEnd(12) +
      '| Status'
  )
  console.log('-'.repeat(120))

  results.forEach((r) => {
    const status =
      r.afterRerankingScore >= 0.75
        ? '✅ PASS'
        : r.afterRerankingScore >= 0.50
          ? '🟡 MARGINAL'
          : '❌ FAIL'

    const queryShort = r.query.slice(0, 45) + (r.query.length > 45 ? '...' : '')

    console.log(
      r.category.padEnd(15) +
        '| ' +
        queryShort.padEnd(48) +
        '| ' +
        r.beforeScore.toFixed(4).padEnd(8) +
        '| ' +
        r.afterExpansionScore.toFixed(4).padEnd(10) +
        '| ' +
        r.afterRerankingScore.toFixed(4).padEnd(10) +
        '| ' +
        status
    )
  })

  // Category summaries
  console.log('\n' + '='.repeat(100))
  console.log('📈 SUMMARY BY AGENT')
  console.log('='.repeat(100))
  console.log()

  const categories = ['ANXIETY', 'FAMILY', 'TRAUMA', 'RELATIONSHIPS', 'MENS', 'WOMENS', 'CROSS-AGENT']

  console.log(
    'Agent'.padEnd(15) +
      '| Avg Before'.padEnd(12) +
      '| Avg +Expansion'.padEnd(16) +
      '| Avg +Reranking'.padEnd(16) +
      '| Improvement'
  )
  console.log('-'.repeat(80))

  categories.forEach((cat) => {
    const catResults = results.filter((r) => r.category === cat)
    if (catResults.length === 0) return

    const avgBefore =
      catResults.reduce((sum, r) => sum + r.beforeScore, 0) / catResults.length
    const avgExpansion =
      catResults.reduce((sum, r) => sum + r.afterExpansionScore, 0) / catResults.length
    const avgReranking =
      catResults.reduce((sum, r) => sum + r.afterRerankingScore, 0) / catResults.length

    const improvement = ((avgReranking - avgBefore) / avgBefore) * 100

    console.log(
      cat.padEnd(15) +
        '| ' +
        avgBefore.toFixed(4).padEnd(10) +
        '| ' +
        avgExpansion.toFixed(4).padEnd(14) +
        '| ' +
        avgReranking.toFixed(4).padEnd(14) +
        '| ' +
        (improvement >= 0 ? '+' : '') +
        improvement.toFixed(1) +
        '%'
    )
  })

  // Overall summary
  console.log('\n' + '='.repeat(100))
  console.log('🎯 OVERALL SUMMARY')
  console.log('='.repeat(100))
  console.log()

  const avgBefore = results.reduce((sum, r) => sum + r.beforeScore, 0) / results.length
  const avgExpansion =
    results.reduce((sum, r) => sum + r.afterExpansionScore, 0) / results.length
  const avgReranking =
    results.reduce((sum, r) => sum + r.afterRerankingScore, 0) / results.length

  const passCount = results.filter((r) => r.afterRerankingScore >= 0.75).length
  const marginalCount = results.filter(
    (r) => r.afterRerankingScore >= 0.50 && r.afterRerankingScore < 0.75
  ).length
  const failCount = results.filter((r) => r.afterRerankingScore < 0.50).length

  console.log(`Total Queries: ${results.length}`)
  console.log()
  console.log(`Average Score (Before):            ${avgBefore.toFixed(4)}`)
  console.log(`Average Score (+Expansion):        ${avgExpansion.toFixed(4)}`)
  console.log(`Average Score (+Reranking):        ${avgReranking.toFixed(4)}`)
  console.log()
  console.log(`Improvement (Before → Reranking):  +${(((avgReranking - avgBefore) / avgBefore) * 100).toFixed(1)}%`)
  console.log()
  console.log(`✅ PASS (≥0.75):       ${passCount}/${results.length} (${((passCount / results.length) * 100).toFixed(0)}%)`)
  console.log(`🟡 MARGINAL (0.50-0.75): ${marginalCount}/${results.length} (${((marginalCount / results.length) * 100).toFixed(0)}%)`)
  console.log(`❌ FAIL (<0.50):        ${failCount}/${results.length} (${((failCount / results.length) * 100).toFixed(0)}%)`)
  console.log()

  console.log('✅ Test complete!')
}

// Run test
runFullTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
