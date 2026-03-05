'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SessionPreview } from '@/types'

interface ChatHistorySidebarProps {
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewConversation: () => void
  onSessionCreated?: () => void
  onClose?: () => void
}

const AGENT_COLORS: Record<string, string> = {
  anxiety: '#6366F1',
  family: '#F59E0B',
  trauma: '#10B981',
  relationships: '#EC4899',
  mens: '#06B6D4',
  womens: '#8B5CF6',
  general: '#6B7280',
}

const AGENT_ICONS: Record<string, string> = {
  anxiety: '🧘',
  family: '👨‍👩‍👧',
  trauma: '🌿',
  relationships: '💕',
  mens: '👤',
  womens: '👤',
  general: '💬',
}

const MOOD_EMOJI: string[] = ['', '😢', '😟', '😕', '😐', '🙂', '😊', '😄']

function getDateGroup(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)

  if (date >= today) return 'Today'
  if (date >= yesterday) return 'Yesterday'
  if (date >= weekAgo) return 'This Week'
  if (date >= monthAgo) return 'This Month'
  return 'Older'
}

function formatSessionDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date >= today) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (date >= yesterday) return 'Yesterday'

  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  if (date >= weekAgo) {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ChatHistorySidebar({
  activeSessionId,
  onSelectSession,
  onNewConversation,
  onClose,
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<SessionPreview[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [lastActiveSessionId, setLastActiveSessionId] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (activeSessionId && !lastActiveSessionId) {
      loadSessions()
    }
    setLastActiveSessionId(activeSessionId)
  }, [activeSessionId])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/chat/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      session.firstUserMessage?.toLowerCase().includes(query) ||
      session.lastAssistantMessage?.toLowerCase().includes(query) ||
      session.agentType.toLowerCase().includes(query)
    )
  })

  const groupedSessions = filteredSessions.reduce(
    (acc, session) => {
      const date = new Date(session.createdAt)
      const group = getDateGroup(date)
      if (!acc[group]) acc[group] = []
      acc[group].push(session)
      return acc
    },
    {} as Record<string, SessionPreview[]>
  )

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']
  const orderedGroups = groupOrder.filter((group) => groupedSessions[group])

  return (
    <div
      className="h-full flex flex-col"
      style={{
        width: 340,
        borderRight: '1px solid #F3F4F6',
        background: '#FFFFFF',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#1F2937' }}
          >
            Conversations
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewConversation}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: '#6366F1', color: '#fff' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#5558E3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#6366F1')}
            >
              <Plus className="w-4 h-4" />
            </button>
            {/* Close button (mobile only) */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: '#F3F4F6', color: '#6B7280' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: '#9CA3AF' }}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              color: '#1F2937',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6366F140')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Loading...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: '#F3F4F6' }}
            >
              <MessageSquare className="w-5 h-5" style={{ color: '#9CA3AF' }} />
            </div>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              {searchQuery ? 'No conversations found' : 'Your conversations will appear here'}
            </p>
          </div>
        ) : (
          orderedGroups.map((group) => (
            <div key={group} className="mb-1">
              <p
                className="text-xs font-medium px-2 py-1.5 sticky top-0"
                style={{ color: '#9CA3AF', background: '#FFFFFF' }}
              >
                {group}
              </p>
              {groupedSessions[group].map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isSelected={session.id === activeSessionId}
                  onClick={() => onSelectSession(session.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SessionItem({
  session,
  isSelected,
  onClick,
}: {
  session: SessionPreview
  isSelected: boolean
  onClick: () => void
}) {
  const agentColor = AGENT_COLORS[session.agentType] || AGENT_COLORS.general
  const date = new Date(session.createdAt)
  const moodChange =
    session.moodBefore && session.moodAfter ? session.moodAfter - session.moodBefore : null

  // Avatar: mood emoji if available, otherwise agent icon
  const avatarContent = session.moodAfter
    ? MOOD_EMOJI[session.moodAfter]
    : AGENT_ICONS[session.agentType] || '💬'

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2.5 py-2.5 rounded-xl transition-all duration-150 flex gap-3 mb-0.5"
      style={{
        background: isSelected
          ? `${agentColor}10`
          : session.isActive
            ? '#FEFCE8'
            : 'transparent',
        border: isSelected ? `1px solid ${agentColor}25` : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = '#F9FAFB'
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          e.currentTarget.style.background = session.isActive ? '#FEFCE8' : 'transparent'
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
        style={{
          background: `linear-gradient(135deg, ${agentColor}18, ${agentColor}08)`,
          border: `1.5px solid ${agentColor}28`,
        }}
      >
        {avatarContent}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Agent badge + active dot + time */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            {session.isActive && (
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#22C55E' }} />
            )}
            <span
              className="text-xs font-semibold"
              style={{ color: agentColor }}
            >
              {session.agentType.charAt(0).toUpperCase() + session.agentType.slice(1)}
            </span>
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>
            {formatSessionDate(date)}
          </span>
        </div>

        {/* Row 2: First user message preview */}
        {session.firstUserMessage && (
          <p
            className="text-sm truncate mb-0.5"
            style={{
              color: isSelected || session.isActive ? '#1F2937' : '#4B5563',
              fontWeight: session.isActive ? 600 : 400,
            }}
          >
            {session.firstUserMessage}
          </p>
        )}

        {/* Row 3: Last assistant message + mood + count */}
        <div className="flex items-center justify-between">
          <p
            className="text-xs truncate"
            style={{ color: '#9CA3AF', maxWidth: '60%' }}
          >
            {session.lastAssistantMessage || 'No response yet'}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mood change */}
            {session.moodBefore && session.moodAfter && (
              <span className="text-xs flex items-center gap-0.5">
                {MOOD_EMOJI[session.moodBefore]}
                <span style={{ color: '#D1D5DB', fontSize: 9 }}>→</span>
                {MOOD_EMOJI[session.moodAfter]}
                {moodChange !== null && moodChange > 0 && (
                  <span
                    className="text-xs font-semibold px-1 py-0.5 rounded"
                    style={{ background: '#ECFDF5', color: '#059669', fontSize: 10 }}
                  >
                    +{moodChange}
                  </span>
                )}
              </span>
            )}
            {/* Message count */}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: '#F3F4F6', color: '#9CA3AF' }}
            >
              {session.messageCount}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
