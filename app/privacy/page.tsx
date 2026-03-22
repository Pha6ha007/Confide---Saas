'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, Trash2, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient fixed inset-0 -z-10" />

      {/* Floating Blur Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#6366F1] rounded-full blur-orb animate-float" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#EC4899] rounded-full blur-orb animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#F59E0B] rounded-full blur-orb animate-float" style={{ animationDelay: '2s' }} />
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

            {/* Back to home link */}
            <Link href="/" className="flex items-center space-x-2 text-[#6B7280] hover:text-[#6366F1] transition-smooth">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm md:text-base">Back to home</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 lg:mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-2xl mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-[#6B7280]">
              Last updated: March 4, 2026
            </p>
          </motion.div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-button rounded-3xl p-8 lg:p-12 shadow-large"
          >
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-10">
                <div className="flex items-start space-x-3 mb-4">
                  <Eye className="w-6 h-6 text-[#6366F1] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Introduction</h2>
                    <p className="text-[#4B5563] leading-relaxed mb-3">
                      <span className="font-semibold text-[#1F2937]">Confide</span> is an AI wellness companion for self-reflection and personal growth — not a medical service. We take your privacy seriously and are committed to protecting your personal information.
                    </p>
                    <p className="text-[#4B5563] leading-relaxed">
                      This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform.
                    </p>
                  </div>
                </div>
              </section>

              {/* What we collect */}
              <section className="mb-10">
                <div className="flex items-start space-x-3 mb-4">
                  <Database className="w-6 h-6 text-[#EC4899] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">What Data We Collect</h2>
                    <div className="space-y-4">
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Account Information</h3>
                        <p className="text-[#4B5563] text-base">Your email address and account preferences</p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Conversation Data</h3>
                        <p className="text-[#4B5563] text-base">All your conversations with Alex (AI companion), including text and voice recordings</p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Usage Analytics</h3>
                        <p className="text-[#4B5563] text-base">Mood scores, session frequency, and interaction patterns to improve your experience</p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-2">Payment Information</h3>
                        <p className="text-[#4B5563] text-base">Processed securely by Paddle (our payment processor) — we never store your credit card details</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* How we store data */}
              <section className="mb-10">
                <div className="flex items-start space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-[#F59E0B] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">How We Store Your Data</h2>
                    <p className="text-[#4B5563] leading-relaxed mb-4">
                      Your data is stored securely using industry-standard encryption:
                    </p>
                    <ul className="space-y-2 text-[#4B5563]">
                      <li className="flex items-start">
                        <span className="text-[#6366F1] mr-2">•</span>
                        <span><strong>Supabase (PostgreSQL):</strong> Your account, conversations, and user profile</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#6366F1] mr-2">•</span>
                        <span><strong>Pinecone (Vector Database):</strong> Encrypted embeddings of your conversations for AI memory</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#6366F1] mr-2">•</span>
                        <span><strong>End-to-end encryption:</strong> Your conversations are encrypted in transit and at rest</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* What we DON'T do */}
              <section className="mb-10">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                  <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4 flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    What We DON'T Do
                  </h2>
                  <ul className="space-y-3 text-[#065F46]">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✗</span>
                      <span className="font-medium">We <strong>never</strong> sell your data to third parties</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✗</span>
                      <span className="font-medium">We <strong>never</strong> use your conversations to train AI models (ours or third-party)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✗</span>
                      <span className="font-medium">We <strong>never</strong> share your conversations with anyone (except in legal emergencies)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">✗</span>
                      <span className="font-medium">We <strong>never</strong> show you targeted ads based on your conversations</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Third-party services */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">Third-Party Services</h2>
                <p className="text-[#4B5563] leading-relaxed mb-4">
                  We use the following trusted third-party services to operate our platform:
                </p>
                <div className="space-y-3">
                  <div className="glass p-4 rounded-xl border border-white/20">
                    <h3 className="font-semibold text-[#1F2937] mb-1">OpenAI</h3>
                    <p className="text-[#4B5563] text-sm">Powers Alex (AI companion). Your conversations are processed but not stored or used for training by OpenAI per our agreement.</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/20">
                    <h3 className="font-semibold text-[#1F2937] mb-1">ElevenLabs</h3>
                    <p className="text-[#4B5563] text-sm">Generates voice responses. Audio is processed transiently and not stored by ElevenLabs.</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/20">
                    <h3 className="font-semibold text-[#1F2937] mb-1">PostHog</h3>
                    <p className="text-[#4B5563] text-sm">Anonymous usage analytics (page views, clicks) to improve the platform — no conversation content.</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/20">
                    <h3 className="font-semibold text-[#1F2937] mb-1">Paddle</h3>
                    <p className="text-[#4B5563] text-sm">Payment processing. They handle billing, taxes, and subscriptions securely.</p>
                  </div>
                </div>
              </section>

              {/* Crisis detection */}
              <section className="mb-10">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                  <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3 flex items-center">
                    <svg className="w-6 h-6 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Crisis Detection & Safety
                  </h2>
                  <p className="text-[#92400E] leading-relaxed mb-3">
                    If our AI detects that you may be in crisis (mentions of self-harm, suicide, or immediate danger), we will:
                  </p>
                  <ul className="space-y-2 text-[#92400E]">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">1.</span>
                      <span>Immediately provide crisis resources (hotlines, emergency contacts)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">2.</span>
                      <span>Log the event metadata (timestamp, user ID) <strong>without storing the conversation content</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">3.</span>
                      <span>In extreme cases, we may contact emergency services if legally required</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Cookies */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">Cookies & Tracking</h2>
                <p className="text-[#4B5563] leading-relaxed mb-3">
                  We use <strong>only essential cookies</strong> required for the platform to function:
                </p>
                <ul className="space-y-2 text-[#4B5563]">
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span><strong>Authentication cookies:</strong> To keep you logged in securely</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>We <strong>do not</strong> use advertising or tracking cookies</span>
                  </li>
                </ul>
              </section>

              {/* Your rights */}
              <section className="mb-10">
                <div className="flex items-start space-x-3 mb-4">
                  <Trash2 className="w-6 h-6 text-[#EC4899] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Your Rights (GDPR Compliant)</h2>
                    <p className="text-[#4B5563] leading-relaxed mb-4">
                      You have full control over your data:
                    </p>
                    <div className="space-y-3">
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-1">Right to Access</h3>
                        <p className="text-[#4B5563] text-sm">Request a copy of all your data (conversations, profile, analytics)</p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-1">Right to Deletion</h3>
                        <p className="text-[#4B5563] text-sm">Delete your account and all associated data permanently at any time</p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-1">Right to Portability</h3>
                        <p className="text-[#4B5563] text-sm">Export your conversations in JSON or PDF format</p>
                      </div>
                      <div className="glass p-4 rounded-xl border border-white/20">
                        <h3 className="font-semibold text-[#1F2937] mb-1">Right to Correction</h3>
                        <p className="text-[#4B5563] text-sm">Update or correct any personal information in your profile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data retention */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">Data Retention</h2>
                <ul className="space-y-2 text-[#4B5563]">
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Active accounts: Data stored indefinitely while you use the platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Deleted accounts: All data permanently deleted within 30 days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Backups: Removed from backups within 90 days of deletion</span>
                  </li>
                </ul>
              </section>

              {/* Children's privacy */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">Children's Privacy</h2>
                <p className="text-[#4B5563] leading-relaxed">
                  Confide is <strong>not intended for users under 18 years old</strong>. We do not knowingly collect data from minors. If you are a parent and believe your child has created an account, please contact us immediately at <a href="mailto:support@confide.app" className="text-[#6366F1] font-medium hover:underline">support@confide.app</a>.
                </p>
              </section>

              {/* International users */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">International Users</h2>
                <p className="text-[#4B5563] leading-relaxed">
                  Confide is available globally. Your data is stored on secure servers in the United States and European Union (Supabase regions). By using our platform, you consent to this data transfer. We comply with GDPR (EU), CCPA (California), and other international privacy laws.
                </p>
              </section>

              {/* Changes to policy */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">Changes to This Policy</h2>
                <p className="text-[#4B5563] leading-relaxed">
                  We may update this Privacy Policy from time to time. Significant changes will be communicated via email. Continued use of Confide after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact */}
              <section>
                <div className="flex items-start space-x-3 mb-4">
                  <Mail className="w-6 h-6 text-[#6366F1] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Contact Us</h2>
                    <p className="text-[#4B5563] leading-relaxed mb-4">
                      Questions about your privacy or this policy? We're here to help:
                    </p>
                    <div className="glass p-6 rounded-xl border border-white/20">
                      <p className="text-[#1F2937] font-semibold mb-2">Privacy Team</p>
                      <p className="text-[#4B5563]">
                        Email: <a href="mailto:support@confide.app" className="text-[#6366F1] font-medium hover:underline">support@confide.app</a>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>

          {/* Back to home button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/">
              <button className="glass-button px-8 py-4 rounded-xl font-semibold text-[#1F2937] hover-lift transition-smooth">
                Back to home
              </button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/20 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <Link href="/" className="flex items-center space-x-2 transition-smooth hover:opacity-90">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg flex items-center justify-center shadow-lg">
                <span className="font-serif font-bold text-lg text-white">C</span>
              </div>
              <span className="font-serif text-xl font-semibold text-[#1F2937]">Confide</span>
            </Link>

            <p className="text-[#9CA3AF] text-sm">
              © 2026 Confide. AI Wellness Companion — Not a Medical Service.
            </p>

            <div className="flex items-center space-x-6 text-sm text-[#6B7280]">
              <Link href="/privacy" className="hover:text-[#6366F1] transition-smooth font-medium">Privacy</Link>
              <Link href="/terms" className="hover:text-[#6366F1] transition-smooth">Terms</Link>
              <a href="mailto:support@confide.app" className="hover:text-[#6366F1] transition-smooth">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
