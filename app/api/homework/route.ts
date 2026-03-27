// app/api/homework/route.ts
// Homework API endpoints

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/homework - Fetch all homework for the authenticated user
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

    // Fetch homework sorted: pending first, then completed
    const homework = await prisma.homework.findMany({
      where: { userId: user.id },
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }],
    })

    return NextResponse.json({ homework })
  } catch (error) {
    console.error('Error fetching homework:', error)
    return NextResponse.json({ error: 'Failed to fetch homework' }, { status: 500 })
  }
}

// POST /api/homework - Create new homework (for testing/manual creation)
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

    const CreateHomeworkSchema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(1).max(2000),
      agent: z.string().min(1).max(50),
      dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
    })

    const validation = CreateHomeworkSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { title, description, agent, dueDate } = validation.data

    const homework = await prisma.homework.create({
      data: {
        userId: user.id,
        title,
        description,
        agent,
        dueDate: new Date(dueDate),
        done: false,
      },
    })

    return NextResponse.json({ homework }, { status: 201 })
  } catch (error) {
    console.error('Error creating homework:', error)
    return NextResponse.json({ error: 'Failed to create homework' }, { status: 500 })
  }
}
