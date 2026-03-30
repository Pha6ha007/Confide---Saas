/**
 * Confide AI Router — Unified AI client with automatic fallback
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │  callWithFallback(taskModels, messages, overrides?)     │
 * │                                                         │
 * │  1. Try PRIMARY model                                   │
 * │  2. On error → try FALLBACK[0]                          │
 * │  3. On error → try FALLBACK[1]                          │
 * │  4. All failed → throw with details                     │
 * │                                                         │
 * │  Retryable errors: 429, 500, 502, 503, 504, timeout    │
 * │  Non-retryable: 400, 401, 403 (don't waste fallbacks)  │
 * └─────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   import { callChat, callMemory, callReranking } from '@/lib/ai/router'
 *
 *   // Chat with user (model selected by plan)
 *   const response = await callChat('pro', messages)
 *
 *   // Memory extraction
 *   const result = await callMemory(messages)
 */

import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import {
  type ModelConfig,
  CHAT_MODELS,
  MEMORY_MODEL,
  SUMMARY_MODEL,
  CRISIS_MODEL,
  RERANKING_MODEL,
  QUERY_EXPANSION_MODEL,
  DEDUP_MODEL,
  PROCEDURAL_MODEL,
  DIARY_MODEL,
  HOMEWORK_MODEL,
  PROACTIVE_MODEL,
} from './models'

// ============================================
// CLIENT INITIALIZATION
// ============================================

/**
 * OpenRouter client — OpenAI-compatible, one API key for all models.
 * Used for all LLM chat completions.
 */
let _routerClient: OpenAI | null = null

function getRouterClient(): OpenAI {
  if (!_routerClient) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error(
        'Missing OPENROUTER_API_KEY in environment. ' +
        'Get one at https://openrouter.ai/settings/keys'
      )
    }
    _routerClient = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://confide.app',
        'X-Title': 'Confide',
      },
    })
  }
  return _routerClient
}

/**
 * Direct OpenAI client — used ONLY for embeddings (text-embedding-3-small).
 * OpenRouter doesn't reliably proxy embedding requests.
 */
let _embeddingClient: OpenAI | null = null

export function getEmbeddingClient(): OpenAI {
  if (!_embeddingClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY for embeddings')
    }
    _embeddingClient = new OpenAI({ apiKey })
  }
  return _embeddingClient
}

/**
 * Groq client — used ONLY for Whisper audio transcription.
 * Groq's Whisper is fast and free-tier friendly.
 * Falls back to OpenAI Whisper if Groq unavailable.
 */
let _whisperClient: OpenAI | null = null

export function getWhisperClient(): OpenAI {
  if (!_whisperClient) {
    const groqKey = process.env.GROQ_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    if (groqKey) {
      _whisperClient = new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1',
      })
    } else if (openaiKey) {
      _whisperClient = new OpenAI({ apiKey: openaiKey })
    } else {
      throw new Error('Missing GROQ_API_KEY or OPENAI_API_KEY for Whisper')
    }
  }
  return _whisperClient
}

// ============================================
// CORE FALLBACK ENGINE
// ============================================

/** Errors that should trigger fallback to next model */
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])

/** Errors that should NOT trigger fallback (bad request, auth issues) */
const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403])

interface CallOptions {
  /** Override temperature for this call */
  temperature?: number
  /** Override max_tokens for this call */
  maxTokens?: number
  /** Request timeout in ms (default: 30000) */
  timeout?: number
  /** Additional headers for OpenRouter */
  headers?: Record<string, string>
}

interface TaskModels {
  primary: ModelConfig
  fallbacks: ModelConfig[]
}

