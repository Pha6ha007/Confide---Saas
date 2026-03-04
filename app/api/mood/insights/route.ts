// GET /api/mood/insights — AI-generated insights

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { MoodInsight } from '@/lib/mood/data'
import { getReasonTag } from '@/lib/mood/data'

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

    // 2. Fetch last 30 days of mood entries
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const entries = await prisma.moodEntry.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (entries.length < 3) {
      // Not enough data for insights
      return NextResponse.json({
        insights: [
          {
            emoji: '📊',
            text: 'Keep tracking your mood to unlock personalized insights',
            type: 'neutral',
          },
        ] as MoodInsight[],
      })
    }

    // 3. Calculate insights (hardcoded logic for now, can add LLM later)
    const insights: MoodInsight[] = []

    // Insight 1: Before vs After trend
    const beforeEntries = entries.filter((e) => e.type === 'before')
    const afterEntries = entries.filter((e) => e.type === 'after')

    if (beforeEntries.length > 0 && afterEntries.length > 0) {
      const avgBefore = beforeEntries.reduce((sum, e) => sum + e.score, 0) / beforeEntries.length
      const avgAfter = afterEntries.reduce((sum, e) => sum + e.score, 0) / afterEntries.length
      const improvement = avgAfter - avgBefore

      if (improvement > 0.5) {
        insights.push({
          emoji: '🌟',
          text: `Talking helps! Your mood improves by ${improvement.toFixed(1)} points on average after sessions.`,
          type: 'positive',
        })
      } else if (improvement < -0.5) {
        insights.push({
          emoji: '💭',
          text: `Your mood tends to dip after sessions. This is normal when processing difficult emotions.`,
          type: 'neutral',
        })
      }
    }

    // Insight 2: Top trigger
    const allReasons = entries.flatMap((e) => e.reasons as string[])
    const reasonCounts = allReasons.reduce(
      (acc, reason) => {
        acc[reason] = (acc[reason] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const topReason = Object.entries(reasonCounts).sort(([, a], [, b]) => b - a)[0]

    if (topReason) {
      const [reasonId, count] = topReason
      const reasonTag = getReasonTag(reasonId)

      if (reasonTag && count >= 3) {
        insights.push({
          emoji: reasonTag.emoji,
          text: `${reasonTag.label} has been your main trigger this month (${count} times). Let's explore this more.`,
          type: 'neutral',
        })
      }
    }

    // Insight 3: Streak achievement
    const entryDates = new Set(
      entries.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
    )

    if (entryDates.size >= 7) {
      insights.push({
        emoji: '🔥',
        text: `You've tracked your mood on ${entryDates.size} different days this month. Consistency is key!`,
        type: 'positive',
      })
    }

    // Insight 4: Time of day pattern (if we have multiple entries per day)
    const morningEntries = entries.filter((e) => {
      const hour = new Date(e.createdAt).getHours()
      return hour >= 6 && hour < 12
    })

    const eveningEntries = entries.filter((e) => {
      const hour = new Date(e.createdAt).getHours()
      return hour >= 18
    })

    if (morningEntries.length >= 3 && eveningEntries.length >= 3) {
      const avgMorning = morningEntries.reduce((sum, e) => sum + e.score, 0) / morningEntries.length
      const avgEvening = eveningEntries.reduce((sum, e) => sum + e.score, 0) / eveningEntries.length

      if (avgMorning - avgEvening > 1) {
        insights.push({
          emoji: '🌅',
          text: 'Your mornings tend to be brighter than your evenings. Consider evening self-care routines.',
          type: 'tip',
        })
      } else if (avgEvening - avgMorning > 1) {
        insights.push({
          emoji: '🌙',
          text: 'Your mood improves throughout the day. Keep powering through those mornings.',
          type: 'positive',
        })
      }
    }

    // Fallback insight if none generated
    if (insights.length === 0) {
      insights.push({
        emoji: '💚',
        text: 'You're building a valuable record of your emotional journey. Keep it up!',
        type: 'positive',
      })
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('[GET /api/mood/insights] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
