'use client'

import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  companionName?: string
}

export function TypingIndicator({ companionName = 'Alex' }: TypingIndicatorProps) {
  return (
    <motion.div
      className="flex justify-start mb-2.5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-button border border-white/20 rounded-2xl px-4 py-2.5 shadow-card backdrop-blur-md hover-lift">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <span className="text-sm text-[#6B7280] font-medium">{companionName} is thinking...</span>
        </div>
      </div>
    </motion.div>
  )
}
