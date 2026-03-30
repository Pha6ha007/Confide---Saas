import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getWhisperClient } from '@/lib/ai/router'
import { WHISPER_MODEL } from '@/lib/ai/models'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { ErrorResponse } from '@/types'
import { safeErrorBody } from '@/lib/utils/safe-error'

/**
 * POST /api/voice
 *
 * Транскрибирует аудио в текст через Whisper (Groq или OpenAI)
 *
 * Body: FormData с файлом audio
 *
 * ВСЕГДА:
 * - Auth check первым
 * - Валидация формата аудио
 * - Лимит размера файла
 */

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (Whisper limit)
const ALLOWED_FORMATS = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
]

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
    // 2. ПОЛУЧИТЬ USER PLAN ДЛЯ RATE LIMITING
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    })

    if (!dbUser) {
      return NextResponse.json<ErrorResponse>(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // ============================================
    // 3. RATE LIMITING (PostgreSQL-based for serverless)
    // ============================================
    const rateLimitResult = await checkRateLimit(
      user.id,
      dbUser.plan as 'free' | 'pro' | 'premium',
      '/api/voice'
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
    // 4. ПОЛУЧИТЬ АУДИО ФАЙЛ ИЗ FORMDATA
    // ============================================
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json<ErrorResponse>(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // ============================================
    // 5. ВАЛИДАЦИЯ ФАЙЛА
    // ============================================
    // Проверить размер
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Проверить формат
    if (!ALLOWED_FORMATS.includes(audioFile.type)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid audio format',
          details: `Allowed formats: ${ALLOWED_FORMATS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // ============================================
    // 6. ТРАНСКРИПЦИЯ ЧЕРЕЗ WHISPER
    // ============================================
    // Groq Whisper (fast, free tier) with OpenAI Whisper fallback
    const whisperClient = getWhisperClient()
    const whisperModel = WHISPER_MODEL

    const transcription = await whisperClient.audio.transcriptions.create({
      file: audioFile,
      model: whisperModel,
      language: 'en', // NOTE: можно добавить поддержку 'ru' через user.language
      response_format: 'json',
    })

    const transcribedText = transcription.text

    if (!transcribedText || transcribedText.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Transcription failed',
          details: 'Could not transcribe audio. Please try again.',
        },
        { status: 500 }
      )
    }

    // ============================================
    // 7. ВЕРНУТЬ ТРАНСКРИПЦИЮ (с rate limit headers)
    // ============================================
    return NextResponse.json(
      {
        text: transcribedText,
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Voice transcription error:', error)

    return NextResponse.json<ErrorResponse>(
      safeErrorBody('Internal server error', error),
      { status: 500 }
    )
  }
}
