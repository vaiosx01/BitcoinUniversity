'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      setIsInstallable(false)
      return
    }

    // Show install button by default if not installed (will work on most modern browsers)
    // The button will handle installation appropriately for each platform
    setIsInstallable(true)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        toast(
          (t) => (
            <div className="text-sm">
              <p className="font-semibold mb-2">Install on iOS:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Tap the Share button</li>
                <li>Select &quot;Add to Home Screen&quot;</li>
              </ol>
            </div>
          ),
          { duration: 6000 }
        )
      } else {
        toast.error('Installation not available. Please use a supported browser.')
      }
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        toast.success('Bitcoin University installed successfully!')
        setDeferredPrompt(null)
        setIsInstallable(false)
        setIsInstalled(true)
        return true
      } else {
        toast('Installation cancelled', { icon: 'ℹ️' })
        return false
      }
    } catch (error) {
      console.error('Error installing PWA:', error)
      toast.error('Failed to install. Please try again.')
      return false
    }
  }

  return {
    install,
    isInstallable,
    isInstalled,
  }
}

