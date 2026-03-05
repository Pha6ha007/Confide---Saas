// app/api/proactive/[id]/route.ts
// Confide — Mark Proactive Message as Read

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/proactive/[id]
 * Mark a proactive message as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const messageId = resolvedParams.id

    // Verify message belongs to user
    const message = await prisma.proactiveMessage.findUnique({
      where: { id: messageId },
    })

    if (!message || message.userId !== user.id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Mark as read
    const updatedMessage = await prisma.proactiveMessage.update({
      where: { id: messageId },
      data: { read: true },
    })

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error('[Proactive API] PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    )
  }
}
