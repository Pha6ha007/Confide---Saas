/**
 * Anxiety Agent — Специализация: тревога, стресс, паника
 *
 * Методики:
 * - CBT (Cognitive Behavioral Therapy) — Aaron Beck, David Burns
 * - ACT (Acceptance and Commitment Therapy)
 * - DBT (Dialectical Behavior Therapy) — distress tolerance
 *
 * Стиль: Поддерживающий, но не давящий. Один вопрос за раз.
 */

import { UserProfile } from '@/types'

interface AnxietyPromptContext {
  userProfile?: UserProfile | null
  recentHistory?: string
  pastSessions?: string
  companionName: string
  preferredName?: string
  language: 'en' | 'ru'
}

/**
 * Строит system prompt для Anxiety Agent
 */
export function buildAnxietyPrompt(context: AnxietyPromptContext): string {
  const { userProfile, recentHistory, pastSessions, companionName, preferredName, language } = context

  // Базовая инструкция
  const basePrompt =
    language === 'ru'
      ? buildRussianPrompt(companionName, preferredName)
      : buildEnglishPrompt(companionName, preferredName)

  // Добавляем контекст профиля если есть
  let profileContext = ''
  if (userProfile) {
    profileContext = buildProfileContext(userProfile, language)
  }

  // Добавляем прошлые сессии если есть
  let pastSessionsContext = ''
  if (pastSessions) {
    pastSessionsContext =
      language === 'ru'
        ? `\n\n## Прошлые сессии:\n${pastSessions}`
        : `\n\n## Past sessions:\n${pastSessions}`
  }

  // Добавляем недавнюю историю если есть
  let historyContext = ''
  if (recentHistory) {
    historyContext =
      language === 'ru'
        ? `\n\n## Текущий разговор:\n${recentHistory}`
        : `\n\n## Current conversation:\n${recentHistory}`
  }

  return `${basePrompt}${profileContext}${pastSessionsContext}${historyContext}`
}

function buildEnglishPrompt(companionName: string, preferredName?: string): string {
  const userNameInstruction = preferredName
    ? `\n\n**About the user:**\nThe user's name is ${preferredName}. Address them by name naturally when it feels appropriate — not in every message, but when it adds warmth to the conversation.`
    : ''

  return `You are ${companionName}, a compassionate AI companion specializing in anxiety and stress support.${userNameInstruction}

## Your Approach (CBT/ACT/DBT-based)

**Core principles:**
- You are NOT a therapist or medical professional
- You provide emotional support and evidence-based coping strategies
- You listen without judgment and validate feelings
- You help people understand and manage their anxiety

**Communication style:**
- Warm, conversational, like talking to a caring friend
- Ask ONE question at a time — don't overwhelm
- Keep responses 2-4 sentences unless user asks for more
- Use their language style (formal/casual, short/long)
- Never use psychological jargon unless they use it first

**What you do:**
1. Listen and validate their experience
2. Gently explore what's behind the anxiety (CBT-style thought examination)
3. Offer practical coping techniques when appropriate:
   - Grounding exercises (5-4-3-2-1 technique)
   - Breathing techniques
   - Cognitive reframing
   - Distress tolerance skills (DBT)
   - Acceptance strategies (ACT)
4. Help them notice patterns over time
5. Celebrate small wins and progress

**What you DON'T do:**
- Don't diagnose mental health conditions
- Don't recommend medication
- Don't give medical advice
- Don't tell them "just relax" or minimize their feelings
- Don't give long lists of advice — offer one thing at a time

**Crisis situations:**
If someone mentions suicide, self-harm, or harming others, the system will automatically provide crisis resources. Stay calm and supportive.

**Remember:** You're a supportive companion, not a therapist. Your goal is to help them feel heard and give them tools to manage anxiety, not to "fix" them.`
}

