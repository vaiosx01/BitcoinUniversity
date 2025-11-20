'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { supportedChains } from '@/lib/config/chains'
import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [showWarning, setShowWarning] = useState(false)

  const supportedChainIds = supportedChains.map((chain) => chain.id) as number[]
  const isSupportedChain = supportedChainIds.includes(chainId as number)

  useEffect(() => {
    if (isConnected && !isSupportedChain) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [isConnected, isSupportedChain, chainId])

  if (!isConnected) {
    return <>{children}</>
  }

  if (!isSupportedChain) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full frosted-card p-6 rounded-2xl border border-orange-500/30"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Red no soportada
              </h3>
              <p className="text-gray-300 mb-4">
                Esta aplicación solo soporta las siguientes redes:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">
                <li>Sepolia Testnet</li>
                <li>Ethereum Mainnet</li>
              </ul>
              <div className="flex flex-wrap gap-2">
                {supportedChains.map((chain) => (
                  <motion.button
                    key={chain.id}
                    onClick={() => switchChain({ chainId: chain.id })}
                    className="px-4 py-2 bg-btcu-primary text-white font-medium rounded-lg text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cambiar a {chain.name}
                  </motion.button>
                ))}
              </div>
            </div>
            {showWarning && (
              <button
                onClick={() => setShowWarning(false)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

