import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'



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
    // 3. ОПРЕДЕЛИТЬ ТИП ПРИВЕТСТВИЯ
    // ============================================
    const sessionsCount = await prisma.session.count({
      where: { userId: user.id },
    })

    let greeting: string

    // Новый пользователь (нет сессий)
    if (sessionsCount === 0) {
      greeting = getNewUserGreeting(companionName, preferredName, language)
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
      // Обычное приветствие
      else {
        greeting = getRegularGreeting(companionName, preferredName, language)
      }
    }

    return NextResponse.json({
      message: greeting,
      companionName,
    })
  } catch (error) {
    console.error('Greeting API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// GREETING GENERATORS
// =============================================================================

function getNewUserGreeting(companionName: string, preferredName: string | undefined, language: 'en' | 'ru'): string {
  if (language === 'ru') {
    const greeting = preferredName
      ? `Привет, ${preferredName}! Я ${companionName}, твой личный собеседник.`
      : `Привет! Я ${companionName}, твой личный собеседник.`

    return `${greeting} Я здесь когда бы тебе ни понадобилось поговорить — и я буду помнить всё, чем мы делимся, так что тебе никогда не придётся повторяться. Что у тебя на уме сегодня?`
  }

  const greeting = preferredName
    ? `Hi ${preferredName}! I'm ${companionName}, your personal companion.`
    : `Hi! I'm ${companionName}, your personal companion.`

  return `${greeting} I'm here whenever you need to talk — and I'll remember everything we share, so you never have to repeat yourself. What's on your mind today?`
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

    const greeting = preferredName ? `С возвращением, ${preferredName}!` : 'С возвращением!'

    return `${greeting} Прошло ${timePhrase} с нашего последнего разговора. Как у тебя дела?`
  }

  const timePhrase =
    daysSince === 1
      ? 'yesterday'
      : daysSince < 7
      ? 'a few days'
      : daysSince < 14
      ? 'a week'
      : 'a while'

  const greeting = preferredName ? `Welcome back, ${preferredName}!` : 'Welcome back!'

  return `${greeting} It's been ${timePhrase} since we last talked. How have you been?`
}

function getFollowUpGreeting(
  companionName: string,
  preferredName: string | undefined,
  followUp: string,
  language: 'en' | 'ru'
): string {
  if (language === 'ru') {
    const greeting = preferredName ? `Привет, ${preferredName}!` : 'Привет!'
    return `${greeting} В прошлый раз ты упоминал: "${followUp}". Как всё прошло?`
  }

  const greeting = preferredName ? `Hey ${preferredName}!` : 'Hey!'
  return `${greeting} Last time you mentioned: "${followUp}". How did that go?`
}

function getRegularGreeting(companionName: string, preferredName: string | undefined, language: 'en' | 'ru'): string {
  if (language === 'ru') {
    const greeting = preferredName
      ? `Привет, ${preferredName}! Я ${companionName}, твой личный собеседник.`
      : `Привет! Я ${companionName}, твой личный собеседник.`

    return `${greeting} Я здесь когда бы тебе ни понадобилось поговорить — и я буду помнить всё, чем мы делимся, так что тебе никогда не придётся повторяться. Что у тебя на уме сегодня?`
  }

  const greeting = preferredName
    ? `Hi ${preferredName}! I'm ${companionName}, your personal companion.`
    : `Hi! I'm ${companionName}, your personal companion.`

  return `${greeting} I'm here whenever you need to talk — and I'll remember everything we share, so you never have to repeat yourself. What's on your mind today?`
}
