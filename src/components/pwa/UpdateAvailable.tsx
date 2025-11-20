'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'

export function UpdateAvailable() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        // Escuchar actualizaciones del service worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Hay una nueva versión disponible
                setUpdateAvailable(true)
                toast('Nueva versión disponible', {
                  icon: '🔄',
                  duration: 5000,
                })
              }
            })
          }
        })

        // Verificar actualizaciones periódicamente
        setInterval(() => {
          reg.update()
        }, 60 * 60 * 1000) // Cada hora
      })
    }
  }, [])

  const handleUpdate = async () => {
    if (registration) {
      // Forzar actualización
      await registration.update()
      
      // Esperar a que el nuevo service worker esté listo
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        
        // Recargar la página después de un breve delay
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
    // No mostrar de nuevo hasta la próxima actualización
  }

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        >
          <div className="frosted-card p-4 border border-btcu-accent/50 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-btcu-accent/20 rounded-lg">
                <RefreshCw className="text-btcu-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Actualización Disponible</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Hay una nueva versión de Bitcoin University disponible
                </p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-btcu-accent text-black rounded-lg font-semibold hover:bg-btcu-accent/90 transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Actualizar Ahora
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

