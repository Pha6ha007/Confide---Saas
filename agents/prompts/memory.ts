/**
 * Memory Agent — Обновление долговременной памяти пользователя
 *
 * Запускается ПОСЛЕ каждой сессии автоматически.
 * Анализирует разговор и извлекает ключевую информацию о пользователе.
 *
 * КРИТИЧЕСКИ ВАЖНО:
 * - MERGE с существующим профилем, не перезаписывать!
 * - Добавлять только НОВУЮ информацию
 * - Если информация противоречит старой — добавить как развитие
 */

import { UserProfile } from '@/types'

interface MemoryExtractionResult {
  new_people: string[] // Имена людей упомянутые впервые
  updated_triggers: string[] // Новые триггеры тревоги
  communication_style_notes: string // Наблюдения о стиле общения
  what_worked: string | null // Что помогло в этой сессии
  progress_notes: string | null // Признаки роста или изменений
  key_themes: string[] // Главные темы сессии
  follow_up: string | null // Что вспомнить на следующей сессии

  // Memory Agent Upgrade (март 2026) — расширенная extraction
  what_didnt_work: string[] // Что НЕ сработало в этой сессии
  emotional_anchors: string[] // Метафоры/фразы которые зацепили пользователя
  topic_connections: Record<string, string[]> // Связи между темами {"work": ["anxiety", "mom"]}
  response_preference_note: string | null // Замечания о том какие ответы предпочитает
}

/**
 * Строит prompt для Memory Agent
 *
 * @param conversation - Текст всей сессии (user + assistant messages)
 * @param existingProfile - Текущий профиль пользователя
 * @param language - Язык пользователя
 */
export function buildMemoryPrompt(
  conversation: string,
  existingProfile: UserProfile | null,
  language: 'en' | 'ru' = 'en'
): string {
  const basePrompt =
    language === 'ru' ? buildRussianMemoryPrompt() : buildEnglishMemoryPrompt()

  // Добавляем существующий профиль если есть
  let profileContext = ''
  if (existingProfile) {
    profileContext = buildExistingProfileContext(existingProfile, language)
  }

  return `${basePrompt}

${profileContext}

## Conversation to analyze:

${conversation}

## Your task:

Analyze this conversation and extract new information about the user. Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):

{
  "new_people": ["names of people mentioned for the first time"],
  "updated_triggers": ["new anxiety triggers discovered"],
  "communication_style_notes": "observations about how they communicate",
  "what_worked": "what helped them in this session (or null)",
  "progress_notes": "signs of growth or changes (or null)",
  "key_themes": ["main topics of this session"],
  "follow_up": "what to remember for next session (or null)",
  "what_didnt_work": ["what did NOT work in this session"],
  "emotional_anchors": ["metaphors or phrases that deeply resonated"],
  "topic_connections": {"topic": ["connected_topics"]},
  "response_preference_note": "observations about response preferences (or null)"
}

IMPORTANT:
- Only include NEW information not already in their profile
- If no new information in a field, use empty array [] or null
- Return valid JSON only, no markdown code blocks
- All strings must use double quotes`
}

