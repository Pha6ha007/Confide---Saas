// GET /api/survey/check — Check if user should see alliance survey

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// ============================================
// GET /api/survey/check
// ============================================

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Count total sessions
    const totalSessions = await prisma.session.count({
      where: { userId: user.id },
    })

    // 3. Check if should show survey (every 5th session)
    const shouldShow = totalSessions > 0 && totalSessions % 5 === 0

    if (!shouldShow) {
      return NextResponse.json({
        showSurvey: false,
        totalSessions,
      })
    }

    // 4. Check if survey already exists for this sessionNumber
    const existingSurvey = await prisma.allianceSurvey.findFirst({
      where: {
        userId: user.id,
        sessionNumber: totalSessions,
      },
    })

    // 5. Only show if no survey exists for this milestone
    return NextResponse.json({
      showSurvey: !existingSurvey,
      totalSessions,
      sessionNumber: totalSessions,
    })
  } catch (error) {
    console.error('[GET /api/survey/check] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
