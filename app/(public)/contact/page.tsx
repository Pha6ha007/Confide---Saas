'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Clock, Send, Building2, Users, FlaskConical, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type FormType = 'general' | 'partnership'

export default function ContactPage() {
  // General Contact Form
  const [generalForm, setGeneralForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [generalLoading, setGeneralLoading] = useState(false)

  // Partnership Form
  const [partnershipForm, setPartnershipForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    partnershipType: 'corporate' as 'corporate' | 'research' | 'other',
    message: '',
  })
  const [partnershipLoading, setPartnershipLoading] = useState(false)

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generalForm,
          type: 'general',
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setGeneralForm({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      // Anti-spam: disable button for 5 seconds
      setTimeout(() => setGeneralLoading(false), 5000)
    }
  }

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPartnershipLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...partnershipForm,
          type: 'partnership',
        }),
      })

      if (!res.ok) throw new Error('Failed to send inquiry')

      toast.success('Partnership inquiry sent! We\'ll review and respond within 48 hours.')
      setPartnershipForm({
        name: '',
        email: '',
        company: '',
        role: '',
        partnershipType: 'corporate',
        message: '',
      })
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      // Anti-spam: disable button for 5 seconds
      setTimeout(() => setPartnershipLoading(false), 5000)
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
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto">
            Have questions? Want to collaborate? We'd love to hear from you.
          </p>
        </motion.div>

        {/* General Contact Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-button p-8 rounded-3xl space-y-6"
          >
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-2">Email</h3>
              <a href="mailto:hello@confide.app" className="text-[#6366F1] hover:underline">
                hello@confide.app
              </a>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1F2937] mb-1">Response Time</h3>
                <p className="text-[#6B7280]">Within 24 hours</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-[#6B7280]">
                We read every message personally. Whether you have a question, feedback, or just want to say hi — we're here.
              </p>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 glass-button p-8 md:p-12 rounded-3xl"
          >
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-[#1F2937] font-medium mb-2 block">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-white/50 border-white/20"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-[#1F2937] font-medium mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="bg-white/50 border-white/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="text-[#1F2937] font-medium mb-2 block">
                  Subject (Optional)
                </Label>
                <Input
                  id="subject"
                  type="text"
                  value={generalForm.subject}
                  onChange={(e) => setGeneralForm({ ...generalForm, subject: e.target.value })}
                  placeholder="What is this about?"
                  className="bg-white/50 border-white/20"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-[#1F2937] font-medium mb-2 block">
                  Message
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={generalForm.message}
                  onChange={(e) => setGeneralForm({ ...generalForm, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="bg-white/50 border-white/20 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={generalLoading}
                className="w-full md:w-auto bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-semibold px-8 py-6 text-base hover-lift shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generalLoading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Partnership Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-button p-8 md:p-12 rounded-3xl"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 glass-button px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span className="text-[#1F2937]">For Organizations</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              Partnership & Collaboration
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Interested in bringing Confide to your organization or collaborating on research?
            </p>
          </div>

          <form onSubmit={handlePartnershipSubmit} className="space-y-6 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="p-name" className="text-[#1F2937] font-medium mb-2 block">
                  Name
                </Label>
                <Input
                  id="p-name"
                  type="text"
                  required
                  value={partnershipForm.name}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, name: e.target.value })}
                  placeholder="Your name"
                  className="bg-white/50 border-white/20"
                />
              </div>

              <div>
                <Label htmlFor="p-email" className="text-[#1F2937] font-medium mb-2 block">
                  Email
                </Label>
                <Input
                  id="p-email"
                  type="email"
                  required
                  value={partnershipForm.email}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, email: e.target.value })}
                  placeholder="you@company.com"
                  className="bg-white/50 border-white/20"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company" className="text-[#1F2937] font-medium mb-2 block">
                  Company / Organization
                </Label>
                <Input
                  id="company"
                  type="text"
                  required
                  value={partnershipForm.company}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="bg-white/50 border-white/20"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-[#1F2937] font-medium mb-2 block">
                  Your Role
                </Label>
                <Input
                  id="role"
                  type="text"
                  required
                  value={partnershipForm.role}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, role: e.target.value })}
                  placeholder="CEO, HR Manager, etc."
                  className="bg-white/50 border-white/20"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#1F2937] font-medium mb-4 block">Partnership Type</Label>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { value: 'corporate', icon: Building2, label: 'Corporate License' },
                  { value: 'research', icon: FlaskConical, label: 'Research Collaboration' },
                  { value: 'other', icon: Users, label: 'Other' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPartnershipForm({ ...partnershipForm, partnershipType: value as any })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      partnershipForm.partnershipType === value
                        ? 'border-[#6366F1] bg-[#6366F1]/10'
                        : 'border-white/20 bg-white/30 hover:border-white/40'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      partnershipForm.partnershipType === value ? 'text-[#6366F1]' : 'text-[#6B7280]'
                    }`} />
                    <span className={`text-sm font-medium ${
                      partnershipForm.partnershipType === value ? 'text-[#6366F1]' : 'text-[#1F2937]'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="p-message" className="text-[#1F2937] font-medium mb-2 block">
                Tell us about your inquiry
              </Label>
              <Textarea
                id="p-message"
                required
                rows={6}
                value={partnershipForm.message}
                onChange={(e) => setPartnershipForm({ ...partnershipForm, message: e.target.value })}
                placeholder="What would you like to collaborate on?"
                className="bg-white/50 border-white/20 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={partnershipLoading}
              className="w-full md:w-auto bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-white font-semibold px-8 py-6 text-base hover-lift shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {partnershipLoading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Partnership Inquiry
                </>
              )}
            </Button>
          </form>
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
              © 2026 Confide. AI Wellness Companion — Not a Medical Service.
            </p>

            <div className="flex items-center space-x-6 text-sm text-[#6B7280]">
              <Link href="/privacy" className="hover:text-[#6366F1] transition-smooth">Privacy</Link>
              <Link href="/terms" className="hover:text-[#6366F1] transition-smooth">Terms</Link>
              <Link href="/refund" className="hover:text-[#6366F1] transition-smooth">Refund</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
