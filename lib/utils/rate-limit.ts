// Confide — Rate Limiting Utility
// PostgreSQL-based rate limiting for serverless environment (Vercel)
// CRITICAL: In-memory storage does NOT work in serverless — each invocation is separate

import { prisma } from "@/lib/prisma";

// Rate limits by plan (messages per 10 minutes)
const RATE_LIMITS = {
  free: 5,
  pro: 30,
  premium: 60,
} as const;

const WINDOW_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetIn: number; // seconds until window resets
}

/**
 * Check if user has exceeded rate limit for given endpoint
 * Uses PostgreSQL to track requests across serverless invocations
 *
 * @param userId - User ID from auth token
 * @param plan - User's subscription plan (free | pro | premium)
 * @param endpoint - API endpoint being accessed (/api/chat, /api/voice, /api/tts)
 * @returns RateLimitResult with success flag and metadata
 */
export async function checkRateLimit(
  userId: string,
  plan: "free" | "pro" | "premium",
  endpoint: string
): Promise<RateLimitResult> {
  const limit = RATE_LIMITS[plan];
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_DURATION_MS);

  try {
    // Find existing rate limit record for this user + endpoint
    const existing = await prisma.rateLimit.findUnique({
      where: {
        userId_endpoint: {
          userId,
          endpoint,
        },
      },
    });

    // If no record exists, create new one
    if (!existing) {
      await prisma.rateLimit.create({
        data: {
          userId,
          endpoint,
          count: 1,
          windowStart: now,
        },
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetIn: Math.ceil(WINDOW_DURATION_MS / 1000),
      };
    }

    // Check if window has expired (more than 10 minutes old)
    const windowExpired = existing.windowStart < windowStart;

    if (windowExpired) {
      // Reset window with new count
      await prisma.rateLimit.update({
        where: { id: existing.id },
        data: {
          count: 1,
          windowStart: now,
        },
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetIn: Math.ceil(WINDOW_DURATION_MS / 1000),
      };
    }

    // Window is still active — check if limit exceeded
    if (existing.count >= limit) {
      const resetIn = Math.ceil(
        (existing.windowStart.getTime() + WINDOW_DURATION_MS - now.getTime()) / 1000
      );

      return {
        success: false,
        limit,
        remaining: 0,
        resetIn: Math.max(0, resetIn),
      };
    }

    // Increment count
    await prisma.rateLimit.update({
      where: { id: existing.id },
      data: {
        count: existing.count + 1,
      },
    });

    const resetIn = Math.ceil(
      (existing.windowStart.getTime() + WINDOW_DURATION_MS - now.getTime()) / 1000
    );

    return {
      success: true,
      limit,
      remaining: limit - existing.count - 1,
      resetIn: Math.max(0, resetIn),
    };
  } catch (error) {
    console.error("[Rate Limit] Error checking rate limit:", error);

    // On error, fail open (allow request) but log the issue
    // This prevents rate limiting from blocking all requests if DB has issues
    return {
      success: true,
      limit,
      remaining: limit,
      resetIn: 0,
    };
  }
}

/**
 * Cleanup old rate limit records (older than 10 minutes)
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupOldRateLimits(): Promise<number> {
  const cutoff = new Date(Date.now() - WINDOW_DURATION_MS);

  try {
    const result = await prisma.rateLimit.deleteMany({
      where: {
        windowStart: {
          lt: cutoff,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error("[Rate Limit] Error cleaning up old records:", error);
    return 0;
  }
}
