// POST /api/mood — Save mood check-in
// GET /api/mood — Get mood history

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { MoodStats } from '@/lib/mood/data'

// ============================================
// POST /api/mood — Save mood check-in
// ============================================

const MoodCheckInSchema = z.object({
  type: z.enum(['before', 'after']),
  score: z.number().min(1).max(7),
  reasons: z.array(z.string()),
  note: z.string().optional().nullable(),
  sessionId: z.string().uuid().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate input
    const body = await request.json()
    const validation = MoodCheckInSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { type, score, reasons, note, sessionId } = validation.data

    // 3. Create MoodEntry
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: user.id,
        type,
        score,
        reasons,
        note: note || null,
        sessionId: sessionId || null,
      },
    })

    // 4. Update session if sessionId provided
    if (sessionId) {
      if (type === 'before') {
        await prisma.session.update({
          where: { id: sessionId },
          data: { moodBefore: score },
        })
      } else if (type === 'after') {
        await prisma.session.update({
          where: { id: sessionId },
          data: { moodAfter: score },
        })
      }
    }

    return NextResponse.json({
      id: moodEntry.id,
      score: moodEntry.score,
      reasons: moodEntry.reasons,
      note: moodEntry.note,
      type: moodEntry.type,
      createdAt: moodEntry.createdAt,
    })
  } catch (error) {
    console.error('[POST /api/mood] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================
// GET /api/mood — Get mood history
// ============================================

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week | month | all

    // 3. Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    // 4. Fetch mood entries
    const entries = await prisma.moodEntry.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // 5. Calculate stats
    const beforeEntries = entries.filter((e) => e.type === 'before')
    const afterEntries = entries.filter((e) => e.type === 'after')

    const avgBefore =
      beforeEntries.length > 0
        ? beforeEntries.reduce((sum, e) => sum + e.score, 0) / beforeEntries.length
        : null

    const avgAfter =
      afterEntries.length > 0
        ? afterEntries.reduce((sum, e) => sum + e.score, 0) / afterEntries.length
        : null

    // 6. Calculate streak (days with at least one entry)
    const entryDates = new Set(
      entries.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
    )
    const sortedDates = Array.from(entryDates).sort().reverse()

    let streak = 0
    let bestStreak = 0
    let currentStreakCount = 0

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i]
      const prevDate = sortedDates[i - 1]

      if (i === 0) {
        // First entry
        if (date === today || date === yesterday) {
          currentStreakCount = 1
        }
      } else {
        // Check if consecutive
        const daysDiff =
          (new Date(prevDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)

        if (daysDiff === 1) {
          currentStreakCount++
        } else {
          // Streak broken
          if (currentStreakCount > bestStreak) {
            bestStreak = currentStreakCount
          }
          currentStreakCount = 0
        }
      }
    }

    // Update best streak
    if (currentStreakCount > bestStreak) {
      bestStreak = currentStreakCount
    }

    // Current streak is only valid if it includes today or yesterday
    if (sortedDates.length > 0 && (sortedDates[0] === today || sortedDates[0] === yesterday)) {
      streak = currentStreakCount
    }

    const stats: MoodStats = {
      avgBefore: avgBefore !== null ? Number(avgBefore.toFixed(1)) : null,
      avgAfter: avgAfter !== null ? Number(avgAfter.toFixed(1)) : null,
      improvement:
        avgBefore !== null && avgAfter !== null
          ? Number((avgAfter - avgBefore).toFixed(1))
          : null,
      streak,
      bestStreak,
      totalEntries: entries.length,
    }

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        score: e.score,
        reasons: e.reasons,
        note: e.note,
        createdAt: e.createdAt,
        sessionId: e.sessionId,
      })),
      stats,
    })
  } catch (error) {
    console.error('[GET /api/mood] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
