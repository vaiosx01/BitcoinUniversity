'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm text-black p-3 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={20} />
            <span className="font-semibold">Modo offline - Algunas funciones pueden estar limitadas</span>
          </div>
        </motion.div>
      )}
      {isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-btcu-accent/90 backdrop-blur-sm text-black p-3 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi size={20} />
            <span className="font-semibold">Conexión restaurada</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

