import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bitcoin University - Decentralized Education',
    short_name: 'BitcoinU',
    description: 'Plataforma educativa descentralizada con credenciales NFT verificables. Democratizando la educación superior a través de blockchain.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0E27',
    theme_color: '#F7931A',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'blockchain', 'crypto'],
    screenshots: [
      {
        src: '/screenshots/desktop.png',
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: '/screenshots/mobile.png',
        sizes: '750x1334',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Accede a tu panel de estudiante',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Courses',
        short_name: 'Courses',
        description: 'Explora los cursos disponibles',
        url: '/courses',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Credentials',
        short_name: 'Credentials',
        description: 'Ver tus credenciales NFT',
        url: '/credentials',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
    share_target: {
      action: '/share',
      method: 'post',
      enctype: 'multipart/form-data',
      params: [
        {
          name: 'title',
          value: 'title',
        },
        {
          name: 'text',
          value: 'text',
        },
        {
          name: 'url',
          value: 'url',
        },
      ],
    },
    // Nuevas características 2025
    prefer_related_applications: false,
    related_applications: [],
    // Mejoras de seguridad
    protocol_handlers: [],
    // Soporte para múltiples idiomas (preparado)
    lang: 'es',
    dir: 'ltr',
  }
}

