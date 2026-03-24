import { NextRequest, NextResponse } from 'next/server'
import { getDodo, DODO_PRODUCTS } from '@/lib/dodo/client'

// Временный тестовый endpoint — удалить после проверки
export async function GET(request: NextRequest) {
  try {
    const dodo = getDodo()
    const proId = DODO_PRODUCTS.pro
    
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: proId, quantity: 1 }],
      customer: {
        email: 'test@example.com',
        name: 'Test User',
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://confide-app-mu.vercel.app'}/dashboard/chat?upgraded=true`,
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.checkout_url,
      productId: proId,
      env_set: !!process.env.DODO_PAYMENTS_API_KEY,
      key_length: process.env.DODO_PAYMENTS_API_KEY?.length || 0,
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || String(err),
      status: err?.status,
      env_set: !!process.env.DODO_PAYMENTS_API_KEY,
      key_length: process.env.DODO_PAYMENTS_API_KEY?.length || 0,
      product_pro: DODO_PRODUCTS.pro,
      product_premium: DODO_PRODUCTS.premium,
    }, { status: 500 })
  }
}
