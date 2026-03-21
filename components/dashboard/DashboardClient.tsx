'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
  Crown,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import type { User } from '@supabase/supabase-js'

interface DashboardClientProps {
  user: User
  userPlan: string
  signOut: () => Promise<void>
  children: React.ReactNode
}

const navigation = [
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Journal', href: '/dashboard/journal', icon: BookOpen },
  { name: 'Exercises', href: '/dashboard/exercises', icon: Sparkles },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardClient({
  user,
  userPlan,
  signOut,
  children,
}: DashboardClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient fixed inset-0 -z-10" />

      {/* Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#F59E0B] rounded-full blur-orb animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass border-b border-white/20 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl hover:bg-white/30 transition-smooth"
        >
          <Menu className="w-6 h-6 text-[#6366F1]" />
        </button>
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-serif font-bold text-lg text-white">C</span>
          </div>
          <span className="font-serif text-xl font-semibold text-[#1F2937]">Confide</span>
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Backdrop Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Glassmorphism Sidebar - Hidden on mobile by default, visible on desktop */}
      <div
        className={`
          ${isSidebarOpen ? 'flex' : 'hidden md:flex'}
          fixed md:relative inset-y-0 left-0 z-50 md:z-10
          w-64 glass border-r border-white/20 flex-col shadow-large
        `}
      >
            {/* Close Button (Mobile Only) */}
            <div className="md:hidden absolute top-4 right-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-white/30 transition-smooth"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <Link
                href="/"
                className="flex items-center space-x-2 transition-smooth hover:opacity-90 hover-lift"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg flex items-center justify-center shadow-lg">
                  <span className="font-serif font-bold text-lg text-white">C</span>
                </div>
                <span className="font-serif text-xl font-semibold text-[#1F2937]">Confide</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-[#4B5563] rounded-xl hover:bg-white/30 transition-smooth group backdrop-blur-sm"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-smooth text-[#6366F1]" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User & Sign Out */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-full flex items-center justify-center shadow-lg hover-lift">
                  <span className="font-serif font-semibold text-white text-lg">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1F2937] text-sm truncate">{user.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {userPlan === 'free' && (
                      <span className="text-xs bg-white/50 text-[#6B7280] px-2 py-0.5 rounded-full">
                        Free
                      </span>
                    )}
                    {userPlan === 'pro' && (
                      <span className="text-xs bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-white px-2 py-0.5 rounded-full flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </span>
                    )}
                    {userPlan === 'premium' && (
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-0.5 rounded-full flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <form action={signOut}>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/30 border-white/30 text-[#1F2937] hover:bg-white/50 transition-smooth backdrop-blur-sm"
                  type="submit"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="w-full h-full">
          {children}
        </div>
      </main>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  )
}
