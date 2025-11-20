import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassCard className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-btcu-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-gray-400 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-btcu-primary text-white rounded-lg font-semibold hover:bg-btcu-primary/90 transition"
          >
            <Home size={20} />
            <span>Ir al inicio</span>
          </Link>
          <Link
            href="/courses"
            className="flex items-center gap-2 px-6 py-3 frosted-card glass-hover rounded-lg font-semibold"
          >
            <ArrowLeft size={20} />
            <span>Explorar cursos</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}

