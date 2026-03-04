'use client'

import { motion } from 'framer-motion'
import { Brain, Shield, Heart, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FirstVisitWelcomeProps {
  companionName: string
  preferredName?: string
  onStartTour: () => void
  onSkipTour: () => void
}

export function FirstVisitWelcome({
  companionName,
  preferredName,
  onStartTour,
  onSkipTour,
}: FirstVisitWelcomeProps) {
  const features = [
    {
      icon: Brain,
      title: 'Based on real psychology research',
      color: '#6366F1',
    },
    {
      icon: Shield,
      title: 'Your conversations are private',
      color: '#10B981',
    },
    {
      icon: Heart,
      title: 'I adapt to your communication style',
      color: '#EC4899',
    },
  ]

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'glass border border-white/20 rounded-2xl shadow-large',
          'max-w-md w-full p-6 space-y-3 backdrop-blur-xl',
          'overflow-y-auto max-h-[calc(100vh-120px)]'
        )}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[#6366F1] to-[#EC4899] flex items-center justify-center shadow-large"
        >
          <Play className="w-7 h-7 text-white" fill="currentColor" />
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            Hi {preferredName || 'there'}, I'm {companionName}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            I'm here whenever you need to talk. No judgment, no rush — just a safe space to share what's on your mind.
          </p>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground text-center"
        >
          I remember our conversations and learn how to support you better over time. Everything here stays between us.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={cn(
                  'flex items-center gap-2 py-3 px-4 rounded-xl',
                  'glass-button border border-white/20 shadow-card',
                  'backdrop-blur-sm'
                )}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: feature.color }} />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {feature.title}
                </span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-2 pt-1"
        >
          <Button
            onClick={onStartTour}
            className={cn(
              'w-full h-10 rounded-xl font-medium transition-smooth text-sm',
              'hover:scale-105 shadow-card hover:shadow-large',
              'bg-gradient-to-r from-[#6366F1] to-[#818CF8]',
              'relative overflow-hidden group'
            )}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#EC4899] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              Take a quick tour
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>

          <Button
            onClick={onSkipTour}
            variant="ghost"
            className="w-full h-10 rounded-xl font-medium hover:bg-white/10 text-sm"
          >
            Start chatting
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
