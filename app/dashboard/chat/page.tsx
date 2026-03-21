'use client'

import { useState, useEffect, Suspense } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar'
import { AutoCheckout } from '@/components/billing/AutoCheckout'

function ChatPageInner() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)

  // Initialize sidebar visibility based on screen size
  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    setSidebarVisible(!isMobile)
  }, [])

  // Restore active session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('confide_active_session')
    if (savedSessionId) {
      setActiveSessionId(savedSessionId)
    }
  }, [])

  // Save active session to localStorage when it changes
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('confide_active_session', activeSessionId)
    } else {
      localStorage.removeItem('confide_active_session')
    }
  }, [activeSessionId])

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    // Auto-close sidebar on mobile after selecting
    if (window.innerWidth < 1024) {
      setSidebarVisible(false)
    }
  }

  const handleNewConversation = () => {
    setActiveSessionId(null)
    // Auto-close sidebar on mobile after action
    if (window.innerWidth < 1024) {
      setSidebarVisible(false)
    }
  }

  const handleSessionChange = (sessionId: string | null) => {
    setActiveSessionId(sessionId)
  }

  return (
    <div className="h-full flex relative">
      <Suspense fallback={null}>
        <AutoCheckout />
      </Suspense>
      {/* Backdrop for mobile sidebar */}
      {sidebarVisible && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar - hidden on mobile by default, always visible on desktop */}
      <div
        className={`
          ${sidebarVisible ? 'flex' : 'hidden lg:flex'}
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          h-full transition-all duration-300 ease-in-out
        `}
      >
        <ChatHistorySidebar
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewConversation={handleNewConversation}
          onClose={() => setSidebarVisible(false)}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 h-full relative">
        {/* Toggle Button (Mobile only) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute top-4 left-4 z-10 lg:hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <MessageSquare className="w-4 h-4" style={{ color: '#6366F1' }} />
        </Button>

        <Suspense fallback={null}>
          <ChatWindow
            activeSessionId={activeSessionId}
            onSessionChange={handleSessionChange}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return <ChatPageInner />
}
