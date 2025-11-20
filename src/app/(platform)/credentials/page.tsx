'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Award,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Share2,
  ExternalLink,
  Download,
  Shield,
  Calendar,
  User,
  Building2,
  Hash,
  Copy,
  Eye,
  Sparkles,
  Trophy,
  Star,
  Zap,
  BookOpen,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { SearchBar } from '@/components/ui/SearchBar'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useChainId } from 'wagmi'
import { chainConfig } from '@/lib/config/chains'

interface Credential {
  id: number
  tokenId: string
  title: string
  type: 'degree' | 'certificate' | 'badge' | 'achievement'
  field: string
  course?: string
  issuedAt: string
  expiresAt?: string
  verified: boolean
  revoked: boolean
  expired: boolean
  issuer: string
  recipient: string
  metadataHash?: string
  image?: string
}

type FilterType = 'all' | 'verified' | 'pending' | 'expired' | 'revoked'
type ViewMode = 'grid' | 'list'

export default function CredentialsPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)

  // Mock data - In real app, this would come from blockchain
  const credentials: Credential[] = useMemo(() => [
    {
      id: 1,
      tokenId: '#1234',
      title: 'Blockchain Developer',
      type: 'certificate',
      field: 'Blockchain Technology',
      course: 'Blockchain Fundamentals',
      issuedAt: '2024-01-15',
      verified: true,
      revoked: false,
      expired: false,
      issuer: 'Bitcoin University',
      recipient: address || '0x...',
    },
    {
      id: 2,
      tokenId: '#1233',
      title: 'DeFi Specialist',
      type: 'certificate',
      field: 'Decentralized Finance',
      course: 'DeFi Protocol Design',
      issuedAt: '2024-03-20',
      verified: true,
      revoked: false,
      expired: false,
      issuer: 'Bitcoin University',
      recipient: address || '0x...',
    },
    {
      id: 3,
      tokenId: '#1232',
      title: 'Smart Contract Auditor',
      type: 'certificate',
      field: 'Blockchain Security',
      course: 'Smart Contract Security',
      issuedAt: '2024-05-10',
      verified: true,
      revoked: false,
      expired: false,
      issuer: 'Bitcoin University',
      recipient: address || '0x...',
    },
    {
      id: 4,
      tokenId: '#1231',
      title: 'Ethereum Developer',
      type: 'certificate',
      field: 'Ethereum Development',
      course: 'Ethereum Development',
      issuedAt: '2024-06-01',
      verified: false,
      revoked: false,
      expired: false,
      issuer: 'Bitcoin University',
      recipient: address || '0x...',
    },
    {
      id: 5,
      tokenId: '#1230',
      title: 'NFT Marketplace Builder',
      type: 'badge',
      field: 'NFT Development',
      course: 'NFT Marketplace Development',
      issuedAt: '2024-07-15',
      verified: true,
      revoked: false,
      expired: true,
      expiresAt: '2024-12-31',
      issuer: 'Bitcoin University',
      recipient: address || '0x...',
    },
    {
      id: 6,
      tokenId: '#1229',
      title: 'Layer 2 Expert',
      type: 'achievement',
      field: 'Scaling Solutions',
      course: 'Layer 2 Solutions',
      issuedAt: '2024-08-20',
      verified: true,
      revoked: false,
      expired: false,
      issuer: 'Bitcoin University',
      recipient: address || '0x...',
    },
  ], [address])

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  // Filter and search credentials
  const filteredCredentials = useMemo(() => {
    return credentials.filter((credential) => {
      const matchesSearch =
        credential.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credential.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credential.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credential.tokenId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'verified' && credential.verified) ||
        (selectedFilter === 'pending' && !credential.verified) ||
        (selectedFilter === 'expired' && credential.expired) ||
        (selectedFilter === 'revoked' && credential.revoked)

      return matchesSearch && matchesFilter
    })
  }, [searchTerm, selectedFilter, credentials])

  const getCredentialTypeColor = (type: Credential['type']) => {
    switch (type) {
      case 'degree':
        return 'from-blue-500 to-cyan-600'
      case 'certificate':
        return 'from-btcu-primary to-orange-600'
      case 'badge':
        return 'from-btcu-accent to-teal-600'
      case 'achievement':
        return 'from-purple-500 to-pink-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getCredentialTypeIcon = (type: Credential['type']) => {
    switch (type) {
      case 'degree':
        return <Trophy className="w-6 h-6" />
      case 'certificate':
        return <Award className="w-6 h-6" />
      case 'badge':
        return <Star className="w-6 h-6" />
      case 'achievement':
        return <Zap className="w-6 h-6" />
      default:
        return <Award className="w-6 h-6" />
    }
  }

  const handleShare = async (credential: Credential) => {
    const shareData = {
      title: `${credential.title} - Bitcoin University`,
      text: `Check out my ${credential.title} credential from Bitcoin University! Token ID: ${credential.tokenId}`,
      url: `${window.location.origin}/credentials?tokenId=${credential.tokenId.replace('#', '')}`,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        toast.success('Credential shared successfully!')
      } catch (err: any) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
          // Fallback to copy
          await navigator.clipboard.writeText(shareData.url)
          toast.success('Link copied to clipboard!')
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link copied to clipboard!')
      } catch (err) {
        toast.error('Failed to copy link')
      }
    }
  }

  const handleView = (credential: Credential) => {
    setSelectedCredential(credential)
  }

  const handleCopyTokenId = async (tokenId: string) => {
    try {
      await navigator.clipboard.writeText(tokenId.replace('#', ''))
      toast.success('Token ID copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy Token ID')
    }
  }

  const handleCloseModal = () => {
    setSelectedCredential(null)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <GlassCard className="p-12 max-w-md mx-auto">
            <Shield className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to view your credentials
            </p>
            <Link href="/">
              <motion.button
                className="px-6 py-3 bg-btcu-primary text-white rounded-xl font-semibold hover:bg-btcu-primary/90 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go to Home
              </motion.button>
            </Link>
          </GlassCard>
        </div>
      </div>
    )
  }

  const stats = {
    total: credentials.length,
    verified: credentials.filter((c) => c.verified).length,
    pending: credentials.filter((c) => !c.verified).length,
    expired: credentials.filter((c) => c.expired).length,
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2">
                My Credentials
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-400">
                Your verifiable NFT credentials stored on-chain
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 frosted-card glass-hover rounded-xl font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Export All</span>
                <span className="sm:hidden">Export</span>
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total', value: stats.total, icon: Award, color: 'text-btcu-primary' },
              { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'text-green-400' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
              { label: 'Expired', value: stats.expired, icon: XCircle, color: 'text-red-400' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <GlassCard className="p-3 sm:p-4 text-center">
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} mx-auto mb-1 sm:mb-2`} />
                  <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <GlassCard className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <SearchBar
                  placeholder="Search credentials by title, field, or token ID..."
                  onSearch={setSearchTerm}
                  showSuggestions={false}
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="flex rounded-xl overflow-hidden border border-white/20">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 sm:p-3 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-btcu-primary text-white'
                        : 'frosted-card glass-hover'
                    }`}
                  >
                    <Grid size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 sm:p-3 transition-all ${
                      viewMode === 'list'
                        ? 'bg-btcu-primary text-white'
                        : 'frosted-card glass-hover'
                    }`}
                  >
                    <ListIcon size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(
                [
                  { id: 'all', label: 'All', count: credentials.length },
                  { id: 'verified', label: 'Verified', count: stats.verified },
                  { id: 'pending', label: 'Pending', count: stats.pending },
                  { id: 'expired', label: 'Expired', count: stats.expired },
                  { id: 'revoked', label: 'Revoked', count: 0 },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id as FilterType)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedFilter === filter.id
                      ? 'bg-btcu-primary text-white'
                      : 'frosted-card glass-hover'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
          Showing <span className="text-btcu-primary font-semibold">{filteredCredentials.length}</span> of{' '}
          <span className="text-white">{credentials.length}</span> credentials
        </div>

        {/* Credentials Grid/List */}
        <AnimatePresence mode="wait">
          {filteredCredentials.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-3 sm:space-y-4'
              }
            >
              {filteredCredentials.map((credential, index) => (
                <motion.div
                  key={credential.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  {viewMode === 'grid' ? (
                    <CredentialCardGrid
                      credential={credential}
                      onShare={handleShare}
                      onView={handleView}
                      onCopyTokenId={handleCopyTokenId}
                      getTypeColor={getCredentialTypeColor}
                      getTypeIcon={getCredentialTypeIcon}
                    />
                  ) : (
                    <CredentialCardList
                      credential={credential}
                      onShare={handleShare}
                      onView={handleView}
                      onCopyTokenId={handleCopyTokenId}
                      getTypeColor={getCredentialTypeColor}
                      getTypeIcon={getCredentialTypeIcon}
                    />
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
                <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No credentials found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedFilter('all')
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

      {/* Credential Detail Modal */}
      <CredentialDetailModal
        credential={selectedCredential}
        onClose={handleCloseModal}
        onShare={handleShare}
        onCopyTokenId={handleCopyTokenId}
        getTypeColor={getCredentialTypeColor}
        getTypeIcon={getCredentialTypeIcon}
      />
    </div>
  )
}

// Grid View Card
function CredentialCardGrid({
  credential,
  onShare,
  onView,
  onCopyTokenId,
  getTypeColor,
  getTypeIcon,
}: {
  credential: Credential
  onShare: (credential: Credential) => void
  onView: (credential: Credential) => void
  onCopyTokenId: (tokenId: string) => void
  getTypeColor: (type: Credential['type']) => string
  getTypeIcon: (type: Credential['type']) => React.ReactNode
}) {
  return (
    <GlassCard hover className="h-full flex flex-col">
      {/* Credential Header */}
      <div className={`relative h-24 sm:h-32 bg-gradient-to-br ${getTypeColor(credential.type)} rounded-xl mb-3 sm:mb-4 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <div className="w-5 h-5 sm:w-6 sm:h-6">{getTypeIcon(credential.type)}</div>
          </div>
        </div>
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          {credential.verified ? (
            <div className="flex items-center gap-0.5 sm:gap-1 bg-green-500/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-green-500/30">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-green-400">Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 sm:gap-1 bg-yellow-500/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-yellow-500/30">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-yellow-400">Pending</span>
            </div>
          )}
        </div>
        {credential.expired && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
            <div className="bg-red-500/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-red-500/30 text-center">
              <span className="text-[10px] sm:text-xs font-semibold text-red-400">Expired</span>
            </div>
          </div>
        )}
      </div>

      {/* Credential Info */}
      <div className="flex-1 flex flex-col">
        <div className="mb-2 sm:mb-3">
          <h3 className="text-lg sm:text-xl font-bold mb-1 line-clamp-2">{credential.title}</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 line-clamp-1">{credential.field}</p>
          {credential.course && (
            <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-1">Course: {credential.course}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">Issued: {new Date(credential.issuedAt).toLocaleDateString()}</span>
          </div>
          {credential.expiresAt && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
              <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">Expires: {new Date(credential.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
            <Building2 size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">{credential.issuer}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
            <Hash size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="font-mono text-[10px] sm:text-xs truncate">{credential.tokenId}</span>
            <button
              onClick={() => onCopyTokenId(credential.tokenId)}
              className="p-0.5 sm:p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
            >
              <Copy size={10} className="sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-white/10 mt-auto">
          <motion.button
            onClick={() => onShare(credential)}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-btcu-primary/20 text-btcu-primary rounded-lg text-xs sm:text-sm font-medium hover:bg-btcu-primary/30 transition flex items-center justify-center gap-1 sm:gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 size={14} className="sm:w-4 sm:h-4" />
            <span>Share</span>
          </motion.button>
          <motion.button
            onClick={() => onView(credential)}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 frosted-card glass-hover rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
            <span>View</span>
          </motion.button>
        </div>
      </div>
    </GlassCard>
  )
}

// List View Card
function CredentialCardList({
  credential,
  onShare,
  onView,
  onCopyTokenId,
  getTypeColor,
  getTypeIcon,
}: {
  credential: Credential
  onShare: (credential: Credential) => void
  onView: (credential: Credential) => void
  onCopyTokenId: (tokenId: string) => void
  getTypeColor: (type: Credential['type']) => string
  getTypeIcon: (type: Credential['type']) => React.ReactNode
}) {
  return (
    <GlassCard hover>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Credential Image */}
        <div className={`relative w-full sm:w-40 lg:w-48 h-40 sm:h-auto bg-gradient-to-br ${getTypeColor(credential.type)} rounded-xl overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <div className="w-8 h-8 sm:w-10 sm:h-10">{getTypeIcon(credential.type)}</div>
            </div>
          </div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            {credential.verified ? (
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            ) : (
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            )}
          </div>
        </div>

        {/* Credential Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-2">{credential.title}</h3>
                {credential.verified && (
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-green-500/20 border border-green-500/30 flex-shrink-0">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span className="text-[10px] sm:text-xs font-semibold text-green-400">Verified</span>
                  </div>
                )}
                {credential.expired && (
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-red-500/20 border border-red-500/30 flex-shrink-0">
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    <span className="text-[10px] sm:text-xs font-semibold text-red-400">Expired</span>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 line-clamp-1">{credential.field}</p>
              {credential.course && (
                <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-1">Course: {credential.course}</p>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
              <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Issued: {new Date(credential.issuedAt).toLocaleDateString()}</span>
            </div>
            {credential.expiresAt && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Expires: {new Date(credential.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
              <Building2 size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{credential.issuer}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
              <Hash size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs truncate">{credential.tokenId}</span>
              <button
                onClick={() => onCopyTokenId(credential.tokenId)}
                className="p-0.5 sm:p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
              >
                <Copy size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/10">
            <motion.button
              onClick={() => onShare(credential)}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-3 bg-btcu-primary text-white rounded-xl font-semibold hover:bg-btcu-primary/90 transition flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Share Credential</span>
              <span className="sm:hidden">Share</span>
            </motion.button>
            <motion.button
              onClick={() => onView(credential)}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-3 frosted-card glass-hover rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
              <ExternalLink size={14} className="sm:w-4 sm:h-4 hidden sm:inline" />
            </motion.button>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

// Credential Detail Modal
function CredentialDetailModal({
  credential,
  onClose,
  onShare,
  onCopyTokenId,
  getTypeColor,
  getTypeIcon,
}: {
  credential: Credential | null
  onClose: () => void
  onShare: (credential: Credential) => void
  onCopyTokenId: (tokenId: string) => void
  getTypeColor: (type: Credential['type']) => string
  getTypeIcon: (type: Credential['type']) => React.ReactNode
}) {
  const chainId = useChainId()
  const explorerUrl = (chainConfig as Record<number, { explorer: string }>)[chainId]?.explorer || 'https://sepolia.etherscan.io'
  const tokenIdNumber = credential?.tokenId.replace('#', '') || ''

  if (!credential) return null

  return (
    <AnimatePresence>
      {credential && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-md w-full max-h-[75vh] overflow-y-auto"
            >
            <GlassCard className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(credential.type)}`}>
                      <div className="text-white">
                        {getTypeIcon(credential.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-1">{credential.title}</h2>
                      <p className="text-sm text-gray-400">{credential.field}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {credential.verified ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 border border-green-500/30">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-semibold text-green-400">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/30">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">Pending</span>
                      </div>
                    )}
                    {credential.expired && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/20 border border-red-500/30">
                        <XCircle className="w-3 h-3 text-red-400" />
                        <span className="text-xs font-semibold text-red-400">Expired</span>
                      </div>
                    )}
                    {credential.revoked && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-500/20 border border-gray-500/30">
                        <XCircle className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-400">Revoked</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-2"
                  aria-label="Close modal"
                >
                  <XCircle className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Credential Image/Preview */}
              <div className={`relative h-32 bg-gradient-to-br ${getTypeColor(credential.type)} rounded-lg mb-3 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                    {getTypeIcon(credential.type)}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-btcu-primary flex-shrink-0" />
                  <span className="text-gray-400">Issued:</span>
                  <span className="text-gray-300">{new Date(credential.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>

                {credential.expiresAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-btcu-accent flex-shrink-0" />
                    <span className="text-gray-400">Expires:</span>
                    <span className="text-gray-300">{new Date(credential.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-btcu-secondary flex-shrink-0" />
                  <span className="text-gray-400">Issuer:</span>
                  <span className="text-gray-300">{credential.issuer}</span>
                </div>

                {credential.course && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-btcu-primary flex-shrink-0" />
                    <span className="text-gray-400">Course:</span>
                    <span className="text-gray-300">{credential.course}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4 text-btcu-primary flex-shrink-0" />
                  <span className="text-gray-400">Token ID:</span>
                  <span className="text-gray-300 font-mono text-xs">{credential.tokenId}</span>
                  <button
                    onClick={() => onCopyTokenId(credential.tokenId)}
                    className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
                    title="Copy Token ID"
                  >
                    <Copy size={12} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                <motion.button
                  onClick={() => onShare(credential)}
                  className="w-full px-4 py-2.5 bg-btcu-primary text-white rounded-lg font-semibold hover:bg-btcu-primary/90 transition flex items-center justify-center gap-2 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </motion.button>
                <a
                  href={`${explorerUrl}/token/${tokenIdNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <motion.button
                    className="w-full px-4 py-2.5 frosted-card glass-hover rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink size={16} />
                    <span>View on Explorer</span>
                  </motion.button>
                </a>
              </div>
            </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
