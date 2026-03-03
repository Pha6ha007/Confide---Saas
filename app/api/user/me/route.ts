import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
