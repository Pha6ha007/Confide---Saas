'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Message } from '@/types'
import { AudioPlayer } from '@/components/voice/AudioPlayer'
import { Button } from '@/components/ui/button'
import { TooltipSimple } from '@/components/ui/tooltip-simple'

interface MessageBubbleProps {
  message: Message
  enableVoice?: boolean
}

export function MessageBubble({ message, enableVoice = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleSaveInsight = async () => {
    if (isSaved || isSaving || !message.id) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.content,
          sourceMessageId: message.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save insight')
      }

      const data = await response.json()

      if (data.alreadySaved) {
        setIsSaved(true)
        toast.info('Already saved to journal')
      } else {
        setIsSaved(true)
        toast.success('Saved to journal')
      }
    } catch (error) {
      console.error('Failed to save insight:', error)
      toast.error('Failed to save insight')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'flex w-full mb-2.5 animate-fade-in-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2.5 transition-smooth hover-lift relative overflow-hidden',
          isUser
            ? 'bg-gradient-to-br from-[#6366F1] to-[#818CF8] text-white shadow-card hover:shadow-large'
            : 'glass-button border border-white/20 text-foreground shadow-card hover:shadow-large backdrop-blur-md'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className="flex items-center justify-between mt-1 gap-3">
          <div className="flex items-center gap-2">
            {message.createdAt && (
              <p
                className={cn(
                  'text-xs',
                  isUser ? 'text-white/70' : 'text-[#6B7280]'
                )}
              >
                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {isAssistant && enableVoice && (
              <AudioPlayer text={message.content} />
            )}
          </div>
          {/* Save to Journal Button - только для assistant сообщений */}
          {isAssistant && (
            <TooltipSimple
              text={isSaved ? 'Saved to journal' : 'Save to journal'}
              position="top"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveInsight}
                disabled={isSaving}
                className={cn(
                  'h-7 w-7 p-0 transition-all hover:scale-110',
                  isSaved
                    ? 'text-[#F59E0B] hover:text-[#F59E0B] opacity-100'
                    : 'text-muted-foreground hover:text-foreground',
                  // Всегда видимая (opacity 0.4), на hover opacity 1
                  !isSaved && (isHovered ? 'opacity-100' : 'opacity-40')
                )}
              >
                <Bookmark
                  className={cn('w-4 h-4', isSaved && 'fill-current')}
                />
              </Button>
            </TooltipSimple>
          )}
        </div>
      </div>
    </motion.div>
  )
}
