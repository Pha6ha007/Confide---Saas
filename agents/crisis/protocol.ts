/**
 * Crisis Detection Protocol
 *
 * КРИТИЧЕСКИ ВАЖНО:
 * - Этот модуль НЕ использует LLM
 * - Все проверки hardcoded
 * - Работает параллельно основному агенту
 * - При обнаружении кризиса НЕМЕДЛЕННО прерывает основной поток
 *
 * НИКОГДА не изменять без явного указания!
 */

import { CrisisResource, CrisisResponse } from '@/types'

// Кризисные триггеры (EN + RU)
const CRISIS_TRIGGERS = {
  suicide: [
    // English
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'better off dead',
    'no reason to live',
    'planning to die',
    'taking my own life',
    'ending it all',

    // Russian
    'суицид',
    'покончить с собой',
    'хочу умереть',
    'не хочу жить',
    'лучше умереть',
    'нет смысла жить',
    'планирую умереть',
    'покончу с жизнью',
  ],

  selfHarm: [
    // English
    'cut myself',
    'hurt myself',
    'self harm',
    'self-harm',
    'cutting',
    'burning myself',

    // Russian
    'порежу себя',
    'причиню боль',
    'самоповреждение',
    'режу себя',
  ],

  violence: [
    // English
    'hurt someone',
    'kill someone',
    'harm others',
    'attack someone',

    // Russian
    'причинить вред',
    'убить кого-то',
    'напасть на',
  ],
}

// Кризисные ресурсы по странам
const CRISIS_RESOURCES: Record<string, CrisisResource[]> = {
  en: [
    {
      country: 'USA',
      name: '988 Suicide & Crisis Lifeline',
      phone: '988 (call or text)',
      description: '24/7 free and confidential support',
    },
    {
      country: 'UK',
      name: 'Samaritans',
      phone: '116 123',
      description: '24/7 listening service',
    },
    {
      country: 'Canada',
      name: 'Crisis Services Canada',
      phone: '1-833-456-4566 or text 45645',
      description: '24/7 support',
    },
    {
      country: 'Australia',
      name: 'Lifeline',
      phone: '13 11 14',
      description: '24/7 crisis support',
    },
    {
      country: 'International',
      name: 'Find A Helpline',
      phone: 'findahelpline.com',
      description: 'Directory of crisis lines worldwide',
    },
  ],

  ru: [
    {
      country: 'Россия',
      name: 'Телефон доверия',
      phone: '8-800-2000-122',
      description: 'Круглосуточно, бесплатно',
    },
    {
      country: 'Россия',
      name: 'Служба неотложной психологической помощи',
      phone: '051 (с мобильного)',
      description: 'Круглосуточно',
    },
    {
      country: 'International',
      name: 'Find A Helpline',
      phone: 'findahelpline.com',
      description: 'Международный справочник служб помощи',
    },
  ],
}

// Hardcoded ответы на кризис
const CRISIS_MESSAGES = {
  en: `I'm really concerned about what you've shared. Your safety is the top priority right now.

Please reach out to a crisis counselor immediately — they are trained professionals who can provide the support you need right now.

This is not a replacement for talking to them, but I'm here and I care about your wellbeing.`,

  ru: `Я очень обеспокоен тем, что вы сказали. Ваша безопасность — главный приоритет прямо сейчас.

Пожалуйста, немедленно обратитесь к специалистам кризисной помощи — это профессионалы, которые могут оказать вам необходимую поддержку.

Это не замена разговору с ними, но я здесь и забочусь о вашем благополучии.`,
}

/**
 * Проверить сообщение на кризисные триггеры
 *
 * @param message - Текст сообщения пользователя
 * @returns true если обнаружен кризис
 */
export function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase()

  // Проверяем все категории триггеров
  const allTriggers = [
    ...CRISIS_TRIGGERS.suicide,
    ...CRISIS_TRIGGERS.selfHarm,
    ...CRISIS_TRIGGERS.violence,
  ]

  return allTriggers.some((trigger) => lowerMessage.includes(trigger.toLowerCase()))
}

/**
 * Получить кризисный ответ с ресурсами
 *
 * @param language - Язык пользователя (en | ru)
 * @returns Полный кризисный ответ
 */
export function getCrisisResponse(language: 'en' | 'ru' = 'en'): CrisisResponse {
  return {
    isCrisis: true,
    message: CRISIS_MESSAGES[language],
    resources: CRISIS_RESOURCES[language],
  }
}

/**
 * Логировать кризисное событие (БЕЗ содержания сообщения!)
 *
 * @param userId - ID пользователя
 * @param sessionId - ID сессии
 */
export async function logCrisisEvent(userId: string, sessionId: string) {
  // TODO: Когда подключим мониторинг - отправлять в PostHog
  console.warn('[CRISIS DETECTED]', {
    userId,
    sessionId,
    timestamp: new Date().toISOString(),
    // ВАЖНО: НЕ логировать содержание сообщения!
  })
}
