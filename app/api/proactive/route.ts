// app/api/proactive/route.ts
// Confide — Proactive Messages API

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { checkAndGenerateProactiveMessages } from '@/lib/proactive/engine'

/**
 * GET /api/proactive
 * Get unread proactive messages for current user
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unread proactive messages
    const messages = await prisma.proactiveMessage.findMany({
      where: {
        userId: user.id,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[Proactive API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proactive messages' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/proactive
 * Trigger proactive message generation for current user
 * Called on dashboard load to check if any proactive messages should be generated
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check and generate proactive messages
    await checkAndGenerateProactiveMessages(user.id)

    // Return newly generated unread messages
    const messages = await prisma.proactiveMessage.findMany({
      where: {
        userId: user.id,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[Proactive API] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to generate proactive messages' },
      { status: 500 }
    )
  }
}
