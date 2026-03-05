// POST /api/survey/alliance — Save therapeutic alliance survey result

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ============================================
// Schema Validation
// ============================================

const AllianceSurveySchema = z.object({
  understanding: z.number().min(1).max(5),
  trust: z.number().min(1).max(5),
  helpfulness: z.number().min(1).max(5),
  feedback: z.string().optional().nullable(),
})

// ============================================
// POST /api/survey/alliance
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate input
    const body = await request.json()
    const validation = AllianceSurveySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { understanding, trust, helpfulness, feedback } = validation.data

    // 3. Count total sessions for this user
    const totalSessions = await prisma.session.count({
      where: { userId: user.id },
    })

    // 4. Create AllianceSurvey
    const survey = await prisma.allianceSurvey.create({
      data: {
        userId: user.id,
        sessionNumber: totalSessions,
        understanding,
        trust,
        helpfulness,
        feedback: feedback || null,
      },
    })

    return NextResponse.json({
      id: survey.id,
      sessionNumber: survey.sessionNumber,
      understanding: survey.understanding,
      trust: survey.trust,
      helpfulness: survey.helpfulness,
      feedback: survey.feedback,
      createdAt: survey.createdAt,
    })
  } catch (error) {
    console.error('[POST /api/survey/alliance] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
