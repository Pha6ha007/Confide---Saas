import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { textToSpeech } from '@/lib/elevenlabs/client'
import { getVoiceConfig } from '@/lib/voices/config'
import { checkIpRateLimit, rateLimitResponse } from '@/lib/utils/ip-rate-limit'

/**
 * API endpoint для превью голосов во время онбординга
 *
 * POST /api/voice/preview
 * Body: { voiceKey: string, companionName?: string }
 *
 * ВАЖНО:
 * - Этот endpoint НЕ требует авторизации (используется в онбординге)
 * - Возвращает audio/mpeg для прослушивания
 * - Rate limited: 10 запросов в минуту с одного IP
 */

const PreviewSchema = z.object({
  voiceKey: z.string().min(1),
  companionName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 0. IP RATE LIMIT (no auth — protect ElevenLabs credits)
    // ============================================
    const rl = checkIpRateLimit(request, {
      limit: 10,
      windowSeconds: 60,
      endpoint: '/api/voice/preview',
    })
    if (!rl.success) return rateLimitResponse(rl)

    // ============================================
    // 1. ВАЛИДАЦИЯ
    // ============================================
    const body = await request.json()
    const validation = PreviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.message },
        { status: 400 }
      )
    }

    const { voiceKey, companionName } = validation.data

    // ============================================
    // 2. ПОЛУЧИТЬ КОНФИГ ГОЛОСА
    // ============================================
    const voiceConfig = getVoiceConfig(voiceKey)

    if (!voiceConfig) {
      return NextResponse.json(
        { error: 'Voice not found' },
        { status: 404 }
      )
    }

    // ============================================
    // 3. ПЕРСОНАЛИЗИРОВАТЬ ТЕКСТ ПРЕВЬЮ
    // ============================================
    let previewText = voiceConfig.previewText

    // Если указано имя компаньона, персонализируем текст
    if (companionName) {
      previewText = `Hi, I'm ${companionName}. ${previewText.split('. ').slice(1).join('. ')}`
    }

    // ============================================
    // 4. ГЕНЕРАЦИЯ АУДИО ЧЕРЕЗ ELEVENLABS
    // ============================================
    const audioBuffer = await textToSpeech(
      previewText,
      voiceConfig.id,
      voiceConfig.gender
    )

    // ============================================
    // 5. ВОЗВРАТ АУДИО
    // ============================================
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Кэшировать на 1 час
      },
    })
  } catch (error) {
    console.error('Voice preview error:', error)

    return NextResponse.json(
      { error: 'Failed to generate voice preview' },
      { status: 500 }
    )
  }
}

