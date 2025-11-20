'use client'

import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      onClick={onClick}
      className={cn(
        'frosted-card p-6',
        hover && 'glass-hover cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02 } : undefined}
    >
      {children}
    </Component>
  )
}

