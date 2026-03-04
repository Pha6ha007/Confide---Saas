import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import ProgressClient from '@/components/progress/ProgressClient'
import type { MoodEntryData, MoodStats } from '@/lib/mood/data'

export default async function ProgressPage() {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch mood entries (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const moodEntries = await prisma.moodEntry.findMany({
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

  // Calculate stats
  const beforeEntries = moodEntries.filter((e) => e.type === 'before')
  const afterEntries = moodEntries.filter((e) => e.type === 'after')

  const avgBefore =
    beforeEntries.length > 0
      ? beforeEntries.reduce((sum, e) => sum + e.score, 0) / beforeEntries.length
      : null

  const avgAfter =
    afterEntries.length > 0
      ? afterEntries.reduce((sum, e) => sum + e.score, 0) / afterEntries.length
      : null

  // Calculate streak
  const entryDates = new Set(
    moodEntries.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
  )
  const sortedDates = Array.from(entryDates).sort().reverse()

  let streak = 0
  let bestStreak = 0
  let currentStreakCount = 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i]
    const prevDate = sortedDates[i - 1]

    if (i === 0) {
      if (date === today || date === yesterday) {
        currentStreakCount = 1
      }
    } else {
      const daysDiff =
        (new Date(prevDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)

      if (daysDiff === 1) {
        currentStreakCount++
      } else {
        if (currentStreakCount > bestStreak) {
          bestStreak = currentStreakCount
        }
        currentStreakCount = 0
      }
    }
  }

  if (currentStreakCount > bestStreak) {
    bestStreak = currentStreakCount
  }

  if (sortedDates.length > 0 && (sortedDates[0] === today || sortedDates[0] === yesterday)) {
    streak = currentStreakCount
  }

  const stats: MoodStats = {
    avgBefore: avgBefore !== null ? Number(avgBefore.toFixed(1)) : null,
    avgAfter: avgAfter !== null ? Number(avgAfter.toFixed(1)) : null,
    improvement:
      avgBefore !== null && avgAfter !== null ? Number((avgAfter - avgBefore).toFixed(1)) : null,
    streak,
    bestStreak,
    totalEntries: moodEntries.length,
  }

  // Convert to plain objects for client component
  const entries: MoodEntryData[] = moodEntries.map((e) => ({
    id: e.id,
    userId: e.userId,
    sessionId: e.sessionId,
    type: e.type as 'before' | 'after',
    score: e.score,
    reasons: e.reasons as string[],
    note: e.note,
    createdAt: e.createdAt,
  }))

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in-up">
      <ProgressClient initialStats={stats} initialEntries={entries} />
    </div>
  )
}
