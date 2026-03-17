'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, AlertCircle, CreditCard, Ban, Scale } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsPage() {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
              Terms of Service
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
                <p className="text-[#4B5563] leading-relaxed mb-3">
                  Welcome to <span className="font-semibold text-[#1F2937]">Confide</span>. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully.
                </p>
                <p className="text-[#4B5563] leading-relaxed">
                  If you do not agree to these Terms, you may not use Confide.
                </p>
              </section>

              {/* CRITICAL: Not Medical Service */}
              <section className="mb-10">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#991B1B] mb-3">
                        Important Disclaimer — Wellness Product, Not Medical Service
                      </h2>
                      <div className="space-y-3 text-[#991B1B]">
                        <p className="leading-relaxed">
                          <strong>Confide is a wellness and self-reflection software product. It is NOT a medical service, NOT a licensed therapy platform, and NOT a substitute for professional healthcare.</strong>
                        </p>
                        <p className="leading-relaxed">
                          Alex (our AI companion) is an AI-powered conversational tool for personal growth and self-reflection — not a licensed therapist, psychologist, or medical professional.
                        </p>
                        <p className="leading-relaxed font-semibold">
                          Confide does NOT:
                        </p>
                        <ul className="space-y-2 ml-4">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Diagnose, treat, cure, or prevent any medical or mental health condition</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Prescribe medication or provide medical advice of any kind</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Replace professional therapy, counseling, or crisis intervention</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Provide emergency services or clinical assessments</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Claim to be or act as a healthcare provider in any jurisdiction</span>
                          </li>
                        </ul>
                        <p className="leading-relaxed font-semibold">
                          If you are experiencing a mental health crisis, suicidal thoughts, or medical emergency, please:
                        </p>
                        <ul className="space-y-2 ml-4">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Call 911 (USA) or your local emergency number immediately</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Contact the 988 Suicide & Crisis Lifeline (USA): call or text 988</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Visit your nearest emergency room</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Eligibility */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">1. Nature of Service</h2>
                <p className="text-[#4B5563] leading-relaxed mb-3">
                  Confide is a <strong>software-as-a-service (SaaS) product</strong> that provides an AI-powered conversational companion for self-reflection, personal growth, and emotional wellness.
                </p>
                <p className="text-[#4B5563] leading-relaxed mb-3">
                  The service falls under the category of <strong>wellness and personal development software</strong>. It uses artificial intelligence to facilitate journaling, self-reflection, mood tracking, and guided exercises such as breathing and grounding techniques.
                </p>
                <p className="text-[#4B5563] leading-relaxed">
                  Confide is comparable to products such as journaling apps, meditation apps, and personal development platforms. It is not comparable to, and does not compete with, medical or therapeutic services.
                </p>
              </section>

              {/* Eligibility */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">2. Eligibility</h2>
                <p className="text-[#4B5563] leading-relaxed mb-3">
                  You must be <strong>at least 18 years old</strong> to use Confide.
                </p>
                <p className="text-[#4B5563] leading-relaxed">
                  By creating an account, you represent that you are 18 or older and have the legal capacity to enter into these Terms.
                </p>
              </section>

              {/* Account responsibilities */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">3. Your Account</h2>
                <div className="space-y-3 text-[#4B5563]">
                  <p className="leading-relaxed">
                    You are responsible for:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-[#6366F1] mr-2">•</span>
                      <span>Maintaining the confidentiality of your account credentials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#6366F1] mr-2">•</span>
                      <span>All activities that occur under your account</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#6366F1] mr-2">•</span>
                      <span>Notifying us immediately of any unauthorized access</span>
                    </li>
                  </ul>
                  <p className="leading-relaxed">
                    We reserve the right to suspend or terminate accounts that violate these Terms.
                  </p>
                </div>
              </section>

              {/* Acceptable use */}
              <section className="mb-10">
                <div className="flex items-start space-x-3 mb-4">
                  <Ban className="w-6 h-6 text-[#EC4899] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">4. Acceptable Use</h2>
                    <p className="text-[#4B5563] leading-relaxed mb-3">
                      You agree <strong>NOT</strong> to use Confide to:
                    </p>
                    <ul className="space-y-2 text-[#4B5563] ml-4">
                      <li className="flex items-start">
                        <span className="text-[#EC4899] mr-2">✗</span>
                        <span>Violate any laws or regulations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#EC4899] mr-2">✗</span>
                        <span>Harass, abuse, or harm others</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#EC4899] mr-2">✗</span>
                        <span>Attempt to reverse-engineer, hack, or compromise our systems</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#EC4899] mr-2">✗</span>
                        <span>Use automated tools (bots, scrapers) without permission</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#EC4899] mr-2">✗</span>
                        <span>Share your account with others</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#EC4899] mr-2">✗</span>
                        <span>Upload malicious content (viruses, malware, etc.)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Subscriptions & payments */}
              <section className="mb-10">
                <div className="flex items-start space-x-3 mb-4">
                  <CreditCard className="w-6 h-6 text-[#F59E0B] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">5. Subscriptions & Payments</h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-2">Plans</h3>
                        <p className="text-[#4B5563] leading-relaxed mb-2">
                          Confide offers three plans:
                        </p>
                        <ul className="space-y-1 text-[#4B5563] ml-4">
                          <li className="flex items-start">
                            <span className="text-[#6366F1] mr-2">•</span>
                            <span><strong>Free:</strong> Limited sessions (5/week), basic features</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#6366F1] mr-2">•</span>
                            <span><strong>Pro ($19/month):</strong> Unlimited sessions, voice features, all AI agents</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#6366F1] mr-2">•</span>
                            <span><strong>Premium ($29/month):</strong> Pro + advanced analytics and priority support</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-2">Billing</h3>
                        <p className="text-[#4B5563] leading-relaxed">
                          All payments are processed securely by <strong>Paddle</strong> (our Merchant of Record). Subscriptions renew automatically unless canceled. You will be billed at the start of each billing cycle (monthly or annually).
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-2">Cancellation & Refunds</h3>
                        <ul className="space-y-2 text-[#4B5563] ml-4">
                          <li className="flex items-start">
                            <span className="text-[#6366F1] mr-2">•</span>
                            <span>You may cancel your subscription at any time via your account settings</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#6366F1] mr-2">•</span>
                            <span>Cancellations take effect at the end of your current billing period</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#6366F1] mr-2">•</span>
                            <span><strong>Refunds:</strong> We offer a 7-day money-back guarantee. Refunds requested within 7 days of initial purchase will be processed within 5-10 business days</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#6366F1] mr-2">•</span>
                            <span>No refunds for partial months or mid-cycle cancellations</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-2">Price Changes</h3>
                        <p className="text-[#4B5563] leading-relaxed">
                          We may change our pricing from time to time. Existing subscribers will be notified 30 days in advance of any price increase and may cancel before the new price takes effect.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Intellectual property */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">6. Intellectual Property</h2>
                <div className="space-y-3 text-[#4B5563]">
                  <p className="leading-relaxed">
                    <strong>Your Content:</strong> You retain ownership of your conversations and personal data. By using Confide, you grant us a limited license to process your content to provide the service (e.g., AI responses, analytics).
                  </p>
                  <p className="leading-relaxed">
                    <strong>Our Content:</strong> All text, graphics, logos, software, and AI models on Confide are owned by us or our licensors. You may not copy, reproduce, or distribute our content without permission.
                  </p>
                </div>
              </section>

              {/* Disclaimer of warranties */}
              <section className="mb-10">
                <div className="flex items-start space-x-3 mb-4">
                  <Scale className="w-6 h-6 text-[#6366F1] mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-3">7. Disclaimer of Warranties</h2>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                      <p className="text-[#374151] leading-relaxed mb-3 uppercase font-semibold text-sm">
                        Important Legal Notice
                      </p>
                      <p className="text-[#4B5563] leading-relaxed mb-3">
                        Confide is provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without warranties of any kind, either express or implied, including but not limited to:
                      </p>
                      <ul className="space-y-2 text-[#4B5563] ml-4">
                        <li className="flex items-start">
                          <span className="text-[#6366F1] mr-2">•</span>
                          <span>Accuracy, reliability, or quality of AI responses</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#6366F1] mr-2">•</span>
                          <span>Uninterrupted or error-free service</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#6366F1] mr-2">•</span>
                          <span>Results or outcomes from using the platform</span>
                        </li>
                      </ul>
                      <p className="text-[#4B5563] leading-relaxed mt-3">
                        <strong>AI-generated content may be inaccurate, incomplete, or inappropriate.</strong> Always verify critical information with a licensed professional.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Limitation of liability */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">8. Limitation of Liability</h2>
                <p className="text-[#4B5563] leading-relaxed mb-3">
                  To the maximum extent permitted by law, <strong>Confide and its affiliates shall not be liable</strong> for:
                </p>
                <ul className="space-y-2 text-[#4B5563] ml-4">
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Any indirect, incidental, consequential, or punitive damages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Loss of profits, data, or business opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Harm resulting from reliance on AI-generated advice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Unauthorized access to your account or data breaches</span>
                  </li>
                </ul>
                <p className="text-[#4B5563] leading-relaxed mt-3">
                  <strong>Our total liability to you for all claims shall not exceed the amount you paid us in the 12 months before the claim (or $100, whichever is greater).</strong>
                </p>
              </section>

              {/* Indemnification */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">9. Indemnification</h2>
                <p className="text-[#4B5563] leading-relaxed">
                  You agree to indemnify and hold harmless Confide from any claims, damages, or expenses (including legal fees) arising from:
                </p>
                <ul className="space-y-2 text-[#4B5563] ml-4 mt-3">
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Your use or misuse of the platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Your violation of these Terms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6366F1] mr-2">•</span>
                    <span>Your violation of any third-party rights</span>
                  </li>
                </ul>
              </section>

              {/* Termination */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">10. Termination</h2>
                <p className="text-[#4B5563] leading-relaxed mb-3">
                  <strong>You may terminate your account at any time</strong> by deleting it in your account settings. All your data will be permanently deleted within 30 days.
                </p>
                <p className="text-[#4B5563] leading-relaxed">
                  <strong>We may suspend or terminate your account</strong> if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.
                </p>
              </section>

              {/* Governing law */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">11. Governing Law</h2>
                <p className="text-[#4B5563] leading-relaxed">
                  These Terms are governed by the laws of <strong>Delaware, United States</strong>, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Delaware.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">12. Changes to These Terms</h2>
                <p className="text-[#4B5563] leading-relaxed">
                  We may update these Terms from time to time. Significant changes will be communicated via email or in-app notification. Continued use of Confide after changes constitutes acceptance of the updated Terms.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-[#1F2937] mb-4">13. Contact Us</h2>
                <p className="text-[#4B5563] leading-relaxed mb-4">
                  Questions about these Terms? Contact us:
                </p>
                <div className="glass p-6 rounded-xl border border-white/20">
                  <p className="text-[#1F2937] font-semibold mb-2">Legal Team</p>
                  <p className="text-[#4B5563]">
                    Email: <a href="mailto:support@confide.app" className="text-[#6366F1] font-medium hover:underline">support@confide.app</a>
                  </p>
                </div>
              </section>

              {/* Final notice */}
              <section className="mt-10">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                  <p className="text-[#1E40AF] leading-relaxed font-medium">
                    By using Confide, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                  </p>
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
              <Link href="/blog" className="hover:text-[#6366F1] transition-smooth">Blog</Link>
              <Link href="/privacy" className="hover:text-[#6366F1] transition-smooth">Privacy</Link>
              <Link href="/terms" className="hover:text-[#6366F1] transition-smooth font-medium">Terms</Link>
              <a href="mailto:support@confide.app" className="hover:text-[#6366F1] transition-smooth">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
