/**
 * Smart Memory Deduplication Engine
 *
 * mem0-style deduplication using existing OpenAI + Pinecone.
 * No new dependencies — uses the same clients as the rest of the app.
 *
 * Flow for each extracted memory fact:
 *   1. Embed the fact with text-embedding-3-small
 *   2. Search user_memories namespace filtered by userId
 *   3. If similar memory exists (cosine > 0.85):
 *      - LLM decides: UPDATE (merge old+new) or NOOP (duplicate, skip)
 *   4. If no similar memory: ADD (new vector)
 *
 * This replaces blind append-only memory with intelligent dedup:
 *   "scared of heights" → later "overcame fear of heights" → old fact auto-replaced
 */

import { getEmbeddingClient, callDedup } from '@/lib/ai/router'
import { EMBEDDING_MODEL } from '@/lib/ai/models'
import { getPineconeIndex } from '@/lib/pinecone/client'
import { NAMESPACES } from '@/lib/pinecone/constants'

// Centralized embedding client (OpenAI direct — not via OpenRouter)
function getOpenAI() { return getEmbeddingClient() }
const SIMILARITY_THRESHOLD = 0.85 // Above this = potential duplicate
const NAMESPACE = NAMESPACES.USER_MEMORIES

export type DedupAction = 'ADD' | 'UPDATE' | 'NOOP'

export interface DedupResult {
  fact: string
  action: DedupAction
  existingId?: string // ID of the memory that was updated/matched
  mergedText?: string // New merged text (for UPDATE)
}

export interface MemoryVector {
  id: string
  text: string
  score: number
}

/**
 * Process a batch of extracted memory facts with deduplication.
 *
 * @param userId — User ID for namespace filtering
 * @param facts — Array of extracted facts from Memory Agent
 * @returns Array of DedupResult indicating what happened to each fact
 */
export async function processMemoriesWithDedup(
  userId: string,
  facts: string[]
): Promise<DedupResult[]> {
  if (facts.length === 0) return []

  const openai = getOpenAI()
  const index = getPineconeIndex()

  // 1. Embed all facts in one batch call
  const embedResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: facts,
  })

  const results: DedupResult[] = []

  // 2. Process each fact
  for (let i = 0; i < facts.length; i++) {
    const fact = facts[i]
    const embedding = embedResponse.data[i].embedding

    try {
      // 3. Search for similar existing memories
      const searchResult = await index.namespace(NAMESPACE).query({
        vector: embedding,
        topK: 3,
        filter: { user_id: userId },
        includeMetadata: true,
      })

      const topMatch = searchResult.matches?.[0]

      // 4. Check if there's a strong match
      if (topMatch && (topMatch.score || 0) >= SIMILARITY_THRESHOLD && topMatch.metadata?.text) {
        const existingText = topMatch.metadata.text as string

        // 5. Ask LLM to decide: UPDATE or NOOP
        const decision = await classifyMemoryAction(existingText, fact)

        if (decision.action === 'UPDATE') {
          // Update the existing vector with merged text
          const mergedText = decision.mergedText || fact

          const mergedEmbedding = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: mergedText,
          })

          await index.namespace(NAMESPACE).upsert([{
            id: topMatch.id,
            values: mergedEmbedding.data[0].embedding,
            metadata: {
              text: mergedText,
              user_id: userId,
              updated_at: new Date().toISOString(),
              update_count: ((topMatch.metadata?.update_count as number) || 0) + 1,
            },
          }])

          results.push({
            fact,
            action: 'UPDATE',
            existingId: topMatch.id,
            mergedText,
          })
        } else {
          // NOOP — duplicate, skip
          results.push({
            fact,
            action: 'NOOP',
            existingId: topMatch.id,
          })
        }
      } else {
        // 6. No similar memory — ADD new vector
        const memoryId = `mem-${userId.slice(0, 8)}-${Date.now()}-${i}`

        await index.namespace(NAMESPACE).upsert([{
          id: memoryId,
          values: embedding,
          metadata: {
            text: fact,
            user_id: userId,
            created_at: new Date().toISOString(),
            update_count: 0,
          },
        }])

        results.push({
          fact,
          action: 'ADD',
        })
      }
    } catch (error) {
      console.error(`[Memory Dedup] Error processing fact "${fact.slice(0, 50)}":`, error)
      // On error, fall back to ADD to avoid data loss
      const memoryId = `mem-${userId.slice(0, 8)}-${Date.now()}-${i}-fallback`

      await index.namespace(NAMESPACE).upsert([{
        id: memoryId,
        values: embedding,
        metadata: {
          text: fact,
          user_id: userId,
          created_at: new Date().toISOString(),
          update_count: 0,
        },
      }])

      results.push({ fact, action: 'ADD' })
    }
  }

  return results
}

