import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Confide — Someone who truly listens',
  description: 'AI companion for emotional support. Share your thoughts, explore your feelings, and grow in a safe, judgment-free space.',
  manifest: '/manifest.json',
  themeColor: '#6366F1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Confide',
  },
  icons: {
    apple: '/icons/icon-192x192.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${fraunces.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Confide" />
      </head>
      <body className={plusJakartaSans.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
