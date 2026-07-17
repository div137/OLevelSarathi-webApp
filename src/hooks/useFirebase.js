import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

// Helper to get from local storage
const getStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (e) { return null }
}

// Global cache for instant in-memory recovery
const globalCache = {}

export function useFirebase(path) {
  // Try Memory -> then LocalStorage -> then null
  const [data, setData] = useState(() => {
    if (globalCache[path]) return globalCache[path]
    const cached = getStorageItem('fb_cache_' + path)
    if (cached) {
      globalCache[path] = cached
      return cached
    }
    return null
  })

  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!path) return

    if (data) setLoading(false)

    const dbRef = ref(db, path)
    let didComplete = false
    const timeoutId = setTimeout(() => {
      if (!didComplete) {
        console.error('Firebase request timed out for path:', path)
        setError('Firebase request timed out or database unavailable.')
        setLoading(false)
      }
    }, 10000)

    const unsub = onValue(
      dbRef,
      (snap) => {
        didComplete = true
        clearTimeout(timeoutId)
        const val = snap.val()
        let parsedData = val ?? []

        if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
          parsedData = Object.entries(parsedData).map(([k, v]) =>
            typeof v === 'object' ? { ...v, _key: k } : { value: v, _key: k }
          )
        }

        globalCache[path] = parsedData
        localStorage.setItem('fb_cache_' + path, JSON.stringify(parsedData))

        setData(parsedData)
        setError(null)
        setLoading(false)
      },
      (err) => {
        didComplete = true
        clearTimeout(timeoutId)
        console.error('Firebase database error:', err)
        setError(err?.message || 'Unable to load Firebase data')
        setLoading(false)
      }
    )

    return () => {
      didComplete = true
      clearTimeout(timeoutId)
      unsub()
    }
  }, [path])

  return { data, loading, error }
}
