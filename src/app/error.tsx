'use client'

import { useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassCard className="max-w-md text-center">
        <div className="p-4 bg-red-500/20 rounded-lg inline-block mb-4">
          <AlertCircle className="text-red-400" size={48} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Algo salió mal</h1>
        <p className="text-gray-400 mb-6">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-btcu-primary text-white rounded-lg font-semibold hover:bg-btcu-primary/90 transition"
          >
            <RefreshCw size={20} />
            <span>Intentar de nuevo</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 frosted-card glass-hover rounded-lg font-semibold"
          >
            <Home size={20} />
            <span>Ir al inicio</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}