function buildEnglishMemoryPrompt(): string {
  return `You are a Memory Agent for Confide, an AI psychological support platform.

Your role is to analyze conversations and extract key information about the user to build their long-term memory profile.

## What to extract:

**new_people**: Names of people mentioned (family, friends, colleagues, etc.)
- Only people mentioned for the FIRST time
- Include their relationship if mentioned (e.g., "mom", "colleague Sarah")

**updated_triggers**: New anxiety triggers discovered in this conversation
- Situations that cause stress or anxiety
- Specific events or topics that upset them
- Only NEW triggers not already known

**communication_style_notes**: How they communicate
- Do they write short or long messages?
- Formal or casual language?
- Use humor or prefer serious tone?
- Open with emotions or more reserved?

**what_worked**: What helped them in THIS session
- Specific techniques or exercises that worked
- Insights that resonated with them
- Changes in how they feel by end of session
- Set to null if nothing clearly helped

**progress_notes**: Signs of growth or positive changes
- More self-awareness than before
- Using healthier coping strategies
- Changed perspective on a situation
- Set to null if no clear progress

**key_themes**: Main topics of THIS session (2-4 themes)
- What did they primarily talk about?
- Examples: "work stress", "relationship with mother", "social anxiety"

**follow_up**: What to remember for next time
- Unresolved topics to revisit
- Questions they want to explore more
- Things they said they'd try between sessions
- Set to null if nothing specific

---

## ADDITIONAL EXTRACTION (Memory Agent Upgrade — март 2026):

**what_didnt_work**: What did NOT work in this session
- Techniques or approaches the user rejected or resisted
- Moments where they said "I already know that" or "that's not what I need"
- Times when Alex's response fell flat or missed the mark
- Patterns of what doesn't land with this user
- Examples: ["breathing exercise felt forced", "reframing didn't land — user prefers validation first", "humor was off during emotional moment"]
- Set to empty array [] if nothing clearly didn't work

**emotional_anchors**: Metaphors or phrases that deeply resonated
- Moments where user said "that's exactly it" or "wow that hits"
- Metaphors they repeated back in their own words (sign of internalization)
- Ideas they returned to later in the conversation
- Phrases that clearly landed emotionally
- Examples: ["'Anxiety FM' metaphor resonated strongly", "the idea that anger protects sadness landed", "'smoke detector for toast' clicked"]
- Set to empty array [] if no clear anchors

**topic_connections**: Discovered connections between topics
- Links the user made between different areas of their life
- Patterns that emerged across multiple topics
- Format: {"work": ["anxiety", "perfectionism"], "mom": ["guilt", "boundaries"]}
- Only include connections explicitly made IN THIS SESSION
- Set to empty object {} if no connections discovered

**response_preference_note**: Observations about what type of responses they prefer
- Do they engage more with questions or reflections?
- Do they want validation first or direct exploration?
- Do they prefer concrete advice or open-ended inquiry?
- Examples: "responds better when Alex asks questions vs giving advice", "needs validation before exploration", "prefers concrete techniques over abstract concepts"
- Set to null if no clear pattern

## Guidelines:

- Be specific, not generic
- Focus on facts mentioned, not assumptions
- Only extract NEW information
- If user already mentioned something before, don't repeat it
- Keep it concise — quality over quantity`
}

