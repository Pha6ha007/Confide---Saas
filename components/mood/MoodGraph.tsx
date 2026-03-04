'use client'

// MoodGraph — Line graph showing before/after mood over time

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getMoodEmoji, type MoodEntryData } from '@/lib/mood/data'

interface MoodGraphProps {
  entries: MoodEntryData[]
}

type Period = 'week' | 'month'

export default function MoodGraph({ entries }: MoodGraphProps) {
  const [period, setPeriod] = useState<Period>('week')

  // Filter entries by period
  const filteredEntries = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()
    if (period === 'week') {
      cutoffDate.setDate(now.getDate() - 7)
    } else {
      cutoffDate.setDate(now.getDate() - 30)
    }

    return entries.filter((e) => new Date(e.createdAt) >= cutoffDate)
  }, [entries, period])

  // Group by date
  const dataByDate = useMemo(() => {
    const grouped: Record<string, { before: number[]; after: number[] }> = {}

    filteredEntries.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = { before: [], after: [] }
      }

      if (entry.type === 'before') {
        grouped[dateKey].before.push(entry.score)
      } else {
        grouped[dateKey].after.push(entry.score)
      }
    })

    // Calculate averages
    return Object.entries(grouped).map(([date, scores]) => ({
      date,
      avgBefore: scores.before.length > 0
        ? scores.before.reduce((a, b) => a + b, 0) / scores.before.length
        : null,
      avgAfter: scores.after.length > 0
        ? scores.after.reduce((a, b) => a + b, 0) / scores.after.length
        : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredEntries])

  if (dataByDate.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No mood data for this period yet</p>
        <p className="text-sm mt-2">Start tracking to see your progress</p>
      </div>
    )
  }

  // SVG dimensions
  const width = 600
  const height = 300
  const padding = { top: 40, right: 40, bottom: 40, left: 50 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom

  // Scale functions
  const xScale = (index: number) => (index / (dataByDate.length - 1 || 1)) * graphWidth
  const yScale = (score: number) => graphHeight - (score / 7) * graphHeight

  // Generate path for line chart
  const generatePath = (type: 'before' | 'after') => {
    const points = dataByDate
      .map((d, i) => {
        const value = type === 'before' ? d.avgBefore : d.avgAfter
        if (value === null) return null
        return { x: xScale(i), y: yScale(value), value }
      })
      .filter((p) => p !== null) as { x: number; y: number; value: number }[]

    if (points.length === 0) return ''

    // Generate smooth cubic bezier curve
    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const controlPointX = (current.x + next.x) / 2

      path += ` C ${controlPointX} ${current.y}, ${controlPointX} ${next.y}, ${next.x} ${next.y}`
    }

    return path
  }

  const beforePath = generatePath('before')
  const afterPath = generatePath('after')

  // Area fill paths
  const generateAreaPath = (type: 'before' | 'after') => {
    const linePath = generatePath(type)
    if (!linePath) return ''

    const points = dataByDate
      .map((d, i) => {
        const value = type === 'before' ? d.avgBefore : d.avgAfter
        if (value === null) return null
        return { x: xScale(i), y: yScale(value) }
      })
      .filter((p) => p !== null) as { x: number; y: number }[]

    if (points.length === 0) return ''

    return `${linePath} L ${points[points.length - 1].x} ${graphHeight} L ${points[0].x} ${graphHeight} Z`
  }

  return (
    <div className="space-y-6">
      {/* Period toggle */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setPeriod('week')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-smooth ${
            period === 'week'
              ? 'bg-[#6366F1] text-white'
              : 'bg-white text-foreground border border-gray-200 hover:border-[#6366F1]/40'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-smooth ${
            period === 'month'
              ? 'bg-[#6366F1] text-white'
              : 'bg-white text-foreground border border-gray-200 hover:border-[#6366F1]/40'
          }`}
        >
          Month
        </button>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl p-6 shadow-subtle">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Y-axis emoji labels */}
          {[7, 6, 5, 4, 3, 2, 1].map((score) => {
            const emoji = getMoodEmoji(score)
            return (
              <g key={score}>
                <text
                  x={padding.left - 10}
                  y={padding.top + yScale(score)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xl"
                >
                  {emoji.emoji}
                </text>
                <line
                  x1={padding.left}
                  y1={padding.top + yScale(score)}
                  x2={padding.left + graphWidth}
                  y2={padding.top + yScale(score)}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </g>
            )
          })}

          {/* X-axis date labels */}
          {dataByDate.map((d, i) => {
            // Only show every few labels to avoid crowding
            const showLabel = dataByDate.length <= 7 || i % Math.ceil(dataByDate.length / 7) === 0
            if (!showLabel) return null

            return (
              <text
                key={d.date}
                x={padding.left + xScale(i)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {new Date(d.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>
            )
          })}

          {/* Area fills with opacity */}
          {beforePath && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 0.6 }}
              d={generateAreaPath('before')}
              fill="#EF4444"
            />
          )}

          {afterPath && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ duration: 0.6 }}
              d={generateAreaPath('after')}
              fill="#22C55E"
            />
          )}

          {/* Line paths */}
          {beforePath && (
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              d={beforePath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="6 3"
              strokeOpacity="0.6"
              transform={`translate(${padding.left}, ${padding.top})`}
            />
          )}

          {afterPath && (
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              d={afterPath}
              fill="none"
              stroke="#22C55E"
              strokeWidth="3"
              transform={`translate(${padding.left}, ${padding.top})`}
            />
          )}

          {/* Data points */}
          {dataByDate.map((d, i) => (
            <g key={d.date}>
              {d.avgBefore !== null && (
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  cx={padding.left + xScale(i)}
                  cy={padding.top + yScale(d.avgBefore)}
                  r="3"
                  fill="#EF4444"
                  opacity="0.7"
                  className="hover:scale-150 transition-transform cursor-pointer"
                />
              )}
              {d.avgAfter !== null && (
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  cx={padding.left + xScale(i)}
                  cy={padding.top + yScale(d.avgAfter)}
                  r="4"
                  fill="#22C55E"
                  className="hover:scale-150 transition-transform cursor-pointer"
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#EF4444] opacity-60" style={{ borderTop: '2px dashed #EF4444' }} />
          <span className="text-muted-foreground">Before</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#22C55E]" />
          <span className="text-muted-foreground">After</span>
        </div>
      </div>
    </div>
  )
}
