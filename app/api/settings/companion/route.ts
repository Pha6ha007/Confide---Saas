import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { safeErrorBody } from '@/lib/utils/safe-error'



// Валидация
const UpdateCompanionSchema = z.object({
  companionName: z.string().min(1).max(20),
})

export async function PATCH(request: NextRequest) {
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
    const validation = UpdateCompanionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.message },
        { status: 400 }
      )
    }

    const { companionName } = validation.data

    // ============================================
    // 3. ОБНОВИТЬ
    // ============================================
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { companionName },
    })

    return NextResponse.json({
      success: true,
      companionName: updatedUser.companionName,
    })
  } catch (error) {
    console.error('Update companion name error:', error)

    return NextResponse.json(
      safeErrorBody('Internal server error', error),
      { status: 500 }
    )
  }
}
