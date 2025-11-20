'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { Award, CheckCircle, XCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils/formatters'

interface CredentialNFTCardProps {
  tokenId: bigint
  credentialType: string
  field: string
  issuedAt: bigint
  expiresAt: bigint
  revoked: boolean
  verified?: boolean
}

export function CredentialNFTCard({
  tokenId,
  credentialType,
  field,
  issuedAt,
  expiresAt,
  revoked,
  verified,
}: CredentialNFTCardProps) {
  const isValid = !revoked && (expiresAt === 0n || Number(expiresAt) * 1000 > Date.now())
  const isExpired = expiresAt !== 0n && Number(expiresAt) * 1000 <= Date.now()

  return (
    <GlassCard hover>
      <div className="flex items-start gap-4">
        <div className="p-4 bg-gradient-to-br from-btcu-primary/20 to-btcu-accent/20 rounded-lg">
          <Award className="text-btcu-primary" size={32} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{credentialType}</h3>
            {verified !== undefined && (
              verified ? (
                <CheckCircle className="text-btcu-accent" size={20} />
              ) : (
                <XCircle className="text-red-400" size={20} />
              )
            )}
            {isExpired && <Clock className="text-yellow-400" size={20} />}
          </div>
          <p className="text-gray-400 mb-1">{field}</p>
          <p className="text-sm text-gray-500 mb-2">Issued: {formatDate(Number(issuedAt))}</p>
          {expiresAt !== 0n && (
            <p className="text-sm text-gray-500">
              {isExpired ? 'Expired' : 'Expires'}: {formatDate(Number(expiresAt))}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-btcu-primary/20 text-btcu-primary rounded-lg text-sm font-medium hover:bg-btcu-primary/30 transition">
              View Details
            </button>
            <button className="px-4 py-2 frosted-card glass-hover rounded-lg text-sm font-medium">
              Share
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

