'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { SourcesPanel } from './SourcesPanel'
import { Message } from '@/types'

interface ChatWindowProps {
  sessionId?: string
  onSessionCreated?: (sessionId: string) => void
}

export function ChatWindow({ sessionId, onSessionCreated }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId)
  const [sources, setSources] = useState<any[]>([])
  const [memoryUpdated, setMemoryUpdated] = useState(false)
  const [companionName, setCompanionName] = useState('Alex')
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false)
  const [greetingLoaded, setGreetingLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<Date>(new Date())

  // Загрузить имя собеседника при монтировании
  useEffect(() => {
    const fetchCompanionName = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setCompanionName(data.companionName || 'Alex')
        }
      } catch (error) {
        console.error('Failed to fetch companion name:', error)
      }
    }

    fetchCompanionName()
  }, [])

  // Загрузить приветственное сообщение если чат пустой
  useEffect(() => {
    const loadGreeting = async () => {
      // Не загружать если:
      // - уже есть сообщения
      // - уже загружается
      // - уже загружено
      if (messages.length > 0 || isLoadingGreeting || greetingLoaded) {
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
        const fallbackMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Hi! I'm ${companionName}, and I'm here to listen. What's on your mind?`,
          createdAt: new Date().toISOString(),
        }
        setMessages([fallbackMessage])
        setGreetingLoaded(true)
      } finally {
        setIsLoadingGreeting(false)
      }
    }

    loadGreeting()
  }, [messages.length, companionName, isLoadingGreeting, greetingLoaded])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // Reset idle timer on user activity
    resetIdleTimer()

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
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update sources if provided
      if (data.sources) {
        setSources(data.sources)
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Show typing indicator when loading greeting or response */}
        {(isLoading || isLoadingGreeting) && <TypingIndicator companionName={companionName} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Sources Panel */}
      {sources.length > 0 && (
        <div className="px-6">
          <SourcesPanel sources={sources} />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 h-auto"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This is AI support, not medical advice. In crisis, contact emergency
          services.
        </p>
      </div>
    </div>
  )
}
