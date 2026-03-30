// lib/proactive/engine.ts
// Confide — Proactive Message Generation Engine

import { prisma } from '@/lib/prisma'
import { callProactive } from '@/lib/ai/router'

/**
 * Generate a proactive message for a user
 * Types:
 * - "morning": Morning check-in (no sessions last 7 days)
 * - "nudge": Gentle nudge during active session (30+ min silence)
 * - "followup": Follow-up after difficult session (24-48h later)
 * - "milestone": Celebrate progress milestone
 * - "exercise": Suggest breathing/grounding exercise based on context
 */

export async function generateProactiveMessage(
  userId: string,
  type: 'morning' | 'nudge' | 'followup' | 'milestone' | 'exercise'
): Promise<string> {
  // Получить профиль пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Получить последнюю сессию
  const lastSession = await prisma.session.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  const companionName = user.companionName || 'Alex'
  const preferredName = user.preferredName || 'there'

  // Построить контекст для LLM
  let contextPrompt = ''
  let examplesPrompt = ''

  switch (type) {
    case 'morning':
      contextPrompt = `
You are ${companionName}, checking in with ${preferredName} in the morning.
They haven't messaged in the last 7 days.

Context:
${lastSession?.summary ? `Last session (${Math.floor((Date.now() - new Date(lastSession.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago): ${lastSession.summary}` : 'No recent sessions'}

User profile:
${JSON.stringify(user.profile, null, 2)}

Generate a brief, natural morning check-in message (1-2 sentences MAX).
NOT generic "how are you?" — reference something specific from their history.

Examples:
- "Hey ${preferredName}, how'd you sleep?"
- "Morning. Yesterday you seemed like you were carrying a lot. How are you today?"
- "Hey — just checking in. No agenda."
`
      break

    case 'nudge':
      contextPrompt = `
You are ${companionName}. ${preferredName} is in an active session but has been silent for 30+ minutes.

Last few messages:
${lastSession?.messages?.map((m) => `${m.role === 'user' ? preferredName : companionName}: ${m.content}`).join('\n')}

Generate a gentle nudge (1 sentence MAX). Not pushy.

Examples:
- "You still there? No rush."
- "Take your time. I'm here when you're ready."
- "We can pick this up later if you need a break."
`
      break

    case 'followup':
      const moodBefore = lastSession?.moodBefore || 5
      const isLowMood = moodBefore <= 3

      contextPrompt = `
You are ${companionName}. ${preferredName} had a difficult session ${Math.floor((Date.now() - new Date(lastSession?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60))} hours ago.

Last session summary: ${lastSession?.summary || 'Unknown'}
Mood before: ${moodBefore}/7 ${isLowMood ? '(low)' : ''}

Generate a follow-up check-in (1-2 sentences MAX). Show you remember.

Examples:
- "Hey. Just wanted to check in — how are things today?"
- "Thinking about what you said yesterday. How's it sitting with you now?"
- "You were in a rough place last time. Any lighter today?"
`
      break

    case 'milestone':
      const sessionCount = await prisma.session.count({ where: { userId } })

      contextPrompt = `
You are ${companionName}. ${preferredName} just hit a milestone: ${sessionCount} sessions completed.

User progress:
${JSON.stringify(user.profile?.progress, null, 2)}

Generate a brief celebration message (1-2 sentences MAX). Not over-the-top.

Examples:
- "You just finished your first breathing exercise. How did that feel?"
- "This is your 10th conversation. You're showing up for yourself."
`
      break

    case 'exercise':
      contextPrompt = `
You are ${companionName}. ${preferredName} just described anxiety symptoms.

Last message: ${lastSession?.messages?.[0]?.content}

Suggest a breathing or grounding exercise (1-2 sentences + link).

Example:
- "Something that might help right now — a quick breathing exercise. Want to try? [Try Box Breathing →](/dashboard/exercises?start=box)"
`
      break
  }

  // Вызвать LLM для генерации сообщения (MiniMax M2.7 — friend-like tone)
  const result = await callProactive([
    {
      role: 'system',
      content: `${contextPrompt}

RULES:
- 1-2 sentences MAX
- Sound like a friend texting, not a therapist
- Reference something specific from their history
- No generic "how are you?" — be specific
- No exclamation marks unless it's a genuine celebration
- Don't start with "Hey!" every time — vary your openings
`,
    },
    {
      role: 'user',
      content: 'Generate the proactive message now.',
    },
  ])

  const generatedMessage = result.content || 'Hey — just checking in. How are you?'

  return generatedMessage.trim()
}

/**
 * Check if a morning check-in is needed
 * Returns true if:
 * - No sessions in last 7 days
 * - No unread proactive messages of type "morning"
 */
export async function shouldSendMorningCheckIn(userId: string): Promise<boolean> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Check if there are recent sessions
  const recentSession = await prisma.session.findFirst({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo },
    },
  })

  if (recentSession) {
    return false // User has been active recently
  }

  // Check if there's an unread morning check-in already
  const unreadMorningMessage = await prisma.proactiveMessage.findFirst({
    where: {
      userId,
      type: 'morning',
      read: false,
    },
  })

  return !unreadMorningMessage // Send only if no unread morning message
}

/**
 * Check if a follow-up is needed
 * Returns true if:
 * - Last session had moodBefore <= 3
 * - 24-48 hours have passed since that session
 * - No unread follow-up messages
 */
export async function shouldSendFollowUp(userId: string): Promise<boolean> {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Find last session with low mood
  const lastLowMoodSession = await prisma.session.findFirst({
    where: {
      userId,
      moodBefore: { lte: 3 },
      createdAt: { gte: twoDaysAgo, lte: oneDayAgo },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!lastLowMoodSession) {
    return false
  }

  // Check if there's an unread follow-up already
  const unreadFollowUp = await prisma.proactiveMessage.findFirst({
    where: {
      userId,
      type: 'followup',
      read: false,
    },
  })

  return !unreadFollowUp
}

/**
 * Check if a milestone celebration is needed
 * Returns true if:
 * - User just completed their 1st, 5th, 10th, 25th, 50th session
 * - No unread milestone messages for this session count
 */
export async function shouldCelebrateMilestone(userId: string): Promise<boolean> {
  const sessionCount = await prisma.session.count({ where: { userId } })

  const milestones = [1, 5, 10, 25, 50, 100]
  if (!milestones.includes(sessionCount)) {
    return false
  }

  // Check if there's an unread milestone message
  const unreadMilestone = await prisma.proactiveMessage.findFirst({
    where: {
      userId,
      type: 'milestone',
      read: false,
      metadata: {
        path: ['sessionCount'],
        equals: sessionCount,
      },
    },
  })

  return !unreadMilestone
}

/**
 * Main function to check and generate proactive messages
 * Called:
 * - On dashboard load (via /api/proactive/generate)
 * - Via Vercel Cron (future implementation)
 */
export async function checkAndGenerateProactiveMessages(userId: string): Promise<void> {
  // 1. Check if morning check-in is needed
  if (await shouldSendMorningCheckIn(userId)) {
    const message = await generateProactiveMessage(userId, 'morning')
    await prisma.proactiveMessage.create({
      data: {
        userId,
        type: 'morning',
        content: message,
        metadata: { reason: 'No sessions in last 7 days' },
      },
    })
  }

  // 2. Check if follow-up is needed
  if (await shouldSendFollowUp(userId)) {
    const message = await generateProactiveMessage(userId, 'followup')
    await prisma.proactiveMessage.create({
      data: {
        userId,
        type: 'followup',
        content: message,
        metadata: { reason: 'Follow-up after low mood session' },
      },
    })
  }

  // 3. Check if milestone celebration is needed
  if (await shouldCelebrateMilestone(userId)) {
    const sessionCount = await prisma.session.count({ where: { userId } })
    const message = await generateProactiveMessage(userId, 'milestone')
    await prisma.proactiveMessage.create({
      data: {
        userId,
        type: 'milestone',
        content: message,
        metadata: { reason: 'Milestone celebration', sessionCount },
      },
    })
  }

  // NOTE: Nudge and exercise suggestions are handled differently:
  // - Nudge: triggered by inactivity timer in ChatWindow
  // - Exercise: triggered by anxiety detection in chat API
}
