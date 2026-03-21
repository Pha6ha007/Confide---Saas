'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Shield, ArrowRight, Check, User, Sparkles, Crown } from 'lucide-react'
import { VoiceQuiz } from '@/components/onboarding/VoiceQuiz'
import { getDefaultVoiceId } from '@/lib/voices/config'

const AGE_GROUPS = ['18–25', '26–35', '36–45', '45+']
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'not_specified', label: 'Prefer not to say' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [isLoadingPlan, setIsLoadingPlan] = useState(true)

  // Step 1 — About You
  const [preferredName, setPreferredName] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [userGender, setUserGender] = useState('')

  // Voice Quiz data (для PRO/PREMIUM)
  const [voiceQuizData, setVoiceQuizData] = useState<{
    companionGender: 'male' | 'female'
    companionName: string
    voiceKey: string
    voiceId: string
  } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Загрузить план пользователя при монтировании
  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.plan || 'free')
        }
      } catch (error) {
        console.error('Failed to fetch user plan:', error)
      } finally {
        setIsLoadingPlan(false)
      }
    }
    fetchUserPlan()
  }, [])

  const isPaidPlan = userPlan === 'pro' || userPlan === 'premium'

  const handleAboutYouSubmit = () => {
    if (!preferredName.trim() || !ageGroup || !userGender) return
    setStep(2)
  }

  const handleVoiceQuizComplete = (data: {
    companionGender: 'male' | 'female'
    companionName: string
    voiceKey: string
    voiceId: string
  }) => {
    setVoiceQuizData(data)
    setStep(3) // Переход к дисклеймеру
  }

  const handleFinish = async () => {
    setIsSubmitting(true)

    try {
      // Для FREE плана — дефолтные значения
      const companionName = isPaidPlan && voiceQuizData
        ? voiceQuizData.companionName
        : 'Alex'

      const companionGender = isPaidPlan && voiceQuizData
        ? voiceQuizData.companionGender
        : 'male'

      const voiceId = isPaidPlan && voiceQuizData
        ? voiceQuizData.voiceId
        : getDefaultVoiceId('male')

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredName: preferredName.trim(),
          ageGroup,
          userGender,
          companionName,
          companionGender,
          voicePreference: voiceId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save onboarding data')
      }

      // Редирект на чат
      router.push('/dashboard/chat')
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Показать лоадер пока загружаем план
  if (isLoadingPlan) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="mesh-gradient fixed inset-0 -z-10" />
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
        </div>

        <div className="text-center glass-button px-8 py-6 rounded-2xl">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-foreground font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient fixed inset-0 -z-10" />

      {/* Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#F59E0B] rounded-full blur-orb animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-12 bg-primary shadow-card'
                  : s < step
                  ? 'w-2.5 bg-primary/60'
                  : 'w-2.5 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Step 1 — About You */}
        {step === 1 && (
          <Card className="glass-button border border-white/20 shadow-large rounded-2xl animate-fade-in-up hover-lift">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="font-serif text-3xl font-semibold">First, tell us about yourself</CardTitle>
              <CardDescription className="text-base mt-3 text-muted-foreground">
                This helps your companion connect with you better
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Name */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  What should your companion call you?
                </label>
                <Input
                  type="text"
                  placeholder="Your name or nickname"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAboutYouSubmit()}
                  className="h-12 rounded-lg focus:ring-2 focus:ring-primary transition-smooth"
                  maxLength={30}
                  autoFocus
                />
              </div>

              {/* Age Group */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Your age group
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AGE_GROUPS.map((age) => (
                    <button
                      key={age}
                      onClick={() => setAgeGroup(age)}
                      className={`p-3 border-2 rounded-xl text-center font-medium transition-smooth ${
                        ageGroup === age
                          ? 'border-primary bg-primary/10 text-primary shadow-subtle'
                          : 'border-border hover:border-primary/50 text-foreground hover:shadow-subtle'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  I identify as
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setUserGender(option.value)}
                      className={`p-3 border-2 rounded-xl text-center font-medium transition-smooth ${
                        userGender === option.value
                          ? 'border-primary bg-primary/10 text-primary shadow-subtle'
                          : 'border-border hover:border-primary/50 text-foreground hover:shadow-subtle'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAboutYouSubmit}
                disabled={!preferredName.trim() || !ageGroup || !userGender}
                className="w-full h-12 text-base rounded-xl transition-smooth hover:scale-[1.02] shadow-card hover:shadow-large"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Voice Setup (зависит от плана) */}
        {step === 2 && (
          <>
            {isPaidPlan ? (
              /* PRO/PREMIUM: Voice Design Quiz */
              <VoiceQuiz
                onComplete={handleVoiceQuizComplete}
                onBack={() => setStep(1)}
              />
            ) : (
              /* FREE: Баннер с апгрейдом */
              <Card className="glass-button border border-white/20 shadow-large rounded-2xl animate-fade-in-up hover-lift">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-serif text-3xl font-semibold">Meet Alex, your companion</CardTitle>
                  <CardDescription className="text-base mt-3 text-muted-foreground">
                    On the free plan, you'll have Alex as your default companion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Info about Alex */}
                  <div className="bg-muted/50 rounded-xl p-6 text-center">
                    <p className="text-foreground leading-relaxed">
                      Alex is a supportive, empathetic companion with a calm, reassuring voice.
                      He's here to listen and help you navigate your thoughts and feelings.
                    </p>
                  </div>

                  {/* Upgrade Banner */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-warm/30 shadow-card">
                    <div className="flex items-start space-x-3">
                      <Crown className="w-6 h-6 text-warm mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-serif font-semibold text-foreground text-xl">
                          Upgrade to Pro for full customization
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-foreground">
                          <li className="flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-warm" />
                            Choose your companion's gender and name
                          </li>
                          <li className="flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-warm" />
                            Select from multiple unique voices
                          </li>
                          <li className="flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-warm" />
                            Unlimited conversations
                          </li>
                        </ul>
                        <Button
                          className="w-full mt-4 rounded-xl transition-smooth hover:scale-[1.02] shadow-card"
                          variant="default"
                          onClick={() => router.push('/#pricing')}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Continue with Free */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => setStep(3)}
                      variant="outline"
                      className="w-full h-12 text-base rounded-xl transition-smooth hover:shadow-subtle"
                      size="lg"
                    >
                      Continue with Alex (Free)
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="w-full rounded-xl transition-smooth hover:bg-muted"
                    >
                      ← Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Step 3 — Disclaimer */}
        {step === 3 && (
          <Card className="glass-button border border-white/20 shadow-large rounded-2xl animate-fade-in-up hover-lift">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="font-serif text-3xl font-semibold">Before we begin...</CardTitle>
              <CardDescription className="text-base mt-3 text-muted-foreground">
                A few important things to know
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 bg-muted/50 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {isPaidPlan && voiceQuizData ? voiceQuizData.companionName : 'Alex'} is not a therapist
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      This is a supportive companion, not a replacement for professional mental health care.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Your conversations are private</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      All conversations are encrypted and stored securely. We never share your data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Crisis support is available</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      If you're in crisis, we'll immediately provide emergency resources.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {isPaidPlan && voiceQuizData ? voiceQuizData.companionName : 'Alex'} learns about you
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Every conversation helps your companion understand you better over time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base rounded-xl transition-smooth hover:scale-[1.02] shadow-card hover:shadow-large"
                  size="lg"
                >
                  {isSubmitting ? 'Setting up...' : `Start talking with ${isPaidPlan && voiceQuizData ? voiceQuizData.companionName : 'Alex'}`}
                  {!isSubmitting && <MessageCircle className="w-4 h-4 ml-2" />}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="w-full rounded-xl transition-smooth hover:bg-muted"
                  disabled={isSubmitting}
                >
                  ← Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
