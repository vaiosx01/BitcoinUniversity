'use client'

import { WalletInfo } from '@/components/web3/WalletInfo'
import { NetworkGuard } from '@/components/web3/NetworkGuard'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NetworkGuard>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WalletInfo />
        </div>
        {children}
      </main>
      <Footer />
    </NetworkGuard>
  )
}

