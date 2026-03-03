import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { openai, getModel } from '@/lib/openai/client'
import {
  buildMemoryPrompt,
  mergeProfileWithExtraction,
} from '@/agents/prompts/memory'
import { ErrorResponse } from '@/types'

const prisma = new PrismaClient()

// Валидация входных данных
const MemoryRequestSchema = z.object({
  sessionId: z.string().uuid(),
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
    const validation = MemoryRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { sessionId } = validation.data

    // ============================================
    // 3. ПРОВЕРИТЬ ЧТО СЕССИЯ ПРИНАДЛЕЖИТ ПОЛЬЗОВАТЕЛЮ
    // ============================================
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          include: { profile: true },
        },
      },
    })

    if (!session) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.userId !== user.id) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // ============================================
    // 4. ПРОВЕРИТЬ ЧТО СЕССИЯ НЕ ОБРАБОТАНА
    // ============================================
    if (session.summary) {
      return NextResponse.json({
        message: 'Session already processed',
        summary: session.summary,
      })
    }

    // ============================================
    // 5. ФОРМАТИРОВАТЬ CONVERSATION
    // ============================================
    const conversation = session.messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'User' : session.user.companionName
        return `${role}: ${msg.content}`
      })
      .join('\n\n')

    if (session.messages.length < 2) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Not enough messages',
          details: 'Need at least 2 messages to analyze',
        },
        { status: 400 }
      )
    }

    // ============================================
    // 6. ВЫЗВАТЬ MEMORY AGENT
    // ============================================
    const memoryPrompt = buildMemoryPrompt(
      conversation,
      session.user.profile,
      session.user.language as 'en' | 'ru'
    )

    const memoryCompletion = await openai.chat.completions.create({
      model: getModel(),
      messages: [{ role: 'user', content: memoryPrompt }],
      temperature: 0.3, // Низкая температура для точности
      max_tokens: 1000,
    })

    const memoryResponse = memoryCompletion.choices[0]?.message?.content

    if (!memoryResponse) {
      throw new Error('Memory Agent returned empty response')
    }

    // ============================================
    // 7. ПАРСИТЬ JSON ОТВЕТ
    // ============================================
    let extraction
    try {
      // Удалить markdown code blocks если есть
      const cleanJson = memoryResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      extraction = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Failed to parse Memory Agent response:', memoryResponse)
      throw new Error('Memory Agent returned invalid JSON')
    }

    // ============================================
    // 8. MERGE С СУЩЕСТВУЮЩИМ ПРОФИЛЕМ
    // ============================================
    const updatedProfileData = mergeProfileWithExtraction(
      extraction,
      session.user.profile
    )

    // ============================================
    // 9. СОХРАНИТЬ ПРОФИЛЬ В БД
    // ============================================
    if (session.user.profile) {
      // Обновить существующий профиль
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: updatedProfileData,
      })
    } else {
      // Создать новый профиль
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          ...updatedProfileData,
        },
      })
    }

    // ============================================
    // 10. ГЕНЕРИРОВАТЬ SESSION SUMMARY
    // ============================================
    const summaryPrompt =
      session.user.language === 'ru'
        ? `Сожми этот разговор в 2-3 предложения. Фокус на главных темах и инсайтах:\n\n${conversation}`
        : `Summarize this conversation in 2-3 sentences. Focus on main topics and insights:\n\n${conversation}`

    const summaryCompletion = await openai.chat.completions.create({
      model: getModel(),
      messages: [{ role: 'user', content: summaryPrompt }],
      temperature: 0.5,
      max_tokens: 200,
    })

    const summary =
      summaryCompletion.choices[0]?.message?.content ||
      'Session completed successfully.'

    // ============================================
    // 11. СОХРАНИТЬ SUMMARY В СЕССИИ
    // ============================================
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        summary,
        endedAt: new Date(),
      },
    })

    // ============================================
    // 12. ВЕРНУТЬ РЕЗУЛЬТАТ
    // ============================================
    return NextResponse.json({
      success: true,
      summary,
      extraction,
      profileUpdated: true,
    })
  } catch (error) {
    console.error('Memory API error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
