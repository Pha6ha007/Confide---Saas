'use client'

import { DodoCheckout } from '@/components/billing/DodoCheckout'

export function UpgradeButton() {
  return (
    <DodoCheckout
      productId={process.env.NEXT_PUBLIC_DODO_PRODUCT_PRO_ID!}
      planName="Pro"
      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white hover:shadow-lg transition-all hover:scale-[1.02]"
    >
      Upgrade to Pro
    </DodoCheckout>
  )
}
