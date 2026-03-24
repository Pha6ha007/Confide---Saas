import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, MessageCircle, Globe, CreditCard, LogOut } from 'lucide-react'
import { CompanionNameEditor } from '@/components/settings/CompanionNameEditor'
import { VoiceCard } from '@/components/settings/VoiceCard'
import { ManageSubscriptionButton } from '@/components/billing/ManageSubscriptionButton'
import { UpgradeButton } from '@/components/billing/UpgradeButton'



async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SettingsPage() {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Получить полный профиль из БД
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  })

  if (!dbUser) {
    redirect('/login')
  }

  const planLabels = {
    free: 'Free',
    pro: 'Pro',
    premium: 'Premium',
  }

  const languageLabels = {
    en: 'English',
    ru: 'Русский',
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">Account Information</CardTitle>
              <CardDescription className="text-base mt-1">Your basic account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-base text-gray-900 mt-1">{dbUser.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Created</label>
              <p className="text-base text-gray-900 mt-1">
                {new Date(dbUser.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {dbUser.preferredName && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-500">Your Name</label>
                <p className="text-base text-gray-900 mt-1">{dbUser.preferredName}</p>
              </div>
              {dbUser.ageGroup && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Age Group</label>
                  <p className="text-base text-gray-900 mt-1">{dbUser.ageGroup}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Companion Settings */}
      <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">Companion Settings</CardTitle>
              <CardDescription className="text-base mt-1">Your AI companion preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">
              Your Companion's Name
            </label>
            <CompanionNameEditor initialName={dbUser.companionName || 'Alex'} />
            <p className="text-xs text-gray-500 mt-2">
              This is how your companion will introduce themselves
            </p>
          </div>

          {dbUser.companionGender && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-3 block">
                Voice Settings
              </label>
              <VoiceCard
                companionName={dbUser.companionName || 'Alex'}
                companionGender={dbUser.companionGender as 'male' | 'female'}
                voiceId={dbUser.voiceId}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">Preferences</CardTitle>
              <CardDescription className="text-base mt-1">Language and regional settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Language</label>
            <p className="text-base text-gray-900 mt-1">
              {languageLabels[dbUser.language as keyof typeof languageLabels] || dbUser.language}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">Subscription</CardTitle>
              <CardDescription className="text-base mt-1">Your current plan and billing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Current Plan</label>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-semibold text-gray-900">
                  {planLabels[dbUser.plan as keyof typeof planLabels] || dbUser.plan}
                </span>
                {dbUser.plan === 'free' && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    5 messages / 10 min
                  </span>
                )}
                {dbUser.plan === 'pro' && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    30 messages / 10 min
                  </span>
                )}
                {dbUser.plan === 'premium' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    60 messages / 10 min
                  </span>
                )}
              </div>
              {dbUser.plan === 'free' && (
                <UpgradeButton />
              )}
              {dbUser.plan !== 'free' && (
                <ManageSubscriptionButton />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Alex - AI Transparency */}
      <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">About {dbUser.companionName || 'Alex'}</CardTitle>
              <CardDescription className="text-base mt-1">
                Understanding your AI companion
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {dbUser.companionName || 'Alex'} is an AI companion — not a therapist, not a replacement
              for professional mental health care. Think of this as a space to think out loud, process
              your thoughts, and explore what's going on inside.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>What {dbUser.companionName || 'Alex'} can do:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li>Listen without judgment, remember your story</li>
              <li>Help you think through challenges using evidence-based techniques</li>
              <li>Offer psychological insights grounded in real research</li>
              <li>Be available 24/7 when you need to talk</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>What {dbUser.companionName || 'Alex'} cannot do:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
              <li>Diagnose mental health conditions</li>
              <li>Prescribe medication or provide medical advice</li>
              <li>Replace licensed therapy or crisis intervention</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
              <strong>In crisis?</strong> If you're in immediate danger, please contact emergency
              services or a crisis hotline in your country. This is support, not emergency care.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="glass-button border border-white/20 shadow-large rounded-2xl transition-smooth hover-lift">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">Sign Out</CardTitle>
              <CardDescription className="text-base mt-1">End your current session</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button variant="outline" type="submit" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-smooth hover:scale-[1.02]">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
