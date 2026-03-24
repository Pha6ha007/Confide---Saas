import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getDodo, DODO_PRODUCTS } from '@/lib/dodo/client'

const RequestSchema = z.object({
  productId: z.string().min(1),
})

// Создаёт Dodo Payments checkout session и возвращает checkout URL
export async function POST(request: NextRequest) {
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
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { productId } = parsed.data

  // 3. Проверить что productId валидный (один из наших)
  const validProductIds = [DODO_PRODUCTS.pro, DODO_PRODUCTS.premium]
  if (!validProductIds.includes(productId)) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  // 4. Получить данные пользователя из БД
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, plan: true },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 5. Проверить что пользователь не подписан на этот план
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })

  if (subscription?.status === 'active') {
    return NextResponse.json(
      { error: 'Already subscribed. Manage your subscription in settings.' },
      { status: 409 }
    )
  }

  // 6. Создать Dodo Payments checkout session
  try {
    const dodo = getDodo()
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: dbUser.email,
        name: dbUser.email.split('@')[0],
      },
      metadata: { userId: user.id },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/chat?upgraded=true`,
    })

    // Возвращаем URL для редиректа на hosted checkout
    return NextResponse.json({
      checkoutUrl: session.checkout_url,
    })
  } catch (err: any) {
    console.error('Dodo checkout creation error:', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
