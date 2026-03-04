'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Lightbulb, Bookmark, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

const tourSteps = [
  {
    icon: MessageCircle,
    title: 'Your safe space',
    description:
      'Alex remembers everything you share and adapts to your style over time. The more you talk, the better Alex understands you.',
    color: '#6366F1',
  },
  {
    icon: Lightbulb,
    title: 'Not sure where to start?',
    description:
      'Tap any topic to begin a conversation, or type your own message. There\'s no wrong way to start.',
    color: '#F59E0B',
  },
  {
    icon: Bookmark,
    title: 'Save meaningful moments',
    description:
      'Tap the bookmark icon on any message to save it to your personal journal. Build a collection of insights over time.',
    color: '#EC4899',
  },
  {
    icon: BookOpen,
    title: 'Evidence-based support',
    description:
      'Alex draws from real psychological research. Tap here to see which books and methods informed each response.',
    color: '#10B981',
  },
]

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = tourSteps.length
  const step = tourSteps[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // Завершить тур
      localStorage.setItem('confide_onboarding_complete', 'true')
      onComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('confide_onboarding_complete', 'true')
    onSkip()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'glass border border-white/20 rounded-2xl shadow-large',
          'max-w-md w-full mx-4 p-8 space-y-6 backdrop-blur-xl relative'
        )}
      >
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: index === currentStep ? 24 : 8,
                backgroundColor:
                  index === currentStep ? '#6366F1' : 'rgba(156, 163, 175, 0.4)',
              }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Icon */}
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-card"
              style={{ backgroundColor: `${step.color}15` }}
            >
              <Icon className="w-8 h-8" style={{ color: step.color }} />
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">
                {step.title}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed px-2">
                {step.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="text-sm font-medium hover:bg-white/10"
          >
            Skip tour
          </Button>

          <Button
            onClick={handleNext}
            className={cn(
              'px-6 h-11 rounded-xl font-medium transition-smooth',
              'hover:scale-105 shadow-card hover:shadow-large',
              'bg-gradient-to-r from-[#6366F1] to-[#818CF8]',
              'relative overflow-hidden group'
            )}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#EC4899] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">
              {currentStep < totalSteps - 1 ? 'Next' : 'Got it!'}
            </span>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
