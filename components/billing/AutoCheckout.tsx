'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { initializePaddle, Paddle } from '@paddle/paddle-js'

const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
  premium: process.env.NEXT_PUBLIC_PADDLE_PREMIUM_PRICE_ID,
}

/**
 * Монтируется в dashboard layout.
 * Если в URL есть ?checkout=pro или ?checkout=premium —
 * автоматически открывает Paddle checkout overlay.
 */
export function AutoCheckout() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const plan = searchParams.get('checkout') // 'pro' | 'premium'
  const hasTriggered = useRef(false)
  const [paddle, setPaddle] = useState<Paddle | null>(null)

  // Инициализируем Paddle
  useEffect(() => {
    if (!plan) return
    initializePaddle({
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' ? 'sandbox' : 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      eventCallback(event) {
        if (event.name === 'checkout.completed') {
          // Убираем ?checkout из URL и обновляем страницу
          router.replace(pathname)
          router.refresh()
        }
      },
    }).then((instance) => {
      if (instance) setPaddle(instance)
    })
  }, [plan, pathname, router])

  // Открываем checkout как только Paddle готов
  useEffect(() => {
    if (!paddle || !plan || hasTriggered.current) return
    const priceId = PLAN_PRICE_MAP[plan]
    if (!priceId) return

    hasTriggered.current = true

    const openCheckout = async () => {
      try {
        const res = await fetch('/api/billing/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        })
        if (!res.ok) return

        const { priceId: confirmedPriceId, customerEmail, customData } = await res.json()
        await paddle.Checkout.open({
          items: [{ priceId: confirmedPriceId, quantity: 1 }],
          customer: { email: customerEmail },
          customData,
        })
      } catch {
        // Тихо игнорируем — пользователь может вручную перейти в settings
      } finally {
        // Убираем ?checkout из URL в любом случае
        router.replace(pathname)
      }
    }

    openCheckout()
  }, [paddle, plan, pathname, router])

  return null
}
