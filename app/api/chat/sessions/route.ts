// app/api/chat/sessions/route.ts
// Confide — Get All Sessions for Chat History Sidebar

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { safeErrorBody } from '@/lib/utils/safe-error'

/**
 * GET /api/chat/sessions
 * Get all sessions for the current user with preview data
 * Returns sessions ordered by createdAt desc (newest first)
 */
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ============================================
    // 2. GET ALL SESSIONS FOR USER
    // ============================================
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        agentType: true,
        moodBefore: true,
        moodAfter: true,
        summary: true,
        endedAt: true,
        messages: {
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // ============================================
    // 3. FORMAT SESSIONS WITH PREVIEW DATA
    // ============================================
    const formattedSessions = sessions.map((session) => {
      // Get first user message for preview
      const firstUserMessage = session.messages.find((msg) => msg.role === 'user')

      // Get last assistant message
      const assistantMessages = session.messages.filter((msg) => msg.role === 'assistant')
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]

      // Count messages
      const messageCount = session.messages.length

      // Check if this is an active session (no endedAt)
      const isActive = !session.endedAt

      return {
        id: session.id,
        createdAt: session.createdAt,
        agentType: session.agentType,
        messageCount,
        moodBefore: session.moodBefore,
        moodAfter: session.moodAfter,
        summary: session.summary,
        firstUserMessage: firstUserMessage?.content || null,
        lastAssistantMessage: lastAssistantMessage?.content || null,
        isActive,
      }
    })

    return NextResponse.json({ sessions: formattedSessions })
  } catch (error) {
    console.error('[Chat Sessions API] Error:', error)
    return NextResponse.json(
      safeErrorBody('Internal server error', error),
      { status: 500 }
    )
  }
}