/**
 * Search user memories by semantic similarity.
 * Used in chat route to enrich system prompt with relevant memories.
 *
 * @param userId — User ID
 * @param query — Search query (user message or topic)
 * @param topK — Number of results (default 5)
 * @returns Array of matching memories with scores
 */
export async function searchUserMemories(
  userId: string,
  query: string,
  topK: number = 5
): Promise<MemoryVector[]> {
  const openai = getOpenAI()
  const index = getPineconeIndex()

  const embedResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  })

  const result = await index.namespace(NAMESPACE).query({
    vector: embedResponse.data[0].embedding,
    topK,
    filter: { user_id: userId },
    includeMetadata: true,
  })

  return (result.matches || [])
    .filter(m => m.metadata?.text)
    .map(m => ({
      id: m.id,
      text: m.metadata!.text as string,
      score: m.score || 0,
    }))
}

/**
 * Format user memories for inclusion in system prompt.
 *
 * @param memories — Array of MemoryVector from searchUserMemories
 * @returns Formatted string for system prompt, or empty string if no memories
 */
export function formatMemoriesForPrompt(memories: MemoryVector[]): string {
  if (memories.length === 0) return ''

  const memoryLines = memories
    .map((m, i) => `${i + 1}. ${m.text}`)
    .join('\n')

  return `## What I remember about you:\n${memoryLines}`
}

// ── Internal helpers ───────────────────────────────────────────

interface ClassifyResult {
  action: 'UPDATE' | 'NOOP'
  mergedText?: string
}

/**
 * Use LLM to classify whether a new fact should UPDATE an existing memory or be skipped (NOOP).
 *
 * Uses gpt-4o-mini for cost efficiency — this is a simple classification task.
 */
async function classifyMemoryAction(
  existingFact: string,
  newFact: string
): Promise<ClassifyResult> {
  const result = await callDedup([
    {
      role: 'system',
      content: `You are a memory deduplication classifier for a mental health support app.

Given an EXISTING memory and a NEW fact about the same user, decide:

- UPDATE: The new fact adds information, corrects, or evolves the existing memory.
  Return the merged text that preserves both the old and new information.
  Example: existing="afraid of heights" new="went skydiving to face fear of heights"
  → UPDATE, merged="faced fear of heights by going skydiving (previously afraid of heights)"

- NOOP: The new fact is essentially the same as the existing one — a duplicate or trivially rephrased.
  Example: existing="works as a developer" new="is a software developer"
  → NOOP

Respond ONLY with valid JSON: {"action": "UPDATE", "mergedText": "..."} or {"action": "NOOP"}`,
    },
    {
      role: 'user',
      content: `EXISTING: "${existingFact}"\nNEW: "${newFact}"`,
    },
  ])

  const content = result.content.trim()
  if (!content) return { action: 'NOOP' }

  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as ClassifyResult
    return {
      action: parsed.action === 'UPDATE' ? 'UPDATE' : 'NOOP',
      mergedText: parsed.mergedText,
    }
  } catch {
    return { action: 'NOOP' }
  }
}
