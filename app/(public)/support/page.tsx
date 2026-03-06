'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Heart, Copy, Check, Gift, Share2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DONATION_ADDRESSES } from '@/lib/constants/donation'

export default function SupportPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const copyToClipboard = async (address: string, label: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      toast.success(`${label} address copied!`)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient fixed inset-0 -z-10" />

      {/* Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-2 md:py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover-lift transition-smooth hover:opacity-90">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-serif font-bold text-lg md:text-xl">C</span>
              </div>
              <span className="font-serif text-xl md:text-2xl font-semibold text-[#1F2937]">Confide</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/#pricing">
                <Button variant="ghost" className="text-[#1F2937] hover:bg-white/30 transition-smooth text-sm md:text-base">
                  Pricing
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-[#1F2937] hover:bg-white/30 transition-smooth text-sm md:text-base">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white hover-lift shadow-lg text-sm md:text-base">
                  Start for free
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 glass-button px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4 text-[#EC4899]" />
            <span className="text-[#1F2937]">Support Our Mission</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-4">
            Help Us <span className="gradient-text">Keep Confide Free</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto">
            Your support helps us make mental health support accessible to everyone.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-button p-8 md:p-12 rounded-3xl mb-12"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1F2937] mb-6">Our Mission</h2>
          <div className="space-y-4 text-[#6B7280] leading-relaxed">
            <p>
              Confide is built on the belief that everyone deserves access to mental health support — regardless of their financial situation.
            </p>
            <p>
              We're a solo developer project, built with passion and purpose. Your donations help us:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Keep the free tier generous and accessible</li>
              <li>Cover infrastructure costs (AI, hosting, databases)</li>
              <li>Add new features and improve the experience</li>
              <li>Maintain 24/7 crisis support for all users</li>
              <li>Expand to more languages and communities</li>
            </ul>
            <p className="pt-4 border-t border-white/20 mt-6">
              <strong className="text-[#1F2937]">100% of donations go directly to keeping Confide running.</strong> No investors. No VC pressure. Just a mission to help people.
            </p>
          </div>
        </motion.div>

        {/* Crypto Addresses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-button p-8 md:p-12 rounded-3xl mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1F2937] mb-4">
              Donate via Crypto
            </h2>
            <p className="text-[#6B7280]">
              Support us with cryptocurrency — fast, secure, and decentralized.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(DONATION_ADDRESSES).map(([key, crypto]) => (
              <div key={key} className="glass-button p-6 rounded-2xl space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center text-2xl">
                    {crypto.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1F2937]">{crypto.label}</h3>
                    <p className="text-xs text-[#9CA3AF]">{crypto.network}</p>
                  </div>
                </div>

                <div className="bg-white/50 rounded-xl p-3 break-all text-sm text-[#1F2937] font-mono">
                  {crypto.address}
                </div>

                <Button
                  onClick={() => copyToClipboard(crypto.address, crypto.label)}
                  className="w-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white hover-lift shadow-lg"
                >
                  {copiedAddress === crypto.address ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl">
            <p className="text-sm text-[#6B7280] text-center">
              <strong className="text-[#F59E0B]">Important:</strong> Always double-check the address and network before sending. Crypto transactions are irreversible.
            </p>
          </div>
        </motion.div>

        {/* Other Ways to Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-button p-8 md:p-12 rounded-3xl"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1F2937] mb-8 text-center">
            Other Ways to Help
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Share with Others */}
            <div className="glass-button p-6 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-2xl flex items-center justify-center mx-auto">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1F2937]">Share with Others</h3>
              <p className="text-sm text-[#6B7280]">
                Tell friends, family, or your community about Confide. Every new user helps us grow our mission.
              </p>
            </div>

            {/* Give Feedback */}
            <div className="glass-button p-6 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-2xl flex items-center justify-center mx-auto">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1F2937]">Give Feedback</h3>
              <p className="text-sm text-[#6B7280]">
                Your feedback helps us improve. Share your experience, report bugs, or suggest new features.
              </p>
              <Link href="/contact">
                <Button variant="ghost" className="text-[#6366F1] hover:bg-white/30 text-sm">
                  Contact Us →
                </Button>
              </Link>
            </div>

            {/* Upgrade to Pro */}
            <div className="glass-button p-6 rounded-2xl text-center space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-2xl flex items-center justify-center mx-auto">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1F2937]">Upgrade to Pro</h3>
              <p className="text-sm text-[#6B7280]">
                Get unlimited access to all features while supporting the platform's sustainability.
              </p>
              <Link href="/#pricing">
                <Button variant="ghost" className="text-[#6366F1] hover:bg-white/30 text-sm">
                  View Pricing →
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Thank You Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 text-[#6B7280]">
            <Heart className="w-5 h-5 text-[#EC4899] fill-[#EC4899]" />
            <p className="text-lg font-medium">
              Thank you for supporting mental health for all.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/20 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <Link href="/" className="flex items-center space-x-2 transition-smooth hover:opacity-90">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg flex items-center justify-center shadow-lg">
                <span className="font-serif font-bold text-lg text-white">C</span>
              </div>
              <span className="font-serif text-xl font-semibold text-[#1F2937]">Confide</span>
            </Link>

            <p className="text-[#9CA3AF] text-sm">
              © 2026 Confide. AI Emotional Support — Not Medical Service.
            </p>

            <div className="flex items-center space-x-6 text-sm text-[#6B7280]">
              <Link href="/privacy" className="hover:text-[#6366F1] transition-smooth">Privacy</Link>
              <Link href="/terms" className="hover:text-[#6366F1] transition-smooth">Terms</Link>
              <Link href="/refund" className="hover:text-[#6366F1] transition-smooth">Refund</Link>
              <Link href="/contact" className="hover:text-[#6366F1] transition-smooth">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
