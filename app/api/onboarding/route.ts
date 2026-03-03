import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/resend/client'

const prisma = new PrismaClient()

// Валидация данных онбординга
const OnboardingSchema = z.object({
  preferredName: z.string().min(1).max(30),
  ageGroup: z.string().min(1),
  userGender: z.enum(['male', 'female', 'not_specified']),
  companionName: z.string().min(1).max(20),
  voicePreference: z.string().optional(),
  companionGender: z.enum(['male', 'female', 'neutral']).optional(),
})

export async function POST(request: NextRequest) {
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
    // 2. ВАЛИДАЦИЯ
    // ============================================
    const body = await request.json()
    const validation = OnboardingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.message },
        { status: 400 }
      )
    }

    const {
      preferredName,
      ageGroup,
      userGender,
      companionName,
      voicePreference,
      companionGender,
    } = validation.data

    // ============================================
    // 3. ОБНОВИТЬ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        preferredName,
        ageGroup,
        userGender,
        companionName,
        companionGender: companionGender || null,
        voiceId: voicePreference || null,
      },
    })

    // ============================================
    // 4. ОТПРАВИТЬ WELCOME EMAIL
    // ============================================
    // Fire-and-forget — не блокируем основной поток
    sendWelcomeEmail({
      to: updatedUser.email,
      companionName: updatedUser.companionName,
      language: updatedUser.language as 'en' | 'ru',
    }).catch((error) => {
      console.error('Failed to send welcome email (non-blocking):', error)
    })

    return NextResponse.json({
      success: true,
      user: {
        companionName: updatedUser.companionName,
        companionGender: updatedUser.companionGender,
      },
    })
  } catch (error) {
    console.error('Onboarding API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
