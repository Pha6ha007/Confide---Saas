'use client'

// InsightCard — AI insight display card

import { motion } from 'framer-motion'
import type { MoodInsight } from '@/lib/mood/data'

interface InsightCardProps {
  insight: MoodInsight
  delay?: number
}

export default function InsightCard({ insight, delay = 0 }: InsightCardProps) {
  const colorClass =
    insight.type === 'positive'
      ? 'border-emerald-200 bg-emerald-50/50'
      : insight.type === 'tip'
        ? 'border-amber-200 bg-amber-50/50'
        : 'border-indigo-200 bg-indigo-50/50'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-4 rounded-xl border-2 ${colorClass} transition-smooth hover:shadow-subtle`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{insight.emoji}</span>
        <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
      </div>
    </motion.div>
  )
}
