/**
 * Rate Limiting для API endpoints
 *
 * Простая in-memory реализация для старта.
 * TODO: При масштабировании переместить в Redis
 */

import { RateLimit } from '@/types'

// Rate limits по планам
const RATE_LIMITS: Record<string, RateLimit> = {
  free: {
    plan: 'free',
    maxRequests: 5,
    windowMs: 10 * 60 * 1000, // 10 минут
  },
  pro: {
    plan: 'pro',
    maxRequests: 30,
    windowMs: 10 * 60 * 1000, // 10 минут
  },
  premium: {
    plan: 'premium',
    maxRequests: 60,
    windowMs: 10 * 60 * 1000, // 10 минут
  },
}

// In-memory хранилище запросов
// Структура: Map<userId, Array<timestamp>>
const requestStore = new Map<string, number[]>()

/**
 * Проверить rate limit для пользователя
 *
 * @param userId - ID пользователя
 * @param plan - План подписки
 * @returns { allowed: boolean, remaining: number, resetAt: Date }
 */
export function checkRateLimit(
  userId: string,
  plan: 'free' | 'pro' | 'premium' = 'free'
): {
  allowed: boolean
  remaining: number
  resetAt: Date
} {
  const limit = RATE_LIMITS[plan]
  const now = Date.now()
  const windowStart = now - limit.windowMs

  // Получить историю запросов пользователя
  let requests = requestStore.get(userId) || []

  // Удалить запросы вне окна
  requests = requests.filter((timestamp) => timestamp > windowStart)

  // Обновить хранилище
  requestStore.set(userId, requests)

  // Проверить лимит
  const allowed = requests.length < limit.maxRequests
  const remaining = Math.max(0, limit.maxRequests - requests.length)

  // Время сброса = конец текущего окна
  const resetAt = new Date(now + limit.windowMs)

  return {
    allowed,
    remaining,
    resetAt,
  }
}

/**
 * Записать новый запрос
 *
 * @param userId - ID пользователя
 */
export function recordRequest(userId: string): void {
  const now = Date.now()
  const requests = requestStore.get(userId) || []
  requests.push(now)
  requestStore.set(userId, requests)
}

/**
 * Получить лимит по плану
 *
 * @param plan - План подписки
 * @returns Объект RateLimit
 */
export function getRateLimit(plan: 'free' | 'pro' | 'premium'): RateLimit {
  return RATE_LIMITS[plan]
}

/**
 * Очистка старых записей (запускать периодически)
 * В production это должно быть в background job
 */
export function cleanupOldRequests(): void {
  const now = Date.now()
  const maxWindow = 10 * 60 * 1000 // 10 минут

  for (const [userId, requests] of requestStore.entries()) {
    const filtered = requests.filter((timestamp) => timestamp > now - maxWindow)

    if (filtered.length === 0) {
      requestStore.delete(userId)
    } else {
      requestStore.set(userId, filtered)
    }
  }
}

// Очистка каждые 5 минут
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldRequests, 5 * 60 * 1000)
}
