'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MoodCheckProps {
  onMoodSelected: (score: number) => void
}

export function MoodCheck({ onMoodSelected }: MoodCheckProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)

  const handleMoodSelect = (score: number) => {
    setSelectedMood(score)

    // Small delay for animation before calling callback
    setTimeout(() => {
      onMoodSelected(score)
    }, 300)
  }

  // Color mapping for mood scores
  const getMoodColor = (score: number) => {
    if (score <= 3) {
      // 1-3: Red gradient (struggling)
      return 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    } else if (score <= 6) {
      // 4-6: Yellow/Amber gradient (okay)
      return 'from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600'
    } else {
      // 7-10: Green gradient (good)
      return 'from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600'
    }
  }

  // Labels for specific scores
  const getLabel = (score: number) => {
    switch (score) {
      case 1:
        return 'Terrible'
      case 5:
        return 'Okay'
      case 10:
        return 'Amazing'
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[600px] p-6"
    >
      <Card className="glass-button border border-white/20 shadow-large rounded-3xl p-12 max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl font-semibold text-foreground mb-3">
            How are you feeling right now?
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose a number that best represents your current mood
          </p>
        </motion.div>

        {/* Mood Score Buttons */}
        <div className="grid grid-cols-10 gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score, index) => (
            <motion.div
              key={score}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3 + index * 0.05,
                duration: 0.3,
              }}
              className="flex flex-col items-center"
            >
              <Button
                onClick={() => handleMoodSelect(score)}
                className={`
                  w-full aspect-square rounded-xl
                  bg-gradient-to-br ${getMoodColor(score)}
                  text-white font-bold text-xl
                  transition-all duration-300
                  shadow-card hover:shadow-large
                  ${selectedMood === score ? 'scale-110 ring-4 ring-white/50' : 'hover:scale-105'}
                `}
              >
                {score}
              </Button>

              {/* Label for specific scores */}
              {getLabel(score) && (
                <span className="text-xs text-muted-foreground mt-2 font-medium">
                  {getLabel(score)}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600" />
              <span>Struggling</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-500" />
              <span>Okay</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500" />
              <span>Good</span>
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  )
}
