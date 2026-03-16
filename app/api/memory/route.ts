import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { openai, getModel } from '@/lib/openai/client'
import {
  buildMemoryPrompt,
  mergeProfileWithExtraction,
} from '@/agents/prompts/memory'
import { analyzeUserStyle, mergeStyleMetrics } from '@/lib/memory/style-analyzer'
import { processMemoriesWithDedup, type DedupResult } from '@/lib/memory/dedup-engine'
import {
  extractProceduralLessons,
  mergeProceduralMemory,
  type ProceduralMemory,
} from '@/lib/memory/procedural-memory'
import { ErrorResponse } from '@/types'



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
    // 6. STYLE ANALYSIS — АВТОМАТИЧЕСКИЙ АНАЛИЗ СТИЛЯ
    // ============================================
    // Анализируем стиль общения пользователя на основе сообщений этой сессии
    const messagesForAnalysis = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }))

    const newStyleMetrics = analyzeUserStyle(messagesForAnalysis)

    // Мерджим с существующими метриками (усреднение, накопление счётчиков)
    const existingStyleMetrics = (session.user.profile?.styleMetrics as any) || {}
    const mergedStyleMetrics = mergeStyleMetrics(
      existingStyleMetrics,
      newStyleMetrics
    )

    // ============================================
    // 7. ВЫЗВАТЬ MEMORY AGENT
    // ============================================
    const memoryPrompt = buildMemoryPrompt(
      conversation,
      session.user.profile as any,
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
    // 8. ПАРСИТЬ JSON ОТВЕТ
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
    // 9. MERGE С СУЩЕСТВУЮЩИМ ПРОФИЛЕМ
    // ============================================
    const updatedProfileData = mergeProfileWithExtraction(
      extraction,
      session.user.profile as any
    )

    // ============================================
    // 10. СОХРАНИТЬ ПРОФИЛЬ В БД (включая styleMetrics)
    // ============================================
    if (session.user.profile) {
      // Обновить существующий профиль
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          ...updatedProfileData,
          styleMetrics: mergedStyleMetrics as any, // Добавляем styleMetrics (as any для Prisma Json type)
        },
      })
    } else {
      // Создать новый профиль
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          ...updatedProfileData,
          styleMetrics: mergedStyleMetrics as any, // Добавляем styleMetrics (as any для Prisma Json type)
        },
      })
    }

    // ============================================
    // 10.5. SMART MEMORY DEDUP — store discrete facts in Pinecone
    // ============================================
    // Flatten the extraction into discrete facts for deduplication
    let dedupResults: DedupResult[] = []
    try {
      const facts = extractFactsFromMemory(extraction)
      if (facts.length > 0) {
        dedupResults = await processMemoriesWithDedup(user.id, facts)

        if (process.env.NODE_ENV === 'development') {
          const added = dedupResults.filter(r => r.action === 'ADD').length
          const updated = dedupResults.filter(r => r.action === 'UPDATE').length
          const skipped = dedupResults.filter(r => r.action === 'NOOP').length
          console.log(`[Memory Dedup] ${facts.length} facts → ADD:${added} UPDATE:${updated} NOOP:${skipped}`)
        }
      }
    } catch (dedupError) {
      // Don't fail the whole memory route if dedup fails
      console.error('[Memory Dedup] Error during deduplication:', dedupError)
    }

    // ============================================
    // 10.6. PROCEDURAL MEMORY — learn HOW to communicate
    // ============================================
    let proceduralUpdated = false
    try {
      const messagesForProcedural = session.messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const lessons = await extractProceduralLessons(messagesForProcedural)

      if (lessons && (lessons.effectivePatterns.length > 0 || lessons.avoidPatterns.length > 0)) {
        // Get existing procedural memory from communicationStyle
        const existingCommStyle = (session.user.profile?.communicationStyle as any) || {}
        const existingProcedural = existingCommStyle.proceduralMemory || null

        // Merge with new lessons
        const mergedProcedural = mergeProceduralMemory(existingProcedural, lessons)

        // Save back into communicationStyle.proceduralMemory
        await prisma.userProfile.update({
          where: { userId: user.id },
          data: {
            communicationStyle: {
              ...existingCommStyle,
              proceduralMemory: mergedProcedural as any,
            },
          },
        })

        proceduralUpdated = true

        if (process.env.NODE_ENV === 'development') {
          console.log('[Procedural Memory]', {
            effective: lessons.effectivePatterns,
            avoid: lessons.avoidPatterns,
            note: lessons.responseStyleNote,
          })
        }
      }
    } catch (proceduralError) {
      // Don't fail the whole memory route if procedural extraction fails
      console.error('[Procedural Memory] Error:', proceduralError)
    }

    // ============================================
    // 11. ГЕНЕРИРОВАТЬ SESSION SUMMARY
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
    // 12. СОХРАНИТЬ SUMMARY В СЕССИИ
    // ============================================
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        summary,
        endedAt: new Date(),
      },
    })

    // ============================================
    // 13. ВЕРНУТЬ РЕЗУЛЬТАТ
    // ============================================
    return NextResponse.json({
      success: true,
      summary,
      extraction,
      profileUpdated: true,
      memoryDedup: {
        total: dedupResults.length,
        added: dedupResults.filter(r => r.action === 'ADD').length,
        updated: dedupResults.filter(r => r.action === 'UPDATE').length,
        skipped: dedupResults.filter(r => r.action === 'NOOP').length,
      },
      proceduralUpdated,
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

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Flatten Memory Agent extraction into discrete facts for dedup engine.
 * Each fact is a standalone statement that can be embedded and compared.
 */
function extractFactsFromMemory(extraction: any): string[] {
  const facts: string[] = []

  // People mentioned
  if (Array.isArray(extraction.new_people)) {
    for (const person of extraction.new_people) {
      if (person && typeof person === 'string') {
        facts.push(`Important person: ${person}`)
      }
    }
  }

  // Triggers
  if (Array.isArray(extraction.updated_triggers)) {
    for (const trigger of extraction.updated_triggers) {
      if (trigger && typeof trigger === 'string') {
        facts.push(`Anxiety trigger: ${trigger}`)
      }
    }
  }

  // Communication style
  if (extraction.communication_style_notes && typeof extraction.communication_style_notes === 'string') {
    facts.push(`Communication style: ${extraction.communication_style_notes}`)
  }

  // What worked
  if (extraction.what_worked && typeof extraction.what_worked === 'string') {
    facts.push(`What helps: ${extraction.what_worked}`)
  }

  // Progress
  if (extraction.progress_notes && typeof extraction.progress_notes === 'string') {
    facts.push(`Progress: ${extraction.progress_notes}`)
  }

  // Key themes
  if (Array.isArray(extraction.key_themes)) {
    for (const theme of extraction.key_themes) {
      if (theme && typeof theme === 'string') {
        facts.push(`Key theme discussed: ${theme}`)
      }
    }
  }

  // Follow-up
  if (extraction.follow_up && typeof extraction.follow_up === 'string') {
    facts.push(`Follow-up needed: ${extraction.follow_up}`)
  }

  // What didn't work
  if (Array.isArray(extraction.what_didnt_work)) {
    for (const item of extraction.what_didnt_work) {
      if (item && typeof item === 'string') {
        facts.push(`What didn't help: ${item}`)
      }
    }
  }

  // Emotional anchors
  if (Array.isArray(extraction.emotional_anchors)) {
    for (const anchor of extraction.emotional_anchors) {
      if (anchor && typeof anchor === 'string') {
        facts.push(`Resonated with: ${anchor}`)
      }
    }
  }

  return facts
}
