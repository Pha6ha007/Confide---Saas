'use client'

// TopReasons — Horizontal bar chart of top 5 mood reasons

import { motion } from 'framer-motion'
import { getReasonTag } from '@/lib/mood/data'

interface TopReasonsProps {
  reasonCounts: Record<string, number>
}

export default function TopReasons({ reasonCounts }: TopReasonsProps) {
  // Get top 5 reasons
  const sortedReasons = Object.entries(reasonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (sortedReasons.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No reason data yet</p>
      </div>
    )
  }

  const maxCount = sortedReasons[0][1]

  return (
    <div className="space-y-4">
      {sortedReasons.map(([reasonId, count], index) => {
        const tag = getReasonTag(reasonId)
        if (!tag) return null

        const widthPercent = (count / maxCount) * 100

        return (
          <motion.div
            key={reasonId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{tag.emoji}</span>
                <span className="font-medium text-foreground">{tag.label}</span>
              </div>
              <span className="text-muted-foreground font-medium">{count}</span>
            </div>

            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full"
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
