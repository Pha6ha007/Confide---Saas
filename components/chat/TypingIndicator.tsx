'use client'

import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  companionName?: string
}

export function TypingIndicator({ companionName = 'Alex' }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  y: [0, -8, 0],
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
          <span className="text-sm text-gray-500">{companionName} is thinking...</span>
        </div>
      </div>
    </div>
  )
}
