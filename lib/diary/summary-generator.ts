// Confide Diary — AI Month Summary Generator
// Generates personalized month summaries using LLM based on session data

import { callDiary, getProviderInfo } from '@/lib/ai/router';
import { MonthSummary } from '@/types';

// ============================================
// TYPES
// ============================================

interface SessionSummaryInput {
  summary: string;
  moodScore?: number;
  agentType: string;
  createdAt: Date;
}

interface UserProfileInput {
  communicationStyle?: Record<string, any>;
  emotionalProfile?: {
    triggers?: string[];
    pain_points?: string[];
    responds_to?: string;
  };
  lifeContext?: {
    key_people?: string[];
    work?: string;
    situation?: string;
  };
  patterns?: string[];
  progress?: Record<string, any>;
  whatWorked?: string[];
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Generate AI-powered month summary from session summaries
 * IMPORTANT: Only uses session.summary (NOT raw messages) for privacy
 */
export async function generateMonthSummary(
  sessions: SessionSummaryInput[],
  companionName: string = 'Alex',
  userProfile?: UserProfileInput
): Promise<MonthSummary> {
  try {
    const providerInfo = getProviderInfo();
    console.log(`[MONTH_SUMMARY] Generating with ${providerInfo.provider} (${providerInfo.diaryModel})`);

    // Build context from sessions
    const sessionContext = sessions
      .map((s, index) => {
        const date = new Date(s.createdAt).toLocaleDateString();
        const mood = s.moodScore ? `Mood: ${s.moodScore}/10` : '';
        return `Session ${index + 1} (${date}, ${s.agentType}) ${mood}\n${s.summary}`;
      })
      .join('\n\n---\n\n');

    // Extract key info from user profile (if available)
    const profileContext = userProfile
      ? `
User context:
- Communication style: ${JSON.stringify(userProfile.communicationStyle || {})}
- Pain points: ${userProfile.emotionalProfile?.pain_points?.join(', ') || 'unknown'}
- What worked before: ${userProfile.whatWorked?.join(', ') || 'unknown'}
- Key people: ${userProfile.lifeContext?.key_people?.join(', ') || 'unknown'}
      `.trim()
      : '';

    // System prompt — warm, personal tone
    const systemPrompt = `You are ${companionName}, an AI companion from Confide. You're writing a monthly summary for a user's personal diary.

Tone: warm, personal, empathetic — like a close friend who knows them well. NOT clinical or formal.

Your task:
1. Read the session summaries below
2. Extract main themes (3-5 recurring topics)
3. Identify progress, changes, or breakthroughs
4. Note what techniques/approaches helped
5. Note what challenges remain
6. Write a personal note from ${companionName} (2-3 sentences, heartfelt)
7. Suggest 2-3 goals for next month

Return ONLY valid JSON (no markdown, no code blocks):
{
  "mainThemes": ["theme1", "theme2", ...],
  "progress": "paragraph about progress and changes",
  "whatHelped": ["technique1", "technique2", ...],
  "challengesRemaining": "what they're still working on",
  "alexNote": "personal message from ${companionName}",
  "goalsForNextMonth": ["goal1", "goal2", ...]
}`;

    const userPrompt = `
${profileContext}

Session summaries:
${sessionContext}
    `.trim();

    // Call LLM via AI Router (Claude Sonnet for literary quality)
    const result = await callDiary([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const content = result.content.trim();

    if (!content) {
      throw new Error('Empty response from LLM');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);

    // Validate structure
    if (!parsed.mainThemes || !parsed.progress || !parsed.alexNote) {
      throw new Error('Invalid response structure from LLM');
    }

    console.log('[MONTH_SUMMARY] Successfully generated');

    return {
      mainThemes: parsed.mainThemes,
      progress: parsed.progress,
      whatHelped: parsed.whatHelped || [],
      challengesRemaining: parsed.challengesRemaining || '',
      alexNote: parsed.alexNote,
      goalsForNextMonth: parsed.goalsForNextMonth || [],
    };
  } catch (error) {
    console.error('[MONTH_SUMMARY_ERROR]', error);
    console.log('[MONTH_SUMMARY] Falling back to basic summary');

    // FALLBACK — basic summary without LLM
    return generateFallbackSummary(sessions, companionName);
  }
}

// ============================================
// FALLBACK GENERATOR
// ============================================

/**
 * Generate basic summary when LLM is unavailable
 */
function generateFallbackSummary(
  sessions: SessionSummaryInput[],
  companionName: string
): MonthSummary {
  // Extract themes from agent types
  const themes = new Set<string>();
  sessions.forEach((s) => {
    const theme = s.agentType.charAt(0).toUpperCase() + s.agentType.slice(1);
    themes.add(theme);
  });

  // Calculate average mood
  const moodScores = sessions.filter((s) => s.moodScore).map((s) => s.moodScore!);
  const avgMood = moodScores.length > 0
    ? (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1)
    : null;

  return {
    mainThemes: Array.from(themes).slice(0, 5),
    progress: `You engaged in ${sessions.length} meaningful conversations this month, exploring important aspects of your well-being.${
      avgMood ? ` Your average mood was ${avgMood}/10.` : ''
    }`,
    whatHelped: [
      'Regular check-ins with Confide',
      'Expressing thoughts and feelings openly',
      'Reflecting on experiences',
    ],
    challengesRemaining: 'Continuing to build on the progress made this month',
    alexNote: `${sessions.length} conversations, each a step forward. I'm proud of your commitment to understanding yourself better. Keep going — you're doing great.`,
    goalsForNextMonth: [
      'Continue regular conversations',
      'Practice techniques discussed',
      'Track mood patterns',
    ],
  };
}
