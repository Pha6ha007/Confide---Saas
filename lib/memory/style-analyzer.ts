/**
 * Style Analyzer — автоматический анализ стиля общения пользователя
 * Memory Agent Upgrade (март 2026)
 *
 * Анализирует сообщения пользователя и извлекает метрики:
 * - Средняя длина сообщений (слова/символы)
 * - Использование emoji, сленга, КАПСА
 * - Стиль пунктуации
 * - Эмоциональная открытость
 * - Предпочитаемый тип ответов
 */

export interface StyleMetrics {
  avgMessageLength: number // средняя длина сообщения пользователя в словах
  avgMessageChars: number // средняя длина в символах
  usesEmoji: boolean // использует ли emoji
  usesSlang: boolean // использует ли сленг/сокращения
  usesCaps: boolean // пишет ли КАПСОМ
  punctuationStyle: 'formal' | 'casual' | 'minimal' // стиль пунктуации
  emotionalOpenness: 'high' | 'medium' | 'low' // насколько открыт эмоционально
  responsePreference: 'questions' | 'reflections' | 'advice' | 'mixed' // что предпочитает получать
  sessionCount: number
  totalMessages: number
  lastActive: string
}

interface MessageForAnalysis {
  role: string
  content: string
  createdAt: Date
}

/**
 * Анализирует стиль общения пользователя на основе его сообщений
 */
export function analyzeUserStyle(
  messages: MessageForAnalysis[]
): StyleMetrics {
  const userMessages = messages.filter((m) => m.role === 'user')

  if (userMessages.length === 0) return defaultMetrics()

  // Средняя длина
  const avgWords =
    userMessages.reduce(
      (sum, m) => sum + m.content.split(/\s+/).length,
      0
    ) / userMessages.length
  const avgChars =
    userMessages.reduce((sum, m) => sum + m.content.length, 0) /
    userMessages.length

  // Emoji detection
  const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\u200d]+/gu
  const usesEmoji = userMessages.some((m) => emojiRegex.test(m.content))

  // Slang detection (basic)
  const slangWords = [
    'lol',
    'lmao',
    'bruh',
    'ngl',
    'tbh',
    'yea',
    'gonna',
    'wanna',
    'kinda',
    'dunno',
    'idk',
    'omg',
    'wtf',
  ]
  const usesSlang = userMessages.some((m) =>
    slangWords.some((s) => m.content.toLowerCase().includes(s))
  )

  // Caps detection
  const usesCaps = userMessages.some((m) => {
    const capsWords = m.content.match(/[A-Z]{3,}/g)
    return capsWords && capsWords.length > 0
  })

  // Punctuation analysis
  const avgPunctuation =
    userMessages.reduce((sum, m) => {
      return sum + (m.content.match(/[.!?,;:]/g) || []).length
    }, 0) / userMessages.length

  const punctuationStyle: 'formal' | 'casual' | 'minimal' =
    avgPunctuation > 2 ? 'formal' : avgPunctuation > 0.5 ? 'casual' : 'minimal'

  // Emotional openness (mentions feelings, uses emotional words)
  const emotionalWords = [
    'feel',
    'feeling',
    'felt',
    'scared',
    'angry',
    'sad',
    'happy',
    'anxious',
    'afraid',
    'hurt',
    'love',
    'hate',
    'cry',
    'crying',
    'depressed',
    'overwhelmed',
    'lonely',
    'stressed',
    'worried',
    'nervous',
    'frustrated',
    'upset',
  ]
  const emotionalMentions = userMessages.filter((m) =>
    emotionalWords.some((w) => m.content.toLowerCase().includes(w))
  ).length
  const emotionalRatio = emotionalMentions / userMessages.length
  const emotionalOpenness: 'high' | 'medium' | 'low' =
    emotionalRatio > 0.4 ? 'high' : emotionalRatio > 0.15 ? 'medium' : 'low'

  return {
    avgMessageLength: Math.round(avgWords),
    avgMessageChars: Math.round(avgChars),
    usesEmoji,
    usesSlang,
    usesCaps,
    punctuationStyle,
    emotionalOpenness,
    responsePreference: 'mixed', // будет обновляться Memory Agent
    sessionCount: 0, // обновляется отдельно
    totalMessages: userMessages.length,
    lastActive: new Date().toISOString(),
  }
}

/**
 * Мерджит новые метрики со старыми (усреднение числовых значений)
 */
export function mergeStyleMetrics(
  existing: Partial<StyleMetrics>,
  newMetrics: StyleMetrics
): StyleMetrics {
  // Если нет существующих метрик, возвращаем новые
  if (!existing || Object.keys(existing).length === 0) {
    return newMetrics
  }

  // Усредняем числовые значения
  const avgMessageLength = existing.avgMessageLength
    ? Math.round(
        (existing.avgMessageLength + newMetrics.avgMessageLength) / 2
      )
    : newMetrics.avgMessageLength

  const avgMessageChars = existing.avgMessageChars
    ? Math.round((existing.avgMessageChars + newMetrics.avgMessageChars) / 2)
    : newMetrics.avgMessageChars

  // Boolean — true если хоть раз использовал
  const usesEmoji = existing.usesEmoji || newMetrics.usesEmoji
  const usesSlang = existing.usesSlang || newMetrics.usesSlang
  const usesCaps = existing.usesCaps || newMetrics.usesCaps

  // Берём последний стиль пунктуации (может меняться со временем)
  const punctuationStyle =
    newMetrics.punctuationStyle || existing.punctuationStyle || 'casual'

  // Эмоциональная открытость — берём более высокий уровень
  const emotionalOpenness = getHigherEmotionalOpenness(
    existing.emotionalOpenness || 'low',
    newMetrics.emotionalOpenness
  )

  // Response preference обновляется через Memory Agent
  const responsePreference =
    existing.responsePreference || newMetrics.responsePreference

  // Инкрементим счётчики
  const sessionCount = (existing.sessionCount || 0) + 1
  const totalMessages =
    (existing.totalMessages || 0) + newMetrics.totalMessages

  return {
    avgMessageLength,
    avgMessageChars,
    usesEmoji,
    usesSlang,
    usesCaps,
    punctuationStyle,
    emotionalOpenness,
    responsePreference,
    sessionCount,
    totalMessages,
    lastActive: newMetrics.lastActive,
  }
}

/**
 * Возвращает более высокий уровень эмоциональной открытости
 */
function getHigherEmotionalOpenness(
  a: 'high' | 'medium' | 'low',
  b: 'high' | 'medium' | 'low'
): 'high' | 'medium' | 'low' {
  const levels = { low: 0, medium: 1, high: 2 }
  return levels[a] > levels[b] ? a : b
}

/**
 * Дефолтные метрики для нового пользователя
 */
function defaultMetrics(): StyleMetrics {
  return {
    avgMessageLength: 0,
    avgMessageChars: 0,
    usesEmoji: false,
    usesSlang: false,
    usesCaps: false,
    punctuationStyle: 'casual',
    emotionalOpenness: 'low',
    responsePreference: 'mixed',
    sessionCount: 0,
    totalMessages: 0,
    lastActive: new Date().toISOString(),
  }
}
