// GET /api/diary/list — Get all diaries for current user

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all diaries for user
    const diaries = await prisma.diary.findMany({
      where: { userId: user.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return NextResponse.json({ diaries });
  } catch (error) {
    console.error('[DIARY_LIST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch diaries' },
      { status: 500 }
    );
  }
}
