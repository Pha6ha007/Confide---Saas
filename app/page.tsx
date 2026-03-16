'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, DollarSign, Brain, MessageCircle, Check, X, Shield, Lock, AlertTriangle, FileText, Star, Zap, TrendingUp, Award, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PaddleCheckout } from '@/components/billing/PaddleCheckout'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleCheckoutSuccess = () => {
    router.refresh()
    router.push('/dashboard')
  }

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

      {/* Glassmorphism Header */}
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
            <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-8">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-[#6B7280] lg:mr-4">
                <Link href="/blog" className="hover:text-[#6366F1] transition-smooth">Blog</Link>
                <a href="#pricing" className="hover:text-[#6366F1] transition-smooth">Pricing</a>
                <Link href="/support" className="hover:text-[#6366F1] transition-smooth">Support Us</Link>
                <Link href="/contact" className="hover:text-[#6366F1] transition-smooth">Contact</Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-white/30 rounded-lg transition-smooth backdrop-blur-sm mr-2"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-[#1F2937]" />
              </button>

              {/* Auth buttons */}
              <Link href="/login">
                <Button variant="ghost" className="text-[#1F2937] hover:bg-white/30 transition-smooth backdrop-blur-sm text-sm md:text-base px-3 md:px-4">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="relative overflow-hidden group bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-semibold hover-lift shadow-lg text-sm md:text-base px-3 md:px-6">
                  <span className="relative z-10">Start for free</span>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-[72px] left-0 right-0 z-40 glass border-b border-white/20 shadow-lg"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F2937] hover:text-[#6366F1] font-medium py-2 px-4 hover:bg-white/30 rounded-lg transition-smooth"
                >
                  Blog
                </Link>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F2937] hover:text-[#6366F1] font-medium py-2 px-4 hover:bg-white/30 rounded-lg transition-smooth"
                >
                  Pricing
                </a>
                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F2937] hover:text-[#6366F1] font-medium py-2 px-4 hover:bg-white/30 rounded-lg transition-smooth"
                >
                  Support Us
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F2937] hover:text-[#6366F1] font-medium py-2 px-4 hover:bg-white/30 rounded-lg transition-smooth"
                >
                  Contact
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 pb-32 md:pt-12 md:pb-40 lg:pt-20 lg:pb-48 w-full">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge with glassmorphism */}
            <div className="inline-flex items-center space-x-2 glass-button px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-6 animate-fade-in">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#6366F1]" />
              <span className="text-[#1F2937]">AI Emotional Support — Not Medical Service</span>
            </div>

            {/* Heading with Gradient Text */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-2 md:mb-4 animate-fade-in-up">
              Therapy costs{' '}
              <span className="gradient-text">$200/hour</span>
              <br />
              Meet <span className="gradient-text">Alex</span> — $19/month.
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-[#4B5563] mb-4 md:mb-6 lg:mb-8 leading-relaxed animate-fade-in-up max-w-3xl mx-auto" style={{ animationDelay: '100ms' }}>
              AI companion trained on real psychology — available 24/7
            </p>

            {/* CTA Button with 3D Effect */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 animate-fade-in-up transform-3d" style={{ animationDelay: '200ms' }}>
              <Link href="/register">
                <button className="group relative px-6 md:px-10 py-3 md:py-5 text-sm md:text-base lg:text-lg font-bold text-white rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 hover-lift shadow-large hover:shadow-2xl">
                  {/* Animated Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#F59E0B] bg-[length:200%_100%] animate-gradient-x"
                       style={{
                         animation: 'gradient-shift 3s ease infinite'
                       }}
                  />

                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Button Text */}
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Start for free</span>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                </button>
              </Link>

              {/* Info text next to button */}
              <div className="flex items-center space-x-2 px-4 py-2 md:px-6 md:py-3 glass rounded-full">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs md:text-sm text-[#6B7280]">No credit card required</span>
                <span className="text-[#D1D5DB]">·</span>
                <span className="text-xs md:text-sm text-[#6B7280]">5 free sessions</span>
              </div>
            </div>

            {/* Floating Cards with Glassmorphism */}
            <div className="hidden lg:grid md:grid-cols-3 gap-6 mt-32 md:mt-40 lg:mt-48 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {/* Card 1 */}
              <div className="glass-button p-8 rounded-2xl hover-lift group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Always Remembers</h3>
                <p className="text-sm text-[#6B7280]">Your entire history, patterns, and progress</p>
              </div>

              {/* Card 2 */}
              <div className="glass-button p-8 rounded-2xl hover-lift group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Evidence-Based</h3>
                <p className="text-sm text-[#6B7280]">Grounded in CBT, ACT, and DBT methods</p>
              </div>

              {/* Card 3 */}
              <div className="glass-button p-8 rounded-2xl hover-lift group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mb-2">Private & Secure</h3>
                <p className="text-sm text-[#6B7280]">End-to-end encrypted conversations</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Demo Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              Alex <span className="gradient-text">remembers</span> your story
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              No need to repeat yourself — every conversation builds on the last
            </p>
          </div>

          {/* Chat Mockup */}
          <div className="glass-button p-8 lg:p-12 rounded-3xl shadow-large max-w-3xl mx-auto">
            <div className="space-y-6">
              {/* User Message 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] px-6 py-4 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white shadow-lg">
                  <p className="text-base leading-relaxed">
                    I've been feeling anxious about work lately
                  </p>
                </div>
              </motion.div>

              {/* Alex Message 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-serif font-bold text-sm">A</span>
                    </div>
                    <span className="text-sm font-medium text-[#6B7280]">Alex</span>
                  </div>
                  <div className="glass px-6 py-4 rounded-2xl shadow-lg border border-white/20">
                    <p className="text-base leading-relaxed text-[#1F2937]">
                      I remember you mentioned your manager's criticism last week. Has anything changed since then?
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* User Message 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] px-6 py-4 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white shadow-lg">
                  <p className="text-base leading-relaxed">
                    Actually yes, we had a good talk yesterday
                  </p>
                </div>
              </motion.div>

              {/* Alex Message 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-serif font-bold text-sm">A</span>
                    </div>
                    <span className="text-sm font-medium text-[#6B7280]">Alex</span>
                  </div>
                  <div className="glass px-6 py-4 rounded-2xl shadow-lg border border-white/20">
                    <p className="text-base leading-relaxed text-[#1F2937]">
                      That's real progress. Three weeks ago you said confrontation felt impossible.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="mt-8 text-center"
            >
              <p className="text-[#6B7280] text-lg font-medium">
                Alex remembers your story — no need to repeat yourself
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PAIN → SOLUTION Section */}
      <section className="relative py-24 lg:py-32 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              Therapy is <span className="gradient-text">expensive</span>. We get it.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-button p-8 rounded-3xl hover-lift"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Can't afford therapy?</h3>
              <div className="h-1 w-16 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-full mb-4"></div>
              <p className="text-[#4B5563] text-lg leading-relaxed">
                <span className="font-bold text-[#6366F1]">$19/month</span>, unlimited sessions — not $240/week
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-button p-8 rounded-3xl hover-lift"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Tired of repeating yourself?</h3>
              <div className="h-1 w-16 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-full mb-4"></div>
              <p className="text-[#4B5563] text-lg leading-relaxed">
                <span className="font-bold text-[#6366F1]">Memory that grows</span> with every conversation
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-button p-8 rounded-3xl hover-lift"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Generic chatbot advice?</h3>
              <div className="h-1 w-16 bg-gradient-to-r from-[#6366F1] to-[#EC4899] rounded-full mb-4"></div>
              <p className="text-[#4B5563] text-lg leading-relaxed">
                Trained on <span className="font-bold text-[#6366F1]">37 psychology books</span> (CBT, DBT, ACT, Gottman)
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              How we <span className="gradient-text">compare</span>
            </h2>
            <p className="text-xl text-[#6B7280]">
              AI support that actually remembers you
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-button rounded-3xl overflow-hidden shadow-large"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left font-serif text-lg text-[#1F2937]">Platform</th>
                    <th className="px-6 py-4 text-center font-serif text-lg text-[#1F2937]">Price</th>
                    <th className="px-6 py-4 text-center font-serif text-lg text-[#1F2937]">Memory</th>
                    <th className="px-6 py-4 text-center font-serif text-lg text-[#1F2937]">Voice</th>
                    <th className="px-6 py-4 text-center font-serif text-lg text-[#1F2937]">Knowledge</th>
                    <th className="px-6 py-4 text-center font-serif text-lg text-[#1F2937]">Agents</th>
                    <th className="px-6 py-4 text-center font-serif text-lg text-[#1F2937]">24/7</th>
                    <th className="px-6 py-4 text-center font-serif text-lg text-[#1F2937]">Crisis</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Confide Row - Highlighted */}
                  <tr className="bg-gradient-to-r from-[#6366F1]/10 via-[#EC4899]/10 to-[#F59E0B]/10 border-b border-white/20">
                    <td className="px-6 py-4 font-bold text-[#1F2937]">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg flex items-center justify-center">
                          <span className="text-white font-serif font-bold text-xs">C</span>
                        </div>
                        <span>Confide</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#6366F1]">$19/mo</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-xs font-medium text-[#6366F1]">Books + Q&A</td>
                    <td className="px-6 py-4 text-center font-semibold text-[#1F2937]">6</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>

                  {/* BetterHelp */}
                  <tr className="border-b border-white/20">
                    <td className="px-6 py-4 text-[#4B5563]">BetterHelp</td>
                    <td className="px-6 py-4 text-center text-[#4B5563]">$240/mo</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-[#4B5563]">Human</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>

                  {/* Wysa */}
                  <tr className="border-b border-white/20">
                    <td className="px-6 py-4 text-[#4B5563]">Wysa</td>
                    <td className="px-6 py-4 text-center text-[#4B5563]">$6/mo</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-[#4B5563]">1</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>

                  {/* Woebot */}
                  <tr>
                    <td className="px-6 py-4 text-[#4B5563]">Woebot</td>
                    <td className="px-6 py-4 text-center text-[#4B5563]">Free</td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                    <td className="px-6 py-4 text-center text-[#4B5563]">1</td>
                    <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS Section */}
      <section className="relative py-24 lg:py-32 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              Get started in <span className="gradient-text">3 simple steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-2xl flex items-center justify-center shadow-large hover-lift">
                  <span className="font-serif text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Sign up in 2 minutes</h3>
              <p className="text-[#6B7280] text-lg">
                No credit card required. Start with 5 free sessions.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-2xl flex items-center justify-center shadow-large hover-lift">
                  <span className="font-serif text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Choose your companion</h3>
              <p className="text-[#6B7280] text-lg">
                Pick a name and voice that feels right for you.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-2xl flex items-center justify-center shadow-large hover-lift">
                  <span className="font-serif text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">Start your first conversation</h3>
              <p className="text-[#6B7280] text-lg">
                Talk about anything. Alex is here to listen.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRICING Section */}
      <section id="pricing" className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              Simple, <span className="gradient-text">transparent</span> pricing
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Start free, upgrade when you're ready — cancel anytime
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* FREE Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-button rounded-3xl p-8 hover-lift"
            >
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-2">Free</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="font-serif text-5xl font-bold text-[#1F2937]">$0</span>
                  <span className="text-[#6B7280] ml-2">/month</span>
                </div>
                <p className="text-[#6B7280] text-sm">Perfect to get started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">5 sessions per week</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Text chat only</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">1 agent (Anxiety)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Crisis support always</span>
                </li>
              </ul>

              <Link href="/register" className="block">
                <button className="w-full py-4 px-6 rounded-xl font-semibold text-[#1F2937] bg-white/50 hover:bg-white/70 transition-all border-2 border-[#E5E7EB]">
                  Start free
                </button>
              </Link>
            </motion.div>

            {/* PRO Plan - Most Popular */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-button rounded-3xl p-8 hover-lift relative border-2 border-[#6366F1] shadow-2xl scale-105"
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>Most Popular</span>
                </div>
              </div>

              <div className="text-center mb-6 mt-4">
                <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-2">Pro</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="font-serif text-5xl font-bold gradient-text">$19</span>
                  <span className="text-[#6B7280] ml-2">/month</span>
                </div>
                <p className="text-[#6B7280] text-sm">For serious progress</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">Unlimited sessions</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">Voice + Text modes</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">All 6 specialist agents</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">Smart memory that evolves</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">Real therapist Q&A knowledge</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">Basic analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">Wellness exercises (13 practices)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#6366F1] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563] font-medium">Mood tracking</span>
                </li>
              </ul>

              <PaddleCheckout
                priceId={process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID!}
                planName="Pro"
                onSuccess={handleCheckoutSuccess}
                className="w-full group relative overflow-hidden py-4 px-6 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-[#6366F1] to-[#EC4899]"
              >
                Start free trial
              </PaddleCheckout>
            </motion.div>

            {/* PREMIUM Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-button rounded-3xl p-8 hover-lift"
            >
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-2">Premium</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="font-serif text-5xl font-bold text-[#1F2937]">$29</span>
                  <span className="text-[#6B7280] ml-2">/month</span>
                </div>
                <p className="text-[#6B7280] text-sm">Maximum personalization</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Streaming voice (~0.5s latency)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Smart memory deduplication</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Adaptive communication style</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Monthly PDF diary</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Full analytics & insights</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">4-level crisis detection</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Custom voice selection</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[#4B5563]">Early access to new features</span>
                </li>
              </ul>

              <PaddleCheckout
                priceId={process.env.NEXT_PUBLIC_PADDLE_PREMIUM_PRICE_ID!}
                planName="Premium"
                onSuccess={handleCheckoutSuccess}
                className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:shadow-lg transition-all"
              >
                Get Premium
              </PaddleCheckout>
            </motion.div>
          </div>

          {/* Trust note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-[#9CA3AF] text-sm">
              No credit card required · 7-day money-back guarantee · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* TRUST & SAFETY Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              Your <span className="gradient-text">privacy</span> matters
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Trust Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-button p-6 rounded-2xl text-center hover-lift"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#1F2937] mb-2">End-to-end encrypted</h3>
              <p className="text-sm text-[#6B7280]">Your conversations are private and secure</p>
            </motion.div>

            {/* Trust Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-button p-6 rounded-2xl text-center hover-lift"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#1F2937] mb-2">Crisis detection</h3>
              <p className="text-sm text-[#6B7280]">We detect urgent situations from day one</p>
            </motion.div>

            {/* Trust Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-button p-6 rounded-2xl text-center hover-lift"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#1F2937] mb-2">Not a medical service</h3>
              <p className="text-sm text-[#6B7280]">AI support, not medical diagnosis</p>
            </motion.div>

            {/* Trust Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-button p-6 rounded-2xl text-center hover-lift"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[#1F2937] mb-2">Your data is yours</h3>
              <p className="text-sm text-[#6B7280]">Never used to train AI models</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA Section */}
      <section className="relative py-32 lg:py-40">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6">
              Ready to feel <span className="gradient-text">heard</span>?
            </h2>
            <p className="text-2xl text-[#6B7280] mb-12">
              Start your first conversation — free
            </p>

            <Link href="/register">
              <button className="group relative px-16 py-8 text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-500 hover-lift shadow-large hover:shadow-2xl">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#F59E0B] bg-[length:200%_100%]"
                     style={{
                       animation: 'gradient-shift 3s ease infinite'
                     }}
                />

                {/* Glass overlay on hover */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-300" />

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Button Text */}
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <span>Start for free</span>
                  <Sparkles className="w-6 h-6" />
                </span>
              </button>
            </Link>

            <p className="text-[#9CA3AF] mt-8 text-lg">
              No credit card required · 5 free sessions · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

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
              © 2026 Confide. AI Emotional Support — Not Medical Service.
            </p>

            <div className="flex items-center space-x-6 text-sm text-[#6B7280]">
              <Link href="/blog" className="hover:text-[#6366F1] transition-smooth">Blog</Link>
              <Link href="/privacy" className="hover:text-[#6366F1] transition-smooth">Privacy</Link>
              <Link href="/terms" className="hover:text-[#6366F1] transition-smooth">Terms</Link>
              <Link href="/refund" className="hover:text-[#6366F1] transition-smooth">Refund</Link>
              <Link href="/support" className="hover:text-[#6366F1] transition-smooth">Support Us</Link>
              <Link href="/contact" className="hover:text-[#6366F1] transition-smooth">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
