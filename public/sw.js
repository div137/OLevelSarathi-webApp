/**
 * Service Worker for Offline Support and Caching Strategies
 * Cache-first, network-first, and stale-while-revalidate strategies
 */

const CACHE_NAME = 'olevel-sarathi-v1'
const RUNTIME_CACHE = 'olevel-runtime'
const API_CACHE = 'olevel-api-cache'

// URLs to cache on install
const URLS_TO_CACHE = ['/', '/index.html', '/logo.svg', '/manifest.json', '/offline.html']

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE)
          .map(cacheName => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Firebase API calls - use network-first strategy
  if (url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // Static assets - use cache-first strategy
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML pages - use network-first with cache fallback
  if (request.headers.get('Accept').includes('text/html')) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE))
    return
  }

  // Default strategy
  event.respondWith(networkFirst(request))
})

/**
 * Cache-first strategy: Use cache if available, fallback to network
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response && response.status === 200 && response.type !== 'error') {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return caches.match('/index.html')
  }
}

/**
 * Network-first strategy: Try network first, fallback to cache
 */
async function networkFirst(request, cacheName = RUNTIME_CACHE) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    // Return offline page or fallback
    if (request.headers.get('Accept').includes('text/html')) {
      const offline = await caches.match('/offline.html')
      return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/html' } })
    }

    return new Response('Request failed', { status: 503 })
  }
}

/**
 * Stale-while-revalidate strategy: Return cached immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const fetchPromise = fetch(request).then(response => {
    if (response && response.status === 200) {
      const cache = caches.open(RUNTIME_CACHE)
      cache.then(c => c.put(request, response.clone()))
    }
    return response
  })

  return cached || fetchPromise
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-blogs') {
    event.waitUntil(syncBlogs())
  }
})

async function syncBlogs() {
  try {
    const cache = await caches.open(API_CACHE)
    const requests = await cache.keys()
    await Promise.all(
      requests.map(request => fetch(request.clone()))
    )
  } catch (error) {
    console.error('Sync failed:', error)
  }
}
