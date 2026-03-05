// POST /api/diary/generate — Generate monthly diary PDF
// Creates diary entry in DB and generates PDF asynchronously

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateDiaryPDF, DiaryData, DiarySession } from '@/lib/diary/generator';
import { format } from 'date-fns';

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

    // Parse request body
    const { month, year } = await req.json();

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month or year. Month must be 1-12.' },
        { status: 400 }
      );
    }

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
    generateDiaryInBackground(user.id, diary.id, month, year, dbUser.companionName, dbUser.email);

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

async function generateDiaryInBackground(
  userId: string,
  diaryId: string,
  month: number,
  year: number,
  companionName: string,
  userEmail: string
) {
  try {
    // Fetch sessions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (sessions.length === 0) {
      await prisma.diary.update({
        where: { id: diaryId },
        data: {
          status: 'error',
          errorMessage: 'No sessions found for this month',
        },
      });
      return;
    }

    // Transform sessions into DiarySession format
    const diarySessions: DiarySession[] = sessions.map((session) => {
      // Get key dialogues (first 3 user-assistant pairs)
      const keyDialogues: DiarySession['keyDialogues'] = [];
      for (let i = 0; i < Math.min(6, session.messages.length); i++) {
        const msg = session.messages[i];
        keyDialogues.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content.slice(0, 200), // Truncate long messages
        });
      }

      return {
        date: session.createdAt,
        summary: session.summary || 'No summary available',
        keyDialogues,
        insight: extractInsightFromSession(session),
        moodScore: session.moodBefore || undefined,
      };
    });

    // Generate month summary (simplified — can use GPT later)
    const monthSummary = {
      mainThemes: extractMainThemes(sessions),
      progress: 'You engaged in meaningful conversations this month, exploring important aspects of your well-being.',
      whatHelped: [
        'Regular check-ins with Confide',
        'Expressing thoughts and feelings openly',
        'Reflecting on experiences',
      ],
      nextMonthGoals: [
        'Continue regular conversations',
        'Practice techniques discussed',
        'Track mood patterns',
      ],
    };

    // Generate PDF
    const diaryData: DiaryData = {
      userName: userEmail.split('@')[0], // Use email username for now
      companionName,
      month,
      year,
      sessions: diarySessions,
      monthSummary,
    };

    const pdfBuffer = await generateDiaryPDF(diaryData);

    // Upload to Supabase Storage
    const fileName = `${userId}/${year}-${String(month).padStart(2, '0')}-diary.pdf`;
    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from('diaries')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('diaries')
      .getPublicUrl(fileName);

    // Update diary with success
    await prisma.diary.update({
      where: { id: diaryId },
      data: {
        status: 'ready',
        storageUrl: publicUrlData.publicUrl,
      },
    });

    console.log(`[DIARY_GENERATED] ${diaryId} for user ${userId}`);
  } catch (error) {
    console.error('[DIARY_BACKGROUND_ERROR]', error);

    await prisma.diary.update({
      where: { id: diaryId },
      data: {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

// ============================================
// HELPERS
// ============================================

function extractInsightFromSession(session: any): string | undefined {
  // Find journal entries linked to this session
  // For now, return undefined — can enhance later
  return undefined;
}

function extractMainThemes(sessions: any[]): string[] {
  // Simplified: extract from session summaries or agent types
  const themes = new Set<string>();

  sessions.forEach((session) => {
    if (session.agentType) {
      themes.add(session.agentType.charAt(0).toUpperCase() + session.agentType.slice(1));
    }
  });

  return Array.from(themes).slice(0, 5);
}
