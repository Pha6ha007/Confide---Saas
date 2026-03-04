'use client'

// MoodCheckIn — 3-step mood check-in flow
// Step 1: Emoji selection (1-7)
// Step 2: Reason tags (multi-select)
// Step 3: Optional note

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, Check } from 'lucide-react'
import { MOOD_EMOJIS, REASON_TAGS, type MoodType, type MoodScore } from '@/lib/mood/data'
import { Button } from '@/components/ui/button'

interface MoodCheckInProps {
  type: MoodType // "before" | "after"
  companionName?: string
  onComplete: (result: { score: number; reasons: string[]; note: string | null }) => void
  onSkip?: () => void
}

export default function MoodCheckIn({
  type,
  companionName = 'Alex',
  onComplete,
  onSkip,
}: MoodCheckInProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedScore, setSelectedScore] = useState<MoodScore | null>(null)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [note, setNote] = useState('')

  const selectedMood = selectedScore ? MOOD_EMOJIS.find((m) => m.score === selectedScore) : null

  // Step 1: Select emoji
  const handleEmojiSelect = (score: MoodScore) => {
    setSelectedScore(score)
    // Auto-advance to step 2 after 400ms
    setTimeout(() => {
      setStep(2)
    }, 400)
  }

  // Step 2: Toggle reason tag
  const toggleReason = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId) ? prev.filter((r) => r !== reasonId) : [...prev, reasonId]
    )
  }

  // Step 2 → 3: Optional note
  const handleContinueToNote = () => {
    setStep(3)
  }

  // Step 2/3: Done
  const handleDone = () => {
    if (!selectedScore) return

    onComplete({
      score: selectedScore,
      reasons: selectedReasons,
      note: note.trim() || null,
    })
  }

  // Navigate back
  const handleBack = () => {
    if (step === 2) setStep(1)
    if (step === 3) setStep(2)
  }

  const title = type === 'before' ? `How are you feeling?` : `How do you feel now?`
  const subtitle =
    type === 'before'
      ? `Check in before talking with ${companionName}`
      : `How did the session feel?`

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#FAFAF9] rounded-3xl shadow-large max-w-lg w-full p-8 relative"
      >
        {/* Close button */}
        {onSkip && step === 1 && (
          <button
            onClick={onSkip}
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Back button */}
        {step > 1 && (
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-[#6366F1]'
                  : s < step
                    ? 'w-6 bg-[#6366F1]/40'
                    : 'w-6 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Emoji Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Selected mood pill */}
              {selectedMood && (
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white px-6 py-3 rounded-full shadow-subtle flex items-center gap-3">
                    <span className="text-3xl">{selectedMood.emoji}</span>
                    <span className="font-serif text-lg font-medium text-foreground">
                      {selectedMood.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Emoji grid */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {MOOD_EMOJIS.map((mood) => {
                  const isSelected = selectedScore === mood.score
                  return (
                    <motion.button
                      key={mood.score}
                      onClick={() => handleEmojiSelect(mood.score as MoodScore)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                        isSelected
                          ? 'scale-125 -translate-y-2'
                          : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110'
                      }`}
                      whileHover={{ scale: isSelected ? 1.25 : 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-5xl">{mood.emoji}</span>
                      <span
                        className={`text-xs font-medium ${
                          isSelected ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {mood.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {onSkip && (
                <div className="text-center pt-4">
                  <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground">
                    Skip for now
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Reason Tags */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <p className="text-center text-muted-foreground mb-6">
                What's contributing to how you feel? (Select all that apply)
              </p>

              {/* Reason tags grid */}
              <div className="flex flex-wrap gap-3 justify-center">
                {REASON_TAGS.map((tag) => {
                  const isSelected = selectedReasons.includes(tag.id)
                  return (
                    <motion.button
                      key={tag.id}
                      onClick={() => toggleReason(tag.id)}
                      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#6366F1] text-white border-2 border-[#6366F1] scale-105 shadow-md'
                          : 'bg-white text-foreground border-2 border-gray-200 hover:border-[#6366F1]/40 hover:scale-105'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-lg">{tag.emoji}</span>
                      <span>{tag.label}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </motion.button>
                  )
                })}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={handleContinueToNote} className="w-full bg-[#6366F1] text-white hover:bg-[#4F46E5]">
                  {selectedReasons.length > 0
                    ? `Next (${selectedReasons.length} selected)`
                    : 'Skip reasons'}
                </Button>
                <Button onClick={handleDone} variant="ghost" className="w-full">
                  Done ✓
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Optional Note */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <p className="text-center text-muted-foreground mb-4">
                Anything else you'd like to note?
              </p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional... what's on your mind?"
                className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#6366F1] focus:outline-none resize-none bg-white text-foreground placeholder:text-muted-foreground transition-smooth"
                maxLength={500}
              />

              <p className="text-xs text-muted-foreground text-right">
                {note.length}/500
              </p>

              <Button onClick={handleDone} className="w-full bg-[#6366F1] text-white hover:bg-[#4F46E5]">
                Done ✓
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
