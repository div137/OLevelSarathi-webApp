import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { ref, runTransaction, onValue } from 'firebase/database'

const STORAGE_KEY = 'olevel_visitor_counted'

export default function useVisitorCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const counterRef = ref(db, 'stats/visitorCount')

    // Count this visitor only once per browser (localStorage flag)
    const alreadyCounted = localStorage.getItem(STORAGE_KEY)
    if (!alreadyCounted) {
      runTransaction(counterRef, (current) => (current || 0) + 1)
        .then(() => localStorage.setItem(STORAGE_KEY, '1'))
        .catch(() => {}) // silent fail — don't block UI
    }

    // Always listen for live count
    const unsub = onValue(counterRef, (snap) => {
      const val = snap.val()
      if (typeof val === 'number') setCount(val)
    })

    return () => unsub()
  }, [])

  return count
}
