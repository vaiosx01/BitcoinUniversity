import { sepolia, mainnet } from 'viem/chains'

// Contract addresses per network (update after deployment)
export const CREDENTIAL_NFT_ADDRESSES: Record<number, `0x${string}`> = {
  [sepolia.id]: (process.env.NEXT_PUBLIC_CREDENTIAL_NFT_ADDRESS_SEPOLIA || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  [mainnet.id]: (process.env.NEXT_PUBLIC_CREDENTIAL_NFT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000') as `0x${string}`,
}

export const COURSE_REGISTRY_ADDRESSES: Record<number, `0x${string}`> = {
  [sepolia.id]: (process.env.NEXT_PUBLIC_COURSE_REGISTRY_ADDRESS_SEPOLIA || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  [mainnet.id]: (process.env.NEXT_PUBLIC_COURSE_REGISTRY_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000') as `0x${string}`,
}

export function getCredentialNFTAddress(chainId: number): `0x${string}` {
  return CREDENTIAL_NFT_ADDRESSES[chainId] || CREDENTIAL_NFT_ADDRESSES[sepolia.id]
}

export function getCourseRegistryAddress(chainId: number): `0x${string}` {
  return COURSE_REGISTRY_ADDRESSES[chainId] || COURSE_REGISTRY_ADDRESSES[sepolia.id]
}

