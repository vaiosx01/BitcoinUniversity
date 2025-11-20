'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { supportedChains } from '@/lib/config/chains'
import { motion } from 'framer-motion'

export function NetworkSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  if (!isConnected) return null

  return (
    <div className="flex flex-wrap gap-2">
      {supportedChains.map((chain) => (
        <motion.button
          key={chain.id}
          onClick={() => switchChain({ chainId: chain.id })}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            chainId === chain.id
              ? 'bg-btcu-primary text-white'
              : 'frosted-card glass-hover'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="hidden sm:inline">{chain.name}</span>
          <span className="sm:hidden">{chain.name.split(' ')[0]}</span>
        </motion.button>
      ))}
    </div>
  )
}

