'use client'

import { useAccount, useBalance } from 'wagmi'
import { GlassCard } from '@/components/ui/GlassCard'
import { Wallet, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

export function WalletInfo() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [copied, setCopied] = useState(false)

  if (!isConnected || !address) return null

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-btcu-primary/20 rounded-lg flex-shrink-0">
          <Wallet className="text-btcu-primary w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <p className="text-xs sm:text-sm text-gray-400 mb-1">Wallet Address</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs sm:text-sm truncate">{address}</p>
            <motion.button
              onClick={copyAddress}
              className="p-1 hover:bg-white/10 rounded transition flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {copied ? (
                <Check size={14} className="sm:w-4 sm:h-4 text-btcu-accent" />
              ) : (
                <Copy size={14} className="sm:w-4 sm:h-4 text-gray-400" />
              )}
            </motion.button>
          </div>
        </div>
        {balance && (
          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-gray-400">Balance</p>
            <p className="font-bold text-sm sm:text-base">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

