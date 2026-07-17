/**
 * Performance Utilities for Core Web Vitals Optimization
 * - Firebase Realtime Database caching
 * - Image optimization
 * - Request debouncing
 * - Service Worker registration
 */

// ==================== CACHING UTILITIES ====================

const CACHE_PREFIX = 'olevel-sarathi-v1'
const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000  // 24 hours
}

/**
 * Memory cache for critical data
 */
class MemoryCache {
  constructor() {
    this.cache = new Map()
  }

  set(key, value, ttl = CACHE_DURATION.MEDIUM) {
    const expiresAt = Date.now() + ttl
    this.cache.set(key, { value, expiresAt })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  clear() {
    this.cache.clear()
  }

  has(key) {
    return this.get(key) !== null
  }
}

export const memoryCache = new MemoryCache()

/**
 * IndexedDB Cache for larger data persistence
 */
export const indexedDBCache = {
  async set(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OLevelSarathi', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const store = db.transaction('cache', 'readwrite').objectStore('cache')
        store.put({ key, value, timestamp: Date.now() })
        resolve()
      }
    })
  },

  async get(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OLevelSarathi', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const store = db.transaction('cache').objectStore('cache')
        const query = store.get(key)
        query.onsuccess = () => resolve(query.result?.value || null)
        query.onerror = () => reject(query.error)
      }
    })
  },

  async clear() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OLevelSarathi', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const store = db.transaction('cache', 'readwrite').objectStore('cache')
        store.clear()
        resolve()
      }
    })
  }
}

// ==================== IMAGE OPTIMIZATION ====================

/**
 * Convert image to WebP format with fallback
 */
export function getOptimizedImageUrl(url, width = 800, height = 600) {
  if (!url) return null
  
  // For Firebase Storage URLs, add parameters for optimization
  if (url.includes('firebasestorage.googleapis.com')) {
    return `${url}?w=${width}&h=${height}&q=75`
  }
  
  return url
}

/**
 * Generate srcset for responsive images
 */
export function generateImageSrcSet(url, sizes = [320, 640, 1024]) {
  return sizes.map(size => `${getOptimizedImageUrl(url, size)} ${size}w`).join(', ')
}

// ==================== REQUEST OPTIMIZATION ====================

/**
 * Debounce function for search/filter operations
 */
export function debounce(fn, delay = 300) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

// ==================== FONT OPTIMIZATION ====================

/**
 * Font display strategy for better CLS
 */
export const fontOptimization = {
  // Use font-display: swap for all fonts
  getCSSRule: (fontFamily) => ({
    fontFamily,
    'font-display': 'swap'
  })
}

// ==================== CORE WEB VITALS HELPERS ====================

/**
 * Report Core Web Vitals
 */
export function reportWebVitals(metric) {
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'web_vitals',
      event_label: metric.id,
      non_interaction: true
    })
  }
  console.log(`${metric.name}: ${metric.value}ms`)
}

/**
 * Monitor LCP (Largest Contentful Paint)
 */
export function observeLCP() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        reportWebVitals({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          id: 'LCP'
        })
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP observer failed:', e)
    }
  }
}

/**
 * Monitor FID (First Input Delay)
 */
export function observeFID() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          reportWebVitals({
            name: 'FID',
            value: entry.processingDuration,
            id: 'FID'
          })
        })
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID observer failed:', e)
    }
  }
}

/**
 * Monitor CLS (Cumulative Layout Shift)
 */
export function observeCLS() {
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            reportWebVitals({
              name: 'CLS',
              value: clsValue,
              id: 'CLS'
            })
          }
        })
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('CLS observer failed:', e)
    }
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    observeLCP()
    observeFID()
    observeCLS()
  }
}

// ==================== SERVICE WORKER ====================

/**
 * Register service worker for offline support and caching
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully')
    } catch (error) {
      console.warn('Service Worker registration failed:', error)
    }
  }
}

// ==================== LAZY LOADING ====================

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyImages() {
  const images = document.querySelectorAll('img[data-src]')
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.removeAttribute('data-src')
          observer.unobserve(img)
        }
      })
    })
    images.forEach(img => imageObserver.observe(img))
  } else {
    // Fallback for browsers without Intersection Observer
    images.forEach(img => {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
    })
  }
}

export default {
  memoryCache,
  indexedDBCache,
  getOptimizedImageUrl,
  generateImageSrcSet,
  debounce,
  throttle,
  reportWebVitals,
  observeLCP,
  observeFID,
  observeCLS,
  initPerformanceMonitoring,
  registerServiceWorker,
  setupLazyImages
}
