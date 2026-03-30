/**
 * Procedural Memory — learns HOW to communicate with each user
 *
 * Inspired by langmem (https://github.com/langchain-ai/langmem)
 * Implemented natively using existing @langchain/openai.
 *
 * After each session, extracts:
 * - effectivePatterns: what response styles worked ("short answers", "metaphors")
 * - avoidPatterns: what didn't work ("giving direct advice", "asking too many questions")
 * - responseStyleNote: overall communication observation
 *
 * These are merged into userProfile.communicationStyle and used by
 * agent prompts to adapt their behavior per user.
 */

import { callProcedural } from '@/lib/ai/router'

export interface ProceduralLessons {
  effectivePatterns: string[]
  avoidPatterns: string[]
  responseStyleNote: string | null
}

export interface ProceduralMemory {
  effectivePatterns: string[]
  avoidPatterns: string[]
  responseStyleNote: string | null
  lastUpdated: string
}

/**
 * Extract procedural lessons from a conversation.
 *
 * Uses gpt-4o-mini for cost efficiency — this is analysis, not generation.
 * Temperature 0 for consistent, factual extraction.
 *
 * @param messages — Session messages in chronological order
 * @returns ProceduralLessons or null if extraction fails
 */
export async function extractProceduralLessons(
  messages: { role: string; content: string }[]
): Promise<ProceduralLessons | null> {
  if (messages.length < 4) return null // Need enough conversation to analyze

  // Build conversation text (limit to last 20 messages for cost)
  const conversationText = messages
    .slice(-20)
    .map(m => `${m.role}: ${m.content}`)
    .join('\n')

  try {
    const result = await callProcedural([
      {
        role: 'system',
        content: `You are analyzing a therapy conversation to extract procedural communication lessons.

Your job: identify WHAT WORKED and WHAT DIDN'T in how the AI assistant communicated with this specific user.

Look for:
- Response length preferences (did they engage more with short or long responses?)
- Question types (open-ended vs. specific? reflective vs. practical?)
- Tone preferences (warm vs. professional? casual vs. formal?)
- Technique responses (did they respond well to metaphors? reframing? validation?)
- What made them shut down or disengage?

Return ONLY valid JSON with this structure:
{
  "effectivePatterns": ["pattern1", "pattern2"],
  "avoidPatterns": ["pattern1"],
  "responseStyleNote": "one-sentence summary of ideal style"
}

Rules:
- Maximum 3 items per array
- Each item is a concrete, actionable observation (not vague)
- If nothing clear was observed, use empty arrays and null
- Example effective: "Short 2-3 sentence responses kept them engaged"
- Example avoid: "Direct advice triggered defensiveness"
- Example note: "Prefers reflective questions over suggestions"`,
      },
      {
        role: 'user',
        content: conversationText,
      },
    ])

    const content = result.content.trim()

    if (!content) return null

    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    return {
      effectivePatterns: Array.isArray(parsed.effectivePatterns)
        ? parsed.effectivePatterns.filter((p: any) => typeof p === 'string').slice(0, 5)
        : [],
      avoidPatterns: Array.isArray(parsed.avoidPatterns)
        ? parsed.avoidPatterns.filter((p: any) => typeof p === 'string').slice(0, 5)
        : [],
      responseStyleNote: typeof parsed.responseStyleNote === 'string'
        ? parsed.responseStyleNote
        : null,
    }
  } catch (error) {
    console.error('[Procedural Memory] Extraction failed:', error)
    return null
  }
}

/**
 * Merge new procedural lessons with existing ones.
 *
 * Strategy:
 * - Append new patterns, keep last 10 unique
 * - responseStyleNote: latest overwrites (evolves over time)
 * - Deduplicate by checking substring overlap
 *
 * @param existing — Current procedural memory from userProfile
 * @param newLessons — Fresh lessons from extractProceduralLessons()
 * @returns Merged ProceduralMemory
 */
export function mergeProceduralMemory(
  existing: Partial<ProceduralMemory> | null,
  newLessons: ProceduralLessons
): ProceduralMemory {
  const prev = existing || { effectivePatterns: [], avoidPatterns: [], responseStyleNote: null }

  return {
    effectivePatterns: deduplicatePatterns([
      ...(prev.effectivePatterns || []),
      ...newLessons.effectivePatterns,
    ]).slice(-10),

    avoidPatterns: deduplicatePatterns([
      ...(prev.avoidPatterns || []),
      ...newLessons.avoidPatterns,
    ]).slice(-10),

    responseStyleNote: newLessons.responseStyleNote || prev.responseStyleNote || null,

    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Format procedural memory for inclusion in agent system prompts.
 *
 * @param memory — ProceduralMemory from userProfile
 * @returns Formatted string for system prompt, or empty string
 */
export function formatProceduralForPrompt(memory: Partial<ProceduralMemory> | null): string {
  if (!memory) return ''

  const sections: string[] = []

  if (memory.effectivePatterns && memory.effectivePatterns.length > 0) {
    sections.push(
      `**What works with this user:**\n${memory.effectivePatterns.map(p => `- ${p}`).join('\n')}`
    )
  }

  if (memory.avoidPatterns && memory.avoidPatterns.length > 0) {
    sections.push(
      `**What to avoid:**\n${memory.avoidPatterns.map(p => `- ${p}`).join('\n')}`
    )
  }

  if (memory.responseStyleNote) {
    sections.push(`**Communication style note:** ${memory.responseStyleNote}`)
  }

  if (sections.length === 0) return ''

  return `## Communication lessons (learned from past sessions):\n${sections.join('\n\n')}`
}

// ── Internal helpers ───────────────────────────────────────────

/**
 * Remove near-duplicate patterns by checking substring overlap.
 * If pattern A contains pattern B or vice versa, keep the longer one.
 */
function deduplicatePatterns(patterns: string[]): string[] {
  const unique: string[] = []

  for (const pattern of patterns) {
    const lower = pattern.toLowerCase()
    const isDuplicate = unique.some(existing => {
      const existingLower = existing.toLowerCase()
      return existingLower.includes(lower) || lower.includes(existingLower)
    })

    if (!isDuplicate) {
      unique.push(pattern)
    } else {
      // If the new one is longer (more specific), replace the shorter one
      const shorterIdx = unique.findIndex(existing => {
        const existingLower = existing.toLowerCase()
        return lower.includes(existingLower) && pattern.length > existing.length
      })
      if (shorterIdx >= 0) {
        unique[shorterIdx] = pattern
      }
    }
  }

  return unique
}
