import OpenAI from 'openai'

// Lazy initialization
let _openai: OpenAI | null = null

function getOpenAIClient() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  }
  return _openai
}

// Модель для reranking (быстрая и дешёвая)
const RERANKING_MODEL = 'gpt-4o-mini'

// Define types locally to avoid circular dependency
export interface RetrievedChunk {
  id: string
  score: number
  text: string
  metadata: {
    book_title: string
    author: string
    chapter?: string
    namespace: string
  }
}

export interface RerankedChunk extends RetrievedChunk {
  rerankScore: number // 0-10 relevance score from LLM
  rerankReason?: string // Optional explanation from LLM
}

/**
 * Rerank retrieved chunks using LLM-based cross-encoder approach
 *
 * Принимает top-15 chunks из Pinecone и использует LLM для
 * определения наиболее релевантных на основе semantic understanding.
 *
 * @param userQuery - Оригинальный запрос пользователя
 * @param chunks - Массив chunks из Pinecone (обычно topK=15)
 * @param topN - Сколько chunks вернуть после reranking (по умолчанию 5)
 * @returns Reranked chunks отсортированные по relevance score
 */
export async function rerankChunks(
  userQuery: string,
  chunks: RetrievedChunk[],
  topN: number = 5
): Promise<RerankedChunk[]> {
  if (chunks.length === 0) {
    return []
  }

  // Если chunks меньше чем topN, вернуть все без reranking
  if (chunks.length <= topN) {
    return chunks.map((chunk) => ({
      ...chunk,
      rerankScore: chunk.score * 10, // Normalize to 0-10 scale
    }))
  }

  try {
    const openai = getOpenAIClient()

    // Подготовить chunks для LLM оценки
    const chunksForEvaluation = chunks
      .map((chunk, idx) => {
        // Truncate text to max 400 chars per chunk для уменьшения токенов
        const truncatedText =
          chunk.text.length > 400 ? chunk.text.slice(0, 400) + '...' : chunk.text

        return `[CHUNK ${idx + 1}]
Source: ${chunk.metadata.book_title} by ${chunk.metadata.author}
Text: ${truncatedText}
Pinecone Score: ${chunk.score.toFixed(4)}`
      })
      .join('\n\n')

    const systemPrompt = `You are a relevance scoring assistant for a psychology RAG (Retrieval-Augmented Generation) system.

Your task: Evaluate how relevant each chunk of text is to answering the user's query. Consider:
- Semantic relevance (does it address the query topic?)
- Practical usefulness (does it provide actionable insights?)
- Depth of content (surface-level vs. deep psychological concepts)
- Context appropriateness (right level of detail for the query)

Output format: JSON array with objects containing:
- chunkIndex: number (1-based index from input)
- score: number (0-10 scale, where 10 = perfectly relevant, 0 = irrelevant)
- reason: string (brief 5-10 word explanation)

Rules:
- Be selective: only high-quality matches should get 7+
- Consider semantic meaning, not just keyword overlap
- Prefer chunks with practical therapeutic insights
- Penalize chunks with endorsements, table of contents, or boilerplate text
- Output ONLY valid JSON, no other text`

    const userPrompt = `User Query: "${userQuery}"

Evaluate these ${chunks.length} chunks and return the top ${topN} most relevant ones:

${chunksForEvaluation}

Return JSON array of top ${topN} chunks sorted by relevance score (highest first).`

    const response = await openai.chat.completions.create({
      model: RERANKING_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Low temperature for consistent scoring
      response_format: { type: 'json_object' },
    })

    const responseText = response.choices[0]?.message?.content?.trim()
    if (!responseText) {
      console.warn('[Reranker] Empty response from LLM, falling back to original order')
      return chunks.slice(0, topN).map((chunk) => ({
        ...chunk,
        rerankScore: chunk.score * 10,
      }))
    }

    // Parse LLM response
    const parsed = JSON.parse(responseText)
    const rankings = parsed.rankings || parsed.results || []

    if (!Array.isArray(rankings) || rankings.length === 0) {
      console.warn('[Reranker] Invalid rankings format, falling back to original order')
      return chunks.slice(0, topN).map((chunk) => ({
        ...chunk,
        rerankScore: chunk.score * 10,
      }))
    }

    // Map LLM rankings back to chunks
    const rerankedChunks: RerankedChunk[] = rankings
      .slice(0, topN) // Take only top N
      .map((ranking: any) => {
        const chunkIndex = ranking.chunkIndex - 1 // Convert to 0-based
        const chunk = chunks[chunkIndex]

        if (!chunk) {
          console.warn(`[Reranker] Invalid chunk index: ${ranking.chunkIndex}`)
          return null
        }

        return {
          ...chunk,
          rerankScore: ranking.score || 0,
          rerankReason: ranking.reason || undefined,
        }
      })
      .filter((chunk): chunk is RerankedChunk => chunk !== null)
      .sort((a, b) => b.rerankScore - a.rerankScore) // Sort by rerank score descending

    // Log reranking results in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Reranker Results]')
      rerankedChunks.forEach((chunk, idx) => {
        console.log(
          `  ${idx + 1}. Score: ${chunk.rerankScore.toFixed(1)}/10 | ${chunk.metadata.book_title}`
        )
        if (chunk.rerankReason) {
          console.log(`     Reason: ${chunk.rerankReason}`)
        }
      })
    }

    return rerankedChunks
  } catch (error) {
    console.error('[Reranker] Reranking failed, falling back to original order:', error)

    // Fallback: return top N chunks by Pinecone score
    return chunks.slice(0, topN).map((chunk) => ({
      ...chunk,
      rerankScore: chunk.score * 10, // Normalize to 0-10 scale
    }))
  }
}
