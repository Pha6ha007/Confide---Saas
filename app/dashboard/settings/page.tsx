import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, MessageCircle, Globe, CreditCard, LogOut } from 'lucide-react'
import { CompanionNameEditor } from '@/components/settings/CompanionNameEditor'

const prisma = new PrismaClient()

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
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
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
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle>Companion Settings</CardTitle>
              <CardDescription>Your AI companion preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="text-sm font-medium text-gray-500">Companion Voice</label>
                <p className="text-base text-gray-900 mt-1 capitalize">{dbUser.companionGender}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Language and regional settings</CardDescription>
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
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan and billing</CardDescription>
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
                <Button variant="default" disabled>
                  Upgrade (Coming Soon)
                </Button>
              )}
              {dbUser.plan !== 'free' && (
                <Button variant="outline" disabled>
                  Manage Subscription (Coming Soon)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>End your current session</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button variant="outline" type="submit" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
