// POST /api/diary/generate — Generate monthly diary PDF
// Creates diary entry in DB and generates PDF asynchronously

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateDiaryForUser } from '@/lib/diary/service';
import { format } from 'date-fns';

const DiaryGenerateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

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

    // Parse and validate request body
    const body = await req.json();
    const validation = DiaryGenerateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid month or year. Month must be 1-12.' },
        { status: 400 }
      );
    }

    const { month, year } = validation.data;

    // Get user profile
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        companionName: true,
        email: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if diary already exists
    const existingDiary = await prisma.diary.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year,
        },
      },
    });

    if (existingDiary && existingDiary.status === 'ready') {
      return NextResponse.json({
        diary: existingDiary,
        message: 'Diary already exists',
      });
    }

    // Create or update diary entry with "generating" status
    const diary = await prisma.diary.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month,
          year,
        },
      },
      create: {
        userId: user.id,
        month,
        year,
        title: `${format(new Date(year, month - 1), 'MMMM yyyy')} — Your Journey`,
        status: 'generating',
      },
      update: {
        status: 'generating',
        errorMessage: null,
      },
    });

    // Generate PDF asynchronously (don't await — background job)
    generateDiaryInBackground(user.id, month, year);

    return NextResponse.json({
      diary,
      message: 'Diary generation started',
    });
  } catch (error) {
    console.error('[DIARY_GENERATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to generate diary' },
      { status: 500 }
    );
  }
}

// ============================================
// BACKGROUND GENERATION
// ============================================

async function generateDiaryInBackground(userId: string, month: number, year: number) {
  // Fire and forget — use service layer
  generateDiaryForUser(userId, month, year);
}
