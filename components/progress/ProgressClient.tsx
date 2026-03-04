'use client'

// ProgressClient — Client component for Progress page with mood tracking

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, Flame, Calendar as CalendarIcon, Lightbulb, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MoodGraph from '@/components/mood/MoodGraph'
import MoodHeatmap from '@/components/mood/MoodHeatmap'
import TopReasons from '@/components/mood/TopReasons'
import InsightCard from '@/components/mood/InsightCard'
import MoodCheckIn from '@/components/mood/MoodCheckIn'
import type { MoodEntryData, MoodStats, MoodInsight } from '@/lib/mood/data'
import { getMoodEmoji } from '@/lib/mood/data'

interface ProgressClientProps {
  initialStats: MoodStats
  initialEntries: MoodEntryData[]
}

type Tab = 'graph' | 'calendar' | 'triggers'

export default function ProgressClient({ initialStats, initialEntries }: ProgressClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('graph')
  const [insights, setInsights] = useState<MoodInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false)
  const [savingMood, setSavingMood] = useState(false)

  // Fetch insights
  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('/api/mood/insights')
        if (response.ok) {
          const data = await response.json()
          setInsights(data.insights || [])
        }
      } catch (error) {
        console.error('Failed to fetch insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  // Handle mood check-in completion
  const handleMoodCheckInComplete = async (result: {
    score: number
    reasons: string[]
    note: string | null
  }) => {
    setSavingMood(true)
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'before',
          score: result.score,
          reasons: result.reasons,
          note: result.note,
        }),
      })

      if (response.ok) {
        setShowMoodCheckIn(false)
        // Refresh page data
        router.refresh()
      } else {
        console.error('Failed to save mood check-in')
      }
    } catch (error) {
      console.error('Error saving mood check-in:', error)
    } finally {
      setSavingMood(false)
    }
  }

  // Calculate reason counts
  const reasonCounts = initialEntries.reduce(
    (acc, entry) => {
      ;(entry.reasons as string[]).forEach((reason) => {
        acc[reason] = (acc[reason] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>
  )

  const avgBeforeEmoji = initialStats.avgBefore ? getMoodEmoji(Math.round(initialStats.avgBefore)) : null
  const avgAfterEmoji = initialStats.avgAfter ? getMoodEmoji(Math.round(initialStats.avgAfter)) : null
  const hasData = initialStats.totalEntries > 0

  return (
    <>
      <div className="space-y-8">
        {/* Header with streak and Log mood button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-foreground">Your Mood</h1>
            <p className="text-muted-foreground mt-2 text-lg">Track your emotional journey</p>
          </div>

          <div className="flex items-center gap-4">
            {initialStats.streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-lg"
              >
                <Flame className="w-5 h-5" />
                <span className="font-serif text-2xl font-semibold">{initialStats.streak}</span>
                <span className="font-medium">day streak</span>
              </motion.div>
            )}

            {hasData && (
              <Button
                onClick={() => setShowMoodCheckIn(true)}
                className="bg-[#6366F1] text-white hover:bg-[#4F46E5] rounded-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log mood
              </Button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!hasData && (
          <Card className="glass-button border border-white/20 shadow-large rounded-3xl transition-smooth hover-lift">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <BarChart3 className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
                Start tracking your mood
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Check in before and after sessions to see patterns over time
              </p>
              <Button
                onClick={() => setShowMoodCheckIn(true)}
                className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white font-semibold hover:shadow-lg transition-all px-8 py-6 text-lg"
                size="lg"
              >
                Log my mood now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Row - Only show if has data */}
        {hasData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Avg Before */}
        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Before</p>
              {avgBeforeEmoji && <span className="text-3xl">{avgBeforeEmoji.emoji}</span>}
            </div>
            <p className="text-3xl font-bold text-foreground">
              {initialStats.avgBefore?.toFixed(1) || '—'}
            </p>
            {avgBeforeEmoji && (
              <p className="text-sm text-muted-foreground mt-1">{avgBeforeEmoji.label}</p>
            )}
          </CardContent>
        </Card>

        {/* Avg After */}
        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg After</p>
              {avgAfterEmoji && <span className="text-3xl">{avgAfterEmoji.emoji}</span>}
            </div>
            <p className="text-3xl font-bold text-foreground">
              {initialStats.avgAfter?.toFixed(1) || '—'}
            </p>
            {avgAfterEmoji && (
              <p className="text-sm text-muted-foreground mt-1">{avgAfterEmoji.label}</p>
            )}
          </CardContent>
        </Card>

        {/* Improvement */}
        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Improvement</p>
              {initialStats.improvement && initialStats.improvement > 0 && (
                <TrendingUp className="w-5 h-5 text-green-600" />
              )}
            </div>
            <p className="text-3xl font-bold text-foreground">
              {initialStats.improvement !== null
                ? `${initialStats.improvement > 0 ? '+' : ''}${initialStats.improvement.toFixed(1)}`
                : '—'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">per session</p>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Check-ins</p>
              <BarChart3 className="w-5 h-5 text-[#6366F1]" />
            </div>
            <p className="text-3xl font-bold text-foreground">{initialStats.totalEntries}</p>
            <p className="text-sm text-muted-foreground mt-1">this month</p>
          </CardContent>
        </Card>
        </div>
      )}

      {/* AI Insights */}
      {hasData && !loading && insights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="font-serif text-2xl font-semibold">Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 4).map((insight, i) => (
              <InsightCard key={i} insight={insight} delay={i * 0.1} />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      {hasData && (
        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
        <CardContent className="p-8">
          {/* Tab headers */}
          <div className="flex items-center gap-4 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('graph')}
              className={`pb-4 px-4 font-medium transition-smooth border-b-2 ${
                activeTab === 'graph'
                  ? 'border-[#6366F1] text-[#6366F1]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Graph</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`pb-4 px-4 font-medium transition-smooth border-b-2 ${
                activeTab === 'calendar'
                  ? 'border-[#6366F1] text-[#6366F1]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('triggers')}
              className={`pb-4 px-4 font-medium transition-smooth border-b-2 ${
                activeTab === 'triggers'
                  ? 'border-[#6366F1] text-[#6366F1]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Triggers</span>
              </div>
            </button>
          </div>

          {/* Tab content */}
          <div className="min-h-[400px]">
            {activeTab === 'graph' && <MoodGraph entries={initialEntries} />}
            {activeTab === 'calendar' && <MoodHeatmap entries={initialEntries} />}
            {activeTab === 'triggers' && (
              <div className="max-w-2xl mx-auto py-4">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
                  Top Triggers
                </h3>
                <TopReasons reasonCounts={reasonCounts} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Recent Check-ins */}
      {hasData && (
        <Card className="glass-button border border-white/20 shadow-large rounded-2xl">
          <CardContent className="p-8">
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Recent Check-ins
            </h3>

            <div className="space-y-4">
              {initialEntries.slice(0, 5).map((entry) => {
                const moodData = getMoodEmoji(entry.score)
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-subtle transition-smooth"
                  >
                    <span className="text-4xl flex-shrink-0">{moodData.emoji}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-serif font-semibold text-foreground">
                          {moodData.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.type === 'before' ? 'Before session' : 'After session'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {entry.note && (
                        <p className="text-sm text-muted-foreground mb-2">{entry.note}</p>
                      )}

                      {(entry.reasons as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(entry.reasons as string[]).map((reason) => (
                            <span
                              key={reason}
                              className="px-2 py-1 bg-gray-100 text-xs text-muted-foreground rounded-md"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      {/* MoodCheckIn Modal */}
      <AnimatePresence>
        {showMoodCheckIn && (
          <MoodCheckIn
            type="before"
            onComplete={handleMoodCheckInComplete}
            onSkip={() => setShowMoodCheckIn(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
