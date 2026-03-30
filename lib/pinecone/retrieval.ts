import { getEmbeddingClient, callQueryExpansion } from '@/lib/ai/router'
import { EMBEDDING_MODEL } from '@/lib/ai/models'
import { getPineconeIndex, type Namespace } from './client'
import { NAMESPACES } from './constants'
import { rerankChunks, type RetrievedChunk, type RerankedChunk } from './reranker'

// Centralized embedding client (OpenAI direct)
function getOpenAIClient() { return getEmbeddingClient() }

// Модель для embeddings (from centralized config)
const EMBEDDING_MODEL_NAME = EMBEDDING_MODEL

// Re-export types for consumers
export type { RetrievedChunk, RerankedChunk }

/**
 * Расширить запрос пользователя в набор релевантных психологических терминов
 * для улучшения semantic search в RAG базе знаний
 *
 * @param userQuery - Оригинальный запрос пользователя
 * @param namespace - Namespace для контекстно-зависимого расширения
 * @returns Расширенный запрос с ключевыми словами и концепциями
 */
async function expandQuery(userQuery: string, namespace: Namespace): Promise<string> {

  // Контекстно-зависимые подсказки по namespace
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
    counseling_qa:
      'Focus on practical counseling advice, therapeutic techniques, therapist responses, mental health Q&A',
    user_memories:
      'Focus on personal user memories, facts about the user, their history, preferences, and context',
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
- NO full sentences, NO explanations, NO formatting

Example:
Input: "I'm anxious all the time"
Output: chronic anxiety generalized anxiety disorder GAD persistent worry racing thoughts catastrophizing rumination physical symptoms chest tightness breathing difficulty hyperventilation panic cognitive distortions safety behaviors avoidance anxiety management techniques CBT cognitive behavioral therapy acceptance commitment therapy mindfulness grounding

Input: "My relationship is falling apart"
Output: relationship conflict marriage problems communication breakdown emotional disconnection attachment insecurity criticism contempt defensiveness stonewalling Gottman method couples therapy intimacy trust issues emotional availability vulnerability connection repair attempts love languages`

  try {
    const result = await callQueryExpansion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery },
    ])

    const expandedQuery = result.content.trim() || userQuery

    // Fallback: если модель вернула пустой ответ, использовать оригинальный запрос
    return expandedQuery.length > 0 ? expandedQuery : userQuery
  } catch (error) {
    console.error('Query expansion failed, using original query:', error)
    return userQuery
  }
}

/**
 * Получить релевантный контекст из RAG базы знаний с reranking
 *
 * Процесс:
 * 1. Query Expansion — расширить запрос для лучшего semantic search
 * 2. Pinecone Retrieval — query primary + secondary namespaces in parallel
 * 3. Merge & Deduplicate — combine results, remove duplicate IDs
 * 4. Cross-Encoder Reranking — LLM оценивает relevance, возвращает top-5
 *
 * @param query - Запрос пользователя
 * @param namespace - Primary namespace (anxiety_cbt, family, trauma, etc)
 * @param topK - Сколько чанков вернуть после reranking (по умолчанию 5)
 * @param useReranking - Включить reranking (по умолчанию true)
 * @param secondaryNamespace - Optional secondary namespace to query in parallel
 * @returns Массив reranked чанков с metadata
 */
export async function retrieveContext(
  query: string,
  namespace: Namespace,
  topK: number = 5,
  useReranking: boolean = true,
  secondaryNamespace?: Namespace | null
): Promise<RerankedChunk[]> {
  try {
    // 1. Расширить запрос для улучшения semantic search
    const expandedQuery = await expandQuery(query, namespace)

    // Логирование для debugging (только в development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[RAG Retrieval]')
      console.log('  Original query:', query)
      console.log('  Expanded query:', expandedQuery)
      console.log('  Primary namespace:', namespace)
      if (secondaryNamespace) {
        console.log('  Secondary namespace:', secondaryNamespace)
      }
    }

    // 2. Создать embedding расширенного запроса через OpenAI
    const openai = getOpenAIClient()
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL_NAME,
      input: expandedQuery,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // 3. Parallel Pinecone queries — primary + secondary namespace
    const retrievalTopK = useReranking ? Math.max(topK * 3, 15) : topK
    const index = getPineconeIndex()

    // Build parallel queries
    const queries: Promise<{ matches: any[]; source: 'primary' | 'counseling_qa' }>[] = [
      index.namespace(namespace).query({
        vector: queryEmbedding,
        topK: retrievalTopK,
        includeMetadata: true,
      }).then(r => ({ matches: r.matches || [], source: 'primary' as const })),
    ]

    if (secondaryNamespace && secondaryNamespace !== namespace) {
      // Secondary gets fewer candidates — it supplements, doesn't dominate
      const secondaryTopK = Math.max(Math.floor(retrievalTopK * 0.6), 8)
      queries.push(
        index.namespace(secondaryNamespace).query({
          vector: queryEmbedding,
          topK: secondaryTopK,
          includeMetadata: true,
        }).then(r => ({ matches: r.matches || [], source: 'counseling_qa' as const }))
      )
    }

    const results = await Promise.all(queries)

    // 4. Merge and deduplicate by vector ID
    const seenIds = new Set<string>()
    const allChunks: RetrievedChunk[] = []

    for (const { matches, source } of results) {
      for (const match of matches) {
        if (!match.metadata?.text || seenIds.has(match.id)) continue
        seenIds.add(match.id)

        const isCounselingQA = source === 'counseling_qa' ||
          (match.metadata.source === 'counsel-chat') ||
          (match.metadata.namespace === NAMESPACES.COUNSELING_QA)

        allChunks.push({
          id: match.id,
          score: match.score || 0,
          text: match.metadata.text as string,
          metadata: {
            book_title: isCounselingQA
              ? 'Real Therapist Response'
              : ((match.metadata.book_title as string) || 'Unknown'),
            author: isCounselingQA
              ? 'Licensed Counselor'
              : ((match.metadata.author as string) || 'Unknown'),
            chapter: match.metadata.chapter as string | undefined,
            namespace: (match.metadata.namespace as string) || (isCounselingQA ? NAMESPACES.COUNSELING_QA : namespace),
          },
        })
      }
    }

    if (process.env.NODE_ENV === 'development' && secondaryNamespace) {
      const primaryCount = results[0].matches.length
      const secondaryCount = results[1]?.matches.length || 0
      console.log(`[RAG] Merged: ${primaryCount} primary + ${secondaryCount} counseling_qa → ${allChunks.length} unique`)
    }

    // 5. Rerank combined set
    if (useReranking && allChunks.length > topK) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[RAG] Reranking ${allChunks.length} candidates → top ${topK}`)
      }

      const rerankedChunks = await rerankChunks(query, allChunks, topK)
      return rerankedChunks
    }

    // Without reranking — return top-K by Pinecone score
    return allChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((chunk) => ({
        ...chunk,
        rerankScore: chunk.score * 10,
      }))
  } catch (error) {
    console.error('Failed to retrieve context from Pinecone:', error)
    return []
  }
}

/**
 * Форматировать retrieved chunks в строку для system prompt.
 * Labels therapist Q&A differently from book sources.
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return ''
  }

  const contextParts = chunks.map((chunk, index) => {
    const isCounselingQA =
      chunk.metadata.namespace === NAMESPACES.COUNSELING_QA ||
      chunk.metadata.book_title === 'Real Therapist Response'

    if (isCounselingQA) {
      return `${index + 1}. [Real therapist response]\n${chunk.text}`
    }

    const source = `[From "${chunk.metadata.book_title}" by ${chunk.metadata.author}]`
    return `${index + 1}. ${source}\n${chunk.text}`
  })

  return `## Relevant knowledge:\n\n${contextParts.join('\n\n')}`
}
