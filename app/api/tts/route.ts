import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { textToSpeech, textToSpeechStream } from '@/lib/elevenlabs/client'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { ErrorResponse } from '@/types'



/**
 * POST /api/tts
 *
 * Генерирует аудио из текста через ElevenLabs
 *
 * Body: { text: string }
 *
 * ВСЕГДА:
 * - Auth check первым
 * - Plan check (голос только для Pro/Premium)
 * - Валидация длины текста
 * - Использует voiceId из профиля пользователя
 */

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  stream: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTH CHECK (всегда первым!)
    // ============================================
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ============================================
    // 2. ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
    // ============================================
    const body = await request.json()
    const validation = TTSRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { text, stream: useStreaming } = validation.data

    // ============================================
    // 3. ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ ИЗ БД
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      return NextResponse.json<ErrorResponse>(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ============================================
    // 4. RATE LIMITING (PostgreSQL-based for serverless)
    // ============================================
    const rateLimitResult = await checkRateLimit(
      user.id,
      dbUser.plan as 'free' | 'pro' | 'premium',
      '/api/tts'
    )

    if (!rateLimitResult.success) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Rate limit exceeded',
          details: `${dbUser.plan} plan: ${rateLimitResult.limit} messages per 10 minutes. Upgrade for more.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
          },
        }
      )
    }

    // ============================================
    // 5. PLAN CHECK (голос только для Pro/Premium)
    // ============================================
    if (dbUser.plan === 'free') {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Voice unavailable on free plan',
          details: 'Upgrade to Pro or Premium to use voice features',
        },
        { status: 403 }
      )
    }

    // ============================================
    // 6. ГЕНЕРАЦИЯ РЕЧИ ЧЕРЕЗ ELEVENLABS
    // ============================================
    // Используем voiceId из профиля или дефолтный по полу
    const gender: 'male' | 'female' | undefined =
      dbUser.companionGender === 'male' || dbUser.companionGender === 'female'
        ? dbUser.companionGender
        : 'female'

    const rateLimitHeaders = {
      'X-RateLimit-Limit': rateLimitResult.limit.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
    }

    // ============================================
    // 7. STREAMING MODE — chunked transfer for low latency
    // ============================================
    if (useStreaming) {
      const audioStream = await textToSpeechStream(
        text,
        dbUser.voiceId || undefined,
        gender
      )

      return new NextResponse(audioStream as any, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
          ...rateLimitHeaders,
        },
      })
    }

    // ============================================
    // 7b. BUFFERED MODE — full response (legacy, cached)
    // ============================================
    const audioBuffer = await textToSpeech(
      text,
      dbUser.voiceId || undefined,
      gender
    )

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        // Cache для экономии запросов (тот же текст = тот же аудио)
        'Cache-Control': 'public, max-age=3600',
        ...rateLimitHeaders,
      },
    })
  } catch (error) {
    console.error('TTS error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
