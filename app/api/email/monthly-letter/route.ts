// POST /api/email/monthly-letter — Manual monthly letter sending
// For testing purposes — allows users to manually trigger monthly letter

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateMonthSummary } from '@/lib/diary/summary-generator';
import { sendMonthlyLetter } from '@/lib/email/send-monthly-letter';
import { z } from 'zod';

// ============================================
// VALIDATION
// ============================================

const RequestSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

// ============================================
// POST HANDLER
// ============================================

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { month, year } = validation.data;

    // Get user profile
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true,
        companionName: true,
        profile: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch sessions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'No sessions found for this month' },
        { status: 404 }
      );
    }

    // Generate month summary
    const monthSummary = await generateMonthSummary(
      sessions.map((s) => ({
        summary: s.summary || 'No summary available',
        moodScore: s.moodBefore || undefined,
        agentType: s.agentType,
        createdAt: s.createdAt,
      })),
      dbUser.companionName,
      dbUser.profile
        ? {
            communicationStyle: dbUser.profile.communicationStyle as Record<string, any>,
            emotionalProfile: dbUser.profile.emotionalProfile as any,
            lifeContext: dbUser.profile.lifeContext as any,
            patterns: dbUser.profile.patterns as string[],
            progress: dbUser.profile.progress as Record<string, any>,
            whatWorked: dbUser.profile.whatWorked as string[],
          }
        : undefined
    );

    // Send monthly letter
    const emailResult = await sendMonthlyLetter({
      userEmail: dbUser.email,
      userName: dbUser.email.split('@')[0],
      companionName: dbUser.companionName,
      monthSummary,
      month,
      year,
      diaryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/journal`,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Monthly letter sent to ${dbUser.email}`,
      emailId: emailResult.emailId,
    });
  } catch (error) {
    console.error('[MONTHLY_LETTER_API_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send monthly letter' },
      { status: 500 }
    );
  }
}
