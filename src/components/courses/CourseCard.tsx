'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Clock, Users, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface CourseCardProps {
  courseId: number
  title: string
  educator: string
  duration: string
  price: string
  students: number
  description?: string
}

export function CourseCard({
  courseId,
  title,
  educator,
  duration,
  price,
  students,
  description,
}: CourseCardProps) {
  return (
    <GlassCard hover className="h-full flex flex-col">
      <div className="aspect-video bg-gradient-to-br from-btcu-primary/20 to-btcu-secondary/20 rounded-lg mb-3 sm:mb-4" />
      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 line-clamp-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">by {educator}</p>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2 flex-1">{description}</p>
      )}
      <div className="flex flex-wrap justify-between gap-2 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
        <div className="flex items-center gap-1">
          <Clock size={14} className="sm:w-4 sm:h-4" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} className="sm:w-4 sm:h-4" />
          <span>{students} students</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 mt-auto">
        <span className="text-lg sm:text-xl font-bold text-btcu-primary text-center sm:text-left">{price}</span>
        <Link href={`/courses/${courseId}`} className="w-full sm:w-auto">
          <motion.button
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-btcu-primary text-white rounded-lg font-semibold hover:bg-btcu-primary/90 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enroll
            <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </motion.button>
        </Link>
      </div>
    </GlassCard>
  )
}

