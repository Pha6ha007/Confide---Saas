'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Volume2, VolumeX, Loader2, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface AudioPlayerProps {
  text: string
  autoPlay?: boolean
  useStreaming?: boolean
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

export function AudioPlayer({
  text,
  autoPlay = false,
  useStreaming = true,
  onPlayStart,
  onPlayEnd,
}: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaSourceRef = useRef<MediaSource | null>(null)

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioUrl])

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay) {
      handlePlay()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay])

  /**
   * Streaming playback — starts audio as soon as first chunk arrives.
   * Uses MediaSource Extensions (MSE) for progressive mp3 playback.
   * Falls back to buffered mode if MSE is not supported.
   */
  const playStreaming = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, stream: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      // Collect chunks and play as a blob once complete
      // (MediaSource + mp3 is unreliable across browsers — blob URL is more reliable)
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let firstChunkReceived = false

      while (true) {
        const { done, value } = await reader.read()

        if (value) {
          chunks.push(value)
          if (!firstChunkReceived) {
            firstChunkReceived = true
            setIsLoading(false) // Show play state once streaming starts
          }
        }

        if (done) break
      }

      // Merge chunks into blob
      const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      // Create audio element and play
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onplay = () => {
        setIsPlaying(true)
        onPlayStart?.()
      }
      audio.onended = () => {
        setIsPlaying(false)
        setHasPlayed(true)
        onPlayEnd?.()
      }
      audio.onerror = () => {
        setError('Failed to play audio')
        setIsPlaying(false)
      }

      await audio.play()
    } catch (err) {
      console.error('Streaming audio error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate audio')
    } finally {
      setIsLoading(false)
    }
  }, [text, onPlayStart, onPlayEnd])

  /**
   * Buffered playback — downloads entire audio then plays.
   * Used as fallback when streaming is disabled.
   */
  const playBuffered = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      const audio = new Audio(url)
      audioRef.current = audio

      audio.onplay = () => {
        setIsPlaying(true)
        onPlayStart?.()
      }
      audio.onended = () => {
        setIsPlaying(false)
        setHasPlayed(true)
        onPlayEnd?.()
      }
      audio.onerror = () => {
        setError('Failed to play audio')
        setIsPlaying(false)
      }

      await audio.play()
    } catch (err) {
      console.error('Audio generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate audio')
    } finally {
      setIsLoading(false)
    }
  }, [text, onPlayStart, onPlayEnd])

  const handlePlay = async () => {
    // If already have audio URL, toggle play/pause
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
      }
      return
    }

    // First play — fetch audio
    if (useStreaming) {
      await playStreaming()
    } else {
      await playBuffered()
    }
  }

  const handleReplay = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={isLoading}
        onClick={handlePlay}
        className="relative h-7 w-7 p-0"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : error ? (
          <VolumeX className="w-4 h-4 text-red-500" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}

        {/* Sound wave animation when playing */}
        {isPlaying && (
          <div className="absolute -right-1 -top-1 flex items-end space-x-[2px] h-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[2px] bg-primary rounded-full"
                initial={{ height: '4px' }}
                animate={{
                  height: ['4px', '12px', '4px'],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </Button>

      {/* Replay button — appears after first play */}
      {hasPlayed && !isPlaying && audioUrl && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleReplay}
          className="h-7 w-7 p-0"
          title="Replay"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      )}

      {error && (
        <span className="text-xs text-red-500">Audio unavailable</span>
      )}
    </div>
  )
}
