import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { ref, onValue, set, remove } from 'firebase/database'
import { fireToast } from './useAdminData'

const ANNOUNCEMENT_PATH = 'announcement'

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = ref(db, ANNOUNCEMENT_PATH)
    const unsub = onValue(r, (snap) => {
      const val = snap.val()
      setAnnouncement(val && val.active ? val : null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { announcement, loading }
}

export async function saveAnnouncement(data) {
  fireToast({ type: 'loading', text: '⏳ Announcement save ho rahi hai...' })
  try {
    const r = ref(db, ANNOUNCEMENT_PATH)
    await set(r, { ...data, active: true, updatedAt: Date.now() })
    fireToast({ type: 'success', text: '✅ Announcement successfully save ho gayi!' })
  } catch (e) {
    fireToast({ type: 'error', text: '❌ Save failed: ' + e.message })
    throw e
  }
}

export async function deleteAnnouncement() {
  fireToast({ type: 'loading', text: '⏳ Announcement delete ho rahi hai...' })
  try {
    const r = ref(db, ANNOUNCEMENT_PATH)
    await remove(r)
    fireToast({ type: 'success', text: '✅ Announcement delete ho gayi!' })
  } catch (e) {
    fireToast({ type: 'error', text: '❌ Delete failed: ' + e.message })
    throw e
  }
}
