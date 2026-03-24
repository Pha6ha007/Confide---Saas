import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getDodo } from '@/lib/dodo/client'

// Создаёт Customer Portal session и возвращает URL
export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Найти подписку пользователя
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })

  if (!subscription?.dodoCustomerId) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 }
    )
  }

  // 3. Создать Customer Portal session через Dodo API
  try {
    const dodo = getDodo()
    const session = await dodo.customers.customerPortal.create(
      subscription.dodoCustomerId
    )

    return NextResponse.json({
      portalUrl: session.link,
    })
  } catch (err: any) {
    console.error('Dodo portal session error:', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
