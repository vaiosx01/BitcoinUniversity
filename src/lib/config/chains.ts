import { sepolia, mainnet } from 'viem/chains'

export const supportedChains = [sepolia, mainnet] as const

export type SupportedChainId = typeof supportedChains[number]['id']

export const defaultChain = sepolia

export const chainConfig = {
  [sepolia.id]: {
    name: 'Sepolia Testnet',
    explorer: 'https://sepolia.etherscan.io',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || 'https://rpc.sepolia.org',
  },
  [mainnet.id]: {
    name: 'Ethereum',
    explorer: 'https://etherscan.io',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com',
  },
}

