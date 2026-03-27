// app/api/goals/[id]/route.ts
// Update goal or milestone

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const UpdateGoalSchema = z.object({
  progress: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  milestoneId: z.string().uuid().optional(),
  milestoneDone: z.boolean().optional(),
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
    const validation = UpdateGoalSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { progress, isActive, milestoneId, milestoneDone } = validation.data

    // Verify goal belongs to user
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { milestones: true },
    })

    if (!goal || goal.userId !== user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Update milestone if milestoneId provided
    if (milestoneId !== undefined) {
      const milestone = goal.milestones.find((m) => m.id === milestoneId)
      if (!milestone) {
        return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
      }

      // Toggle milestone done status
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          done: milestoneDone,
          completedAt: milestoneDone ? new Date() : null,
        },
      })

      // Recalculate goal progress based on completed milestones
      const updatedGoal = await prisma.goal.findUnique({
        where: { id },
        include: { milestones: true },
      })

      if (updatedGoal && updatedGoal.milestones.length > 0) {
        const completedCount = updatedGoal.milestones.filter((m) => m.done).length
        const totalCount = updatedGoal.milestones.length
        const newProgress = Math.round((completedCount / totalCount) * 100)

        await prisma.goal.update({
          where: { id },
          data: { progress: newProgress },
        })
      }
    }

    // Update goal fields if provided
    const updateData: any = {}
    if (progress !== undefined) updateData.progress = progress
    if (isActive !== undefined) updateData.isActive = isActive

    if (Object.keys(updateData).length > 0) {
      await prisma.goal.update({
        where: { id },
        data: updateData,
      })
    }

    // Fetch updated goal with milestones
    const updatedGoal = await prisma.goal.findUnique({
      where: { id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ goal: updatedGoal })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}
