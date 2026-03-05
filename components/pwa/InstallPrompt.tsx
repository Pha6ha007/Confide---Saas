'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check dismissed count
    const dismissedCount = parseInt(localStorage.getItem('pwa-install-dismissed') || '0')
    if (dismissedCount >= 3) {
      return
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after 30 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show prompt after 30 seconds
    if (iOS) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    const dismissedCount = parseInt(localStorage.getItem('pwa-install-dismissed') || '0')
    localStorage.setItem('pwa-install-dismissed', String(dismissedCount + 1))
    setShowPrompt(false)
  }

  if (!showPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div className="glass border border-white/20 rounded-2xl p-4 shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="font-serif font-bold text-lg text-white">C</span>
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-[#1F2937] mb-1">
                Install Confide
              </h3>
              <p className="text-sm text-[#6B7280] mb-3">
                {isIOS
                  ? 'Tap Share → Add to Home Screen for quick access'
                  : 'Install Confide for a better experience with offline access'}
              </p>

              {/* Install button (only for non-iOS) */}
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="w-full flex items-center justify-center space-x-2 bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#5558E3] transition-all duration-200 font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
