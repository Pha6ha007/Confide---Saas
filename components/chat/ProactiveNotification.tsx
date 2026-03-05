'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

interface ProactiveMessage {
  id: string
  type: string
  content: string
  metadata?: any
  read: boolean
  createdAt: string
}

interface ProactiveNotificationProps {
  message: ProactiveMessage
  companionName: string
  onRead: (messageId: string) => void
}

/**
 * ProactiveNotification — displays proactive messages from Alex as chat messages
 * Appears like a normal assistant message with subtle animation
 */
export function ProactiveNotification({
  message,
  companionName,
  onRead,
}: ProactiveNotificationProps) {
  // Mark as read when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      onRead(message.id)
    }, 1000) // Mark as read after 1 second

    return () => clearTimeout(timer)
  }, [message.id, onRead])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-start space-x-3 mb-2.5"
    >
      {/* Agent Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-card">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Message Bubble */}
      <div className="flex-1">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-sm font-medium text-foreground">{companionName}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {/* Proactive Badge */}
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Proactive
          </span>
        </div>

        {/* Message Content */}
        <div className="glass-button rounded-2xl rounded-tl-sm px-4 py-2.5 text-foreground max-w-lg shadow-card border border-white/20">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </motion.div>
  )
}
