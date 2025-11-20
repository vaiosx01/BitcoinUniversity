// Service Worker básico - será generado automáticamente por next-pwa
// Este archivo es solo para referencia

self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // La lógica de caché es manejada por next-pwa
  event.respondWith(fetch(event.request))
})

