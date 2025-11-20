'use client'

import { useWaitForTransactionReceipt } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface TransactionStatusProps {
  hash: `0x${string}` | undefined
  onSuccess?: () => void
  onError?: () => void
}

export function TransactionStatus({ hash, onSuccess, onError }: TransactionStatusProps) {
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  if (isLoading) {
    toast.loading('Transaction pending...', { id: hash })
    return (
      <div className="flex items-center gap-2 text-btcu-secondary">
        <Loader className="animate-spin" size={20} />
        <span>Processing transaction...</span>
      </div>
    )
  }

  if (isSuccess) {
    toast.success('Transaction confirmed!', { id: hash })
    onSuccess?.()
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-btcu-accent"
      >
        <CheckCircle size={20} />
        <span>Transaction confirmed</span>
      </motion.div>
    )
  }

  if (isError) {
    toast.error('Transaction failed', { id: hash })
    onError?.()
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-red-400"
      >
        <XCircle size={20} />
        <span>Transaction failed</span>
      </motion.div>
    )
  }

  return null
}

