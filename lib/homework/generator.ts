/**
 * Homework Generator — AI-powered homework assignments from chat sessions
 *
 * Analyzes conversation and generates personalized, actionable homework
 * that's small (15-30 min), relevant to the discussion, and warm in tone.
 */

import { callHomework } from '@/lib/ai/router'

export interface GeneratedHomework {
  title: string
  description: string
  category: 'reflection' | 'action' | 'mindfulness' | 'social' | 'creative'
}

interface Message {
  role: string
  content: string
}

/**
 * Generate homework based on session conversation
 *
 * @param sessionMessages - Last 15 messages from the session
 * @param userProfile - Optional user profile for personalization
 * @returns Generated homework with title, description, and category
 */
export async function generateHomework(
  sessionMessages: Message[],
  userProfile?: any
): Promise<GeneratedHomework> {
  try {
    // Build prompt for homework generation
    const conversationSummary = sessionMessages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Alex'}: ${msg.content}`)
      .join('\n')

    const userContext = userProfile
      ? `User profile notes:
- Communication style: ${JSON.stringify(userProfile.communicationStyle || {})}
- Emotional profile: ${JSON.stringify(userProfile.emotionalProfile || {})}
- What worked before: ${JSON.stringify(userProfile.whatWorked || [])}
`
      : ''

    const systemPrompt = `You are Alex, a warm AI companion helping someone with their mental wellbeing.

Based on this conversation, create ONE small homework assignment (15-30 minutes max).

${userContext}

Recent conversation:
${conversationSummary}

Create homework that is:
- SMALL and specific (15-30 minutes max)
- ACTIONABLE (clear what to do)
- RELEVANT to what we discussed
- WARM in tone (not clinical or demanding)
- ONE clear task (not multiple tasks)

Categories:
- reflection: journaling, self-reflection, thinking exercises
- action: doing something in real life (e.g., call someone, try new activity)
- mindfulness: breathing, meditation, grounding exercises
- social: reaching out, spending time with others
- creative: drawing, writing, music, creative expression

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "title": "5-10 word title",
  "description": "2-3 sentence description in warm, supportive tone",
  "category": "one of: reflection, action, mindfulness, social, creative"
}

Examples:
{
  "title": "Write a letter to your younger self",
  "description": "Take 20 minutes to write a letter to yourself at age 15. What would you tell them about what you've learned? This can help process past experiences.",
  "category": "reflection"
}

{
  "title": "Try the 5-4-3-2-1 grounding technique",
  "description": "Next time you feel anxious, try this: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. We talked about grounding—this is a practical way to try it.",
  "category": "mindfulness"
}`

    // Call LLM via AI Router (MiniMax M2.7 for warm practical tone)
    const result = await callHomework(
      [{ role: 'system', content: systemPrompt }]
    )

    const responseText = result.content.trim()

    if (!responseText) {
      throw new Error('Empty response from LLM')
    }

    // Parse JSON response
    const parsed = JSON.parse(responseText) as GeneratedHomework

    // Validate required fields
    if (!parsed.title || !parsed.description || !parsed.category) {
      throw new Error('Invalid homework structure from LLM')
    }

    // Validate category
    const validCategories = ['reflection', 'action', 'mindfulness', 'social', 'creative']
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'reflection' // Fallback to reflection
    }

    return parsed
  } catch (error) {
    console.error('[Homework Generator] Error:', error)

    // Fallback: generic homework based on most common themes
    return getFallbackHomework()
  }
}

/**
 * Fallback homework if LLM fails
 * Returns a generic but useful assignment
 */
function getFallbackHomework(): GeneratedHomework {
  const fallbacks: GeneratedHomework[] = [
    {
      title: 'Reflect on what helped this week',
      description: "Take 15 minutes to write down 3 things that helped you feel better this week. It could be a conversation, an activity, or just a moment of peace. Noticing what works helps you do more of it.",
      category: 'reflection',
    },
    {
      title: 'Try a 5-minute breathing exercise',
      description: "Set a timer for 5 minutes. Breathe in for 4 counts, hold for 4, out for 4. If your mind wanders, that's okay—just come back to your breath. Small practices add up.",
      category: 'mindfulness',
    },
    {
      title: 'Write down 3 things you noticed today',
      description: "Before bed tonight, write down 3 things you noticed today—big or small. This helps practice being present and can shift focus from rumination to observation.",
      category: 'reflection',
    },
  ]

  // Return random fallback
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}
