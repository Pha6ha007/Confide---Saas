// User & Auth Types
export interface User {
  id: string
  email: string
  createdAt: Date
  plan: 'free' | 'pro' | 'premium'
  voiceId?: string
  companionName: string
  companionGender?: 'male' | 'female'
  language: 'en' | 'ru'
}

// User Profile (Long-term Memory)
export interface UserProfile {
  id: string
  userId: string
  communicationStyle: Record<string, any>
  emotionalProfile: {
    triggers?: string[]
    pain_points?: string[]
    responds_to?: string
  }
  lifeContext: {
    key_people?: string[]
    work?: string
    situation?: string
  }
  patterns: string[]
  progress: Record<string, any>
  whatWorked: string[]
  updatedAt: Date
}

// Session Types
export interface Session {
  id: string
  userId: string
  agentType: AgentType
  createdAt: Date
  endedAt?: Date
  summary?: string
  moodScore?: number
}

export type AgentType =
  | 'anxiety'
  | 'family'
  | 'trauma'
  | 'relationships'
  | 'mens'
  | 'womens'
  | 'general'

// Message Types
export interface Message {
  id: string
  sessionId?: string
  userId?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  audioUrl?: string
  createdAt: string
  isCrisis?: boolean
}

// Journal Types
export interface JournalEntry {
  id: string
  userId: string
  content: string
  insight?: string
  sourceMessageId?: string
  createdAt: Date
}

// Subscription Types
export interface Subscription {
  id: string
  userId: string
  paddleCustomerId?: string
  paddleSubscriptionId?: string
  plan: 'free' | 'pro' | 'premium'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  expiresAt?: Date
  createdAt: Date
}

// RAG / Knowledge Base Types
export interface KnowledgeSource {
  title: string
  author?: string
  namespace: string
  chunkIndex: number
  pineconeId: string
}

export interface RAGSource {
  title: string
  author?: string
  excerpt: string
  score?: number
}

// API Response Types
export interface ChatResponse {
  message: string
  messageId: string
  sessionId: string
  sources?: RAGSource[]
  isCrisis?: boolean
}

export interface ErrorResponse {
  error: string
  details?: string
}

// Rate Limiting
export interface RateLimit {
  plan: 'free' | 'pro' | 'premium'
  maxRequests: number
  windowMs: number
}

// Crisis Detection
export interface CrisisResource {
  country: string
  name: string
  phone: string
  description: string
}

export interface CrisisResponse {
  isCrisis: true
  message: string
  resources: CrisisResource[]
}
