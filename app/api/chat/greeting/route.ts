import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { safeErrorBody } from '@/lib/utils/safe-error'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTH CHECK
    // ============================================
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ============================================
    // 2. ПОЛУЧИТЬ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const companionName = dbUser.companionName || 'Alex'
    const preferredName = dbUser.preferredName || undefined
    const language = dbUser.language as 'en' | 'ru'

    // ============================================
    // 3. ОПРЕДЕЛИТЬ ТИП ПРИВЕТСТВИЯ (с time-awareness)
    // ============================================
    // Get time context for time-aware greetings
    const now = new Date()
    const hour = now.getHours()
    const isLateNight = hour >= 23 || hour <= 4
    const isMorning = hour >= 8 && hour <= 11

    const sessionsCount = await prisma.session.count({
      where: { userId: user.id },
    })

    let greeting: string

    // Новый пользователь (нет сессий)
    if (sessionsCount === 0) {
      greeting = getNewUserGreeting(companionName, preferredName, language, isLateNight, isMorning)
    }
    // Возвращающийся пользователь
    else {
      const lastSession = dbUser.sessions[0]
      const daysSinceLastSession = lastSession
        ? Math.floor((Date.now() - new Date(lastSession.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      // Проверить наличие follow_up в профиле
      // follow_up хранится в progress объекте
      const followUp = dbUser.profile?.progress
        ? (dbUser.profile.progress as any)?.follow_up
        : null

      // Более 3 дней назад
      if (daysSinceLastSession > 3) {
        greeting = getReturningUserGreeting(companionName, preferredName, daysSinceLastSession, language)
      }
      // Есть follow_up для напоминания
      else if (followUp) {
        greeting = getFollowUpGreeting(companionName, preferredName, followUp, language)
      }
      // Обычное приветствие (time-aware)
      else {
        greeting = getRegularGreeting(companionName, preferredName, language, isLateNight, isMorning)
      }
    }

    return NextResponse.json({
      message: greeting,
      companionName,
    })
  } catch (error) {
    console.error('Greeting API error:', error)

    return NextResponse.json(
      safeErrorBody('Internal server error', error),
      { status: 500 }
    )
  }
}

// =============================================================================
// GREETING GENERATORS
// =============================================================================

function getNewUserGreeting(
  companionName: string,
  preferredName: string | undefined,
  language: 'en' | 'ru',
  isLateNight: boolean,
  isMorning: boolean
): string {
  if (language === 'ru') {
    if (isLateNight) {
      return preferredName
        ? `Привет, ${preferredName}. Поздняя ночь?`
        : `Привет. Поздняя ночь?`
    } else if (isMorning) {
      return preferredName
        ? `Доброе утро, ${preferredName}. Как начинается день?`
        : `Доброе утро. Как начинается день?`
    }
    // First-ever greeting with AI disclosure (Russian)
    return preferredName
      ? `Привет, ${preferredName}! Я ${companionName}. Я AI-собеседник — не терапевт, не человек — но я здесь чтобы слушать, помнить, и помогать тебе разобраться в мыслях. Что у тебя на уме?`
      : `Привет! Я ${companionName}. Я AI-собеседник — не терапевт, не человек — но я здесь чтобы слушать, помнить, и помогать тебе разобраться в мыслях. Что у тебя на уме?`
  }

  if (isLateNight) {
    return preferredName
      ? `Hey ${preferredName}. Late one tonight?`
      : `Hey. Late one tonight?`
  } else if (isMorning) {
    return preferredName
      ? `Morning, ${preferredName}. How are you starting the day?`
      : `Morning. How are you starting the day?`
  }

  // First-ever greeting with AI disclosure
  return preferredName
    ? `Hey ${preferredName}! I'm ${companionName}. I'm an AI companion — not a therapist, not a human — but I'm here to listen, remember, and help you think things through. What's on your mind?`
    : `Hey! I'm ${companionName}. I'm an AI companion — not a therapist, not a human — but I'm here to listen, remember, and help you think things through. What's on your mind?`
}

function getReturningUserGreeting(
  companionName: string,
  preferredName: string | undefined,
  daysSince: number,
  language: 'en' | 'ru'
): string {
  if (language === 'ru') {
    const timePhrase =
      daysSince === 1
        ? 'вчера'
        : daysSince < 7
        ? 'несколько дней'
        : daysSince < 14
        ? 'неделю'
        : 'какое-то время'

    return preferredName
      ? `С возвращением, ${preferredName}! Прошло ${timePhrase}. Как дела?`
      : `С возвращением! Прошло ${timePhrase}. Как дела?`
  }

  const timePhrase =
    daysSince === 1
      ? 'yesterday'
      : daysSince < 7
      ? 'a few days'
      : daysSince < 14
      ? 'a week'
      : 'a while'

  return preferredName
    ? `Hey ${preferredName}! It's been ${timePhrase}. How are you?`
    : `Hey! It's been ${timePhrase}. How are you?`
}

function getFollowUpGreeting(
  companionName: string,
  preferredName: string | undefined,
  followUp: string,
  language: 'en' | 'ru'
): string {
  if (language === 'ru') {
    return preferredName
      ? `Привет, ${preferredName}! Как всё прошло с "${followUp}"?`
      : `Привет! Как всё прошло с "${followUp}"?`
  }

  return preferredName
    ? `Hey ${preferredName}! How did "${followUp}" go?`
    : `Hey! How did "${followUp}" go?`
}

function getRegularGreeting(
  companionName: string,
  preferredName: string | undefined,
  language: 'en' | 'ru',
  isLateNight: boolean,
  isMorning: boolean
): string {
  if (language === 'ru') {
    if (isLateNight) {
      return preferredName
        ? `Привет, ${preferredName}. Поздняя ночь. Что происходит?`
        : `Привет. Поздняя ночь. Что происходит?`
    } else if (isMorning) {
      return preferredName
        ? `Доброе утро, ${preferredName}! Как настроение?`
        : `Доброе утро! Как настроение?`
    }
    return preferredName ? `Привет, ${preferredName}! Что нового?` : `Привет! Что нового?`
  }

  if (isLateNight) {
    return preferredName
      ? `Hey ${preferredName}. Late night. What's going on?`
      : `Hey. Late night. What's going on?`
  } else if (isMorning) {
    return preferredName
      ? `Morning, ${preferredName}! How's the mood?`
      : `Morning! How's the mood?`
  }

  return preferredName ? `Hey ${preferredName}! What's up?` : `Hey! What's up?`
}
