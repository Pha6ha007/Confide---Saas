'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2, Star, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') // 'pro' | 'premium' | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const callbackUrl = plan
        ? `${window.location.origin}/auth/callback?plan=${plan}`
        : `${window.location.origin}/auth/callback`

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
        },
      })

      if (signUpError) {
        // Более дружелюбное сообщение для распространённых ошибок
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setError('This email is already registered. Please sign in instead.')
        } else {
          setError(signUpError.message)
        }
        setIsLoading(false)
        return
      }

      // Success — показать сообщение о проверке email
      setSuccessMessage(
        `We sent a confirmation email to ${email}. Please check your inbox and click the link to verify your account.`
      )
      setIsLoading(false)
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient fixed inset-0 -z-10" />

      {/* Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#F59E0B] rounded-full blur-orb animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Back to home */}
      <Link href="/" className="fixed top-6 left-6 flex items-center space-x-2 text-[#6B7280] hover:text-[#6366F1] transition-smooth z-50">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to home</span>
      </Link>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6"
      >
        <div className="glass-button rounded-3xl p-8 lg:p-10 shadow-large">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-serif font-bold text-3xl">C</span>
            </div>
          </div>

          {/* Plan banner */}
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
                plan === 'premium'
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-indigo-50 border border-indigo-200'
              }`}
            >
              {plan === 'premium' ? (
                <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
              ) : (
                <Zap className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              )}
              <p className={`text-sm font-medium ${plan === 'premium' ? 'text-amber-900' : 'text-indigo-900'}`}>
                You selected the <strong>{plan === 'premium' ? 'Premium $29/mo' : 'Pro $19/mo'}</strong> plan.
                Create an account to continue.
              </p>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#1F2937] mb-2">
              {plan ? 'Create your account' : 'Start for free'}
            </h1>
            <p className="text-[#6B7280]">
              {plan ? 'After verification, your plan will activate automatically' : 'Create your account — no credit card required'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 rounded-xl bg-green-50 border border-green-200"
            >
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">Check your email!</h3>
                  <p className="text-sm text-green-800 leading-relaxed">{successMessage}</p>
                  <p className="text-xs text-green-700 mt-3">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className="font-semibold hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && !successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  {error.includes('already registered') && (
                    <Link href="/login" className="text-sm text-[#6366F1] font-semibold hover:underline mt-2 inline-block">
                      Go to sign in →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Register Form - скрыть если успешно зарегистрирован */}
          {!successMessage && (
            <form onSubmit={handleRegister} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 py-6 rounded-xl border-[#E5E7EB] focus:border-[#6366F1] focus:ring-[#6366F1]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-12 py-6 rounded-xl border-[#E5E7EB] focus:border-[#6366F1] focus:ring-[#6366F1]"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-12 py-6 rounded-xl border-[#E5E7EB] focus:border-[#6366F1] focus:ring-[#6366F1]"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="text-xs text-[#6B7280] leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-[#6366F1] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#6366F1] hover:underline">
                Privacy Policy
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#EC4899] hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
          )}

          {/* Divider и Google Sign Up - только если нет success message */}
          {!successMessage && (
            <>
              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-[#E5E7EB]"></div>
                <span className="px-4 text-sm text-[#9CA3AF]">or</span>
                <div className="flex-1 border-t border-[#E5E7EB]"></div>
              </div>

              {/* Google Sign Up */}
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const supabase = createClient()
                  const oauthCallback = plan
                    ? `${window.location.origin}/auth/callback?plan=${plan}`
                    : `${window.location.origin}/auth/callback`
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: oauthCallback,
                    },
                  })
                }}
                className="w-full py-6 rounded-xl font-semibold border-[#E5E7EB] hover:bg-white/50 transition-all mb-8"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              {/* Medical Disclaimer */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-semibold">Important:</strong> Confide is an AI companion for emotional support, not a medical service.
                  We do not diagnose, treat, or provide medical advice.
                  If you're experiencing a mental health emergency, please contact a licensed professional or crisis hotline immediately.
                </p>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-[#6B7280]">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#6366F1] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
