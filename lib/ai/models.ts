/**
 * Confide AI Model Configuration
 *
 * Central registry of all models used across the platform.
 * Each task gets its own model chain with automatic fallback.
 *
 * Architecture:
 * - OpenRouter as primary gateway (one API key, 300+ models)
 * - Each task has a PRIMARY model and a FALLBACK chain
 * - On error (timeout, 429, 500, 404) → auto-switch to next model
 * - Embeddings stay on OpenAI direct (OpenRouter doesn't support embeddings well)
 * - Whisper stays on Groq/OpenAI direct (audio transcription not via OpenRouter)
 */

// ============================================
// MODEL DEFINITIONS
// ============================================

export interface ModelConfig {
  id: string           // OpenRouter model ID
  name: string         // Human-readable name
  maxTokens: number    // Max output tokens for this task
  temperature: number  // Default temperature
  contextWindow: number // Context window size
}

/**
 * All models used in Confide, organized by task.
 *
 * Pricing (per 1M tokens):
 * - MiniMax M2-her:         $0.30 / $1.20  (companion-first, 66K ctx)
 * - MiniMax M2.7:           $0.30 / $1.20  (reasoning + character, 204K ctx)
 * - Claude Sonnet 4.6:      $3.00 / $15.00 (best empathetic, 1M ctx)
 * - Gemini 3.1 Flash Lite:  $0.25 / $1.50  (fastest, 1M ctx)
 * - DeepSeek V3.2:          $0.25 / $0.38  (cheapest structured output)
 * - GPT-4o-mini:            $0.15 / $0.60  (reliable fallback)
 */

// ── Chat Models (by user plan) ──────────────────────────────────

export const CHAT_MODELS = {
  /** Free plan — companion-focused, warm tone, 66K context */
  free: {
    primary: { id: 'minimax/minimax-m2-her', name: 'MiniMax M2-her', maxTokens: 200, temperature: 0.7, contextWindow: 66_000 },
    fallbacks: [
      { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 200, temperature: 0.7, contextWindow: 204_800 },
      { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 200, temperature: 0.7, contextWindow: 1_000_000 },
    ],
  },
  /** Pro plan — reasoning + character consistency, 204K context */
  pro: {
    primary: { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 200, temperature: 0.7, contextWindow: 204_800 },
    fallbacks: [
      { id: 'minimax/minimax-m2-her', name: 'MiniMax M2-her', maxTokens: 200, temperature: 0.7, contextWindow: 66_000 },
      { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 200, temperature: 0.7, contextWindow: 1_000_000 },
    ],
  },
  /** Premium plan — best empathetic model, 1M context */
  premium: {
    primary: { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', maxTokens: 200, temperature: 0.7, contextWindow: 1_000_000 },
    fallbacks: [
      { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 200, temperature: 0.7, contextWindow: 204_800 },
      { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 200, temperature: 0.7, contextWindow: 1_000_000 },
    ],
  },
} as const satisfies Record<string, { primary: ModelConfig; fallbacks: ModelConfig[] }>

// ── Task-Specific Models ────────────────────────────────────────

/** Memory Agent — JSON extraction from session, low temperature */
export const MEMORY_MODEL = {
  primary: { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 1000, temperature: 0.3, contextWindow: 204_800 },
  fallbacks: [
    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 1000, temperature: 0.3, contextWindow: 1_000_000 },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 1000, temperature: 0.3, contextWindow: 128_000 },
  ],
}

/** Session Summary — brief compression, medium temperature */
export const SUMMARY_MODEL = {
  primary: { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 200, temperature: 0.5, contextWindow: 204_800 },
  fallbacks: [
    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 200, temperature: 0.5, contextWindow: 1_000_000 },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 200, temperature: 0.5, contextWindow: 128_000 },
  ],
}

/** Crisis Detection — FASTEST response time, minimal output */
export const CRISIS_MODEL = {
  primary: { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 50, temperature: 0, contextWindow: 1_000_000 },
  fallbacks: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 50, temperature: 0, contextWindow: 128_000 },
  ],
}

/** RAG Reranking — structured scoring, cheap */
export const RERANKING_MODEL = {
  primary: { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', maxTokens: 500, temperature: 0, contextWindow: 131_072 },
  fallbacks: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 500, temperature: 0, contextWindow: 128_000 },
  ],
}

/** RAG Query Expansion — cheap, structured */
export const QUERY_EXPANSION_MODEL = {
  primary: { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', maxTokens: 300, temperature: 0.3, contextWindow: 131_072 },
  fallbacks: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 300, temperature: 0.3, contextWindow: 128_000 },
  ],
}

/** Memory Dedup — merge/compare decisions, cheap */
export const DEDUP_MODEL = {
  primary: { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', maxTokens: 300, temperature: 0, contextWindow: 131_072 },
  fallbacks: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 300, temperature: 0, contextWindow: 128_000 },
  ],
}

/** Procedural Memory — style analysis, cheap */
export const PROCEDURAL_MODEL = {
  primary: { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', maxTokens: 300, temperature: 0, contextWindow: 131_072 },
  fallbacks: [
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 300, temperature: 0, contextWindow: 128_000 },
  ],
}

/** Diary Generation — literary quality, warm tone */
export const DIARY_MODEL = {
  primary: { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', maxTokens: 500, temperature: 0.7, contextWindow: 1_000_000 },
  fallbacks: [
    { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 500, temperature: 0.7, contextWindow: 204_800 },
    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 500, temperature: 0.7, contextWindow: 1_000_000 },
  ],
}

/** Homework Generation — practical, warm */
export const HOMEWORK_MODEL = {
  primary: { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 200, temperature: 0.7, contextWindow: 204_800 },
  fallbacks: [
    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 200, temperature: 0.7, contextWindow: 1_000_000 },
  ],
}

/** Proactive Messages — friend-like tone */
export const PROACTIVE_MODEL = {
  primary: { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', maxTokens: 100, temperature: 0.8, contextWindow: 204_800 },
  fallbacks: [
    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', maxTokens: 100, temperature: 0.8, contextWindow: 1_000_000 },
  ],
}

// ── Embedding Model (stays on OpenAI direct — not via OpenRouter) ──

export const EMBEDDING_MODEL = 'text-embedding-3-small'

// ── Whisper Model (stays on Groq direct — not via OpenRouter) ──

export const WHISPER_MODEL = 'whisper-large-v3-turbo'
