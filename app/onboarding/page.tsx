'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Volume2, Shield, ArrowRight, Check, User } from 'lucide-react'

type VoiceOption = {
  id: string
  label: string
  description: string
  gender: 'male' | 'female' | 'neutral'
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'warm-calm',
    label: 'Warm & Calm',
    description: 'Reassuring and steady voice',
    gender: 'male',
  },
  {
    id: 'soft-gentle',
    label: 'Soft & Gentle',
    description: 'Soothing and compassionate voice',
    gender: 'female',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    description: 'Balanced and friendly voice',
    gender: 'neutral',
  },
]

const AGE_GROUPS = ['18–25', '26–35', '36–45', '45+']
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'not_specified', label: 'Prefer not to say' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1 — About You
  const [preferredName, setPreferredName] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [userGender, setUserGender] = useState('')

  // Step 2 — Companion Name
  const [companionName, setCompanionName] = useState('')

  // Step 3 — Voice
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAboutYouSubmit = () => {
    if (!preferredName.trim() || !ageGroup || !userGender) return
    setStep(2)
  }

  const handleNameSubmit = () => {
    if (!companionName.trim()) return
    setStep(3)
  }

  const handleVoiceSelect = (voice: VoiceOption) => {
    setSelectedVoice(voice)
    setStep(4)
  }

  const handleFinish = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredName: preferredName.trim(),
          ageGroup,
          userGender,
          companionName: companionName.trim(),
          voicePreference: selectedVoice?.id,
          companionGender: selectedVoice?.gender,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-indigo-600'
                  : s < step
                  ? 'w-2 bg-indigo-400'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step 1 — About You */}
        {step === 1 && (
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl">First, tell us about yourself</CardTitle>
              <CardDescription className="text-base mt-2">
                This helps your companion connect with you better
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What should your companion call you?
                </label>
                <Input
                  type="text"
                  placeholder="Your name or nickname"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAboutYouSubmit()}
                  className="h-12"
                  maxLength={30}
                  autoFocus
                />
              </div>

              {/* Age Group */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your age group
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AGE_GROUPS.map((age) => (
                    <button
                      key={age}
                      onClick={() => setAgeGroup(age)}
                      className={`p-3 border-2 rounded-lg text-center font-medium transition-all ${
                        ageGroup === age
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  I identify as
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setUserGender(option.value)}
                      className={`p-3 border-2 rounded-lg text-center font-medium transition-all ${
                        userGender === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300 text-gray-700'
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
                className="w-full h-12 text-base"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Companion Name */}
        {step === 2 && (
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl">Choose your companion's name</CardTitle>
              <CardDescription className="text-base mt-2">
                What would you like to call your companion?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Alex"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="text-center text-xl h-14"
                  maxLength={20}
                  autoFocus
                />
                <p className="text-sm text-gray-500 text-center mt-2">
                  You can always change this later in Settings
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleNameSubmit}
                  disabled={!companionName.trim()}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  ← Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Voice Selection */}
        {step === 3 && (
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Choose {companionName}'s voice</CardTitle>
              <CardDescription className="text-base mt-2">
                Pick a voice that feels right for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice)}
                  className="w-full p-4 border-2 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                        {voice.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{voice.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </button>
              ))}

              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                className="w-full mt-4"
              >
                ← Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Disclaimer */}
        {step === 4 && (
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Before we begin...</CardTitle>
              <CardDescription className="text-base mt-2">
                A few important things to know
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {companionName} is not a therapist
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      This is a supportive companion, not a replacement for professional mental health care.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Your conversations are private</p>
                    <p className="text-sm text-gray-600 mt-1">
                      All conversations are encrypted and stored securely. We never share your data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Crisis support is available</p>
                    <p className="text-sm text-gray-600 mt-1">
                      If you're in crisis, we'll immediately provide emergency resources.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{companionName} learns about you</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Every conversation helps {companionName} understand you better over time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isSubmitting ? 'Setting up...' : `Start talking with ${companionName}`}
                  {!isSubmitting && <MessageCircle className="w-4 h-4 ml-2" />}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep(3)}
                  className="w-full"
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
