'use client'

// MoodHeatmap — GitHub-style calendar heatmap

import { motion } from 'framer-motion'
import { getMoodEmoji, type MoodEntryData } from '@/lib/mood/data'

interface MoodHeatmapProps {
  entries: MoodEntryData[]
}

export default function MoodHeatmap({ entries }: MoodHeatmapProps) {
  // Generate last 12 weeks of dates
  const weeks = 12
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - weeks * 7)

  // Group entries by date
  const entriesByDate: Record<string, MoodEntryData[]> = {}
  entries.forEach((entry) => {
    const dateKey = new Date(entry.createdAt).toISOString().split('T')[0]
    if (!entriesByDate[dateKey]) {
      entriesByDate[dateKey] = []
    }
    entriesByDate[dateKey].push(entry)
  })

  // Generate grid data
  const days = []
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]
    const dayEntries = entriesByDate[dateKey] || []

    // Calculate average mood for the day
    let avgMood = 0
    if (dayEntries.length > 0) {
      const totalScore = dayEntries.reduce((sum, e) => sum + e.score, 0)
      avgMood = totalScore / dayEntries.length
    }

    days.push({
      date,
      dateKey,
      count: dayEntries.length,
      avgMood,
    })
  }

  // Get color based on mood
  const getMoodColor = (avgMood: number) => {
    if (avgMood === 0) return 'bg-gray-100'
    if (avgMood <= 2) return 'bg-red-300'
    if (avgMood <= 3) return 'bg-orange-300'
    if (avgMood <= 4) return 'bg-yellow-300'
    if (avgMood <= 5) return 'bg-lime-300'
    if (avgMood <= 6) return 'bg-green-400'
    return 'bg-cyan-400'
  }

  // Split into weeks
  const weeksData = []
  for (let i = 0; i < weeks; i++) {
    weeksData.push(days.slice(i * 7, (i + 1) * 7))
  }

  // Day labels
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="space-y-4">
      {/* Month labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        {weeksData
          .filter((_, i) => i % 4 === 0) // Show every 4th week
          .map((week) => {
            const monthName = week[0].date.toLocaleDateString('en-US', { month: 'short' })
            return <span key={week[0].dateKey}>{monthName}</span>
          })}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day labels column */}
        <div className="flex flex-col justify-around text-xs text-muted-foreground pr-2">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 flex items-center">
              {i % 2 === 0 && label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1">
          {weeksData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const moodData = getMoodEmoji(Math.round(day.avgMood))
                const isToday = day.dateKey === today.toISOString().split('T')[0]

                return (
                  <motion.div
                    key={day.dateKey}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                    className={`w-3 h-3 rounded-sm ${getMoodColor(day.avgMood)} ${
                      isToday ? 'ring-2 ring-[#6366F1] ring-offset-1' : ''
                    } transition-all hover:scale-150 hover:z-10 cursor-pointer relative group`}
                    title={`${day.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}: ${day.count > 0 ? `${moodData.emoji} ${moodData.label}` : 'No data'}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      {day.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {day.count > 0 && (
                        <>
                          : <span className="font-medium">{moodData.emoji} {moodData.label}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end pt-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-yellow-300" />
          <div className="w-3 h-3 rounded-sm bg-lime-300" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-cyan-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
