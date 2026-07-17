import { useState, useEffect } from 'react'
import { ref, onValue, set, push, update, remove } from 'firebase/database'
import { db } from '../firebase'

// ─── Global Toast Event Bus ───────────────────────────────────────────────────
// Components can subscribe to this to show toasts
const toastListeners = []
export function subscribeToast(fn) {
  toastListeners.push(fn)
  return () => {
    const i = toastListeners.indexOf(fn)
    if (i !== -1) toastListeners.splice(i, 1)
  }
}
export function fireToast(toast) {
  toastListeners.forEach(fn => fn(toast))
}

// Generic CRUD hook for any Firebase path
export function useAdminCrud(path) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!path) return
    const r = ref(db, path)
    const unsub = onValue(r, (snap) => {
      const val = snap.val()
      if (val && typeof val === 'object') {
        const arr = Array.isArray(val)
          ? val.map((v, i) => ({ ...v, _id: String(i) }))
          : Object.entries(val).map(([k, v]) => ({ ...(typeof v === 'object' ? v : { value: v }), _id: k }))
        setItems(arr)
      } else {
        setItems([])
      }
      setLoading(false)
    })
    return () => unsub()
  }, [path])

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const addItem = async (data) => {
    try {
      setSaving(true)
      fireToast({ type: 'loading', text: '⏳ Data upload ho raha hai...' })
      const r = ref(db, path)
      await push(r, { ...data, createdAt: Date.now() })
      flash('✅ Added successfully!')
      fireToast({ type: 'success', text: '✅ Data successfully upload ho gaya!' })
      return true
    } catch (e) {
      flash('❌ Error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Upload failed: ' + e.message })
      return false
    } finally {
      setSaving(false)
    }
  }

  const updateItem = async (id, data) => {
    try {
      setSaving(true)
      fireToast({ type: 'loading', text: '⏳ Data save ho raha hai...' })
      const r = ref(db, `${path}/${id}`)
      await update(r, { ...data, updatedAt: Date.now() })
      flash('✅ Updated!')
      fireToast({ type: 'success', text: '✅ Data successfully update ho gaya!' })
      return true
    } catch (e) {
      flash('❌ Error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Update failed: ' + e.message })
      return false
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id) => {
    try {
      setSaving(true)
      fireToast({ type: 'loading', text: '⏳ Delete ho raha hai...' })
      await remove(ref(db, `${path}/${id}`))
      flash('✅ Deleted!')
      fireToast({ type: 'success', text: '✅ Record delete ho gaya!' })
      return true
    } catch (e) {
      flash('❌ Error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Delete failed: ' + e.message })
      return false
    } finally {
      setSaving(false)
    }
  }

  const setItem = async (data) => {
    try {
      setSaving(true)
      fireToast({ type: 'loading', text: '⏳ Data save ho raha hai...' })
      await set(ref(db, path), data)
      flash('✅ Saved!')
      fireToast({ type: 'success', text: '✅ Data successfully save ho gaya!' })
      return true
    } catch (e) {
      flash('❌ Error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Save failed: ' + e.message })
      return false
    } finally {
      setSaving(false)
    }
  }

  return { items, loading, msg, saving, addItem, updateItem, deleteItem, setItem }
}
