'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Target,
  Zap,
  ChevronRight,
  Play,
  CheckCircle,
  Star,
  BarChart3,
  Activity,
  Trophy,
  FileText,
  ArrowUpRight,
  Filter,
  Grid,
  List as ListIcon,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'

interface EnrolledCourse {
  id: number
  title: string
  educator: string
  progress: number
  nextClass: string
  category: string
  duration: string
  image?: string
}

interface Credential {
  id: number
  title: string
  course: string
  date: string
  verified: boolean
  tokenId: string
}

interface Activity {
  id: number
  type: 'enrollment' | 'completion' | 'certificate' | 'achievement'
  title: string
  timestamp: string
  icon: React.ReactNode
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  // Mock data - In real app, this would come from blockchain/API
  const stats = [
    {
      label: 'Active Courses',
      value: '3',
      change: '+1 this month',
      icon: BookOpen,
      color: 'from-btcu-primary to-orange-600',
      trend: 'up',
    },
    {
      label: 'Credentials Earned',
      value: '5',
      change: '+2 this month',
      icon: Award,
      color: 'from-btcu-accent to-teal-600',
      trend: 'up',
    },
    {
      label: 'Average Grade',
      value: '92%',
      change: '+3% improvement',
      icon: TrendingUp,
      color: 'from-btcu-secondary to-blue-600',
      trend: 'up',
    },
    {
      label: 'Study Hours',
      value: '127',
      change: 'This month',
      icon: Clock,
      color: 'from-purple-500 to-pink-600',
      trend: 'neutral',
    },
  ]

  const enrolledCourses: EnrolledCourse[] = [
    {
      id: 1,
      title: 'Blockchain Fundamentals',
      educator: 'Prof. Satoshi',
      progress: 75,
      nextClass: 'Tomorrow at 3PM',
      category: 'Blockchain',
      duration: '12 weeks',
    },
    {
      id: 2,
      title: 'DeFi Protocol Design',
      educator: 'Dr. Vitalik',
      progress: 45,
      nextClass: 'Friday at 1PM',
      category: 'DeFi',
      duration: '8 weeks',
    },
    {
      id: 3,
      title: 'Smart Contract Security',
      educator: 'Prof. Trail',
      progress: 30,
      nextClass: 'Monday at 4PM',
      category: 'Security',
      duration: '10 weeks',
    },
  ]

  const recentCredentials: Credential[] = [
    {
      id: 1,
      title: 'Blockchain Developer',
      course: 'Blockchain Fundamentals',
      date: '2 days ago',
      verified: true,
      tokenId: '#1234',
    },
    {
      id: 2,
      title: 'DeFi Specialist',
      course: 'DeFi Protocol Design',
      date: '1 week ago',
      verified: true,
      tokenId: '#1233',
    },
  ]

  const recentActivity: Activity[] = [
    {
      id: 1,
      type: 'enrollment',
      title: 'Enrolled in Smart Contract Security',
      timestamp: '2 hours ago',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 2,
      type: 'completion',
      title: 'Completed Module 5: Consensus Mechanisms',
      timestamp: '1 day ago',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: 3,
      type: 'certificate',
      title: 'Earned Blockchain Developer Credential',
      timestamp: '2 days ago',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Achieved 100 Study Hours Milestone',
      timestamp: '3 days ago',
      icon: <Trophy className="w-4 h-4" />,
    },
  ]

