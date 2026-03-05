'use client'

import { motion } from 'framer-motion'
import { Brain, Heart, Sparkles, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestionChipsProps {
  onSelect: (text: string) => void
}

const suggestions = [
  {
    text: "I'm feeling anxious lately",
    icon: Brain,
    bg: '#EEF2FF', // indigo-50
    iconColor: '#6366F1', // indigo-600
  },
  {
    text: 'I had a tough day',
    icon: Heart,
    bg: '#FFF7ED', // orange-50
    iconColor: '#F59E0B', // amber-500
  },
  {
    text: 'I want to understand myself better',
    icon: Sparkles,
    bg: '#F0FDF4', // green-50
    iconColor: '#10B981', // emerald-500
  },
  {
    text: 'I need someone to listen',
    icon: Shield,
    bg: '#FDF2F8', // pink-50
    iconColor: '#EC4899', // pink-500
  },
]

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="max-w-xl mx-auto mb-3"
    >
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon

          return (
            <motion.button
              key={suggestion.text}
              onClick={() => onSelect(suggestion.text)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-300 shadow-card hover:shadow-large',
                'border border-white/20 backdrop-blur-sm text-foreground'
              )}
              style={{ backgroundColor: suggestion.bg }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: suggestion.iconColor }}
              />
              <span>{suggestion.text}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
