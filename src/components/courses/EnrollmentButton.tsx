'use client'

import { useAccount, useChainId } from 'wagmi'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { motion } from 'framer-motion'
import { TransactionStatus } from '@/components/web3/TransactionStatus'
import toast from 'react-hot-toast'

interface EnrollmentButtonProps {
  courseId: bigint
  price: bigint
  courseRegistryAddress: `0x${string}`
  courseRegistryAbi: any[]
}

export function EnrollmentButton({
  courseId,
  price,
  courseRegistryAddress,
  courseRegistryAbi,
}: EnrollmentButtonProps) {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()

  const handleEnroll = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      writeContract({
        address: courseRegistryAddress,
        abi: courseRegistryAbi,
        functionName: 'enrollStudent',
        args: [courseId],
        value: price,
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll')
    }
  }

  return (
    <div>
      <motion.button
        onClick={handleEnroll}
        disabled={isPending || !isConnected}
        className="w-full px-8 py-4 bg-btcu-primary text-white font-bold rounded-xl glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isPending ? 1 : 1.02 }}
        whileTap={{ scale: isPending ? 1 : 0.98 }}
      >
        {isPending ? 'Processing...' : `Enroll Now - ${(Number(price) / 1e18).toFixed(4)} ETH`}
      </motion.button>
      {hash && <TransactionStatus hash={hash} />}
    </div>
  )
}

