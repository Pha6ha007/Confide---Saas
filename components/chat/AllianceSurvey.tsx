'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface AllianceSurveyProps {
  companionName: string
  onComplete: () => void
  onSkip: () => void
}

export function AllianceSurvey({ companionName, onComplete, onSkip }: AllianceSurveyProps) {
  const [understanding, setUnderstanding] = useState<number | null>(null)
  const [trust, setTrust] = useState<number | null>(null)
  const [helpfulness, setHelpfulness] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const questions = [
    {
      id: 'understanding' as const,
      question: `${companionName} понимает меня`,
      value: understanding,
      setter: setUnderstanding,
    },
    {
      id: 'trust' as const,
      question: `Я могу быть честным с ${companionName}`,
      value: trust,
      setter: setTrust,
    },
    {
      id: 'helpfulness' as const,
      question: 'Наши разговоры помогают мне',
      value: helpfulness,
      setter: setHelpfulness,
    },
  ]

  const labels = {
    1: 'Совсем нет',
    3: 'В некоторой степени',
    5: 'Очень сильно',
  }

  const canSubmit = understanding !== null && trust !== null && helpfulness !== null

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/survey/alliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          understanding,
          trust,
          helpfulness,
          feedback: feedback.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit survey')
      }

      // Show success state
      setIsSuccess(true)

      // Show thank you toast
      setTimeout(() => {
        toast.success(`Спасибо! Это помогает ${companionName} лучше понимать тебя.`, {
          duration: 3000,
        })
        onComplete()
      }, 1500)
    } catch (error) {
      console.error('[AllianceSurvey] Submit error:', error)
      toast.error('Не удалось сохранить отзыв. Попробуйте позже.')
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-button border border-white/20 shadow-large rounded-3xl p-8 relative">
            {/* Success State */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4" />
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  Спасибо за отзыв!
                </h3>
              </motion.div>
            ) : (
              <>
                {/* Skip Button */}
                <button
                  onClick={onSkip}
                  disabled={isSubmitting}
                  className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  aria-label="Skip survey"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">
                    Как проходят ваши разговоры?
                  </h2>
                  <p className="text-muted-foreground">
                    Быстрый опрос — займёт всего 30 секунд
                  </p>
                </motion.div>

                {/* Questions */}
                <div className="space-y-8 mb-6">
                  {questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <p className="text-foreground font-medium mb-3">{q.question}</p>
                      <div className="flex items-center justify-between gap-3">
                        {/* Score buttons 1-5 */}
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            onClick={() => q.setter(score)}
                            disabled={isSubmitting}
                            className={`
                              w-14 h-14 rounded-full font-bold text-lg
                              transition-all duration-300
                              ${
                                q.value === score
                                  ? 'bg-indigo-500 text-white scale-110 ring-4 ring-indigo-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 hover:scale-105'
                              }
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      {/* Labels */}
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{labels[1]}</span>
                        <span>{labels[3]}</span>
                        <span>{labels[5]}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Optional Feedback */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <label htmlFor="feedback" className="text-sm text-muted-foreground block mb-2">
                    Ещё что-то добавить? (опционально)
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ваши мысли..."
                    disabled={isSubmitting}
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between gap-4"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onSkip}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Пропустить
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохраняем...
                      </>
                    ) : (
                      'Отправить'
                    )}
                  </Button>
                </motion.div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
