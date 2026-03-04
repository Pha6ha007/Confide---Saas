'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Loader2, Mic, Keyboard, Volume2, VolumeX, Crown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getExerciseById } from '@/lib/exercises/data'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { SourcesPanel } from './SourcesPanel'
import MoodCheckIn from '@/components/mood/MoodCheckIn'
import { SuggestionChips } from './SuggestionChips'
import { FirstVisitWelcome } from './FirstVisitWelcome'
import { OnboardingTour } from './OnboardingTour'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { AudioPlayer } from '@/components/voice/AudioPlayer'
import { TooltipSimple } from '@/components/ui/tooltip-simple'
import { Message } from '@/types'

interface ChatWindowProps {
  sessionId?: string
  onSessionCreated?: (sessionId: string) => void
}

export function ChatWindow({ sessionId, onSessionCreated }: ChatWindowProps) {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId)
  const [sources, setSources] = useState<any[]>([])
  const [memoryUpdated, setMemoryUpdated] = useState(false)
  const [companionName, setCompanionName] = useState('Alex')
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false)
  const [greetingLoaded, setGreetingLoaded] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false) // Voice input
  const [agentVoiceEnabled, setAgentVoiceEnabled] = useState(false) // Voice output
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free')
  const [preferredName, setPreferredName] = useState<string | undefined>(undefined)
  const [showBeforeMoodCheckIn, setShowBeforeMoodCheckIn] = useState(false) // Before session mood check-in
  const [showAfterMoodCheckIn, setShowAfterMoodCheckIn] = useState(false) // After session mood check-in
  const [hasMoodCheckInToday, setHasMoodCheckInToday] = useState(false) // Has mood check-in today
  const [showOnboarding, setShowOnboarding] = useState(false) // First visit welcome screen
  const [showTour, setShowTour] = useState(false) // Onboarding tour overlay
  const [messageCount, setMessageCount] = useState(0) // Track user messages in current session
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<Date>(new Date())

  // Derived states
  const isVoiceAvailable = userPlan === 'pro' || userPlan === 'premium'
  const isPremium = userPlan === 'premium'

  // Загрузить данные пользователя при монтировании
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setCompanionName(data.companionName || 'Alex')
          setUserPlan(data.plan || 'free')
          setPreferredName(data.preferredName)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [])

  // Проверить первый ли это визит (SSR safe)
  useEffect(() => {
    const isOnboardingComplete = localStorage.getItem('confide_onboarding_complete')
    if (!isOnboardingComplete) {
      setShowOnboarding(true)
    }
  }, [])

  // Check if user has mood check-in today
  useEffect(() => {
    const checkTodayMoodCheckIn = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await fetch('/api/mood?period=month')
        if (response.ok) {
          const data = await response.json()
          const hasToday = data.entries.some((entry: any) => {
            const entryDate = new Date(entry.createdAt).toISOString().split('T')[0]
            return entryDate === today
          })
          setHasMoodCheckInToday(hasToday)

          // Show before-session check-in if no session and no check-in today
          if (!currentSessionId && !hasToday && !showOnboarding && !showTour) {
            setShowBeforeMoodCheckIn(true)
          }
        }
      } catch (error) {
        console.error('Failed to check mood check-in:', error)
      }
    }

    checkTodayMoodCheckIn()
  }, [currentSessionId, showOnboarding, showTour])

  // Handle exercise deep linking from query parameter
  useEffect(() => {
    const exerciseId = searchParams?.get('exercise')
    if (exerciseId && !input) {
      const exercise = getExerciseById(exerciseId)
      if (exercise) {
        setInput(`I just finished the ${exercise.name} exercise. Here's how I feel: `)
        // Focus the textarea after a short delay to ensure it's rendered
        setTimeout(() => {
          textareaRef.current?.focus()
          // Move cursor to end
          const length = textareaRef.current?.value.length || 0
          textareaRef.current?.setSelectionRange(length, length)
        }, 100)
      }
    }
  }, [searchParams, input])

  // Загрузить приветственное сообщение если чат пустой
  useEffect(() => {
    const loadGreeting = async () => {
      // Не загружать если:
      // - уже есть сообщения
      // - уже загружается
      // - уже загружено
      // - показывается before mood check-in
      if (messages.length > 0 || isLoadingGreeting || greetingLoaded || showBeforeMoodCheckIn) {
        return
      }

      setIsLoadingGreeting(true)

      // Показать typing indicator 800ms
      await new Promise((resolve) => setTimeout(resolve, 800))

      try {
        const response = await fetch('/api/chat/greeting')
        if (!response.ok) {
          throw new Error('Failed to load greeting')
        }

        const data = await response.json()

        // Добавить приветственное сообщение
        const greetingMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          createdAt: new Date().toISOString(),
        }

        setMessages([greetingMessage])
        setGreetingLoaded(true)
      } catch (error) {
        console.error('Failed to load greeting:', error)
        // Fallback greeting если API недоступен
        const greeting = preferredName
          ? `Hi ${preferredName}! I'm ${companionName}, your personal companion.`
          : `Hi! I'm ${companionName}, your personal companion.`

        const fallbackMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `${greeting} I'm here whenever you need to talk — and I'll remember everything we share, so you never have to repeat yourself. What's on your mind today?`,
          createdAt: new Date().toISOString(),
        }
        setMessages([fallbackMessage])
        setGreetingLoaded(true)
      } finally {
        setIsLoadingGreeting(false)
      }
    }

    loadGreeting()
  }, [messages.length, companionName, isLoadingGreeting, greetingLoaded, showBeforeMoodCheckIn])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Update memory after session (idle timeout or page unload)
  const updateMemory = async () => {
    if (!currentSessionId || memoryUpdated || messages.length < 2) {
      return
    }

    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
        }),
      })

      if (response.ok) {
        setMemoryUpdated(true)
        console.log('Memory updated successfully')
      }
    } catch (error) {
      console.error('Failed to update memory:', error)
    }
  }

  // Reset idle timer on user activity
  const resetIdleTimer = () => {
    lastActivityRef.current = new Date()

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }

    // Update memory after 5 minutes of inactivity
    idleTimerRef.current = setTimeout(() => {
      updateMemory()
    }, 5 * 60 * 1000) // 5 minutes
  }

  // Handle page unload - update memory before leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSessionId && !memoryUpdated && messages.length >= 2) {
        // Use sendBeacon for reliable background request
        const data = JSON.stringify({ sessionId: currentSessionId })
        navigator.sendBeacon('/api/memory', data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [currentSessionId, memoryUpdated, messages.length])

  // Start idle timer when session starts
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      resetIdleTimer()
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [currentSessionId, messages.length])

  const handleSubmit = async (e?: React.FormEvent, transcribedText?: string) => {
    if (e) {
      e.preventDefault()
    }

    const userMessage = transcribedText || input.trim()

    if (!userMessage || isLoading) return

    setInput('')

    // Reset idle timer on user activity
    resetIdleTimer()

    // Increment message count
    setMessageCount((prev) => prev + 1)

    // Add user message immediately
    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSessionId,
          enableVoiceResponse: agentVoiceEnabled, // Передаём флаг голосового ответа
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Update session ID if new session was created
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId)
        onSessionCreated?.(data.sessionId)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: data.messageId || crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        audioUrl: data.audioUrl, // Аудио URL если сгенерировано
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update sources if provided
      if (data.sources) {
        setSources(data.sources)
      }

      // Auto-play audio если пришёл audioUrl и голос включён
      if (data.audioUrl && agentVoiceEnabled) {
        try {
          const audio = new Audio(data.audioUrl)
          audio.play().catch((error) => {
            console.error('Failed to auto-play audio:', error)
          })
        } catch (error) {
          console.error('Failed to create audio element:', error)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error. Please try again in a moment.',
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceTranscription = (text: string) => {
    handleSubmit(undefined, text)
  }

  const toggleVoiceInput = () => {
    if (!isVoiceAvailable) {
      // Заблокировано для FREE — tooltip покажет подсказку
      return
    }
    setIsVoiceMode(!isVoiceMode)
  }

  const toggleAgentVoice = () => {
    if (!isVoiceAvailable) {
      return
    }
    setAgentVoiceEnabled(!agentVoiceEnabled)
  }

  const handleBeforeMoodCheckInComplete = async (result: {
    score: number
    reasons: string[]
    note: string | null
  }) => {
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'before',
          score: result.score,
          reasons: result.reasons,
          note: result.note,
        }),
      })

      if (response.ok) {
        setShowBeforeMoodCheckIn(false)
        setHasMoodCheckInToday(true)
      } else {
        console.error('Failed to save before-session mood check-in')
        toast.error('Failed to save mood check-in')
      }
    } catch (error) {
      console.error('Error saving before-session mood check-in:', error)
      toast.error('Failed to save mood check-in')
    }
  }

  const handleAfterMoodCheckInComplete = async (result: {
    score: number
    reasons: string[]
    note: string | null
  }) => {
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'after',
          score: result.score,
          reasons: result.reasons,
          note: result.note,
          sessionId: currentSessionId,
        }),
      })

      if (response.ok) {
        setShowAfterMoodCheckIn(false)
        toast.success('Mood saved', {
          description: 'Your after-session mood has been recorded.',
        })
      } else {
        console.error('Failed to save after-session mood check-in')
        toast.error('Failed to save mood check-in')
      }
    } catch (error) {
      console.error('Error saving after-session mood check-in:', error)
      toast.error('Failed to save mood check-in')
    }
  }

  const handleStartTour = () => {
    setShowOnboarding(false)
    setShowTour(true)
  }

  const handleSkipTour = () => {
    localStorage.setItem('confide_onboarding_complete', 'true')
    setShowOnboarding(false)
  }

  const handleCompleteTour = () => {
    setShowTour(false)
  }

  const handleChipSelect = (text: string) => {
    // Вызвать ту же функцию что и при отправке сообщения
    handleSubmit(undefined, text)
  }

  const handleNewConversation = async () => {
    // Если нет активной сессии или мало сообщений - просто сбросить
    if (!currentSessionId || messages.length < 2) {
      setMessages([])
      setCurrentSessionId(undefined)
      setMessageCount(0)
      setMemoryUpdated(false)
      setGreetingLoaded(false)
      setSources([])
      return
    }

    // Показать after-session mood check-in если 5+ сообщений от пользователя
    if (messageCount >= 5) {
      setShowAfterMoodCheckIn(true)
    }

    try {
      // Завершить текущую сессию через Memory Agent
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to end session')
      }

      const data = await response.json()

      // Показать summary как уведомление
      if (data.summary) {
        toast.success('Session saved', {
          description: data.summary,
          duration: 5000,
        })
      }

      // Сбросить всё состояние для новой сессии
      setMessages([])
      setCurrentSessionId(undefined)
      setMessageCount(0)
      setMemoryUpdated(false)
      setGreetingLoaded(false)
      setSources([])
    } catch (error) {
      console.error('Failed to start new conversation:', error)
      toast.error('Failed to save session')
    }
  }

  // Show SuggestionChips when there's only greeting (no user messages yet)
  const shouldShowSuggestionChips = messages.length === 1 && messages[0].role === 'assistant' && !isLoading

  return (
    <div className="flex flex-col h-full relative">
      {/* First Visit Welcome Screen */}
      {showOnboarding ? (
        <FirstVisitWelcome
          companionName={companionName}
          preferredName={preferredName}
          onStartTour={handleStartTour}
          onSkipTour={handleSkipTour}
        />
      ) : showTour ? (
        /* Onboarding Tour Overlay */
        <OnboardingTour onComplete={handleCompleteTour} onSkip={handleCompleteTour} />
      ) : (
        <>
          {/* Header with New Conversation button */}
          {currentSessionId && messages.length > 0 && (
            <div className="border-b border-white/20 px-6 py-3 glass backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Active session</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  className="text-xs hover:bg-white/20 transition-all"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Conversation
                </Button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            enableVoice={isVoiceAvailable}
          />
        ))}

        {/* Show typing indicator when loading greeting or response */}
        {(isLoading || isLoadingGreeting) && <TypingIndicator companionName={companionName} />}

        {/* Show Suggestion Chips after greeting */}
        {shouldShowSuggestionChips && (
          <SuggestionChips onSelect={handleChipSelect} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sources Panel */}
      {sources.length > 0 && (
        <div className="px-6">
          <SourcesPanel sources={sources} />
        </div>
      )}

      {/* Input Area */}
      <div className="glass border-t border-white/20 p-6 shadow-large">
        <div className="space-y-4">
          {/* Voice Controls — только для PRO/PREMIUM */}
          {isVoiceAvailable && (
            <div className="flex items-center justify-between px-4 py-3 glass-button border border-white/20 rounded-xl shadow-card">
              {/* Agent Voice Toggle */}
              <div className="flex items-center space-x-3">
                <Switch
                  checked={agentVoiceEnabled}
                  onCheckedChange={toggleAgentVoice}
                />
                <div className="flex items-center space-x-2">
                  {agentVoiceEnabled ? (
                    <Volume2 className="w-4 h-4 text-primary" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    Agent replies with voice
                  </span>
                  {/* Premium Badge */}
                  {isPremium && (
                    <Badge variant="premium" className="ml-2">
                      <Crown className="w-3 h-3 mr-1" />
                      Custom Voice
                    </Badge>
                  )}
                </div>
              </div>

              {/* Voice Input Toggle */}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={toggleVoiceInput}
                className="text-xs transition-smooth hover:bg-white/30 backdrop-blur-sm"
              >
                {isVoiceMode ? (
                  <>
                    <Keyboard className="w-4 h-4 mr-1" />
                    Text Input
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Text or Voice Input */}
          {isVoiceMode && isVoiceAvailable ? (
            <VoiceRecorder
              onTranscriptionComplete={handleVoiceTranscription}
              disabled={isLoading}
            />
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="min-h-[60px] max-h-[200px] resize-none rounded-xl glass-button border border-white/20 focus:ring-2 focus:ring-primary transition-smooth backdrop-blur-md"
                disabled={isLoading}
              />
              <div className="flex flex-col space-y-2">
                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 h-auto rounded-xl transition-smooth hover:scale-105 shadow-card hover:shadow-large relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#EC4899] opacity-0 group-hover:opacity-20 transition-opacity" />
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <Send className="w-5 h-5 relative z-10" />
                  )}
                </Button>

                {/* Voice Button для FREE — заблокирован с tooltip */}
                {!isVoiceAvailable && (
                  <TooltipSimple text="Upgrade to Pro for voice features" position="left">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                      className="px-3 py-2 opacity-50 cursor-not-allowed rounded-xl"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </TooltipSimple>
                )}
              </div>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          This is AI support, not medical advice. In crisis, contact emergency
          services.
        </p>
      </div>
        </>
      )}

      {/* Before-Session Mood Check-In Modal */}
      {showBeforeMoodCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <MoodCheckIn
            type="before"
            companionName={companionName}
            onComplete={handleBeforeMoodCheckInComplete}
            onSkip={() => setShowBeforeMoodCheckIn(false)}
          />
        </div>
      )}

      {/* After-Session Mood Check-In Modal */}
      {showAfterMoodCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <MoodCheckIn
            type="after"
            companionName={companionName}
            onComplete={handleAfterMoodCheckInComplete}
            onSkip={() => setShowAfterMoodCheckIn(false)}
          />
        </div>
      )}
    </div>
  )
}
