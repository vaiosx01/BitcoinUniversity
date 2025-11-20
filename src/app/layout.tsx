import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { headers } from 'next/headers'
import './globals.css'
import '@/styles/glassmorphism.css'
import '@/styles/neural-effects.css'
import { Providers } from './providers'
import { NeuralBackground } from '@/components/ui/NeuralBackground'
import { InstallPWA } from '@/components/pwa/InstallPWA'
import { UpdateAvailable } from '@/components/pwa/UpdateAvailable'
import { AppKitProvider } from '@/context/AppKitProvider'

const inter = Inter({ subsets: ['latin'] })

const APP_NAME = 'Bitcoin University'
const APP_DEFAULT_TITLE = 'Bitcoin University - Decentralized Education'
const APP_TITLE_TEMPLATE = '%s - Bitcoin University'
const APP_DESCRIPTION = 'Plataforma educativa descentralizada con credenciales NFT verificables. Democratizando la educación superior a través de blockchain.'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_DEFAULT_TITLE,
    startupImage: [
      '/icons/icon-512x512.png',
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Bitcoin University Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ['/icons/icon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7931A' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0E27' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-btcu-dark text-white min-h-screen`}>
        <AppKitProvider cookies={cookies}>
          <Providers>
            <NeuralBackground />
            {children}
            <InstallPWA />
            <UpdateAvailable />
          </Providers>
        </AppKitProvider>
      </body>
    </html>
  )
}