  const filteredCourses = enrolledCourses.filter((course) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'active') return course.progress < 100
    if (selectedFilter === 'completed') return course.progress === 100
    return true
  })

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-green-500 to-emerald-600'
    if (progress >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-cyan-500'
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2">
                My Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400">
                Welcome back! Here's your learning progress and achievements.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link href="/courses" className="w-full sm:w-auto">
                <motion.button
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-btcu-primary text-white rounded-xl font-semibold hover:bg-btcu-primary/90 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Browse Courses</span>
                  <span className="sm:hidden">Browse</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <GlassCard hover className="h-full">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center gap-1 text-green-400 text-xs sm:text-sm">
                      <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">{stat.label}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{stat.change}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content - Enrolled Courses */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Courses Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">My Courses</h2>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Filter Buttons */}
                <div className="flex gap-1 sm:gap-2 rounded-xl overflow-hidden border border-white/20 flex-1 sm:flex-initial">
                  {(['all', 'active', 'completed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-initial ${
                        selectedFilter === filter
                          ? 'bg-btcu-primary text-white'
                          : 'bg-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
                {/* View Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/20">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-btcu-primary text-white'
                        : 'bg-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 transition-all ${
                      viewMode === 'list'
                        ? 'bg-btcu-primary text-white'
                        : 'bg-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <ListIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courses List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4' : 'space-y-3 sm:space-y-4'}>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link href={`/courses/${course.id}`}>
                    <GlassCard hover className="h-full">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Course Image */}
                        <div className="relative w-full sm:w-28 lg:w-32 h-28 sm:h-auto bg-gradient-to-br from-btcu-primary/20 via-btcu-secondary/20 to-btcu-accent/20 rounded-xl overflow-hidden flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold bg-black/50 backdrop-blur-sm">
                              {course.category}
                            </span>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 line-clamp-2">{course.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">by {course.educator}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xl sm:text-2xl font-bold text-btcu-primary">
                                {course.progress}%
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500">complete</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 mb-2 sm:mb-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-1.5 sm:h-2 rounded-full bg-gradient-to-r ${getProgressColor(course.progress)}`}
                            />
                          </div>

                          {/* Course Meta */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-400">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">{course.nextClass}</span>
                                <span className="sm:hidden">Next: {course.nextClass.split(' ')[0]}</span>
                              </div>
                            </div>
                            <motion.button
                              className="flex items-center gap-1 text-btcu-primary hover:text-btcu-primary/80 transition-colors"
                              whileHover={{ x: 4 }}
                            >
                              <span className="text-xs sm:text-sm font-semibold">Continue</span>
                              <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCourses.length === 0 && (
              <GlassCard className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No courses found</h3>
                <p className="text-gray-400 mb-6">
                  {selectedFilter === 'completed'
                    ? "You haven't completed any courses yet."
                    : "You don't have any active courses."}
                </p>
                <Link href="/courses">
                  <motion.button
                    className="px-6 py-3 bg-btcu-primary text-white rounded-xl font-semibold hover:bg-btcu-primary/90 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Courses
                  </motion.button>
                </Link>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Recent Credentials */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-primary flex-shrink-0" />
                    <span>Recent Credentials</span>
                  </h3>
                  <Link
                    href="/credentials"
                    className="text-xs sm:text-sm text-btcu-primary hover:text-btcu-primary/80 transition-colors flex-shrink-0"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {recentCredentials.map((credential) => (
                    <div
                      key={credential.id}
                      className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-btcu-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold mb-1 line-clamp-1">{credential.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">{credential.course}</p>
                        </div>
                        {credential.verified && (
                          <div className="flex-shrink-0">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 gap-2">
                        <span className="truncate">{credential.date}</span>
                        <span className="text-btcu-primary font-mono truncate">{credential.tokenId}</span>
                      </div>
                    </div>
                  ))}
                  <Link href="/credentials">
                    <motion.button
                      className="w-full px-3 sm:px-4 py-2 rounded-lg bg-btcu-primary/20 hover:bg-btcu-primary/30 text-btcu-primary font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>View All Credentials</span>
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </motion.button>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-primary flex-shrink-0" />
                    <span>Recent Activity</span>
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-btcu-primary/20 flex items-center justify-center text-btcu-primary">
                        <div className="w-3 h-3 sm:w-4 sm:h-4">{activity.icon}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 line-clamp-2">{activity.title}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <GlassCard>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/courses">
                    <motion.button
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left text-xs sm:text-sm"
                      whileHover={{ x: 4 }}
                    >
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-primary flex-shrink-0" />
                      <span>Browse Courses</span>
                    </motion.button>
                  </Link>
                  <Link href="/credentials">
                    <motion.button
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left text-xs sm:text-sm"
                      whileHover={{ x: 4 }}
                    >
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-accent flex-shrink-0" />
                      <span>View Credentials</span>
                    </motion.button>
                  </Link>
                  <motion.button
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left text-xs sm:text-sm"
                    whileHover={{ x: 4 }}
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-secondary flex-shrink-0" />
                    <span>View Analytics</span>
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
