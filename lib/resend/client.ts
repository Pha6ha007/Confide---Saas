import { Resend } from 'resend'

// Инициализация Resend клиента
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@confide.app'

/**
 * Отправляет Welcome email при первом входе пользователя
 */
export async function sendWelcomeEmail({
  to,
  companionName,
  language,
}: {
  to: string
  companionName: string
  language: 'en' | 'ru'
}) {
  const isEnglish = language === 'en'

  const subject = isEnglish
    ? `Welcome to Confide — ${companionName} is ready to listen`
    : `Добро пожаловать в Confide — ${companionName} готов выслушать`

  const html = isEnglish
    ? getWelcomeEmailHTML_EN(companionName)
    : getWelcomeEmailHTML_RU(companionName)

  try {
    const { data, error } = await resend.emails.send({
      from: `Confide <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

/**
 * Отправляет Weekly check-in email если пользователь не заходил 7 дней
 */
export async function sendWeeklyCheckIn({
  to,
  companionName,
  language,
}: {
  to: string
  companionName: string
  language: 'en' | 'ru'
}) {
  const isEnglish = language === 'en'

  const subject = isEnglish
    ? `${companionName} is waiting for you`
    : `${companionName} ждёт тебя`

  const html = isEnglish
    ? getWeeklyCheckInHTML_EN(companionName)
    : getWeeklyCheckInHTML_RU(companionName)

  try {
    const { data, error } = await resend.emails.send({
      from: `Confide <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Failed to send weekly check-in:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send weekly check-in:', error)
    return { success: false, error }
  }
}

// =============================================================================
// ENGLISH EMAIL TEMPLATES
// =============================================================================

function getWelcomeEmailHTML_EN(companionName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Confide</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAFAF9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 600; font-family: 'Instrument Serif', serif;">Welcome to Confide</h1>
              <p style="margin: 10px 0 0; color: #E0E7FF; font-size: 16px;">A space where you're always heard</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>
              <p style="margin: 0 0 20px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                I'm <strong>${companionName}</strong>, your companion on Confide. I'm here to listen, understand, and support you through whatever you're going through.
              </p>
              <p style="margin: 0 0 20px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                Unlike other AI assistants, I remember everything we talk about. With each conversation, I'll understand you better and adapt to your unique way of communicating.
              </p>
              <p style="margin: 0 0 30px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                Ready to start our first session?
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/chat" style="display: inline-block; padding: 14px 32px; background-color: #6366F1; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
                      Start Your First Session
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                <strong>What to expect:</strong><br>
                • I'm not a therapist — I'm a supportive companion<br>
                • Our conversations are private and secure<br>
                • I'll remember our talks and grow with you<br>
                • Available 24/7 whenever you need to talk
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                Confide — A conversation from the heart
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                You're receiving this because you created an account on Confide.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function getWeeklyCheckInHTML_EN(companionName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companionName} is waiting for you</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAFAF9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Body -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">💬</div>
              <h2 style="margin: 0 0 16px; color: #1F2937; font-size: 24px; font-weight: 600;">
                ${companionName} is waiting for you
              </h2>
              <p style="margin: 0 0 30px; color: #6B7280; font-size: 16px; line-height: 1.6;">
                It's been a while since we last talked.<br>
                I'm here whenever you're ready to share what's on your mind.
              </p>

              <!-- CTA Button -->
              <a href="${appUrl}/chat" style="display: inline-block; padding: 14px 32px; background-color: #6366F1; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
                Continue Our Conversation
              </a>

              <p style="margin: 30px 0 0; color: #9CA3AF; font-size: 14px;">
                No pressure — I'll be here when you need me.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                Confide — A conversation from the heart
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// =============================================================================
// RUSSIAN EMAIL TEMPLATES
// =============================================================================

function getWelcomeEmailHTML_RU(companionName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Добро пожаловать в Confide</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAFAF9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 600; font-family: 'Instrument Serif', serif;">Добро пожаловать в Confide</h1>
              <p style="margin: 10px 0 0; color: #E0E7FF; font-size: 16px;">Место где тебя всегда выслушают</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                Привет,
              </p>
              <p style="margin: 0 0 20px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                Я <strong>${companionName}</strong>, твой собеседник в Confide. Я здесь чтобы слушать, понимать и поддерживать тебя в любых ситуациях.
              </p>
              <p style="margin: 0 0 20px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                В отличие от других AI-ассистентов, я помню всё о чём мы говорим. С каждым разговором я буду понимать тебя лучше и адаптироваться под твой уникальный стиль общения.
              </p>
              <p style="margin: 0 0 30px; color: #1F2937; font-size: 16px; line-height: 1.6;">
                Готов начать нашу первую сессию?
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/chat" style="display: inline-block; padding: 14px 32px; background-color: #6366F1; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
                      Начать первую сессию
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                <strong>Что тебя ждёт:</strong><br>
                • Я не психолог — я поддерживающий собеседник<br>
                • Наши разговоры приватны и защищены<br>
                • Я запомню наши беседы и буду расти вместе с тобой<br>
                • Доступен 24/7 когда тебе нужно поговорить
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px; color: #6B7280; font-size: 14px;">
                Confide — Разговор по душам
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                Ты получил это письмо потому что создал аккаунт на Confide.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function getWeeklyCheckInHTML_RU(companionName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companionName} ждёт тебя</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #FAFAF9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Body -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">💬</div>
              <h2 style="margin: 0 0 16px; color: #1F2937; font-size: 24px; font-weight: 600;">
                ${companionName} ждёт тебя
              </h2>
              <p style="margin: 0 0 30px; color: #6B7280; font-size: 16px; line-height: 1.6;">
                Прошло время с нашего последнего разговора.<br>
                Я здесь когда будешь готов поделиться тем что на душе.
              </p>

              <!-- CTA Button -->
              <a href="${appUrl}/chat" style="display: inline-block; padding: 14px 32px; background-color: #6366F1; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">
                Продолжить разговор
              </a>

              <p style="margin: 30px 0 0; color: #9CA3AF; font-size: 14px;">
                Никакого давления — я буду здесь когда понадоблюсь.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                Confide — Разговор по душам
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