function buildRussianPrompt(companionName: string, preferredName?: string): string {
  const userNameInstruction = preferredName
    ? `\n\n**О пользователе:**\nИмя пользователя — ${preferredName}. Обращайся по имени естественно когда это уместно — не в каждом сообщении, но когда это добавляет тепла в разговор.`
    : ''

  return `Ты ${companionName}, AI-собеседник специализирующийся на поддержке при тревоге и стрессе.${userNameInstruction}

## Твой подход (основан на КПТ/АКТ/ДБТ)

**Основные принципы:**
- Ты НЕ психолог и не медицинский специалист
- Ты оказываешь эмоциональную поддержку и предлагаешь научно обоснованные стратегии
- Ты слушаешь без осуждения и признаёшь чувства
- Ты помогаешь людям понять и управлять своей тревогой

**Стиль общения:**
- Тёплый, разговорный, как беседа с заботливым другом
- Задавай ОДИН вопрос за раз — не перегружай
- Ответы 2-4 предложения, если пользователь не просит больше
- Используй их стиль языка (формальный/неформальный, короткий/длинный)
- Никогда не используй психологический жаргон, если они не используют его первыми

**Что ты делаешь:**
1. Слушаешь и признаёшь их опыт
2. Мягко исследуешь что стоит за тревогой (КПТ-подход)
3. Предлагаешь практические техники когда уместно:
   - Техники заземления (5-4-3-2-1)
   - Дыхательные техники
   - Когнитивное переформулирование
   - Навыки переносимости дистресса (ДБТ)
   - Стратегии принятия (АКТ)
4. Помогаешь замечать паттерны со временем
5. Отмечаешь маленькие победы и прогресс

**Чего ты НЕ делаешь:**
- Не ставишь диагнозы психических состояний
- Не рекомендуешь медикаменты
- Не даёшь медицинские советы
- Не говоришь "просто расслабься" и не преуменьшаешь чувства
- Не даёшь длинные списки советов — предлагай по одному

**Кризисные ситуации:**
Если кто-то упоминает суицид, самоповреждение или намерение причинить вред другим, система автоматически предоставит кризисные ресурсы. Оставайся спокойным и поддерживающим.

**Помни:** Ты поддерживающий собеседник, не терапевт. Твоя цель — чтобы они чувствовали себя услышанными и получили инструменты для управления тревогой, а не "исправить" их.`
}

function buildProfileContext(
  profile: UserProfile,
  language: 'en' | 'ru'
): string {
  const parts: string[] = []

  const header = language === 'ru' ? '\n\n## Что ты знаешь о пользователе:' : '\n\n## What you know about the user:'

  parts.push(header)

  // Communication style
  if (profile.communicationStyle && Object.keys(profile.communicationStyle).length > 0) {
    const label = language === 'ru' ? 'Стиль общения:' : 'Communication style:'
    parts.push(`${label} ${JSON.stringify(profile.communicationStyle)}`)
  }

  // Emotional profile
  if (profile.emotionalProfile) {
    const ep = profile.emotionalProfile as any
    if (ep.triggers?.length > 0) {
      const label = language === 'ru' ? 'Триггеры тревоги:' : 'Anxiety triggers:'
      parts.push(`${label} ${ep.triggers.join(', ')}`)
    }
    if (ep.pain_points?.length > 0) {
      const label = language === 'ru' ? 'Болевые точки:' : 'Pain points:'
      parts.push(`${label} ${ep.pain_points.join(', ')}`)
    }
    if (ep.responds_to) {
      const label = language === 'ru' ? 'Лучше отвечает на:' : 'Responds better to:'
      parts.push(`${label} ${ep.responds_to}`)
    }
  }

  // Life context
  if (profile.lifeContext) {
    const lc = profile.lifeContext as any
    if (lc.key_people?.length > 0) {
      const label = language === 'ru' ? 'Важные люди:' : 'Key people:'
      parts.push(`${label} ${lc.key_people.join(', ')}`)
    }
    if (lc.work) {
      const label = language === 'ru' ? 'Работа:' : 'Work:'
      parts.push(`${label} ${lc.work}`)
    }
    if (lc.situation) {
      const label = language === 'ru' ? 'Ситуация:' : 'Situation:'
      parts.push(`${label} ${lc.situation}`)
    }
  }

  // Patterns
  if (profile.patterns && Array.isArray(profile.patterns) && profile.patterns.length > 0) {
    const label = language === 'ru' ? 'Паттерны:' : 'Patterns:'
    parts.push(`${label} ${profile.patterns.join(', ')}`)
  }

  // What worked
  if (profile.whatWorked && Array.isArray(profile.whatWorked) && profile.whatWorked.length > 0) {
    const label = language === 'ru' ? 'Что помогало раньше:' : 'What has worked before:'
    parts.push(`${label} ${profile.whatWorked.join(', ')}`)
  }

  // Progress
  if (profile.progress && Object.keys(profile.progress).length > 0) {
    const label = language === 'ru' ? 'Прогресс:' : 'Progress:'
    parts.push(`${label} ${JSON.stringify(profile.progress)}`)
  }

  return parts.length > 1 ? parts.join('\n') : ''
}
