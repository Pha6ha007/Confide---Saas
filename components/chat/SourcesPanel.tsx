'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Source {
  title: string
  author?: string
  excerpt: string
}

interface SourcesPanelProps {
  sources: Source[]
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-sm font-medium">
          {sources.length} source{sources.length > 1 ? 's' : ''} from knowledge base
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {source.title}
                    </h4>
                  </div>
                  {source.author && (
                    <p className="text-xs text-gray-500 mb-2">
                      by {source.author}
                    </p>
                  )}
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {source.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
