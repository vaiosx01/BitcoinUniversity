'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'
import { motion } from 'framer-motion'
import { Wallet, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = () => {
    try {
      open()
    } catch (error) {
      console.error('Error opening wallet modal:', error)
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-btcu-primary/50 text-white font-bold rounded-xl animate-pulse text-sm sm:text-base">
        <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <motion.button
        onClick={handleDisconnect}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 frosted-card glass-hover glow-orange text-xs sm:text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="font-medium">{formatAddress(address)}</span>
        <LogOut className="w-3 h-3 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
      </motion.button>
    )
  }

  return (
    <motion.button
      onClick={handleConnect}
      className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-btcu-primary text-white font-bold rounded-xl glow-orange text-xs sm:text-sm lg:text-base whitespace-nowrap"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </motion.button>
  )
}

