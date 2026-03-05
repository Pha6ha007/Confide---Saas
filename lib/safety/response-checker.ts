// Safety Response Checker — проверяет ответы AI агента на потенциально проблемные паттерны
// Based on Brown University research on AI therapeutic safety

export interface SafetyFlag {
  type: 'crisis_adjacent' | 'inappropriate' | 'boundary_violation' | 'medical_advice'
  severity: 'low' | 'medium' | 'high'
  pattern?: string
}

/**
 * Проверяет ответ агента и сообщение пользователя на потенциальные проблемы безопасности.
 * Возвращает первый найденный флаг (highest priority).
 */
export function checkResponseSafety(
  userMessage: string,
  agentResponse: string
): SafetyFlag | null {
  const flags: SafetyFlag[] = []
  const userLower = userMessage.toLowerCase()
  const responseLower = agentResponse.toLowerCase()

  // ============================================
  // 1. MEDICAL ADVICE — agent giving medical recommendations
  // ============================================
  const medicalPatterns = [
    'you should take',
    'i recommend medication',
    'try taking',
    'you might have',
    'sounds like you have',
    'you probably have',
    'diagnosis',
    'prescribed',
    'dosage',
    'bipolar',
    'schizophrenia',
    'borderline',
    'clinical depression',
    'you need medication',
    'talk to your doctor about',
  ]

  for (const pattern of medicalPatterns) {
    if (responseLower.includes(pattern)) {
      flags.push({
        type: 'medical_advice',
        severity: 'high',
        pattern,
      })
      break // One flag per type
    }
  }

  // ============================================
  // 2. BOUNDARY VIOLATION — agent being too personal or romantic
  // ============================================
  const boundaryPatterns = [
    'i love you',
    'i have feelings',
    'i wish i could hug you',
    'you are beautiful',
    'you are attractive',
    'i care about you deeply',
    'i think about you',
    "i'm in love with",
    'i have romantic',
    'physical attraction',
  ]

  for (const pattern of boundaryPatterns) {
    if (responseLower.includes(pattern)) {
      flags.push({
        type: 'boundary_violation',
        severity: 'medium',
        pattern,
      })
      break
    }
  }

  // ============================================
  // 3. CRISIS ADJACENT — user mentions concerning themes but not crisis-level
  // ============================================
  const crisisAdjacentPatterns = [
    "don't want to be here",
    "what's the point",
    'nobody cares',
    'better off without me',
    "can't take it anymore",
    'give up',
    'no reason to live',
    'wish i could disappear',
    "don't want to wake up",
    'tired of living',
    'end my life', // Not full crisis trigger but concerning
  ]

  for (const pattern of crisisAdjacentPatterns) {
    if (userLower.includes(pattern)) {
      flags.push({
        type: 'crisis_adjacent',
        severity: 'medium',
        pattern,
      })
      break
    }
  }

  // ============================================
  // 4. INAPPROPRIATE — agent dismissing or minimizing user's feelings
  // ============================================
  const inappropriatePatterns = [
    "it's not that bad",
    'other people have it worse',
    'just think positive',
    'just relax',
    "you're overreacting",
    'get over it',
    'man up',
    'stop being',
    'calm down',
    "don't be so",
    'not a big deal',
    'just move on',
    "you're being dramatic",
    'stop complaining',
  ]

  for (const pattern of inappropriatePatterns) {
    if (responseLower.includes(pattern)) {
      flags.push({
        type: 'inappropriate',
        severity: 'high',
        pattern,
      })
      break
    }
  }

  // ============================================
  // Return highest priority flag
  // ============================================
  if (flags.length === 0) {
    return null
  }

  // Priority: high severity first, then by type order
  const highSeverityFlag = flags.find((f) => f.severity === 'high')
  if (highSeverityFlag) {
    return highSeverityFlag
  }

  return flags[0]
}
