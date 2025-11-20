'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Clock,
  TrendingUp,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: number
  type: 'course' | 'educator' | 'category'
  title: string
  subtitle?: string
  icon?: React.ReactNode
  metadata?: string
}

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  suggestions?: string[]
  recentSearches?: string[]
  showSuggestions?: boolean
  className?: string
}

// Mock data for suggestions and recent searches
const popularSearches = [
  'Blockchain Fundamentals',
  'Smart Contracts',
  'DeFi Protocols',
  'NFT Development',
  'Ethereum',
  'Solidity',
]

const categories = [
  { name: 'Blockchain', icon: BookOpen },
  { name: 'DeFi', icon: TrendingUp },
  { name: 'Security', icon: BookOpen },
  { name: 'Development', icon: BookOpen },
]

export function SearchBar({
  placeholder = 'Search courses, educators, or topics...',
  onSearch,
  showSuggestions = true,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Get recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recentSearches')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  // Generate search results based on query
  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return []

    const lowerQuery = query.toLowerCase()
    const results: SearchResult[] = []

    // Mock course data - in real app, this would come from API
    const mockCourses = [
      { id: 1, title: 'Blockchain Fundamentals', educator: 'Prof. Satoshi', category: 'Blockchain' },
      { id: 2, title: 'DeFi Protocol Design', educator: 'Dr. Vitalik', category: 'DeFi' },
      { id: 3, title: 'Smart Contract Security', educator: 'Prof. Trail', category: 'Security' },
      { id: 4, title: 'Ethereum Development', educator: 'Prof. Buterin', category: 'Development' },
      { id: 5, title: 'NFT Marketplace Development', educator: 'Dr. Crypto', category: 'Development' },
      { id: 6, title: 'Layer 2 Solutions', educator: 'Prof. Optimism', category: 'Blockchain' },
    ]

    // Match courses
    mockCourses.forEach((course) => {
      if (
        course.title.toLowerCase().includes(lowerQuery) ||
        course.educator.toLowerCase().includes(lowerQuery) ||
        course.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: course.id,
          type: 'course',
          title: course.title,
          subtitle: `by ${course.educator}`,
          metadata: course.category,
          icon: <BookOpen className="w-4 h-4" />,
        })
      }
    })

    // Match educators
    const uniqueEducators = [...new Set(mockCourses.map((c) => c.educator))]
    uniqueEducators.forEach((educator) => {
      if (educator.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: results.length + 100,
          type: 'educator',
          title: educator,
          subtitle: 'Educator',
          icon: <User className="w-4 h-4" />,
        })
      }
    })

    // Match categories
    categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: results.length + 200,
          type: 'category',
          title: cat.name,
          subtitle: 'Category',
          icon: <cat.icon className="w-4 h-4" />,
        })
      }
    })

    return results.slice(0, 8) // Limit to 8 results
  }, [query])

  // Handle search
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }

    // Navigate or call callback
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`)
    }

    setIsFocused(false)
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleSearch(searchResults[selectedIndex].title)
      } else {
        handleSearch(query)
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Simulate loading
  useEffect(() => {
    if (query.length >= 2) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 300)
      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [query])

  const showDropdown = isFocused && showSuggestions

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full ${className}`}
      style={{ 
        zIndex: showDropdown ? 9999 : 'auto',
        position: 'relative',
      }}
    >
      {/* Search Input */}
      <div className="relative z-10">
        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10">
          {isLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 lg:py-4 bg-transparent border border-white/20 rounded-xl focus:outline-none focus:border-btcu-primary focus:ring-2 focus:ring-btcu-primary/20 transition-all text-white placeholder-gray-500 text-xs sm:text-sm lg:text-base"
        />

        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setQuery('')
              setSelectedIndex(-1)
              inputRef.current?.focus()
            }}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-0.5 sm:p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-white" />
          </motion.button>
        )}

        {/* Search Button (Mobile) */}
        {query && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleSearch(query)}
            className="absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg bg-btcu-primary hover:bg-btcu-primary/90 transition-colors sm:hidden"
            aria-label="Search"
          >
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </motion.button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 frosted-card border border-white/20 rounded-xl overflow-hidden shadow-2xl max-h-[400px] sm:max-h-[500px] overflow-y-auto"
            style={{ 
              position: 'absolute',
              zIndex: 9999,
            }}
          >
            {/* Search Results */}
            {query.length >= 2 && searchResults.length > 0 && (
              <div className="p-1.5 sm:p-2">
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Results
                </div>
                {searchResults.map((result, index) => (
                  <motion.button
                    key={result.id}
                    onClick={() => handleSearch(result.title)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all text-left ${
                      selectedIndex === index
                        ? 'bg-btcu-primary/20 border border-btcu-primary/30'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-btcu-primary/20 flex items-center justify-center text-btcu-primary">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4">{result.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate text-xs sm:text-sm">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs sm:text-sm text-gray-400 truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    {result.metadata && (
                      <div className="flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs text-gray-400 bg-white/5 hidden sm:block">
                        {result.metadata}
                      </div>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div className="p-1.5 sm:p-2 border-t border-white/10">
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Recent Searches</span>
                  <button
                    onClick={() => {
                      setRecentSearches([])
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('recentSearches')
                      }
                    }}
                    className="text-[10px] sm:text-xs text-btcu-primary hover:text-btcu-primary/80"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      handleSearch(search)
                    }}
                    className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left group"
                  >
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-hover:text-btcu-primary transition-colors flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {search}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {query.length < 2 && (
              <div className="p-1.5 sm:p-2 border-t border-white/10">
                <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <TrendingUp className="w-3 h-3 flex-shrink-0" />
                  <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 p-1.5 sm:p-2">
                  {popularSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setQuery(search)
                        handleSearch(search)
                      }}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm bg-white/5 hover:bg-btcu-primary/20 hover:text-btcu-primary border border-white/10 hover:border-btcu-primary/30 transition-all text-gray-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && searchResults.length === 0 && !isLoading && (
              <div className="p-8 text-center">
                <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-1">No results found</p>
                <p className="text-sm text-gray-500">
                  Try different keywords or browse categories
                </p>
              </div>
            )}

            {/* Quick Actions */}
            {query.length >= 2 && (
              <div className="p-2 border-t border-white/10">
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-btcu-primary hover:bg-btcu-primary/90 text-white font-semibold transition-colors"
                >
                  <span>Search for &quot;{query}&quot;</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

