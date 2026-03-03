'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        {message.createdAt && (
          <p
            className={cn(
              'text-xs mt-2',
              isUser ? 'text-indigo-100' : 'text-gray-400'
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </motion.div>
  )
}
