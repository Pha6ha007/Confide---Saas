'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Play, Pause, Square, ChevronLeft } from 'lucide-react'
import {
  ALL_EXERCISES,
  Exercise,
  ExerciseCategory,
  getExercisesByCategory,
  getCategoryCount,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  getExerciseById,
} from '@/lib/exercises/data'
import { ExerciseCard } from './ExerciseCard'
import { BreathingCircle } from './BreathingCircle'
import { GuidedPrompt } from './GuidedPrompt'
import { CompletionScreen } from './CompletionScreen'

type ViewMode = 'list' | 'detail' | 'countdown' | 'active' | 'completed'

interface ExercisesPageProps {
  startExerciseId?: string // For deep linking from chat
}

export function ExercisesPage({ startExerciseId }: ExercisesPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [totalElapsed, setTotalElapsed] = useState(0) // total seconds elapsed in entire exercise
  const [isPaused, setIsPaused] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Handle deep linking from chat
  useEffect(() => {
    if (startExerciseId) {
      const exercise = getExerciseById(startExerciseId)
      if (exercise) {
        setSelectedExercise(exercise)
        setViewMode('detail')
      }
    }
  }, [startExerciseId])

  // Filter exercises by category
  const filteredExercises =
    selectedCategory === 'all' ? ALL_EXERCISES : getExercisesByCategory(selectedCategory)

  // Calculate current cycle and phase from totalElapsed
  const getCurrentState = () => {
    if (!selectedExercise) return null

    const phases = selectedExercise.phases
    const cycleLength = phases.reduce((sum, p) => sum + p.duration, 0)
    const totalDuration = cycleLength * selectedExercise.cycles

    // Check if exercise is complete
    if (totalElapsed >= totalDuration) {
      return { isComplete: true, currentCycle: 0, currentPhaseIndex: 0, elapsed: 0, progress: 1 }
    }

    const currentCycle = Math.floor(totalElapsed / cycleLength)
    const elapsedInCycle = totalElapsed - currentCycle * cycleLength

    let accumulatedTime = 0
    let currentPhaseIndex = 0

    for (let i = 0; i < phases.length; i++) {
      if (elapsedInCycle < accumulatedTime + phases[i].duration) {
        currentPhaseIndex = i
        break
      }
      accumulatedTime += phases[i].duration
    }

    const currentPhase = phases[currentPhaseIndex]
    const elapsed = elapsedInCycle - accumulatedTime
    const progress = elapsed / currentPhase.duration

    return { isComplete: false, currentCycle, currentPhaseIndex, elapsed, progress, currentPhase }
  }

  const currentState = getCurrentState()
  const currentCycle = currentState?.currentCycle ?? 0
  const currentPhaseIndex = currentState?.currentPhaseIndex ?? 0
  const currentPhase = currentState?.currentPhase ?? selectedExercise?.phases[0]
  const progress = currentState?.progress ?? 0
  const elapsed = currentState?.elapsed ?? 0

  // Get current guided prompt (if exercise has them)
  const getCurrentPrompt = () => {
    if (!selectedExercise) return null

    // Sensory prompts (5-4-3-2-1)
    if (selectedExercise.sensoryPrompts && currentCycle < selectedExercise.sensoryPrompts.length) {
      const prompt = selectedExercise.sensoryPrompts[currentCycle]
      return {
        text: `${prompt.sense} ${prompt.count}: ${prompt.prompt}`,
        emoji: prompt.emoji,
      }
    }

    // Guided prompts (other exercises)
    if (selectedExercise.guidedPrompts && currentCycle < selectedExercise.guidedPrompts.length) {
      return {
        text: selectedExercise.guidedPrompts[currentCycle],
        emoji: undefined,
      }
    }

    return null
  }

  // Timer logic
  useEffect(() => {
    if (viewMode !== 'active' || isPaused || !selectedExercise) {
      return
    }

    const phases = selectedExercise.phases
    const cycleLength = phases.reduce((sum, p) => sum + p.duration, 0)
    const totalDuration = cycleLength * selectedExercise.cycles

    console.log('🎯 Starting exercise timer...', { totalDuration, cycleLength })

    const interval = setInterval(() => {
      setTotalElapsed((prev) => {
        const newElapsed = prev + 0.05

        // Check if exercise is complete
        if (newElapsed >= totalDuration) {
          console.log('ALL CYCLES DONE')
          console.log('🎉 Exercise completed! Switching to completion screen...')
          setViewMode('completed')
          return totalDuration
        }

        return newElapsed
      })
    }, 50) // 50ms = smooth animation

    return () => {
      console.log('🛑 Cleaning up timer...')
      clearInterval(interval)
    }
  }, [viewMode, isPaused, selectedExercise])

  // Countdown timer
  useEffect(() => {
    if (viewMode === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (viewMode === 'countdown' && countdown === 0) {
      setViewMode('active')
    }
  }, [viewMode, countdown])

  // Handlers
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setViewMode('detail')
  }

  const handleBegin = () => {
    setTotalElapsed(0)
    setCountdown(3)
    setViewMode('countdown')
  }

  const handlePause = () => setIsPaused(true)
  const handleResume = () => setIsPaused(false)

  const handleStop = () => {
    setViewMode('detail')
    setTotalElapsed(0)
    setIsPaused(false)
  }

  const handleRestart = () => {
    setTotalElapsed(0)
    setIsPaused(false)
    setCountdown(3)
    setViewMode('countdown')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedExercise(null)
    setTotalElapsed(0)
    setIsPaused(false)
  }

  // Category tabs
  const categories: Array<ExerciseCategory | 'all'> = [
    'all',
    'breathing',
    'grounding',
    'meditation',
    'body',
  ]

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <AnimatePresence mode="wait">
        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-serif text-5xl font-semibold text-foreground mb-3">
                Wellness Exercises
              </h1>
              <p className="text-lg text-muted-foreground">
                Evidence-based breathing, grounding, and meditation practices for calm and clarity.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat
                const count = cat === 'all' ? ALL_EXERCISES.length : getCategoryCount(cat)
                const icon = cat === 'all' ? '✨' : CATEGORY_ICONS[cat]
                const label = cat === 'all' ? 'All' : CATEGORY_LABELS[cat]

                return (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    variant={isActive ? 'default' : 'outline'}
                    className={`
                      flex items-center space-x-2 transition-smooth
                      ${isActive ? 'bg-primary text-white shadow-lg' : 'glass border-white/30 hover:bg-white/50'}
                    `}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </Button>
                )
              })}
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onClick={() => handleSelectExercise(exercise)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* DETAIL VIEW */}
        {viewMode === 'detail' && selectedExercise && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto text-center px-6"
          >
            {/* Back Button */}
            <div className="mb-12 text-left">
              <button
                onClick={handleBackToList}
                className="flex items-center text-sm transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1F2937')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              >
                <span className="mr-1">←</span>
                <span>Back</span>
              </button>
            </div>

            {/* Icon */}
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg mx-auto mb-4"
              style={{
                background: `linear-gradient(135deg, ${selectedExercise.gradient[0]}, ${selectedExercise.gradient[1]})`,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {selectedExercise.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="font-serif text-xl font-semibold text-foreground mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {selectedExercise.name}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-sm text-[#6B7280] leading-relaxed mb-6 max-w-sm mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {selectedExercise.description}
            </motion.p>

            {/* Phase Pills */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-1.5 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {selectedExercise.phases.map((phase, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${selectedExercise.color}14`,
                      color: selectedExercise.color,
                    }}
                  >
                    {phase.name} {phase.duration}s
                  </div>
                  {idx < selectedExercise.phases.length - 1 && (
                    <span className="text-[10px] text-[#D1D5DB]">→</span>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] mb-1">Duration</p>
                <p className="text-sm font-medium text-foreground">
                  {Math.ceil(
                    (selectedExercise.phases.reduce((sum, p) => sum + p.duration, 0) *
                      selectedExercise.cycles) /
                      60
                  )}m
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] mb-1">Cycles</p>
                <p className="text-sm font-medium text-foreground">{selectedExercise.cycles}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] mb-1">Category</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {selectedExercise.category}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] mb-1">
                  Difficulty
                </p>
                <p className="text-sm font-medium text-foreground">{selectedExercise.difficulty}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] mb-1">Best for</p>
                <p className="text-sm font-medium text-foreground">{selectedExercise.bestFor}</p>
              </div>
            </motion.div>

            {/* Begin Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button
                onClick={handleBegin}
                className="bg-primary text-white hover:scale-105 transition-smooth shadow-lg px-8"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Begin
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* COUNTDOWN */}
        {viewMode === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center min-h-[600px]"
          >
            <motion.div
              className="font-serif text-7xl font-light mb-4"
              style={{ color: selectedExercise?.color }}
              key={countdown}
              initial={{ scale: 1 }}
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 1,
                times: [0, 0.5, 1],
                ease: 'easeInOut',
              }}
            >
              {countdown}
            </motion.div>
            <p className="text-sm text-[#9CA3AF]">Get comfortable...</p>
          </motion.div>
        )}

        {/* ACTIVE */}
        {viewMode === 'active' && selectedExercise && currentPhase && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between w-full px-6 py-4 mb-8">
              {/* Left: Back button */}
              <button
                onClick={handleStop}
                className="text-sm transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1F2937')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              >
                ← Back
              </button>

              {/* Center: Exercise name */}
              <h2 className="font-serif text-lg font-semibold absolute left-1/2 -translate-x-1/2" style={{ color: '#1F2937' }}>
                {selectedExercise.name}
              </h2>

              {/* Right: Cycle indicator */}
              <span className="text-sm" style={{ color: '#6B7280' }}>
                {currentCycle + 1}/{selectedExercise.cycles}
              </span>
            </div>

            {/* Guided Prompt */}
            {getCurrentPrompt() && (
              <div className="mb-8">
                <GuidedPrompt
                  text={getCurrentPrompt()!.text}
                  color={selectedExercise.color}
                  emoji={getCurrentPrompt()!.emoji}
                />
              </div>
            )}

            {/* Breathing Circle */}
            <div className="mb-6">
              <BreathingCircle
                progress={progress}
                phaseName={currentPhase.name}
                secondsLeft={Math.ceil(currentPhase.duration - elapsed)}
                color={selectedExercise.color}
                action={currentPhase.action}
              />
            </div>

            {/* Phase Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {selectedExercise.phases.map((phase, idx) => (
                <div
                  key={idx}
                  className="transition-all duration-300"
                  style={{
                    width: idx === currentPhaseIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor:
                      idx === currentPhaseIndex
                        ? selectedExercise.color
                        : `${selectedExercise.color}33`,
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="px-5 py-2 rounded-xl text-white transition-smooth"
                  style={{ backgroundColor: selectedExercise.color }}
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-5 py-2 rounded-xl transition-smooth"
                  style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleStop}
                className="px-5 py-2 rounded-xl transition-smooth"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
              >
                Stop
              </button>
            </div>
          </motion.div>
        )}

        {/* COMPLETED */}
        {viewMode === 'completed' && selectedExercise && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <CompletionScreen
              exercise={selectedExercise}
              onRestart={handleRestart}
              onBackToList={handleBackToList}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
