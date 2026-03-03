import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { openai, getModel } from '@/lib/openai/client'
import { buildAnxietyPrompt } from '@/agents/prompts/anxiety'
import { detectCrisis, getCrisisResponse, logCrisisEvent } from '@/agents/crisis/protocol'
import { checkRateLimit, recordRequest } from '@/lib/utils/rate-limit'
import { sendWelcomeEmail } from '@/lib/resend/client'
import { ChatResponse, ErrorResponse } from '@/types'

const prisma = new PrismaClient()

// Валидация входных данных
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid().optional(),
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
    const validation = ChatRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { message: userMessage, sessionId } = validation.data

    // ============================================
    // 3. ПОЛУЧИТЬ ИЛИ СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ В БД
    // ============================================
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    })

    // Создать пользователя если первый раз
    // NOTE: companionName останется пустым до прохождения онбординга
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || 'unknown@example.com',
          plan: 'free',
          companionName: '', // Пустое значение — пользователь пройдёт онбординг
          language: 'en',
          profile: {
            create: {
              communicationStyle: {},
              emotionalProfile: {},
              lifeContext: {},
              patterns: [],
              progress: {},
              whatWorked: [],
            },
          },
        },
        include: { profile: true },
      })

      // Welcome email отправится ПОСЛЕ онбординга (из /api/onboarding)
    }

    // ============================================
    // 4. RATE LIMITING
    // ============================================
    const { allowed, remaining } = checkRateLimit(user.id, dbUser.plan as any)

    if (!allowed) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Rate limit exceeded',
          details: `Free plan: 5 messages per 10 minutes. Upgrade for more.`,
        },
        { status: 429 }
      )
    }

    recordRequest(user.id)

    // ============================================
    // 5. CRISIS DETECTION (параллельно, hardcoded)
    // ============================================
    const isCrisis = detectCrisis(userMessage)

    if (isCrisis) {
      // Логируем без содержания
      await logCrisisEvent(user.id, sessionId || 'no-session')

      // Возвращаем hardcoded ответ
      const crisisResponse = getCrisisResponse(dbUser.language as 'en' | 'ru')

      return NextResponse.json({
        message: crisisResponse.message,
        isCrisis: true,
        resources: crisisResponse.resources,
        messageId: crypto.randomUUID(),
        sessionId: sessionId || crypto.randomUUID(),
      })
    }

    // ============================================
    // 6. СОЗДАТЬ ИЛИ НАЙТИ СЕССИЮ
    // ============================================
    let session
    if (sessionId) {
      session = await prisma.session.findUnique({
        where: { id: sessionId },
      })
    }

    if (!session) {
      session = await prisma.session.create({
        data: {
          userId: user.id,
          agentType: 'anxiety', // Пока только anxiety agent
        },
      })
    }

    // ============================================
    // 7. СОХРАНИТЬ USER MESSAGE
    // ============================================
    const userMessageRecord = await prisma.message.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        role: 'user',
        content: userMessage,
      },
    })

    // ============================================
    // 8. ЗАГРУЗИТЬ КОНТЕКСТ
    // ============================================
    // Последние 30 сообщений из этой сессии
    const recentMessages = await prisma.message.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    // Перевернуть чтобы были в хронологическом порядке
    recentMessages.reverse()

    // Форматировать в строку для контекста
    const recentHistory = recentMessages
      .slice(0, -1) // Исключить текущее сообщение (оно последнее)
      .map((msg) => `${msg.role === 'user' ? 'User' : dbUser.companionName}: ${msg.content}`)
      .join('\n')

    // Загрузить последние 3 summary из прошлых сессий
    const pastSessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        summary: { not: null },
        id: { not: session.id }, // Исключить текущую сессию
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        summary: true,
        createdAt: true,
      },
    })

    // Форматировать past sessions для контекста
    const pastSessionsContext = pastSessions.length > 0
      ? pastSessions
          .reverse() // Хронологический порядок (старые → новые)
          .map((s, i) => {
            const daysAgo = Math.floor(
              (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            )
            const timeLabel = daysAgo === 0
              ? 'today'
              : daysAgo === 1
              ? 'yesterday'
              : `${daysAgo} days ago`
            return `Session ${timeLabel}: ${s.summary}`
          })
          .join('\n')
      : undefined

    // ============================================
    // 9. ПОСТРОИТЬ SYSTEM PROMPT
    // ============================================
    const systemPrompt = buildAnxietyPrompt({
      userProfile: dbUser.profile,
      recentHistory: recentHistory || undefined,
      pastSessions: pastSessionsContext,
      companionName: dbUser.companionName || 'Alex', // Fallback если пустой
      preferredName: dbUser.preferredName || undefined,
      language: dbUser.language as 'en' | 'ru',
    })

    // ============================================
    // 10. ВЫЗВАТЬ AI (Groq/OpenAI)
    // ============================================
    const completion = await openai.chat.completions.create({
      model: getModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const assistantMessage = completion.choices[0]?.message?.content ||
      'I apologize, but I had trouble generating a response. Could you try again?'

    // ============================================
    // 11. СОХРАНИТЬ ASSISTANT MESSAGE
    // ============================================
    const assistantMessageRecord = await prisma.message.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        role: 'assistant',
        content: assistantMessage,
      },
    })

    // ============================================
    // 12. ВЕРНУТЬ ОТВЕТ
    // ============================================
    return NextResponse.json<ChatResponse>({
      message: assistantMessage,
      messageId: assistantMessageRecord.id,
      sessionId: session.id,
      // TODO: sources когда подключим RAG
    })
  } catch (error) {
    console.error('Chat API error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
