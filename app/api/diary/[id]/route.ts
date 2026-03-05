// GET /api/diary/[id] — Get specific diary by ID

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch diary
    const diary = await prisma.diary.findUnique({
      where: { id },
    });

    if (!diary) {
      return NextResponse.json({ error: 'Diary not found' }, { status: 404 });
    }

    // Verify ownership
    if (diary.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ diary });
  } catch (error) {
    console.error('[DIARY_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch diary' },
      { status: 500 }
    );
  }
}
