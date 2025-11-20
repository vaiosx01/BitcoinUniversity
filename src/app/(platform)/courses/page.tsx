'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  X,
  Grid3x3,
  List,
  Clock,
  Users,
  Star,
  TrendingUp,
  DollarSign,
  Calendar,
  BookOpen,
  Award,
  Zap,
  ChevronDown,
  Check,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { CourseCard } from '@/components/courses/CourseCard'
import { SAMPLE_COURSES } from '@/lib/constants/courses'
import Link from 'next/link'

type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'duration'
type ViewMode = 'grid' | 'list'
type FilterCategory = 'all' | 'blockchain' | 'defi' | 'security' | 'development'

interface Course {
  id: number
  title: string
  educator: string
  duration: string
  price: string
  students: number
  description: string
  category: FilterCategory
  level: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  reviews: number
  image?: string
}

// Extended courses data
const courses: Course[] = [
  {
    ...SAMPLE_COURSES[0],
    category: 'blockchain',
    level: 'beginner',
    rating: 4.8,
    reviews: 124,
    description: 'Learn the core concepts of blockchain technology, from consensus mechanisms to smart contracts. Perfect for beginners.',
  },
  {
    ...SAMPLE_COURSES[1],
    category: 'defi',
    level: 'intermediate',
    rating: 4.9,
    reviews: 87,
    description: 'Design and implement decentralized finance protocols from scratch. Build real-world DeFi applications.',
  },
  {
    ...SAMPLE_COURSES[2],
    category: 'security',
    level: 'advanced',
    rating: 5.0,
    reviews: 56,
    description: 'Master security best practices for smart contract development and auditing. Become a security expert.',
  },
  {
    id: 4,
    title: 'Ethereum Development',
    educator: 'Prof. Buterin',
    duration: '14 weeks',
    price: '0.12 ETH',
    students: 203,
    category: 'development',
    level: 'intermediate',
    rating: 4.7,
    reviews: 145,
    description: 'Comprehensive guide to building on Ethereum. Learn Solidity, testing, and deployment strategies.',
  },
  {
    id: 5,
    title: 'NFT Marketplace Development',
    educator: 'Dr. Crypto',
    duration: '10 weeks',
    price: '0.09 ETH',
    students: 178,
    category: 'development',
    level: 'intermediate',
    rating: 4.6,
    reviews: 98,
    description: 'Build a complete NFT marketplace from scratch. Learn minting, trading, and royalty systems.',
  },
  {
    id: 6,
    title: 'Layer 2 Solutions',
    educator: 'Prof. Optimism',
    duration: '8 weeks',
    price: '0.07 ETH',
    students: 156,
    category: 'blockchain',
    level: 'advanced',
    rating: 4.9,
    reviews: 112,
    description: 'Deep dive into Layer 2 scaling solutions. Explore Optimistic and ZK rollups, state channels, and more.',
  },
]

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1])

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.educator.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })

    // Sort courses
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.students - a.students
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'newest':
          return b.id - a.id
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration)
        default:
          return 0
      }
    })

    return result
  }, [searchTerm, selectedCategory, sortBy, selectedLevel])

  const categories = [
    { id: 'all', name: 'All Courses', count: courses.length },
    { id: 'blockchain', name: 'Blockchain', count: courses.filter(c => c.category === 'blockchain').length },
    { id: 'defi', name: 'DeFi', count: courses.filter(c => c.category === 'defi').length },
    { id: 'security', name: 'Security', count: courses.filter(c => c.category === 'security').length },
    { id: 'development', name: 'Development', count: courses.filter(c => c.category === 'development').length },
  ]

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ]

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
            Course Catalog
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl">
            Discover blockchain courses taught by industry experts. Earn verifiable NFT credentials upon completion.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8 relative"
        >
          <GlassCard className="p-4 sm:p-6 relative">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Advanced Search Bar */}
              <div className="flex-1">
                <SearchBar
                  placeholder="Search courses, educators, or topics..."
                  onSearch={(query) => setSearchTerm(query)}
                  showSuggestions={true}
                />
              </div>

              {/* Filter Toggle (Mobile) */}
              <div className="flex gap-2 sm:gap-3 lg:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all text-xs sm:text-sm ${
                    showFilters
                      ? 'bg-btcu-primary text-white'
                      : 'frosted-card glass-hover'
                  }`}
                >
                  <Filter size={16} className="sm:w-5 sm:h-5" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 sm:p-3 rounded-xl frosted-card glass-hover"
                >
                  {viewMode === 'grid' ? <List size={16} className="sm:w-5 sm:h-5" /> : <Grid3x3 size={16} className="sm:w-5 sm:h-5" />}
                </button>
              </div>

              {/* View Mode Toggle (Desktop) */}
              <div className="hidden lg:flex gap-3">
                <div className="flex rounded-xl overflow-hidden border border-white/20">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-btcu-primary text-white'
                        : 'frosted-card glass-hover'
                    }`}
                  >
                    <Grid3x3 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-all ${
                      viewMode === 'list'
                        ? 'bg-btcu-primary text-white'
                        : 'frosted-card glass-hover'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Level</label>
                      <div className="flex flex-wrap gap-2">
                        {levels.map((level) => (
                          <button
                            key={level.id}
                            onClick={() => setSelectedLevel(level.id)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              selectedLevel === level.id
                                ? 'bg-btcu-primary text-white'
                                : 'frosted-card glass-hover'
                            }`}
                          >
                            {level.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Categories and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8 relative z-0">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 sm:flex-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as FilterCategory)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-btcu-primary text-white'
                    : 'frosted-card glass-hover'
                }`}
              >
                {category.name}
                <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none w-full sm:w-auto px-3 sm:px-4 py-2 pr-8 sm:pr-10 rounded-xl frosted-card glass-hover border border-white/20 focus:outline-none focus:border-btcu-primary text-white bg-transparent cursor-pointer text-xs sm:text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="duration">Duration</option>
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
          Showing <span className="text-btcu-primary font-semibold">{filteredCourses.length}</span> of{' '}
          <span className="text-white">{courses.length}</span> courses
        </div>

        {/* Course Grid/List */}
        <AnimatePresence mode="wait">
          {filteredCourses.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'
                  : 'space-y-3 sm:space-y-4'
              }
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  {viewMode === 'grid' ? (
                    <CourseCardEnhanced course={course} />
                  ) : (
                    <CourseCardList course={course} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <GlassCard className="p-12 max-w-md mx-auto">
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No courses found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                  }}
                  className="px-6 py-3 bg-btcu-primary text-white rounded-xl font-semibold hover:bg-btcu-primary/90 transition"
                >
                  Clear Filters
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Enhanced Course Card for Grid View
function CourseCardEnhanced({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <GlassCard hover className="h-full flex flex-col">
        {/* Course Image */}
        <div className="relative aspect-video bg-gradient-to-br from-btcu-primary/20 via-btcu-secondary/20 to-btcu-accent/20 rounded-xl mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
              course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">{course.rating}</span>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <span>by</span>
            <span className="text-btcu-primary font-medium">{course.educator}</span>
          </div>

          {/* Course Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{course.students}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span>{course.rating}</span>
              <span className="text-gray-500">({course.reviews})</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-2xl font-bold text-btcu-primary">{course.price}</span>
            <motion.button
              className="px-6 py-2 bg-btcu-primary text-white rounded-lg font-semibold hover:bg-btcu-primary/90 transition flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => e.preventDefault()}
            >
              <span>View</span>
              <Award size={16} />
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}

// Course Card for List View
function CourseCardList({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <GlassCard hover>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Course Image */}
          <div className="relative w-full sm:w-64 h-48 sm:h-auto sm:flex-shrink-0 bg-gradient-to-br from-btcu-primary/20 via-btcu-secondary/20 to-btcu-accent/20 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
            </div>
          </div>

          {/* Course Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-3">{course.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>by</span>
                  <span className="text-btcu-primary font-medium">{course.educator}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-btcu-primary mb-2">{course.price}</div>
                <div className="flex items-center justify-end gap-1 text-sm">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-500">({course.reviews})</span>
                </div>
              </div>
            </div>

            {/* Stats and CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={16} />
                  <span>NFT Credential</span>
                </div>
              </div>
              <motion.button
                className="px-8 py-3 bg-btcu-primary text-white rounded-xl font-semibold hover:bg-btcu-primary/90 transition flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.preventDefault()}
              >
                <span>Enroll Now</span>
                <Award size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}
