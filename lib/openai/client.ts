/**
 * @deprecated — Use lib/ai/router.ts instead.
 *
 * This file is kept for backwards compatibility only.
 * All AI calls now go through OpenRouter via lib/ai/router.ts
 * with automatic model selection and fallback chains.
 *
 * Migration (March 2026):
 * - lib/ai/router.ts — callChat(), callMemory(), callReranking(), etc.
 * - lib/ai/models.ts — all model definitions and fallback chains
 * - Embeddings: getEmbeddingClient() (OpenAI direct)
 * - Whisper: getWhisperClient() (Groq direct)
 */

// Re-export from new location for any remaining references
export { getEmbeddingClient as openai } from '@/lib/ai/router'
export { getProviderInfo } from '@/lib/ai/router'

export function getModel(): string {
  return 'DEPRECATED — use lib/ai/router.ts'
}
