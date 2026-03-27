import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/resend/emails/welcome'
import { safeErrorBody } from '@/lib/utils/safe-error'



// Валидация данных онбординга
const OnboardingSchema = z.object({
  preferredName: z.string().min(1).max(30),
  ageGroup: z.string().min(1),
  userGender: z.enum(['male', 'female', 'not_specified']),
  companionName: z.string().min(1).max(20),
  voicePreference: z.string().optional(), // ElevenLabs voice ID
  companionGender: z.enum(['male', 'female']).optional(),
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
    // 3. СОЗДАТЬ/ОБНОВИТЬ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    // Используем upsert потому что запись может не существовать после регистрации
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email!,
        preferredName,
        ageGroup,
        userGender,
        companionName,
        companionGender: companionGender || 'male',
        voiceId: voicePreference || null,
        plan: 'free', // Дефолтный план для новых пользователей
        profile: {
          create: {
            communicationStyle: {},
            emotionalProfile: {},
            lifeContext: {},
            patterns: [],
            progress: {},
            whatWorked: [],
          },
        },
      },
      update: {
        preferredName,
        ageGroup,
        userGender,
        companionName,
        companionGender: companionGender || 'male',
        voiceId: voicePreference || null,
      },
    })

    // ============================================
    // 4. ОТПРАВИТЬ WELCOME EMAIL
    // ============================================
    // Fire-and-forget — не блокируем основной поток
    sendWelcomeEmail({
      preferredName: updatedUser.preferredName || 'there',
      companionName: updatedUser.companionName,
      email: updatedUser.email,
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
      safeErrorBody('Internal server error', error),
      { status: 500 }
    )
  }
}
