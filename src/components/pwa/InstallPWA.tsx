'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback para iOS
      toast(
        <div className="text-sm">
          <p className="font-semibold mb-2">Instalar en iOS:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Toca el botón Compartir</li>
            <li>Selecciona &quot;Añadir a pantalla de inicio&quot;</li>
          </ol>
        </div>,
        { duration: 6000 }
      )
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      toast.success('¡Bitcoin University instalada correctamente!')
    } else {
      toast('Instalación cancelada', { icon: 'ℹ️' })
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Guardar preferencia para no mostrar de nuevo por un tiempo
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Verificar si el usuario ya descartó recientemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        >
          <div className="frosted-card p-4 border border-white/20 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-btcu-primary/20 rounded-lg">
                <Download className="text-btcu-primary" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Instalar Bitcoin University</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Instala la app para acceso rápido y funcionalidad offline
                </p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleInstallClick}
                    className="flex-1 px-4 py-2 bg-btcu-primary text-white rounded-lg font-semibold hover:bg-btcu-primary/90 transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Instalar
                  </motion.button>
                  <motion.button
                    onClick={handleDismiss}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Cerrar"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

