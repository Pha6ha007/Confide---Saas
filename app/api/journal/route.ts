import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ErrorResponse } from '@/types'

// Валидация входных данных
const JournalEntrySchema = z.object({
  content: z.string().min(1).max(10000),
  sourceMessageId: z.string().uuid(),
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
    const validation = JournalEntrySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', details: validation.error.message },
        { status: 400 }
      )
    }

    const { content, sourceMessageId } = validation.data

    // ============================================
    // 3. ПРОВЕРИТЬ ЧТО СООБЩЕНИЕ СУЩЕСТВУЕТ И ПРИНАДЛЕЖИТ ПОЛЬЗОВАТЕЛЮ
    // ============================================
    const message = await prisma.message.findUnique({
      where: { id: sourceMessageId },
    })

    if (!message) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.userId !== user.id) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Проверить что это сообщение от assistant
    if (message.role !== 'assistant') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Only assistant messages can be saved as insights' },
        { status: 400 }
      )
    }

    // ============================================
    // 4. ПРОВЕРИТЬ ЧТО ЭТО СООБЩЕНИЕ УЖЕ НЕ СОХРАНЕНО
    // ============================================
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        userId: user.id,
        sourceMessageId,
      },
    })

    if (existingEntry) {
      // Уже сохранено — вернуть success без дублирования
      return NextResponse.json({
        success: true,
        alreadySaved: true,
        entryId: existingEntry.id,
      })
    }

    // ============================================
    // 5. СОЗДАТЬ JOURNAL ENTRY
    // ============================================
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content,
        sourceMessageId,
      },
    })

    // ============================================
    // 6. ВЕРНУТЬ SUCCESS
    // ============================================
    return NextResponse.json({
      success: true,
      alreadySaved: false,
      entryId: journalEntry.id,
    })
  } catch (error) {
    console.error('Journal API error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint для получения всех записей журнала
export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTH CHECK
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
    // 2. ПОЛУЧИТЬ ВСЕ ЗАПИСИ ЖУРНАЛА
    // ============================================
    const entries = await prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      entries,
    })
  } catch (error) {
    console.error('Journal API error:', error)

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