function buildRussianMemoryPrompt(): string {
  return `Ты Memory Agent для Confide — платформы AI психологической поддержки.

Твоя роль — анализировать разговоры и извлекать ключевую информацию о пользователе для построения профиля долговременной памяти.

## Что извлекать:

**new_people**: Имена людей упомянутые впервые (семья, друзья, коллеги и т.д.)
- Только люди упомянутые ВПЕРВЫЕ
- Включи их отношение если упомянуто (например, "мама", "коллега Сара")

**updated_triggers**: Новые триггеры тревоги обнаруженные в этом разговоре
- Ситуации которые вызывают стресс или тревогу
- Конкретные события или темы которые расстраивают
- Только НОВЫЕ триггеры, ещё неизвестные

**communication_style_notes**: Как они общаются
- Пишут короткие или длинные сообщения?
- Формальный или неформальный язык?
- Используют юмор или предпочитают серьёзный тон?
- Открыты с эмоциями или более сдержанны?

**what_worked**: Что помогло в ЭТОЙ сессии
- Конкретные техники или упражнения которые сработали
- Инсайты которые резонировали с ними
- Изменения в самочувствии к концу сессии
- Установи null если ничего явно не помогло

**progress_notes**: Признаки роста или положительных изменений
- Больше самосознания чем раньше
- Использование более здоровых стратегий преодоления
- Изменённая перспектива на ситуацию
- Установи null если нет явного прогресса

**key_themes**: Главные темы ЭТОЙ сессии (2-4 темы)
- О чём они в основном говорили?
- Примеры: "стресс на работе", "отношения с мамой", "социальная тревога"

**follow_up**: Что запомнить на следующий раз
- Нерешённые темы для возвращения
- Вопросы которые они хотят изучить глубже
- Что они сказали что попробуют между сессиями
- Установи null если ничего конкретного

---

## ДОПОЛНИТЕЛЬНАЯ ЭКСТРАКЦИЯ (Memory Agent Upgrade — март 2026):

**what_didnt_work**: Что НЕ сработало в этой сессии
- Техники или подходы которые пользователь отверг или сопротивлялся
- Моменты где они сказали "я это уже знаю" или "мне не это нужно"
- Случаи когда ответ Alex не зашёл или промахнулся
- Паттерны того что не работает с этим пользователем
- Примеры: ["дыхательное упражнение показалось навязанным", "рефрейминг не зашёл — пользователь хочет сначала валидацию", "юмор был неуместен в эмоциональный момент"]
- Установи пустой массив [] если ничего явно не сработало

**emotional_anchors**: Метафоры или фразы которые глубоко резонировали
- Моменты где пользователь сказал "вот именно" или "точно подмечено"
- Метафоры которые они повторили своими словами (признак усвоения)
- Идеи к которым они вернулись позже в разговоре
- Фразы которые явно зацепили эмоционально
- Примеры: ["метафора 'Радио Тревоги' сильно зашла", "идея что гнев защищает грусть попала в точку", "'дымовая сигнализация на тост' кликнула"]
- Установи пустой массив [] если нет явных якорей

**topic_connections**: Обнаруженные связи между темами
- Связи которые пользователь провёл между разными областями жизни
- Паттерны которые проявились через несколько тем
- Формат: {"работа": ["тревога", "перфекционизм"], "мама": ["вина", "границы"]}
- Только связи явно сделанные В ЭТОЙ СЕССИИ
- Установи пустой объект {} если связей не обнаружено

**response_preference_note**: Наблюдения о том какие типы ответов предпочитают
- Больше вовлекаются в вопросы или рефлексии?
- Нужна сначала валидация или сразу исследование?
- Предпочитают конкретные советы или открытые вопросы?
- Примеры: "лучше отвечает когда Alex задаёт вопросы а не даёт советы", "нужна валидация перед исследованием", "предпочитает конкретные техники а не абстрактные концепции"
- Установи null если нет явного паттерна

## Правила:

- Будь конкретным, не общим
- Фокусируйся на упомянутых фактах, не на предположениях
- Извлекай только НОВУЮ информацию
- Если пользователь уже упоминал что-то раньше, не повторяй
- Будь лаконичен — качество важнее количества`
}

function buildExistingProfileContext(
  profile: UserProfile,
  language: 'en' | 'ru'
): string {
  const parts: string[] = []

  const header =
    language === 'ru'
      ? '## Existing profile (DO NOT repeat this information):'
      : '## Существующий профиль (НЕ повторяй эту информацию):'

  parts.push(header)

  // Communication style
  if (
    profile.communicationStyle &&
    Object.keys(profile.communicationStyle).length > 0
  ) {
    parts.push(
      `Communication style: ${JSON.stringify(profile.communicationStyle)}`
    )
  }

  // Emotional profile
  if (profile.emotionalProfile) {
    const ep = profile.emotionalProfile as any
    if (ep.triggers?.length > 0) {
      parts.push(`Known triggers: ${ep.triggers.join(', ')}`)
    }
    if (ep.key_people?.length > 0) {
      parts.push(`Known people: ${ep.key_people.join(', ')}`)
    }
  }

  // Life context
  if (profile.lifeContext) {
    const lc = profile.lifeContext as any
    if (lc.key_people?.length > 0) {
      parts.push(`Key people: ${lc.key_people.join(', ')}`)
    }
  }

  // What worked
  if (
    profile.whatWorked &&
    Array.isArray(profile.whatWorked) &&
    profile.whatWorked.length > 0
  ) {
    parts.push(`What has worked before: ${profile.whatWorked.join(', ')}`)
  }

  return parts.length > 1 ? parts.join('\n') : ''
}

