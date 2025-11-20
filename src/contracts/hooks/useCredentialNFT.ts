import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { credentialNFTAbi } from '@/contracts/abis/CredentialNFT'
import { getCredentialNFTAddress } from '@/contracts/addresses'
import { keccak256, stringToBytes } from 'viem'

export function useIssueCredential() {
  const chainId = useChainId()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const issueCredential = async (
    recipient: `0x${string}`,
    credentialType: string,
    field: string,
    tokenURI: string,
    metadataHash: string,
    expiresAt: bigint
  ) => {
    const address = getCredentialNFTAddress(chainId)
    const hashBytes = metadataHash.startsWith('0x') 
      ? (metadataHash as `0x${string}`)
      : keccak256(stringToBytes(metadataHash))

    writeContract({
      address,
      abi: credentialNFTAbi,
      functionName: 'issueCredential',
      args: [recipient, credentialType, field, tokenURI, hashBytes, expiresAt],
    })
  }

  return {
    issueCredential,
    isLoading: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useVerifyCredential(tokenId: bigint) {
  const chainId = useChainId()
  const address = getCredentialNFTAddress(chainId)

  return useReadContract({
    address,
    abi: credentialNFTAbi,
    functionName: 'verifyCredential',
    args: [tokenId],
  })
}

export function useGetCredential(tokenId: bigint) {
  const chainId = useChainId()
  const address = getCredentialNFTAddress(chainId)

  return useReadContract({
    address,
    abi: credentialNFTAbi,
    functionName: 'getCredential',
    args: [tokenId],
  })
}

export function useGetCredentialsByRecipient(recipient: `0x${string}` | undefined) {
  const chainId = useChainId()
  const address = getCredentialNFTAddress(chainId)

  return useReadContract({
    address,
    abi: credentialNFTAbi,
    functionName: 'getCredentialsByRecipient',
    args: recipient ? [recipient] : undefined,
    query: {
      enabled: !!recipient,
    },
  })
}

