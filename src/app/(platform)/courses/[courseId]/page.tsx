'use client'

import { useParams } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { Clock, Users, Award, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string

  return (
    <div className="min-h-screen py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="aspect-video bg-gradient-to-br from-btcu-primary/20 to-btcu-secondary/20 rounded-xl mb-6 sm:mb-8" />

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Blockchain Fundamentals</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8">
            Learn the core concepts of blockchain technology, from consensus mechanisms to smart contracts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <GlassCard>
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="text-btcu-primary w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-400">Duration</p>
                  <p className="font-bold text-sm sm:text-base">12 weeks</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="text-btcu-secondary w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-400">Students</p>
                  <p className="font-bold text-sm sm:text-base">142 enrolled</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 sm:gap-3">
                <Award className="text-btcu-accent w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-400">Certificate</p>
                  <p className="font-bold text-sm sm:text-base">NFT Credential</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="mb-6 sm:mb-8 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Course Description</h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4 sm:mb-6">
              This comprehensive course covers the fundamental principles of blockchain technology,
              including distributed systems, cryptographic foundations, consensus algorithms, and
              smart contract development. Students will gain hands-on experience building
              decentralized applications.
            </p>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">What you&apos;ll learn:</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-300">
                <li className="flex items-start gap-2">
                  <BookOpen size={16} className="text-btcu-primary flex-shrink-0 mt-0.5" />
                  <span>Blockchain architecture and data structures</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen size={16} className="text-btcu-primary flex-shrink-0 mt-0.5" />
                  <span>Consensus mechanisms (PoW, PoS, DPoS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen size={16} className="text-btcu-primary flex-shrink-0 mt-0.5" />
                  <span>Smart contract development with Solidity</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen size={16} className="text-btcu-primary flex-shrink-0 mt-0.5" />
                  <span>DeFi protocols and token standards</span>
                </li>
              </ul>
            </div>
          </GlassCard>

          <div className="flex gap-3 sm:gap-4">
            <motion.button
              className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-btcu-primary text-white font-bold rounded-xl glow-orange text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="hidden sm:inline">Enroll Now - 0.05 ETH</span>
              <span className="sm:hidden">Enroll - 0.05 ETH</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

