'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { DollarSign, Clock, Shield, AlertCircle } from 'lucide-react'

export default function RefundPage() {
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
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-4">
            Refund <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto">
            Fair, transparent, and hassle-free
          </p>
          <p className="text-sm text-[#9CA3AF] mt-4">
            Last updated: March 2026
          </p>
        </motion.div>

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-button p-8 md:p-12 rounded-3xl mb-8"
        >
          <p className="text-[#6B7280] leading-relaxed text-lg">
            We want you to feel confident trying Confide. That's why we offer a straightforward 14-day money-back guarantee.
            If Confide isn't right for you, we'll make it right — no questions asked.
          </p>
        </motion.div>

        {/* Key Points Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* 14-Day Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-button p-6 rounded-2xl"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-2">14-Day Money-Back Guarantee</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Try Confide Pro or Premium risk-free for 14 days. If you're not satisfied for any reason, we'll issue a full refund.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Paddle Merchant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-button p-6 rounded-2xl"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-2">Processed by Paddle</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  All payments and refunds are securely handled by Paddle, our Merchant of Record. You'll receive your refund directly from them.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-button p-8 md:p-12 rounded-3xl mb-8"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1F2937] mb-8">How It Works</h2>

          <div className="space-y-8">
            {/* Section 1 */}
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-3 flex items-center">
                <DollarSign className="w-5 h-5 text-[#6366F1] mr-2" />
                Eligible for Refunds
              </h3>
              <p className="text-[#6B7280] leading-relaxed mb-3">
                You can request a full refund within <strong className="text-[#1F2937]">14 days of your initial purchase</strong> for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#6B7280]">
                <li>Pro plan ($19/month)</li>
                <li>Premium plan ($29/month)</li>
              </ul>
              <p className="text-[#6B7280] leading-relaxed mt-3">
                <strong className="text-[#1F2937]">Important:</strong> The 14-day guarantee applies to your first payment only.
                Renewal payments are not eligible for refunds unless there was a billing error.
              </p>
            </div>

            {/* Section 2 */}
            <div className="pt-6 border-t border-white/20">
              <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-3 flex items-center">
                <Clock className="w-5 h-5 text-[#6366F1] mr-2" />
                Processing Time
              </h3>
              <p className="text-[#6B7280] leading-relaxed">
                Once approved, refunds are processed by Paddle within <strong className="text-[#1F2937]">5-10 business days</strong>.
                The exact timing depends on your payment method and bank.
              </p>
            </div>

            {/* Section 3 */}
            <div className="pt-6 border-t border-white/20">
              <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 text-[#6366F1] mr-2" />
                Not Eligible for Refunds
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#6B7280]">
                <li>
                  <strong className="text-[#1F2937]">Partial refunds:</strong> We don't offer prorated refunds for partial use of a billing period.
                  If you cancel mid-month, you'll retain access until the end of your billing cycle.
                </li>
                <li>
                  <strong className="text-[#1F2937]">Free plan:</strong> The Free plan is always free, so refunds don't apply.
                </li>
                <li>
                  <strong className="text-[#1F2937]">Terms violations:</strong> Accounts suspended for violating our Terms of Service are not eligible for refunds.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="pt-6 border-t border-white/20">
              <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-3">How to Request a Refund</h3>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                We've made it simple:
              </p>
              <ol className="list-decimal list-inside space-y-3 ml-4 text-[#6B7280]">
                <li>
                  Email us at{' '}
                  <a href="mailto:hello@confide.app" className="text-[#6366F1] hover:underline font-medium">
                    hello@confide.app
                  </a>{' '}
                  with the subject line "Refund Request"
                </li>
                <li>Include your account email address</li>
                <li>We'll process your request within 24 hours</li>
                <li>Paddle will handle the refund to your original payment method</li>
              </ol>
            </div>

            {/* Section 5 */}
            <div className="pt-6 border-t border-white/20">
              <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-3">Cancellations</h3>
              <p className="text-[#6B7280] leading-relaxed">
                You can cancel your subscription anytime from your{' '}
                <strong className="text-[#1F2937]">Account Settings</strong>. When you cancel:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#6B7280] mt-3">
                <li>You'll retain access until the end of your current billing period</li>
                <li>Your subscription won't renew automatically</li>
                <li>No cancellation fees — ever</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-button p-8 rounded-3xl text-center"
        >
          <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-3">Questions About Refunds?</h3>
          <p className="text-[#6B7280] leading-relaxed mb-6">
            We're here to help. Reach out and we'll respond within 24 hours.
          </p>
          <a href="mailto:hello@confide.app">
            <Button className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-semibold px-8 py-6 text-base hover-lift shadow-lg">
              Contact Us
            </Button>
          </a>
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
              <Link href="/support" className="hover:text-[#6366F1] transition-smooth">Support Us</Link>
              <Link href="/contact" className="hover:text-[#6366F1] transition-smooth">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
