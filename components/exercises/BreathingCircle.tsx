'use client'

import { motion } from 'framer-motion'
import { PhaseAction } from '@/lib/exercises/data'

interface BreathingCircleProps {
  progress: number // 0-1 progress through current phase
  phaseName: string // "Breathe In", "Hold", "Breathe Out", etc.
  secondsLeft: number // countdown in seconds
  color: string // hex color
  action: PhaseAction
}

export function BreathingCircle({
  progress,
  phaseName,
  secondsLeft,
  color,
  action,
}: BreathingCircleProps) {
  // Calculate circle scale based on action
  const getScale = () => {
    if (action === 'inhale' || action === 'tense') {
      // Grow from 0.55 to 1.0 during inhale/tense
      return 0.55 + progress * 0.45
    } else if (action === 'exhale' || action === 'release') {
      // Shrink from 1.0 to 0.55 during exhale/release
      return 1.0 - progress * 0.45
    } else {
      // Hold at 1.0 for hold/tap/rest
      return 1.0
    }
  }

  // Calculate stroke-dashoffset for progress arc (0-1 around circle)
  const circumference = 2 * Math.PI * 110 // radius 110
  const offset = circumference * (1 - progress)

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: '260px', height: '260px' }}>
      {/* SVG Progress Arc */}
      <svg
        className="absolute inset-0 transform -rotate-90"
        width="260"
        height="260"
        viewBox="0 0 260 260"
      >
        {/* Background Circle */}
        <circle
          cx="130"
          cy="130"
          r="110"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200 opacity-20"
        />
        {/* Progress Arc */}
        <circle
          cx="130"
          cy="130"
          r="110"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-100 ease-linear"
        />
      </svg>

      {/* Ripple Rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 opacity-30"
        style={{ borderColor: color }}
        animate={{
          scale: [1, 1.15],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 opacity-30"
        style={{ borderColor: color }}
        animate={{
          scale: [1, 1.15],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 opacity-30"
        style={{ borderColor: color }}
        animate={{
          scale: [1, 1.15],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 1,
        }}
      />

      {/* Main Circle with Scale Animation */}
      <motion.div
        className="relative rounded-full flex items-center justify-center shadow-large"
        style={{
          width: '220px',
          height: '220px',
          background: `radial-gradient(circle at 30% 30%, ${color}22, ${color}11)`,
          boxShadow: `0 0 60px ${color}33, 0 0 120px ${color}22`,
        }}
        animate={{
          scale: getScale(),
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      >
        {/* Gradient Glow Inner Circle */}
        <div
          className="absolute inset-8 rounded-full opacity-80"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}44, transparent)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          <motion.p
            className="font-serif text-base font-medium mb-2"
            style={{ color }}
            key={phaseName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {phaseName}
          </motion.p>
          <motion.p
            className="text-4xl font-light tabular-nums"
            style={{ color }}
            key={secondsLeft}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {secondsLeft}
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
