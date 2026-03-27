// Confide — IP-based Rate Limiting for public endpoints
// Uses in-memory store with TTL. On Vercel, each function instance
// has its own memory — this means limits are per-instance, not global.
// For public endpoints this is acceptable: it stops casual abuse
// while keeping things simple. For heavy abuse, use Vercel WAF or Cloudflare.

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number // timestamp
}

// In-memory store per function instance
const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 60 seconds to prevent memory leaks
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 60_000

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

/**
 * Get client IP from request headers (Vercel, Cloudflare, etc.)
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export interface IpRateLimitConfig {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSeconds: number
  /** Unique key prefix for this endpoint */
  endpoint: string
}

export interface IpRateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetIn: number // seconds
}

/**
 * Check IP-based rate limit for public endpoints.
 * Does NOT require auth — uses client IP as identifier.
 *
 * Usage:
 *   const result = checkIpRateLimit(request, { limit: 10, windowSeconds: 60, endpoint: '/api/contact' })
 *   if (!result.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */
export function checkIpRateLimit(
  request: NextRequest,
  config: IpRateLimitConfig
): IpRateLimitResult {
  cleanup()

  const ip = getClientIp(request)
  const key = `${config.endpoint}:${ip}`
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000

  const existing = store.get(key)

  // No record or window expired — create fresh
  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetIn: config.windowSeconds,
    }
  }

  // Window still active — check limit
  if (existing.count >= config.limit) {
    const resetIn = Math.ceil((existing.resetAt - now) / 1000)
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetIn: Math.max(0, resetIn),
    }
  }

  // Increment
  existing.count++
  const resetIn = Math.ceil((existing.resetAt - now) / 1000)

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetIn: Math.max(0, resetIn),
  }
}

/**
 * Helper: return a 429 response with rate limit headers
 */
export function rateLimitResponse(result: IpRateLimitResult): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.resetIn),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetIn),
      },
    }
  )
}