interface CallResult {
  content: string
  model: string       // Which model actually responded
  fallbackUsed: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Core function: call a model with automatic fallback chain.
 *
 * Tries primary model first, then each fallback in order.
 * Only retries on server/rate-limit errors — not on bad requests.
 *
 * @param taskModels - Primary + fallback models for this task
 * @param messages - Chat messages to send
 * @param options - Optional overrides (temperature, maxTokens, timeout)
 * @returns Response content + metadata about which model was used
 */
export async function callWithFallback(
  taskModels: TaskModels,
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  const client = getRouterClient()
  const allModels = [taskModels.primary, ...taskModels.fallbacks]
  const errors: Array<{ model: string; error: string; status?: number }> = []

  for (let i = 0; i < allModels.length; i++) {
    const model = allModels[i]
    const isRetry = i > 0

    try {
      const completion = await client.chat.completions.create({
        model: model.id,
        messages,
        temperature: options?.temperature ?? model.temperature,
        max_tokens: options?.maxTokens ?? model.maxTokens,
      }, {
        timeout: options?.timeout ?? 30_000,
        headers: options?.headers,
      })

      const content = completion.choices[0]?.message?.content

      if (!content) {
        errors.push({ model: model.id, error: 'Empty response from model' })
        continue
      }

      // Log fallback usage for monitoring
      if (isRetry) {
        console.warn(
          `[AI Router] Fallback activated: ${model.name} (attempt ${i + 1}/${allModels.length})`,
          `Previous errors: ${errors.map(e => `${e.model}: ${e.error}`).join('; ')}`
        )
      }

      return {
        content,
        model: model.id,
        fallbackUsed: isRetry,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined,
      }
    } catch (err: any) {
      const statusCode = err?.status || err?.response?.status || 0
      const errorMessage = err?.message || 'Unknown error'

      errors.push({ model: model.id, error: errorMessage, status: statusCode })

      // Don't retry on non-retryable errors (bad request, auth)
      if (NON_RETRYABLE_STATUS_CODES.has(statusCode)) {
        console.error(
          `[AI Router] Non-retryable error (${statusCode}) from ${model.name}: ${errorMessage}`
        )
        throw new Error(
          `AI request failed (${statusCode}): ${errorMessage}. Model: ${model.id}`
        )
      }

      // Log and continue to next fallback
      console.warn(
        `[AI Router] ${model.name} failed (${statusCode || 'timeout'}): ${errorMessage}. ` +
        `Trying fallback ${i + 1}/${allModels.length - 1}...`
      )
    }
  }

  // All models failed
  const errorSummary = errors.map(e => `${e.model} (${e.status || 'err'}): ${e.error}`).join('\n')
  console.error(`[AI Router] ALL MODELS FAILED:\n${errorSummary}`)
  throw new Error(
    `All AI models failed after ${allModels.length} attempts. ` +
    `Last error: ${errors[errors.length - 1]?.error}`
  )
}

// ============================================
// TASK-SPECIFIC CONVENIENCE FUNCTIONS
// ============================================

/**
 * Main chat — model selected by user plan.
 * This is the primary user-facing interaction.
 */
export async function callChat(
  plan: 'free' | 'pro' | 'premium',
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  const taskModels = CHAT_MODELS[plan]
  return callWithFallback(taskModels, messages, options)
}

/** Memory Agent — JSON extraction from session */
export async function callMemory(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(MEMORY_MODEL, messages, options)
}

/** Session Summary generation */
export async function callSummary(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(SUMMARY_MODEL, messages, options)
}

/** RAG Reranking — score chunks by relevance */
export async function callReranking(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(RERANKING_MODEL, messages, options)
}

/** RAG Query Expansion */
export async function callQueryExpansion(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(QUERY_EXPANSION_MODEL, messages, options)
}

/** Memory Dedup — merge/compare decisions */
export async function callDedup(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(DEDUP_MODEL, messages, options)
}

/** Procedural Memory — style analysis */
export async function callProcedural(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(PROCEDURAL_MODEL, messages, options)
}

/** Diary Generation — literary quality */
export async function callDiary(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(DIARY_MODEL, messages, options)
}

/** Homework Generation */
export async function callHomework(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(HOMEWORK_MODEL, messages, options)
}

/** Proactive Messages */
export async function callProactive(
  messages: ChatCompletionMessageParam[],
  options?: CallOptions
): Promise<CallResult> {
  return callWithFallback(PROACTIVE_MODEL, messages, options)
}

// ============================================
// PROVIDER INFO (for logging/debugging)
// ============================================

/**
 * Get info about current AI configuration.
 * Replaces the old getProviderInfo() from lib/openai/client.ts
 */
export function getProviderInfo(plan?: 'free' | 'pro' | 'premium') {
  const chatModel = plan ? CHAT_MODELS[plan].primary : CHAT_MODELS.free.primary
  return {
    provider: 'OpenRouter',
    gateway: 'https://openrouter.ai/api/v1',
    chatModel: chatModel.name,
    chatModelId: chatModel.id,
    memoryModel: MEMORY_MODEL.primary.name,
    rerankingModel: RERANKING_MODEL.primary.name,
    diaryModel: DIARY_MODEL.primary.name,
    embeddingModel: 'text-embedding-3-small (OpenAI direct)',
    whisperModel: 'whisper-large-v3-turbo (Groq direct)',
  }
}
