import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * OAuth callback handler для Google Sign-in
 *
 * Supabase редиректит сюда после успешной OAuth аутентификации
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const plan = requestUrl.searchParams.get('plan') // pro | premium
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Игнорируем ошибки cookie в middleware
            }
          },
        },
      }
    )

    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Проверить завершён ли онбординг у пользователя
    if (data.user) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('companion_name')
        .eq('id', data.user.id)
        .single()

      // Если companion_name пустой — редирект на onboarding (с планом если есть)
      if (!dbUser || !dbUser.companion_name || dbUser.companion_name.trim() === '') {
        const onboardingUrl = plan
          ? `${origin}/onboarding?plan=${plan}`
          : `${origin}/onboarding`
        return NextResponse.redirect(onboardingUrl)
      }
    }
  }

  // Редирект на dashboard после успешной аутентификации (с планом для авто-checkout)
  const dashboardUrl = plan
    ? `${origin}/dashboard/chat?checkout=${plan}`
    : `${origin}/dashboard/chat`
  return NextResponse.redirect(dashboardUrl)
}
