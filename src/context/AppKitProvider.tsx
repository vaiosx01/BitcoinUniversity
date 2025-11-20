'use client'

import { wagmiAdapter, projectId } from '@/config/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { sepolia, mainnet } from 'viem/chains'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient - singleton instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'Bitcoin University',
  description: 'Decentralized Higher Education Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://bitcoin-university.vercel.app',
  icons: ['https://bitcoin-university.vercel.app/logo.svg'],
}

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia, mainnet],
  defaultNetwork: sepolia,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'apple'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#F7931A',
    '--w3m-border-radius-master': '12px',
  },
})

export function AppKitProvider({ 
  children, 
  cookies 
}: { 
  children: ReactNode
  cookies: string | null 
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

