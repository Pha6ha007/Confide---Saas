// app/api/homework/[id]/route.ts
// Update homework (toggle done status)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const UpdateHomeworkSchema = z.object({
  done: z.boolean(),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { id } = await context.params
    const body = await request.json()
    const validation = UpdateHomeworkSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { done } = validation.data

    // Verify homework belongs to user
    const homework = await prisma.homework.findUnique({
      where: { id },
    })

    if (!homework || homework.userId !== user.id) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
    }

    // Update homework
    const updatedHomework = await prisma.homework.update({
      where: { id },
      data: {
        done,
        completedAt: done ? new Date() : null,
      },
    })

    return NextResponse.json({ homework: updatedHomework })
  } catch (error) {
    console.error('Error updating homework:', error)
    return NextResponse.json({ error: 'Failed to update homework' }, { status: 500 })
  }
}
