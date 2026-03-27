import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { safeErrorBody } from '@/lib/utils/safe-error'



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
    // 2. ПОЛУЧИТЬ/СОЗДАТЬ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    // Используем upsert чтобы создать запись если её нет после регистрации
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
        plan: 'free',
        companionName: '', // Пустой = не прошёл onboarding
      },
      update: {}, // Ничего не обновляем, просто получаем данные
      select: {
        companionName: true,
        companionGender: true,
        preferredName: true,
        ageGroup: true,
        userGender: true,
        language: true,
        plan: true,
      },
    })

    return NextResponse.json({
      companionName: dbUser.companionName || 'Alex',
      companionGender: dbUser.companionGender,
      preferredName: dbUser.preferredName,
      ageGroup: dbUser.ageGroup,
      userGender: dbUser.userGender,
      language: dbUser.language,
      plan: dbUser.plan,
    })
  } catch (error) {
    console.error('Get user error:', error)

    return NextResponse.json(
      safeErrorBody('Internal server error', error),
      { status: 500 }
    )
  }
}
