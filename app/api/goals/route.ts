// app/api/goals/route.ts
// Goals API endpoints

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/goals - Fetch all goals for the authenticated user
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

    // Fetch goals with milestones
    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Calculate session count for each goal (based on createdAt)
    const goalsWithStats = await Promise.all(
      goals.map(async (goal) => {
        const sessionCount = await prisma.session.count({
          where: {
            userId: user.id,
            createdAt: { gte: goal.createdAt },
          },
        })

        return {
          ...goal,
          sessionCount,
        }
      })
    )

    return NextResponse.json({ goals: goalsWithStats })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

// POST /api/goals - Create a new goal
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

    const body = await request.json()

    const CreateGoalSchema = z.object({
      category: z.string().min(1).max(100),
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      milestones: z.array(z.string().min(1).max(500)).max(20).optional(),
    })

    const validation = CreateGoalSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { category, title, description, milestones } = validation.data

    // Create goal with milestones
    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        category,
        title,
        description: description || null,
        progress: 0,
        isActive: true,
        milestones: milestones
          ? {
              create: milestones.map((text: string, index: number) => ({
                text,
                order: index,
                done: false,
              })),
            }
          : undefined,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}