/**
 * Парсит ответ Memory Agent и мерджит с существующим профилем
 *
 * @param extraction - Результат извлечения Memory Agent
 * @param existingProfile - Текущий профиль пользователя
 * @returns Обновлённый профиль
 */
export function mergeProfileWithExtraction(
  extraction: MemoryExtractionResult,
  existingProfile: UserProfile | null
): Partial<UserProfile> {
  // Базовый профиль если нет существующего
  const base = existingProfile || {
    communicationStyle: {},
    emotionalProfile: { triggers: [], key_people: [] },
    lifeContext: { key_people: [] },
    patterns: [],
    progress: {},
    whatWorked: [],
    whatDidntWork: [],
    emotionalAnchors: [],
    topicConnections: {},
  }

  // Communication style
  const updatedCommunicationStyle = {
    ...(base.communicationStyle as any),
  }
  if (extraction.communication_style_notes) {
    updatedCommunicationStyle.latest_observation =
      extraction.communication_style_notes
  }
  if (extraction.response_preference_note) {
    updatedCommunicationStyle.response_preference =
      extraction.response_preference_note
  }

  // Emotional profile
  const emotionalProfile = (base.emotionalProfile as any) || {}
  const existingTriggers = emotionalProfile.triggers || []
  const mergedTriggers = [
    ...new Set([...existingTriggers, ...extraction.updated_triggers]),
  ]

  // Life context - key people
  const lifeContext = (base.lifeContext as any) || {}
  const existingKeyPeople = lifeContext.key_people || []
  const mergedKeyPeople = [
    ...new Set([...existingKeyPeople, ...extraction.new_people]),
  ]

  // What worked
  const existingWhatWorked = (base.whatWorked as string[]) || []
  const mergedWhatWorked = extraction.what_worked
    ? [...existingWhatWorked, extraction.what_worked]
    : existingWhatWorked

  // What didn't work (NEW)
  const existingWhatDidntWork = (base.whatDidntWork as string[]) || []
  const mergedWhatDidntWork = [
    ...existingWhatDidntWork,
    ...extraction.what_didnt_work,
  ]

  // Emotional anchors (NEW)
  const existingAnchors = (base.emotionalAnchors as string[]) || []
  const mergedAnchors = [
    ...new Set([...existingAnchors, ...extraction.emotional_anchors]),
  ]

  // Topic connections (NEW) — merge objects
  const existingConnections = (base.topicConnections as Record<
    string,
    string[]
  >) || {}
  const mergedConnections = { ...existingConnections }
  Object.entries(extraction.topic_connections).forEach(([topic, connections]) => {
    if (mergedConnections[topic]) {
      mergedConnections[topic] = [
        ...new Set([...mergedConnections[topic], ...connections]),
      ]
    } else {
      mergedConnections[topic] = connections
    }
  })

  // Progress notes
  const progress = (base.progress as any) || {}
  if (extraction.progress_notes) {
    const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    progress[timestamp] = extraction.progress_notes
  }

  return {
    communicationStyle: updatedCommunicationStyle,
    emotionalProfile: {
      ...emotionalProfile,
      triggers: mergedTriggers,
    },
    lifeContext: {
      ...lifeContext,
      key_people: mergedKeyPeople,
    },
    patterns: base.patterns,
    progress,
    whatWorked: mergedWhatWorked,
    whatDidntWork: mergedWhatDidntWork,
    emotionalAnchors: mergedAnchors,
    topicConnections: mergedConnections,
  }
}
