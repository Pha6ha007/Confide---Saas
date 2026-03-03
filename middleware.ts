import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware для защиты роутов через Supabase Auth
 *
 * Защищённые роуты:
 * - /dashboard/* — требует аутентификации
 *
 * Публичные роуты:
 * - / — landing page
 * - /login, /register — auth pages
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Проверяем сессию пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Защищённые роуты — требуется auth
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Проверяем завершён ли онбординг (есть ли companionName)
    // Если нет — редирект на /onboarding
    const { data: dbUser } = await supabase
      .from('users')
      .select('companion_name')
      .eq('id', user.id)
      .single()

    // Если companionName пустой — показать онбординг
    if (!dbUser || !dbUser.companion_name || dbUser.companion_name.trim() === '') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Защищённый роут /onboarding — требуется auth но не требуется companionName
  if (pathname === '/onboarding') {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Роуты auth — если пользователь уже залогинен, редирект на dashboard
  if ((pathname === '/login' || pathname === '/register') && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard/chat'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
