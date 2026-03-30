'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Brain, Heart, Sparkles, ArrowLeft, Server, Zap, Lock, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
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
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover-lift transition-smooth hover:opacity-90">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-serif font-bold text-lg md:text-xl">C</span>
              </div>
              <span className="font-serif text-xl md:text-2xl font-semibold text-[#1F2937]">Confide</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" className="text-[#6B7280] hover:text-[#1F2937] transition-smooth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-semibold hover-lift shadow-lg">
                  Start for free
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 pt-16 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6">
              About <span className="gradient-text">Confide</span>
            </h1>
            <p className="text-xl text-[#6B7280] max-w-3xl mx-auto leading-relaxed">
              Confide is an AI wellness companion for self-reflection, personal growth, and emotional wellness. 
              Not a therapist. Not a chatbot. A conversation that remembers you.
            </p>
          </motion.div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-white/50">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#1F2937] mb-6">
                  Why we built this
                </h2>
                <div className="space-y-4 text-lg text-[#4B5563] leading-relaxed">
                  <p>
                    Traditional therapy is expensive — $240+/month for BetterHelp, with limited availability and long wait times.
                  </p>
                  <p>
                    Existing AI chatbots forget everything between sessions, give generic advice, and feel more like filling out a form than talking to someone who understands you.
                  </p>
                  <p>
                    We wanted to build something different: a companion that actually remembers your story, grows with you over time, and draws from real evidence-based knowledge — available 24/7 at a price anyone can afford.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { icon: Heart, label: 'Long-term memory', desc: 'Remembers everything from day one' },
                  { icon: BookOpen, label: '37+ books', desc: 'Evidence-based knowledge' },
                  { icon: Brain, label: '6 specialists', desc: 'Anxiety, family, trauma & more' },
                  { icon: Shield, label: 'Always safe', desc: 'Crisis detection built in' },
                ].map((item, i) => (
                  <div key={i} className="glass-button p-5 rounded-2xl text-center hover-lift">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#1F2937] text-sm mb-1">{item.label}</h3>
                    <p className="text-xs text-[#6B7280]">{item.desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4">
                Our <span className="gradient-text">technology</span>
              </h2>
              <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
                We use frontier AI models from leading providers to deliver the best possible experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Multi-model */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-button p-6 rounded-2xl hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#818CF8] rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">Multi-Model Intelligence</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Each conversation task is powered by the best-suited AI model. Premium users get access to the most advanced conversational AI available — tuned for empathy, nuance, and emotional understanding.
                </p>
              </motion.div>

              {/* Reliability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-button p-6 rounded-2xl hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">Multi-Provider Reliability</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  If one AI provider goes down, we automatically switch to another — seamlessly and instantly. Your conversations are never interrupted. We route through multiple world-class AI providers for 99.9% uptime.
                </p>
              </motion.div>

              {/* Speed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-button p-6 rounded-2xl hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">Fast & Responsive</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  We select the fastest models for time-critical tasks like safety detection, and the most capable models for deep conversations. Every response is optimized for both speed and quality.
                </p>
              </motion.div>

              {/* RAG */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-button p-6 rounded-2xl hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#EC4899] to-[#F472B6] rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">Evidence-Based Knowledge</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Alex draws from a curated library of 37+ published books on psychology, self-improvement, and emotional wellness. Every conversation is grounded in proven methods — not generic AI advice.
                </p>
              </motion.div>

              {/* Memory */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-button p-6 rounded-2xl hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">Intelligent Memory</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  A three-layer memory system remembers your story, communication preferences, and progress over time. Alex learns what works for you and adapts — getting better with every conversation.
                </p>
              </motion.div>

              {/* Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="glass-button p-6 rounded-2xl hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-2">Privacy by Design</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Your conversations are never used to train AI models. We use encrypted storage, provider-side data retention is disabled, and we never log message content in our systems.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-16 bg-white/50">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass-button p-8 rounded-3xl">
                <Shield className="w-10 h-10 text-[#6366F1] mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">
                  An important note
                </h3>
                <p className="text-[#4B5563] leading-relaxed">
                  Confide is a wellness companion — not a medical service, therapist, or substitute for professional help. 
                  Alex is an AI that draws from published psychology books to support your self-reflection and personal growth. 
                  If you're in crisis, Alex will always connect you with real emergency resources. 
                  For medical or mental health emergencies, please contact your local emergency services or a licensed professional.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#1F2937] mb-6">
                Ready to meet Alex?
              </h2>
              <Link href="/register">
                <button className="group relative px-12 py-5 text-lg font-bold text-white rounded-2xl overflow-hidden transition-all duration-500 hover-lift shadow-large">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#F59E0B] bg-[length:200%_100%]"
                       style={{ animation: 'gradient-shift 3s ease infinite' }}
                  />
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Start for free</span>
                    <Sparkles className="w-5 h-5" />
                  </span>
                </button>
              </Link>
              <p className="text-[#9CA3AF] mt-4">No credit card required</p>
            </motion.div>
          </div>
        </section>
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
              <Link href="/privacy" className="hover:text-[#6366F1] transition-smooth">Privacy</Link>
              <Link href="/terms" className="hover:text-[#6366F1] transition-smooth">Terms</Link>
              <Link href="/contact" className="hover:text-[#6366F1] transition-smooth">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
