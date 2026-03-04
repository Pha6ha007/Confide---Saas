import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  MessageCircle,
  Calendar,
  Zap,
  BarChart3,
  Sparkles,
} from 'lucide-react'

export default async function ProgressPage() {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Получить статистику
  const [totalSessions, totalMessages, firstSession, sessionsWithMood] = await Promise.all([
    prisma.session.count({
      where: { userId: user.id },
    }),
    prisma.message.count({
      where: { userId: user.id, role: 'user' },
    }),
    prisma.session.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    }),
    // Получить последние 10 сессий с mood score
    prisma.session.findMany({
      where: {
        userId: user.id,
        moodScore: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        moodScore: true,
        createdAt: true,
      },
    }),
  ])

  // Вычислить дни активности
  const daysActive = firstSession
    ? Math.ceil(
        (new Date().getTime() - new Date(firstSession.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  // Получить последние сессии для streak
  const recentSessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  // Вычислить текущий streak (упрощённая версия)
  let currentStreak = 0
  if (recentSessions.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const session of recentSessions) {
      const sessionDate = new Date(session.createdAt)
      sessionDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === currentStreak) {
        currentStreak++
      } else if (diffDays > currentStreak) {
        break
      }
    }
  }

  const hasData = totalSessions > 0

  // Вычислить средний mood score
  const averageMoodScore =
    sessionsWithMood.length > 0
      ? Math.round(
          sessionsWithMood.reduce((sum, s) => sum + (s.moodScore || 0), 0) / sessionsWithMood.length
        )
      : null

  // Получить цвет для mood score
  const getMoodColor = (score: number) => {
    if (score <= 3) return 'from-red-500 to-red-600'
    if (score <= 6) return 'from-amber-400 to-amber-500'
    return 'from-emerald-400 to-emerald-500'
  }

  const getMoodLabel = (score: number) => {
    if (score <= 3) return 'Struggling'
    if (score <= 6) return 'Okay'
    return 'Good'
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-semibold text-foreground">Your Progress</h1>
        <p className="text-muted-foreground mt-2 text-lg">See how far you've come</p>
      </div>

      {/* Empty State */}
      {!hasData && (
        <Card className="glass-button border border-white/20 shadow-large rounded-3xl transition-smooth hover-lift">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
              No progress data yet
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Start your first conversation to begin tracking your journey. Your progress will be
              visualized here over time.
            </p>
            <Link href="/dashboard/chat">
              <Button className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-semibold hover:shadow-lg transition-all">
                <MessageCircle className="w-4 h-4 mr-2" />
                Start First Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {hasData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sessions */}
            <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-foreground">{totalSessions}</p>
              </CardContent>
            </Card>

            {/* Total Messages */}
            <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-foreground">{totalMessages}</p>
              </CardContent>
            </Card>

            {/* Days Active */}
            <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Days Active</p>
                <p className="text-3xl font-bold text-foreground">{daysActive}</p>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  {currentStreak > 0 && <Sparkles className="w-5 h-5 text-[#F59E0B]" />}
                </div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-foreground">
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mood Tracking */}
          <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    Mood Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {sessionsWithMood.length > 0
                      ? 'Your emotional journey over time'
                      : 'Track your mood at the start of each session'}
                  </p>
                </div>
              </div>

              {sessionsWithMood.length === 0 ? (
                <div className="bg-white/30 rounded-xl p-12 text-center backdrop-blur-sm">
                  <TrendingUp className="w-12 h-12 text-[#6366F1] mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No mood data yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start your next session to track your mood
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Average Mood Score */}
                  {averageMoodScore && (
                    <div className="bg-white/30 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Average Mood</p>
                          <p className="text-3xl font-bold text-foreground">{averageMoodScore}/10</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getMoodLabel(averageMoodScore)}
                          </p>
                        </div>
                        <div
                          className={`w-20 h-20 bg-gradient-to-br ${getMoodColor(
                            averageMoodScore
                          )} rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          <span className="text-3xl font-bold text-white">
                            {averageMoodScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Mood Scores */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">
                      Recent Sessions
                    </p>
                    <div className="grid grid-cols-5 gap-3">
                      {sessionsWithMood.map((session, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-xl bg-white/30 backdrop-blur-sm flex flex-col items-center justify-center p-2 hover:scale-105 transition-transform"
                        >
                          <div
                            className={`w-8 h-8 bg-gradient-to-br ${getMoodColor(
                              session.moodScore!
                            )} rounded-lg flex items-center justify-center shadow-md mb-1`}
                          >
                            <span className="text-sm font-bold text-white">
                              {session.moodScore}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones Card */}
          <Card className="glass border border-white/20 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Your Journey</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You've had <strong className="text-foreground">{totalSessions}</strong> meaningful
                    conversations and shared{' '}
                    <strong className="text-foreground">{totalMessages}</strong> thoughts. Keep going —
                    every conversation is a step forward.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
