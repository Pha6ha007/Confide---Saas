import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { MessageSquare, BookOpen, TrendingUp, Settings, LogOut, Crown, Sparkles } from 'lucide-react'
import InstallPrompt from '@/components/pwa/InstallPrompt'

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user plan from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  })

  const userPlan = dbUser?.plan || 'free'

  const navigation = [
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Journal', href: '/dashboard/journal', icon: BookOpen },
    { name: 'Exercises', href: '/dashboard/exercises', icon: Sparkles },
    { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient fixed inset-0 -z-10" />

      {/* Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#F59E0B] rounded-full blur-orb animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glassmorphism Sidebar */}
      <div className="w-64 glass border-r border-white/20 flex flex-col shadow-large relative z-10">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center space-x-2 transition-smooth hover:opacity-90 hover-lift">
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
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  )
}
