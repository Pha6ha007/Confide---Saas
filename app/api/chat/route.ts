import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { openai, getModel } from '@/lib/openai/client'
import { textToSpeech } from '@/lib/elevenlabs/client'
import {
  buildAnxietyPrompt,
  buildFamilyPrompt,
  buildTraumaPrompt,
  buildRelationshipsPrompt,
  buildMensPrompt,
  buildWomensPrompt,
} from '@/agents/prompts'
import { detectCrisis, getCrisisResponse, logCrisisEvent } from '@/agents/crisis/protocol'
import { checkRateLimit, recordRequest } from '@/lib/utils/rate-limit'
import { retrieveContext, formatContextForPrompt } from '@/lib/pinecone/retrieval'
import { getNamespaceForAgent } from '@/lib/pinecone/namespace-mapping'
import { ChatResponse, ErrorResponse, AgentType } from '@/types'
import { routeToAgent, shouldReroute } from '@/lib/agents/orchestrator'



// Валидация входных данных
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid().optional(),
  enableVoiceResponse: z.boolean().optional(), // Флаг для голосового ответа
  moodScore: z.number().int().min(1).max(10).optional(), // Mood score для новой сессии
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

    const { message: userMessage, sessionId, enableVoiceResponse, moodScore } = validation.data

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
    // 6. СОЗДАТЬ ИЛИ НАЙТИ СЕССИЮ + ORCHESTRATOR ROUTING
    // ============================================
    // Создаём fallback для userProfile если его нет
    const userProfile = dbUser.profile || {
      communicationStyle: {},
      emotionalProfile: {},
      lifeContext: {},
      patterns: [],
      progress: {},
      whatWorked: [],
    }

    let session
    let routingDecision

    if (sessionId) {
      session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 5, // First few messages for routing context
          },
        },
      })
    }

    if (!session) {
      // NEW SESSION - Use Orchestrator to determine which agent
      routingDecision = await routeToAgent(
        user.id,
        userMessage,
        userProfile as any,
        dbUser.companionGender as 'male' | 'female' | undefined,
        0 // First message
      )

      session = await prisma.session.create({
        data: {
          userId: user.id,
          agentType: routingDecision.route,
          moodScore: moodScore || null, // Сохранить mood score если передан
        },
      })

      // Log routing decision in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Orchestrator] New session routing:')
        console.log(`  Agent: ${routingDecision.route}`)
        console.log(`  Confidence: ${routingDecision.confidence.toFixed(2)}`)
        console.log(`  Reasoning: ${routingDecision.reasoning}`)
        console.log(`  Topics: ${routingDecision.detectedTopics.join(', ')}`)
      }
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
    // 8. ЗАГРУЗИТЬ КОНТЕКСТ ИЗ ИСТОРИИ
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
    // 9.5. MID-CONVERSATION RE-ROUTING (Handoff Protocol)
    // ============================================
    // Check if we should switch agents based on topic shift
    const messageCount = recentMessages.length
    if (messageCount >= 5) {
      const rerouting = await shouldReroute(
        session.id,
        session.agentType as AgentType,
        recentMessages.map((m) => ({ role: m.role, content: m.content })),
        userProfile as any,
        dbUser.companionGender as 'male' | 'female' | undefined
      )

      if (rerouting.shouldReroute && rerouting.newAgent) {
        // Update session agent type
        await prisma.session.update({
          where: { id: session.id },
          data: { agentType: rerouting.newAgent },
        })

        // Update local session object
        session.agentType = rerouting.newAgent

        // Log handoff in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[Orchestrator] Mid-conversation handoff:')
          console.log(`  From: ${rerouting.handoffPayload?.fromAgent}`)
          console.log(`  To: ${rerouting.newAgent}`)
          console.log(`  Reason: ${rerouting.reason}`)
        }
      }
    }

    // ============================================
    // 10. RAG NAMESPACE & RETRIEVAL (после возможного handoff)
    // ============================================
    // NOTE: Namespace определяется ПОСЛЕ возможного handoff в шаге 9.5
    const agentNamespace = getNamespaceForAgent(session.agentType as AgentType)

    // Получить top-5 релевантных чанков из Pinecone
    const retrievedChunks = await retrieveContext(userMessage, agentNamespace, 5)

    // Форматировать для system prompt
    const ragContext = formatContextForPrompt(retrievedChunks)

    // ============================================
    // 11. ПОСТРОИТЬ SYSTEM PROMPT (с RAG контекстом)
    // ============================================
    const promptParams = {
      userProfile: userProfile as any,
      recentHistory: recentHistory || undefined,
      pastSessions: pastSessionsContext,
      ragContext: ragContext || undefined,
      companionName: dbUser.companionName || 'Alex', // Fallback если пустой
      preferredName: dbUser.preferredName || undefined,
      language: dbUser.language as 'en' | 'ru',
    }

    // Route to appropriate agent prompt builder
    let systemPrompt: string

    switch (session.agentType) {
      case 'anxiety':
        systemPrompt = buildAnxietyPrompt(promptParams)
        break
      case 'family':
        systemPrompt = buildFamilyPrompt(promptParams)
        break
      case 'trauma':
        systemPrompt = buildTraumaPrompt(promptParams)
        break
      case 'relationships':
        systemPrompt = buildRelationshipsPrompt(promptParams)
        break
      case 'mens':
        systemPrompt = buildMensPrompt(promptParams)
        break
      case 'womens':
        systemPrompt = buildWomensPrompt(promptParams)
        break
      default:
        // Fallback to anxiety agent
        systemPrompt = buildAnxietyPrompt(promptParams)
    }

    // ============================================
    // 12. ВЫЗВАТЬ AI (Groq/OpenAI)
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
    // 13. СОХРАНИТЬ ASSISTANT MESSAGE
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
    // 13.5. ГЕНЕРАЦИЯ ГОЛОСОВОГО ОТВЕТА (если запрошено)
    // ============================================
    let audioUrl: string | undefined

    if (enableVoiceResponse && (dbUser.plan === 'pro' || dbUser.plan === 'premium')) {
      try {
        // Генерировать аудио через ElevenLabs
        const audioBuffer = await textToSpeech(
          assistantMessage,
          dbUser.voiceId || undefined,
          dbUser.companionGender as 'male' | 'female' | undefined
        )

        // TODO: Загрузить в Supabase Storage
        // Пока вернём как base64 data URL для тестирования
        const base64Audio = Buffer.from(audioBuffer).toString('base64')
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`

        // Обновить message с audioUrl
        await prisma.message.update({
          where: { id: assistantMessageRecord.id },
          data: { audioUrl },
        })
      } catch (error) {
        console.error('Failed to generate voice response:', error)
        // Не блокируем ответ если аудио не сгенерировалось
      }
    }

    // ============================================
    // 14. ВЕРНУТЬ ОТВЕТ (с sources из RAG)
    // ============================================
    return NextResponse.json<ChatResponse>({
      message: assistantMessage,
      messageId: assistantMessageRecord.id,
      sessionId: session.id,
      audioUrl, // Добавляем audioUrl если сгенерировано
      sources: retrievedChunks.map((chunk) => ({
        title: chunk.metadata.book_title,
        author: chunk.metadata.author,
        excerpt: chunk.text.slice(0, 200) + (chunk.text.length > 200 ? '...' : ''),
        score: chunk.score,
      })),
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
