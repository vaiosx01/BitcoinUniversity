/**
 * Utilidades para monitoreo de rendimiento PWA
 * Basado en Web Vitals y mejores prácticas 2025
 */

export interface WebVitals {
  name: string
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function reportWebVitals(metric: WebVitals) {
  // Enviar métricas a tu servicio de analytics
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Ejemplo: Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      ;(window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // Log para debugging
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating)
  }
}

export function measurePerformance() {
  if (typeof window === 'undefined') return

  // First Contentful Paint (FCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      console.warn('Performance Observer not supported', e)
    }
  }

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP Observer not supported', e)
    }
  }
}

// Inicializar medición de rendimiento
if (typeof window !== 'undefined') {
  measurePerformance()
}

