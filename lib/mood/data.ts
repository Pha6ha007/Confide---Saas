// Confide — Mood Tracking Data & Types
// Based on CLAUDE.md specification

export const MOOD_EMOJIS = [
  { score: 1, emoji: '😞', label: 'Awful', color: '#EF4444' },
  { score: 2, emoji: '😔', label: 'Bad', color: '#F97316' },
  { score: 3, emoji: '😕', label: 'Meh', color: '#EAB308' },
  { score: 4, emoji: '🙂', label: 'Okay', color: '#84CC16' },
  { score: 5, emoji: '😊', label: 'Good', color: '#22C55E' },
  { score: 6, emoji: '😄', label: 'Great', color: '#10B981' },
  { score: 7, emoji: '🤩', label: 'Amazing', color: '#06B6D4' },
] as const

export const REASON_TAGS = [
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'relationship', label: 'Relationship', emoji: '💕' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'sleep', label: 'Sleep', emoji: '😴' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'money', label: 'Money', emoji: '💰' },
  { id: 'loneliness', label: 'Loneliness', emoji: '🌧' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'achievement', label: 'Achievement', emoji: '🏆' },
  { id: 'weather', label: 'Weather', emoji: '☀️' },
  { id: 'social', label: 'Social', emoji: '🎉' },
] as const

export type MoodType = 'before' | 'after'
export type MoodScore = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface MoodCheckInResult {
  score: MoodScore
  reasons: string[]
  note: string | null
}

export interface MoodEntryData {
  id: string
  userId: string
  sessionId: string | null
  type: MoodType
  score: number
  reasons: string[]
  note: string | null
  createdAt: Date
}

export interface MoodStats {
  avgBefore: number | null
  avgAfter: number | null
  improvement: number | null
  streak: number
  bestStreak: number
  totalEntries: number
}

export interface MoodInsight {
  emoji: string
  text: string
  type: 'positive' | 'neutral' | 'tip'
}

// Helper: Get emoji data by score
export function getMoodEmoji(score: number) {
  return MOOD_EMOJIS.find((m) => m.score === score) || MOOD_EMOJIS[3] // Default to "Okay"
}

// Helper: Get reason tag by id
export function getReasonTag(id: string) {
  return REASON_TAGS.find((r) => r.id === id)
}

// Helper: Calculate mood improvement
export function calculateImprovement(before: number | null, after: number | null): number | null {
  if (before === null || after === null) return null
  return Number(((after - before) / 7 * 100).toFixed(1))
}
