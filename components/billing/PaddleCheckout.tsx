'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { initializePaddle, Paddle } from '@paddle/paddle-js'

interface PaddleCheckoutProps {
  priceId: string
  planName: string
  children: React.ReactNode
  className?: string
  onSuccess?: () => void
}

export function PaddleCheckout({
  priceId,
  planName,
  children,
  className,
  onSuccess,
}: PaddleCheckoutProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Флаг что checkout реально открыт нами — не принимаем события от кэша
  const checkoutOpenedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    initializePaddle({
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' ? 'sandbox' : 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      eventCallback(event) {
        if (event.name === 'checkout.completed' && checkoutOpenedRef.current) {
          checkoutOpenedRef.current = false
          onSuccess?.()
        }
      },
    }).then((instance) => {
      if (instance) setPaddle(instance)
    })
  }, [onSuccess])

  const handleClick = async () => {
    if (!paddle || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (res.status === 401) {
        // Не авторизован — редирект на регистрацию с планом
        router.push(`/register?plan=${planName.toLowerCase()}`)
        return
      }

      if (res.status === 409) {
        // Уже подписан — редирект в настройки
        router.push('/dashboard/settings')
        return
      }

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Something went wrong')
        return
      }

      const { priceId: confirmedPriceId, customerEmail, customData } = await res.json()

      // Помечаем что мы сами открыли checkout
      checkoutOpenedRef.current = true

      await paddle.Checkout.open({
        items: [{ priceId: confirmedPriceId, quantity: 1 }],
        customer: { email: customerEmail },
        customData,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading || !paddle} className={className}>
        {loading ? 'Loading...' : children}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}
