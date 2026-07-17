import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiEye, FiEyeOff,
  FiBell, FiLogOut, FiSearch, FiArrowUp, FiArrowDown,
  FiRefreshCw, FiDatabase, FiBookOpen, FiFileText, FiCode,
  FiImage, FiAlertCircle, FiUsers, FiGrid, FiList, FiSave,
  FiChevronDown, FiChevronUp, FiClipboard, FiLayers, FiUploadCloud, FiLoader
} from 'react-icons/fi'
import { useAnnouncement, saveAnnouncement, deleteAnnouncement } from '../hooks/useAnnouncement'
import { useBlogManagement } from '../hooks/useBlogManagement'
import { useAdminCrud, subscribeToast, fireToast } from '../hooks/useAdminData'
// GitHub Actions trigger — no local generator needed for auto-deploy
import { ref, onValue, push, update, remove } from 'firebase/database'
import { db } from '../firebase'

const ADMIN_PASSWORD = 'OLevel@Admin2026'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      '#0a0f1e',
  card:    '#111827',
  card2:   '#1a2236',
  border:  '#1e2d45',
  border2: '#2a3f5f',
  text:    '#e2e8f0',
  muted:   '#64748b',
  accent:  '#6366f1',
  accent2: '#818cf8',
  green:   '#10b981',
  red:     '#ef4444',
  yellow:  '#f59e0b',
  blue:    '#3b82f6',
  purple:  '#8b5cf6',
  pink:    '#ec4899',
}

const S = {
  input: {
    width: '100%', padding: '10px 13px', borderRadius: 8, boxSizing: 'border-box',
    background: T.card2, border: `1px solid ${T.border2}`, color: T.text,
    fontSize: '0.88rem', outline: 'none', transition: 'border 0.2s',
  },
  textarea: {
    width: '100%', padding: '10px 13px', borderRadius: 8, boxSizing: 'border-box',
    background: T.card2, border: `1px solid ${T.border2}`, color: T.text,
    fontSize: '0.88rem', outline: 'none', resize: 'vertical', minHeight: 90,
  },
  btn: {
    padding: '9px 18px', background: T.accent, color: '#fff', border: 'none',
    borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'opacity 0.2s',
  },
  btnRed: {
    padding: '9px 18px', background: T.red, color: '#fff', border: 'none',
    borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  },
  btnGhost: {
    padding: '8px 14px', background: 'transparent', color: T.muted,
    border: `1px solid ${T.border2}`, borderRadius: 8, fontWeight: 600,
    cursor: 'pointer', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6,
  },
  btnGreen: {
    padding: '9px 18px', background: T.green, color: '#fff', border: 'none',
    borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  },
  label: {
    display: 'block', marginBottom: 5, fontSize: '0.75rem', fontWeight: 700,
    color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  card: {
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px 22px',
  },
}

// ─── Small Reusable Components ───────────────────────────────────────────────
function Msg({ text }) {
  if (!text) return null
  const ok = text.startsWith('✅')
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontWeight: 600,
      fontSize: '0.85rem',
      background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
      color: ok ? T.green : T.red,
      border: `1px solid ${ok ? T.green : T.red}33`,
    }}>{text}</div>
  )
}

function FL({ children }) { return <label style={S.label}>{children}</label> }

// ─── Global Toast Notification ────────────────────────────────────────────────
function useToastStore() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unsub = subscribeToast((toast) => {
      const id = Date.now()
      setToasts(prev => {
        // Replace loading toast when success/error arrives
        const withoutLoading = toast.type !== 'loading'
          ? prev.filter(t => t.type !== 'loading')
          : prev
        return [...withoutLoading, { ...toast, id }]
      })
      if (toast.type !== 'loading') {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, 3500)
      }
    })
    return unsub
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, removeToast }
}

function ToastContainer() {
  const { toasts, removeToast } = useToastStore()
  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div key={toast.id} onClick={() => removeToast(toast.id)} style={{
          pointerEvents: 'all',
          cursor: 'pointer',
          minWidth: 260, maxWidth: 360,
          padding: '13px 18px',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          fontWeight: 600, fontSize: '0.88rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          animation: 'toastSlideIn 0.3s ease',
          ...(toast.type === 'loading' ? {
            background: 'rgba(99,102,241,0.18)',
            border: '1px solid rgba(99,102,241,0.5)',
            color: '#a5b4fc',
          } : toast.type === 'success' ? {
            background: 'rgba(16,185,129,0.18)',
            border: '1px solid rgba(16,185,129,0.5)',
            color: '#6ee7b7',
          } : {
            background: 'rgba(239,68,68,0.18)',
            border: '1px solid rgba(239,68,68,0.5)',
            color: '#fca5a5',
          }),
        }}>
          {toast.type === 'loading' ? (
            <span style={{ display: 'inline-block', animation: 'spinLoader 0.8s linear infinite', fontSize: '1.1rem' }}>⏳</span>
          ) : toast.type === 'success' ? (
            <span style={{ fontSize: '1.1rem' }}>✅</span>
          ) : (
            <span style={{ fontSize: '1.1rem' }}>❌</span>
          )}
          <span style={{ flex: 1 }}>{toast.type === 'loading'
            ? toast.text.replace('⏳ ', '')
            : toast.text.replace('✅ ', '').replace('❌ ', '')
          }</span>
          {toast.type !== 'loading' && (
            <span style={{ opacity: 0.5, fontSize: '0.75rem', marginLeft: 4 }}>✕</span>
          )}
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes spinLoader {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}


function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
      <FiSearch size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
      <input style={{ ...S.input, paddingLeft: 32 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function CatFilter({ cats, value, onChange, label = 'All Categories' }) {
  return (
    <select style={{ ...S.input, width: 'auto', minWidth: 130, flex: 'none' }} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{label}</option>
      {cats.map(c => <option key={c}>{c}</option>)}
    </select>
  )
}

function SortBtn({ field, label, current, dir, onClick }) {
  const active = current === field
  return (
    <button onClick={() => onClick(field)} style={{ ...S.btnGhost, color: active ? T.accent : T.muted }}>
      {label || field}
      {active ? (dir === 'asc' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />) : null}
    </button>
  )
}

function Badge({ color = T.accent, children }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
      background: color + '22', color, border: `1px solid ${color}44`,
    }}>{children}</span>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.text }}>{value ?? '—'}</div>
      </div>
    </div>
  )
}

// ─── useTableState ────────────────────────────────────────────────────────────
function useTableState(items, { searchKeys = [], catKey = null }) {
  const [q, setQ]      = useState('')
  const [cat, setCat]  = useState('')
  const [sortF, setSF] = useState('')
  const [sortD, setSD] = useState('asc')

  const toggleSort = field => {
    if (sortF === field) setSD(d => d === 'asc' ? 'desc' : 'asc')
    else { setSF(field); setSD('asc') }
  }

  const filtered = useMemo(() => {
    let arr = [...(items || [])]
    if (q) arr = arr.filter(item => searchKeys.some(k => String(item[k] || '').toLowerCase().includes(q.toLowerCase())))
    if (cat && catKey) arr = arr.filter(item => (item[catKey] || '') === cat)
    if (sortF) arr.sort((a, b) => {
      const va = String(a[sortF] || '').toLowerCase()
      const vb = String(b[sortF] || '').toLowerCase()
      return sortD === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return arr
  }, [items, q, cat, sortF, sortD])

  const uniqueCats = useMemo(() => {
    if (!catKey) return []
    return [...new Set((items || []).map(i => i[catKey]).filter(Boolean))]
  }, [items, catKey])

  return { q, setQ, cat, setCat, sortF, sortD, toggleSort, filtered, uniqueCats }
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      backdropFilter: 'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: T.card, border: `1px solid ${T.border2}`, borderRadius: 16,
        width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: T.text, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ ...S.btnGhost, padding: '6px 8px', borderRadius: 6 }}><FiX size={16} /></button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
function ConfirmDelete({ label, onConfirm, onCancel }) {
  return (
    <Modal title="⚠️ Confirm Delete" onClose={onCancel}>
      <p style={{ color: T.muted, marginBottom: 20 }}>
        Are you sure you want to delete <strong style={{ color: T.text }}>{label}</strong>? This cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={S.btnRed} onClick={onConfirm}><FiTrash2 size={14} /> Delete</button>
        <button style={S.btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </Modal>
  )
}

// ─── TABLE COMPONENT ─────────────────────────────────────────────────────────
function DataTable({ columns, rows, onEdit, onDelete, emptyMsg = 'No data found.' }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${T.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
        <thead>
          <tr style={{ background: T.card2, borderBottom: `1px solid ${T.border}` }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: T.muted, whiteSpace: 'nowrap', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {c.label}
              </th>
            ))}
            <th style={{ padding: '11px 14px', color: T.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length + 1} style={{ padding: 32, textAlign: 'center', color: T.muted }}>{emptyMsg}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={row._id || i} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = T.card2}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '10px 14px', color: T.text, maxWidth: c.maxWidth || 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '—')}
                </td>
              ))}
              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onEdit(row)} style={{ ...S.btnGhost, padding: '6px 10px', color: T.accent, border: `1px solid ${T.accent}44` }}>
                    <FiEdit2 size={13} />
                  </button>
                  <button onClick={() => onDelete(row)} style={{ ...S.btnGhost, padding: '6px 10px', color: T.red, border: `1px solid ${T.red}44` }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLOUDINARY IMAGE UPLOAD COMPONENT
// Uses unsigned upload preset — no backend needed
// Setup: Cloudinary dashboard → Settings → Upload → Add unsigned preset
// ═══════════════════════════════════════════════════════════════════════════════
const CLOUDINARY_CLOUD_NAME    = 'datjw2xcs'
const CLOUDINARY_UPLOAD_PRESET = 'My_pdf'

function CloudinaryImageUpload({ value, onChange, label = 'Featured Image' }) {
  const [uploading,  setUploading]  = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [error,      setError]      = useState('')
  const [dragOver,   setDragOver]   = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('❌ Sirf image files allowed hain (JPG, PNG, WebP)।'); return }
    if (file.size > 5 * 1024 * 1024) { setError('❌ Image 5MB se badi nahi honi chahiye।'); return }

    setError('')
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      formData.append('folder', 'blog')

      // Use XMLHttpRequest for progress tracking
      const url = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText)
          if (data.secure_url) resolve(data.secure_url)
          else reject(new Error(data.error?.message || 'Upload failed'))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send(formData)
      })

      onChange(url)
      setProgress(100)
    } catch (e) {
      setError('❌ Upload failed: ' + e.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div>
      <FL>{label}</FL>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? T.accent : uploading ? T.blue : T.border2}`,
          borderRadius: 12, padding: '20px 16px', textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: dragOver ? `${T.accent}10` : uploading ? `${T.blue}08` : T.card2,
          transition: 'all 0.2s', marginBottom: 8,
        }}
      >
        {uploading ? (
          <div>
            <div style={{ color: T.blue, fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>
              ⏳ Uploading... {progress}%
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.blue})`, borderRadius: 3, transition: 'width 0.3s ease' }}/>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: 6 }}>
              {dragOver ? '📂' : '🖼️'}
            </div>
            <div style={{ color: T.text, fontSize: '0.85rem', fontWeight: 700, marginBottom: 3 }}>
              {dragOver ? 'Drop karo yahan!' : 'Click karo ya image drag karo'}
            </div>
            <div style={{ color: T.muted, fontSize: '0.72rem' }}>
              JPG, PNG, WebP · Max 5MB · Cloudinary pe upload hoga
            </div>
          </div>
        )}
        <input
          ref={inputRef} type="file" accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: T.red, fontSize: '0.78rem', marginBottom: 8, padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {/* OR divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
        <div style={{ flex: 1, height: 1, background: T.border }}/>
        <span style={{ color: T.muted, fontSize: '0.7rem' }}>YA URL PASTE KARO</span>
        <div style={{ flex: 1, height: 1, background: T.border }}/>
      </div>

      {/* Manual URL input */}
      <input
        style={S.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://res.cloudinary.com/... ya koi bhi image URL"
      />

      {/* Preview */}
      {value && !uploading && (
        <div style={{ marginTop: 10, position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <img
            src={value} alt="preview"
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <button
            onClick={() => onChange('')}
            title="Remove image"
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(239,68,68,0.9)', border: 'none',
              color: '#fff', cursor: 'pointer', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900,
            }}
          >✕</button>
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(16,185,129,0.85)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
            ✅ Uploaded
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: TESTS MANAGER
// Firebase structure: Tests/<CategoryName>/<numericId>/{ ... }
//                    TestCategories/<id>/{ name, description, icon, color }
// ═══════════════════════════════════════════════════════════════════════════════

// ── Hook: Categories metadata (TestCategories node) ──────────────────────────
function useTestCategories() {
  const { items, loading, msg, addItem, updateItem, deleteItem } = useAdminCrud('TestCategories')
  // items = [{ _id, name, description, icon, color }, ...]
  return { categories: items, loading, msg, addCategory: addItem, updateCategory: updateItem, deleteCategory: deleteItem }
}

// Custom hook: flattens nested Tests structure from Firebase
// Real DB structure: Tests/<CategoryName>/<numericId>/{ title, questionsJson, ... }
// Category names have spaces & colons — stored AS-IS in _catPath
function useTestsData() {
  const [tests, setTests]     = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]         = useState('')
  // Keep raw snapshot ref for accurate path lookups
  const rawRef = useState({})[0]

  useEffect(() => {
    const r = ref(db, 'Tests')
    const unsub = onValue(r, (snap) => {
      const raw = snap.val()
      if (!raw || typeof raw !== 'object') { setTests([]); setLoading(false); return }

      const flat = []
      Object.entries(raw).forEach(([catKey, catNode]) => {
        if (!catNode || typeof catNode !== 'object') return

        // Check if catNode itself is a test (has title)
        if (catNode.title) {
          flat.push({
            ...catNode,
            _id:      catKey,
            _catPath: catKey,
            _testId:  catKey,
            category: catNode.category || catNode.subject || catKey,
          })
          return
        }

        // Category bucket → iterate test nodes inside
        Object.entries(catNode).forEach(([testId, testData]) => {
          if (!testData || typeof testData !== 'object') return
          if (testData.title || testData.questionsJson || testData.questions) {
            flat.push({
              ...testData,
              // _id uses the EXACT catKey (spaces/colons preserved) + testId
              _id:      `${catKey}|||${testId}`,
              _catPath: catKey,
              _testId:  testId,
              category: testData.category || testData.subject || catKey,
            })
          }
        })
      })
      setTests(flat)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  // Decode _id back to Firebase path segments
  const decodePath = (id) => {
    if (id.includes('|||')) {
      const [catKey, testId] = id.split('|||')
      return { catKey, testId, fbPath: `Tests/${catKey}/${testId}` }
    }
    return { catKey: id, testId: id, fbPath: `Tests/${id}` }
  }

  const addTest = async (data) => {
    try {
      fireToast({ type: 'loading', text: '⏳ Test upload ho raha hai...' })
      const catKey = data.category || 'General'
      const id = Date.now().toString()
      await update(ref(db, `Tests/${catKey}/${id}`), { ...data, createdAt: Date.now() })
      flash('✅ Test added!')
      fireToast({ type: 'success', text: '✅ Test successfully upload ho gaya!' })
      return true
    } catch (e) {
      flash('❌ Error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Upload failed: ' + e.message })
      return false
    }
  }

  const updateTest = async (id, data) => {
    try {
      fireToast({ type: 'loading', text: '⏳ Test save ho raha hai...' })
      const { catKey: oldCatKey, testId, fbPath } = decodePath(id)
      const newCatKey = data.category || data.subject || oldCatKey

      if (oldCatKey !== newCatKey) {
        // Category changed → move: write to new path, delete old
        const newId = testId
        await update(ref(db, `Tests/${newCatKey}/${newId}`), { ...data, updatedAt: Date.now() })
        await remove(ref(db, fbPath))
      } else {
        await update(ref(db, fbPath), { ...data, updatedAt: Date.now() })
      }
      flash('✅ Updated!')
      fireToast({ type: 'success', text: '✅ Test successfully update ho gaya!' })
      return true
    } catch (e) {
      flash('❌ Error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Update failed: ' + e.message })
      return false
    }
  }

  const deleteTest = async (id) => {
    try {
      fireToast({ type: 'loading', text: '⏳ Test delete ho raha hai...' })
      const { fbPath } = decodePath(id)
      await remove(ref(db, fbPath))
      flash('✅ Deleted!')
      fireToast({ type: 'success', text: '✅ Test delete ho gaya!' })
      return true
    } catch (e) {
      flash('❌ Error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Delete failed: ' + e.message })
      return false
    }
  }

  return { tests, loading, msg, addTest, updateTest, deleteTest }
}

// ─── Question Editor: each question as its own card ──────────────────────────
function QuestionEditor({ questions, onChange }) {
  const emptyQ = () => ({ question: '', A: '', B: '', C: '', D: '', ans: 'A', explanation: '', hidden: false })

  const update = (idx, field, val) => {
    const next = questions.map((q, i) => i === idx ? { ...q, [field]: val } : q)
    onChange(next)
  }
  const addQ    = () => onChange([...questions, emptyQ()])
  const removeQ = (idx) => onChange(questions.filter((_, i) => i !== idx))
  const moveUp  = (idx) => { if (idx === 0) return; const a = [...questions]; [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; onChange(a) }
  const moveDown= (idx) => { if (idx === questions.length-1) return; const a = [...questions]; [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; onChange(a) }
  const duplicateQ = (idx) => { const copy = { ...questions[idx], explanation: questions[idx].explanation || '' }; const next = [...questions]; next.splice(idx+1, 0, copy); onChange(next) }

  const optColors = { A: T.blue, B: T.purple, C: T.yellow, D: T.pink }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {questions.map((q, idx) => (
        <div key={idx} style={{
          background: q.hidden ? T.bg : T.card2,
          border: `1px solid ${q.hidden ? T.red+'44' : T.border2}`,
          borderRadius: 10, padding: '14px 16px',
          opacity: q.hidden ? 0.6 : 1,
        }}>
          {/* Question header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: T.accent, letterSpacing: '0.06em' }}>
                Q{idx + 1}
              </span>
              {/* Visible / Hidden toggle */}
              <button
                onClick={() => update(idx, 'hidden', !q.hidden)}
                title={q.hidden ? 'Question hidden — click to show' : 'Question visible — click to hide'}
                style={{
                  padding: '2px 9px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                  border: `1px solid ${q.hidden ? T.red+'66' : T.green+'66'}`,
                  background: q.hidden ? T.red+'18' : T.green+'18',
                  color: q.hidden ? T.red : T.green, cursor: 'pointer',
                }}>
                {q.hidden ? '🚫 Hidden' : '✅ Visible'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => moveUp(idx)}    style={{ ...S.btnGhost, padding: '3px 7px', fontSize: '0.75rem' }} title="Move up">↑</button>
              <button onClick={() => moveDown(idx)}  style={{ ...S.btnGhost, padding: '3px 7px', fontSize: '0.75rem' }} title="Move down">↓</button>
              <button onClick={() => duplicateQ(idx)} style={{ ...S.btnGhost, padding: '3px 8px', color: T.blue, borderColor: T.blue+'44', fontSize: '0.75rem' }} title="Duplicate question">⧉</button>
              <button onClick={() => removeQ(idx)}   style={{ ...S.btnGhost, padding: '3px 8px', color: T.red, borderColor: T.red+'44', fontSize: '0.75rem' }} title="Delete question">
                <FiTrash2 size={12} />
              </button>
            </div>
          </div>

          {/* Question text */}
          <textarea
            style={{ ...S.textarea, minHeight: 60, marginBottom: 10, fontSize: '0.85rem' }}
            value={q.question}
            onChange={e => update(idx, 'question', e.target.value)}
            placeholder={`Question ${idx + 1} text...`}
          />

          {/* Options A B C D */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 7, background: q.ans === opt ? optColors[opt]+'18' : T.bg, border: `1px solid ${q.ans === opt ? optColors[opt]+'66' : T.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'text' }}
                onClick={() => update(idx, 'ans', opt)}>
                <span style={{ fontWeight: 800, fontSize: '0.78rem', color: optColors[opt], flexShrink: 0, width: 16 }}>{opt}</span>
                <input
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: '0.83rem', width: '100%' }}
                  value={q[opt] || ''}
                  onChange={e => { e.stopPropagation(); update(idx, opt, e.target.value) }}
                  onClick={e => e.stopPropagation()}
                  placeholder={`Option ${opt}`}
                />
                {q.ans === opt && <FiCheck size={12} style={{ color: optColors[opt], flexShrink: 0 }} />}
              </div>
            ))}
          </div>

          {/* Correct answer selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 700 }}>Correct Answer:</span>
            {['A','B','C','D'].map(opt => (
              <button key={opt} onClick={() => update(idx, 'ans', opt)}
                style={{ width: 30, height: 30, borderRadius: 6, border: `1.5px solid ${q.ans === opt ? optColors[opt] : T.border2}`, background: q.ans === opt ? optColors[opt]+'22' : 'transparent', color: q.ans === opt ? optColors[opt] : T.muted, fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>
                {opt}
              </button>
            ))}
          </div>

          {/* Explanation — dedicated textarea, always visible */}
          <div>
            <label style={{ ...S.label, marginBottom: 5 }}>
              💡 Explanation <span style={{ color: T.muted, fontWeight: 400, textTransform: 'none' }}>(students ko answer ke baad dikhega)</span>
            </label>
            <textarea
              style={{ ...S.textarea, minHeight: 56, fontSize: '0.83rem', borderColor: q.explanation ? T.accent+'55' : T.border2 }}
              value={q.explanation || ''}
              onChange={e => update(idx, 'explanation', e.target.value)}
              placeholder="e.g. यह सही है क्योंकि... / This is correct because..."
            />
          </div>
        </div>
      ))}

      {/* Add question button */}
      <button onClick={addQ} style={{ ...S.btnGhost, justifyContent: 'center', borderStyle: 'dashed', color: T.accent, borderColor: T.accent+'55', padding: '10px' }}>
        <FiPlus size={14} /> Add Question
      </button>
    </div>
  )
}

// ─── Parse any questions format into normalized array ────────────────────────
// Handles: questionsJson string, questions object/array
// Options may be lowercase (a,b,c,d) or uppercase (A,B,C,D)
// ans may be a letter ("a"/"A") OR full option text ("Commonly Operated...")
function parseQuestions(row) {
  let raw = []

  // 1. Try questionsJson string first (most common in this DB)
  if (row.questionsJson) {
    try {
      const parsed = typeof row.questionsJson === 'string'
        ? JSON.parse(row.questionsJson)
        : row.questionsJson
      if (Array.isArray(parsed)) raw = parsed
      else if (parsed && typeof parsed === 'object') raw = Object.values(parsed)
    } catch (_) {}
  }

  // 2. Fallback to questions field
  if (raw.length === 0 && row.questions) {
    if (Array.isArray(row.questions)) raw = row.questions
    else if (typeof row.questions === 'object') raw = Object.values(row.questions)
  }

  if (raw.length === 0) return []

  return raw.map(q => {
    if (!q || typeof q !== 'object') {
      return { question: '', A: '', B: '', C: '', D: '', ans: 'A', explanation: '' }
    }

    // Get option values — support both uppercase and lowercase keys
    const optA = q.A || q.a || q.option1 || q.opt1 || ''
    const optB = q.B || q.b || q.option2 || q.opt2 || ''
    const optC = q.C || q.c || q.option3 || q.opt3 || ''
    const optD = q.D || q.d || q.option4 || q.opt4 || ''

    // Resolve correct answer — may be letter (a/A/b/B) or full option text
    let rawAns = String(q.ans || q.correct || q.answer || 'a').trim()
    let ans = 'A'

    if (['a','b','c','d','A','B','C','D'].includes(rawAns)) {
      // It's already a letter
      ans = rawAns.toUpperCase()
    } else {
      // It's full text — match against the 4 options
      const opts = { A: optA, B: optB, C: optC, D: optD }
      const match = Object.entries(opts).find(
        ([, v]) => v && v.trim().toLowerCase() === rawAns.toLowerCase()
      )
      ans = match ? match[0] : 'A'
    }

    // Explanation — check all possible keys (DB uses 'exp' most commonly)
    const explanation = q.exp || q.explanation || q.explain ||
                        q.solution || q.reason || q.hint || q.desc || ''

    return {
      question:    String(q.question || q.ques || q.text || ''),
      A:           String(optA),
      B:           String(optB),
      C:           String(optC),
      D:           String(optD),
      ans,
      explanation: String(explanation),
      hidden:      Boolean(q.hidden || false),
    }
  })
}

function TestsManager() {
  const { tests, loading, msg, addTest, updateTest, deleteTest } = useTestsData()
  const { categories, msg: catMsg, addCategory, updateCategory, deleteCategory } = useTestCategories()

  const [subTab, setSubTab]             = useState('tests')
  const [modal, setModal]               = useState(null)
  const [editRow, setEditRow]           = useState(null)
  const [delRow, setDelRow]             = useState(null)
  const [activeTab, setActiveTab]       = useState('info')
  const [form, setForm]                 = useState({ title:'', category:'', level:'Easy', totalQue:'', duration:'', shuffleQuestions: false, shuffleOptions: false })
  const [questions, setQuestions]       = useState([])
  const [catInputMode, setCatInputMode] = useState('select')
  const [catModal, setCatModal]         = useState(null)
  const [editCat, setEditCat]           = useState(null)
  const [delCat, setDelCat]             = useState(null)
  const [catForm, setCatForm]           = useState({ name:'', description:'', icon:'📋', color:'#6366f1' })
  // JSON import state
  const [jsonInput, setJsonInput]       = useState('')
  const [jsonError, setJsonError]       = useState('')
  const [jsonSuccess, setJsonSuccess]   = useState('')

  const { q, setQ, cat, setCat, sortF, sortD, toggleSort, filtered, uniqueCats } = useTableState(
    tests, { searchKeys: ['title', 'category'], catKey: 'category' }
  )
  const allCatNames = useMemo(() => {
    return [...new Set([...categories.map(c=>c.name).filter(Boolean), ...uniqueCats])].sort()
  }, [categories, uniqueCats])

  const emptyQ = () => ({ question:'', A:'', B:'', C:'', D:'', ans:'A', explanation:'' })

  const openAdd  = () => {
    setForm({ title:'', category:'', level:'Easy', totalQue:'', duration:'', shuffleQuestions: false, shuffleOptions: false })
    setQuestions([emptyQ()]); setActiveTab('info'); setCatInputMode('select')
    setJsonInput(''); setJsonError(''); setJsonSuccess(''); setModal('add')
  }
  const openEdit = row => {
    setEditRow(row)
    setForm({ title:row.title||'', category:row.category||'', level:row.level||'Easy', totalQue:row.totalQue||'', duration:row.duration||'', shuffleQuestions: Boolean(row.shuffleQuestions), shuffleOptions: Boolean(row.shuffleOptions) })
    setQuestions(parseQuestions(row)); setActiveTab('info'); setCatInputMode('select')
    setJsonInput(''); setJsonError(''); setJsonSuccess(''); setModal('edit')
  }
  const handleSave = async () => {
    if (!form.title.trim() || !form.category.trim()) return
    // Count only visible (non-hidden) questions for totalQue
    const visibleCount = questions.filter(q => !q.hidden).length
    const data = {
      title:form.title.trim(), category:form.category.trim(), level:form.level,
      totalQue: String(visibleCount), duration:form.duration,
      shuffleQuestions: Boolean(form.shuffleQuestions),
      shuffleOptions:   Boolean(form.shuffleOptions),
      questionsJson: JSON.stringify(questions.map(q=>({
        question:q.question, a:q.A, b:q.B, c:q.C, d:q.D,
        ans:q.ans?.toLowerCase?.()||'a', exp:q.explanation||'',
        hidden: q.hidden || false,
      }))),
    }
    if (modal==='add') { const ok=await addTest(data); if(ok) setModal(null) }
    else { const ok=await updateTest(editRow._id,data); if(ok) setModal(null) }
  }
  const handleDelete = async () => { await deleteTest(delRow._id); setDelRow(null) }

  // ── JSON Import Handler ──
  const handleJsonImport = () => {
    setJsonError(''); setJsonSuccess('')
    if (!jsonInput.trim()) { setJsonError('❌ JSON khali hai — kuch paste karein.'); return }
    let parsed
    try {
      parsed = JSON.parse(jsonInput.trim())
    } catch (e) {
      setJsonError('❌ JSON invalid hai: ' + e.message)
      return
    }
    if (!Array.isArray(parsed)) { setJsonError('❌ JSON ek array hona chahiye: [ {...}, {...} ]'); return }
    if (parsed.length === 0) { setJsonError('❌ Array khali hai.'); return }

    const normalized = parsed.map((q, i) => {
      if (!q || typeof q !== 'object') return emptyQ()
      const optA = String(q.A || q.a || q.option1 || q.opt1 || '')
      const optB = String(q.B || q.b || q.option2 || q.opt2 || '')
      const optC = String(q.C || q.c || q.option3 || q.opt3 || '')
      const optD = String(q.D || q.d || q.option4 || q.opt4 || '')
      let rawAns = String(q.ans || q.correct || q.answer || 'a').trim()
      let ans = 'A'
      if (['a','b','c','d','A','B','C','D'].includes(rawAns)) {
        ans = rawAns.toUpperCase()
      } else {
        const opts = { A: optA, B: optB, C: optC, D: optD }
        const match = Object.entries(opts).find(([,v]) => v && v.trim().toLowerCase() === rawAns.toLowerCase())
        ans = match ? match[0] : 'A'
      }
      const explanation = String(q.exp || q.explanation || q.explain || q.solution || '')
      return {
        question: String(q.question || q.ques || q.text || ''),
        A: optA, B: optB, C: optC, D: optD,
        ans, explanation, hidden: Boolean(q.hidden || false),
      }
    })

    setQuestions(prev => [...prev, ...normalized])
    setJsonInput('')
    setJsonSuccess(`✅ ${normalized.length} questions import ho gaye! Questions tab mein check karein.`)
    setTimeout(() => setJsonSuccess(''), 4000)
  }

  // ── Single Question Add from JSON line ──
  const handleSingleJsonAdd = () => {
    setJsonError(''); setJsonSuccess('')
    const trimmed = jsonInput.trim()
    if (!trimmed) { setJsonError('❌ JSON khali hai.'); return }
    // Support both single object and single-item array
    let obj
    try {
      const parsed = JSON.parse(trimmed)
      obj = Array.isArray(parsed) ? parsed[0] : parsed
    } catch (e) {
      setJsonError('❌ JSON invalid: ' + e.message); return
    }
    if (!obj || typeof obj !== 'object') { setJsonError('❌ Valid question object nahi mila.'); return }
    const optA = String(obj.A || obj.a || '')
    const optB = String(obj.B || obj.b || '')
    const optC = String(obj.C || obj.c || '')
    const optD = String(obj.D || obj.d || '')
    let rawAns = String(obj.ans || obj.correct || 'a').trim()
    let ans = 'A'
    if (['a','b','c','d','A','B','C','D'].includes(rawAns)) {
      ans = rawAns.toUpperCase()
    } else {
      const opts = { A: optA, B: optB, C: optC, D: optD }
      const match = Object.entries(opts).find(([,v]) => v && v.trim().toLowerCase() === rawAns.toLowerCase())
      ans = match ? match[0] : 'A'
    }
    const newQ = {
      question: String(obj.question || obj.ques || ''),
      A: optA, B: optB, C: optC, D: optD,
      ans, explanation: String(obj.exp || obj.explanation || ''), hidden: false,
    }
    setQuestions(prev => [...prev, newQ])
    setJsonInput('')
    setJsonSuccess('✅ 1 question add ho gaya!')
    setTimeout(() => setJsonSuccess(''), 3000)
  }

  const openAddCat  = () => { setCatForm({name:'',description:'',icon:'📋',color:'#6366f1'}); setCatModal('add') }
  const openEditCat = row => { setEditCat(row); setCatForm({name:row.name||'',description:row.description||'',icon:row.icon||'📋',color:row.color||'#6366f1'}); setCatModal('edit') }
  const handleSaveCat = async () => {
    if (!catForm.name.trim()) return
    if (catModal==='add') { const ok=await addCategory(catForm); if(ok) setCatModal(null) }
    else { const ok=await updateCategory(editCat._id,catForm); if(ok) setCatModal(null) }
  }
  const handleDeleteCat = async () => { await deleteCategory(delCat._id); setDelCat(null) }

  const testCols = [
    { key:'title',    label:'Title',     maxWidth:240 },
    { key:'category', label:'Category',  render:v=><Badge color={T.blue}>{v||'—'}</Badge> },
    { key:'level',    label:'Level',     render:v=><Badge color={v==='Easy'?T.green:v==='Hard'?T.red:T.yellow}>{v||'Medium'}</Badge> },
    { key:'totalQue', label:'Questions', render:(v,row)=>v||(row.questions?Object.keys(row.questions).length:'—') },
    { key:'duration', label:'Duration',  render:v=>v?`${v} min`:'—' },
  ]
  const catCols = [
    { key:'icon',        label:'Icon',        render:v=><span style={{fontSize:'1.3rem'}}>{v||'📋'}</span> },
    { key:'name',        label:'Name',        render:v=><strong style={{color:T.text}}>{v}</strong> },
    { key:'description', label:'Description', maxWidth:280 },
    { key:'color',       label:'Color',       render:v=>v?<span style={{display:'inline-block',width:18,height:18,borderRadius:4,background:v,border:`1px solid ${T.border2}`,verticalAlign:'middle'}}/>:'—' },
  ]
  const tabStyle = active => ({
    padding:'8px 18px', borderRadius:'8px 8px 0 0', fontWeight:700, fontSize:'0.85rem',
    cursor:'pointer', border:'none', borderBottom:active?`2px solid ${T.accent}`:'2px solid transparent',
    background:active?T.accent+'18':'transparent', color:active?T.accent:T.muted,
  })
  const stStyle = active => ({
    padding:'7px 16px', borderRadius:8, fontWeight:700, fontSize:'0.83rem', cursor:'pointer',
    border:`1px solid ${active?T.accent+'66':T.border2}`,
    background:active?T.accent+'18':'transparent', color:active?T.accent2:T.muted,
  })
  const ICONS = ['📋','📝','🧠','💡','🖥️','🌐','🐍','⚙️','📡','🔌','🗄️','📱','🔒','🎯','⭐','📚']

  return (
    <div>
      {/* Sub-tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        <button style={stStyle(subTab==='tests')}      onClick={()=>setSubTab('tests')}>📋 Tests ({tests.length})</button>
        <button style={stStyle(subTab==='categories')} onClick={()=>setSubTab('categories')}>🗂️ Categories ({allCatNames.length})</button>
      </div>

      {/* ══ TESTS TAB ══ */}
      {subTab==='tests' && (
        <div>
          <Msg text={msg}/>
          {loading ? (
            <div style={{color:T.muted,padding:32,textAlign:'center'}}>🔄 Loading tests...</div>
          ) : (
            <>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16,alignItems:'center'}}>
                <SearchBar value={q} onChange={setQ} placeholder="Search tests..."/>
                <CatFilter cats={allCatNames} value={cat} onChange={setCat}/>
                <SortBtn field="title"    label="Title"    current={sortF} dir={sortD} onClick={toggleSort}/>
                <SortBtn field="category" label="Category" current={sortF} dir={sortD} onClick={toggleSort}/>
                <SortBtn field="level"    label="Level"    current={sortF} dir={sortD} onClick={toggleSort}/>
                <button style={S.btn} onClick={openAdd}><FiPlus size={14}/> Add Test</button>
              </div>
              <div style={{fontSize:'0.8rem',color:T.muted,marginBottom:10}}>
                Showing <strong style={{color:T.text}}>{filtered.length}</strong> of <strong style={{color:T.text}}>{tests.length}</strong> tests
              </div>
              <DataTable columns={testCols} rows={filtered} onEdit={openEdit} onDelete={setDelRow} emptyMsg="No tests found."/>
            </>
          )}
        </div>
      )}

      {/* ══ CATEGORIES TAB ══ */}
      {subTab==='categories' && (
        <div>
          <Msg text={catMsg}/>
          <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{color:T.muted,fontSize:'0.85rem',flex:1}}>Add icon, color &amp; description for each category card on the Tests page.</span>
            <button style={S.btn} onClick={openAddCat}><FiPlus size={14}/> Add Category</button>
          </div>
          {categories.length>0 && <DataTable columns={catCols} rows={categories} onEdit={openEditCat} onDelete={setDelCat} emptyMsg="No categories yet."/>}
          {allCatNames.filter(n=>!categories.find(c=>c.name===n)).length>0 && (
            <div style={{marginTop:20,padding:'14px 18px',borderRadius:10,background:T.card2,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:'0.8rem',color:T.yellow,fontWeight:700,marginBottom:10}}>⚠️ Categories in tests without metadata — click to add:</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {allCatNames.filter(n=>!categories.find(c=>c.name===n)).map(name=>(
                  <button key={name} onClick={()=>{setCatForm({name,description:'',icon:'📋',color:'#6366f1'});setCatModal('add')}}
                    style={{...S.btnGhost,fontSize:'0.8rem',color:T.yellow,borderColor:T.yellow+'44'}}>
                    <FiPlus size={12}/> {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ TEST ADD/EDIT MODAL ══ */}
      {(modal==='add'||modal==='edit') && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'20px 12px',backdropFilter:'blur(4px)',overflowY:'auto'}}>
          <div style={{background:T.card,border:`1px solid ${T.border2}`,borderRadius:16,width:'100%',maxWidth:780,boxShadow:'0 25px 60px rgba(0,0,0,0.5)',marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 22px',borderBottom:`1px solid ${T.border}`}}>
              <h3 style={{fontWeight:800,fontSize:'1rem',color:T.text,margin:0}}>{modal==='add'?'➕ Add New Test':`✏️ Edit: ${form.title||'Test'}`}</h3>
              <button onClick={()=>setModal(null)} style={{...S.btnGhost,padding:'6px 8px'}}><FiX size={16}/></button>
            </div>
            <div style={{display:'flex',gap:0,padding:'0 22px',borderBottom:`1px solid ${T.border}`}}>
              <button style={tabStyle(activeTab==='info')} onClick={()=>setActiveTab('info')}>📋 Test Info</button>
              <button style={tabStyle(activeTab==='questions')} onClick={()=>setActiveTab('questions')}>
                ❓ Questions <span style={{marginLeft:4,background:T.accent+'33',color:T.accent,borderRadius:999,padding:'1px 7px',fontSize:'0.72rem',fontWeight:800}}>{questions.length}</span>
              </button>
              <button style={tabStyle(activeTab==='import')} onClick={()=>setActiveTab('import')}>📥 JSON Import</button>
            </div>
            <div style={{padding:'20px 22px'}}>
              <Msg text={msg}/>
              {activeTab==='info' && (
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div><FL>Test Title *</FL>
                    <input style={S.input} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. M1-R5 Practice Set 1"/>
                  </div>
                  <div>
                    <FL>Category *</FL>
                    <div style={{display:'flex',gap:8,marginBottom:8}}>
                      <button style={{...stStyle(catInputMode==='select'),fontSize:'0.78rem',padding:'5px 12px'}} onClick={()=>setCatInputMode('select')}>Select Existing</button>
                      <button style={{...stStyle(catInputMode==='new'),fontSize:'0.78rem',padding:'5px 12px'}} onClick={()=>setCatInputMode('new')}>＋ New Category</button>
                    </div>
                    {catInputMode==='select' ? (
                      <select style={S.input} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                        <option value="">— Select Category —</option>
                        {allCatNames.map(n=><option key={n} value={n}>{n}</option>)}
                      </select>
                    ) : (
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        <input style={S.input} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} placeholder="e.g. M5-R5 or New Course Name"/>
                        <div style={{fontSize:'0.75rem',color:T.muted}}>
                          💡 New category auto-created. Add icon/desc from{' '}
                          <strong style={{color:T.accent,cursor:'pointer'}} onClick={()=>{setModal(null);setSubTab('categories')}}>Categories tab</strong>.
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div><FL>Difficulty Level</FL>
                      <select style={S.input} value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))}>
                        <option>Easy</option><option>Medium</option><option>Hard</option>
                      </select>
                    </div>
                    <div><FL>Duration (mins)</FL>
                      <input style={S.input} type="number" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} placeholder="30"/>
                    </div>
                    <div><FL>Total Questions (auto)</FL>
                      <input style={{...S.input,color:T.muted}} value={questions.filter(q=>!q.hidden).length} readOnly/>
                    </div>
                  </div>
                  {/* Shuffle Settings */}
                  <div style={{padding:'14px 16px',borderRadius:10,background:T.card2,border:`1px solid ${T.border2}`}}>
                    <div style={{fontSize:'0.75rem',fontWeight:800,color:T.muted,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>🔀 Shuffle Settings (User View)</div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
                        <input
                          type="checkbox"
                          checked={!!form.shuffleQuestions}
                          onChange={e=>setForm(p=>({...p,shuffleQuestions:e.target.checked}))}
                          style={{marginTop:2,width:16,height:16,accentColor:T.accent,flexShrink:0}}
                        />
                        <div>
                          <div style={{fontSize:'0.86rem',fontWeight:700,color:T.text}}>Questions Shuffle</div>
                          <div style={{fontSize:'0.75rem',color:T.muted,marginTop:2}}>User ko questions random order mein dikhenge — database mein order same rahega</div>
                        </div>
                      </label>
                      <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
                        <input
                          type="checkbox"
                          checked={!!form.shuffleOptions}
                          onChange={e=>setForm(p=>({...p,shuffleOptions:e.target.checked}))}
                          style={{marginTop:2,width:16,height:16,accentColor:T.accent,flexShrink:0}}
                        />
                        <div>
                          <div style={{fontSize:'0.86rem',fontWeight:700,color:T.text}}>Options Shuffle</div>
                          <div style={{fontSize:'0.75rem',color:T.muted,marginTop:2}}>Har question ke options (A/B/C/D) randomly shuffle honge — sahi answer ka mapping preserved rahega</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <button style={{...S.btn,alignSelf:'flex-start'}} onClick={()=>setActiveTab('questions')}>
                    Next → Edit Questions ({questions.length})
                  </button>
                </div>
              )}
              {activeTab==='questions' && (
                <div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
                    <span style={{fontSize:'0.82rem',color:T.muted}}>
                      <strong style={{color:T.text}}>{questions.length}</strong> questions — click option to mark correct • <span style={{color:T.green}}>✅ Visible</span> / <span style={{color:T.red}}>🚫 Hidden</span> toggle per question
                    </span>
                    <button style={{...S.btnGhost,fontSize:'0.78rem',color:T.accent,borderColor:T.accent+'55'}} onClick={()=>setActiveTab('import')}>
                      📥 JSON se import karein
                    </button>
                  </div>
                  <div style={{maxHeight:'55vh',overflowY:'auto',paddingRight:4}}>
                    <QuestionEditor questions={questions} onChange={setQuestions}/>
                  </div>
                </div>
              )}
              {activeTab==='import' && (
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  {/* Format info */}
                  <div style={{padding:'12px 16px',borderRadius:8,background:T.card2,border:`1px solid ${T.border2}`,fontSize:'0.8rem',color:T.muted,lineHeight:1.7}}>
                    <strong style={{color:T.accent}}>📌 JSON Format:</strong>
                    <pre style={{margin:'8px 0 0',fontFamily:'monospace',fontSize:'0.78rem',color:T.text,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
{`[
  {
    "question": "कंप्यूटर का उपयोग music में?",
    "a": "Composition, editing, production",
    "b": "केवल listening",
    "c": "नहीं",
    "d": "Manual",
    "ans": "a",
    "exp": "संगीत निर्माण।"
  }
]`}
                    </pre>
                    <div style={{marginTop:8,color:T.muted,fontSize:'0.75rem'}}>
                      • <code style={{background:T.bg,padding:'1px 5px',borderRadius:4}}>ans</code> field mein option letter (a/b/c/d) ya option ka pura text dono chalega<br/>
                      • <code style={{background:T.bg,padding:'1px 5px',borderRadius:4}}>exp</code> ya <code style={{background:T.bg,padding:'1px 5px',borderRadius:4}}>explanation</code> — explanation ke liye<br/>
                      • <code style={{background:T.bg,padding:'1px 5px',borderRadius:4}}>"hidden": true</code> — optional, question hide karne ke liye
                    </div>
                  </div>

                  {/* JSON textarea */}
                  <div>
                    <FL>JSON Paste karein (Array ya Single Object)</FL>
                    <textarea
                      style={{...S.textarea, minHeight:200, fontFamily:'monospace', fontSize:'0.82rem'}}
                      value={jsonInput}
                      onChange={e=>{setJsonInput(e.target.value);setJsonError('');setJsonSuccess('')}}
                      placeholder='[{"question":"...","a":"...","b":"...","c":"...","d":"...","ans":"a","exp":"..."}]'
                    />
                  </div>

                  {/* Error / Success messages */}
                  {jsonError   && <div style={{padding:'8px 14px',borderRadius:8,background:'rgba(239,68,68,0.12)',color:T.red,fontSize:'0.84rem',fontWeight:600,border:`1px solid ${T.red}33`}}>{jsonError}</div>}
                  {jsonSuccess && <div style={{padding:'8px 14px',borderRadius:8,background:'rgba(16,185,129,0.12)',color:T.green,fontSize:'0.84rem',fontWeight:600,border:`1px solid ${T.green}33`}}>{jsonSuccess}</div>}

                  {/* Action buttons */}
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    <button style={{...S.btnGreen,flex:1,justifyContent:'center'}} onClick={handleJsonImport}>
                      <FiPlus size={14}/> Bulk Import (Array)
                    </button>
                    <button style={{...S.btn,flex:1,justifyContent:'center',background:T.blue}} onClick={handleSingleJsonAdd}>
                      <FiPlus size={14}/> Single Question Add
                    </button>
                    <button style={{...S.btnGhost,padding:'9px 16px'}} onClick={()=>{setJsonInput('');setJsonError('');setJsonSuccess('')}} title="Clear">
                      <FiX size={14}/>
                    </button>
                  </div>

                  {/* Current questions count preview */}
                  {questions.length > 0 && (
                    <div style={{padding:'10px 14px',borderRadius:8,background:T.card2,border:`1px solid ${T.border}`,fontSize:'0.82rem',color:T.muted,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span>Abhi <strong style={{color:T.text}}>{questions.length}</strong> questions hain</span>
                      <button style={{...S.btnGhost,fontSize:'0.78rem',padding:'5px 12px',color:T.accent}} onClick={()=>setActiveTab('questions')}>
                        Questions Edit karein →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{padding:'14px 22px',borderTop:`1px solid ${T.border}`,display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button style={S.btnGhost} onClick={()=>setModal(null)}>Cancel</button>
              <button style={S.btn} onClick={handleSave}><FiSave size={14}/> Save Test</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CATEGORY ADD/EDIT MODAL ══ */}
      {(catModal==='add'||catModal==='edit') && (
        <Modal title={catModal==='add'?'➕ Add Category':'✏️ Edit Category'} onClose={()=>setCatModal(null)}>
          <Msg text={catMsg}/>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 80px',gap:12}}>
              <div><FL>Category Name *</FL>
                <input style={S.input} value={catForm.name} onChange={e=>setCatForm(p=>({...p,name:e.target.value}))} placeholder="e.g. M1-R5"/>
              </div>
              <div><FL>Color</FL>
                <input type="color" style={{...S.input,padding:4,height:40,cursor:'pointer'}} value={catForm.color} onChange={e=>setCatForm(p=>({...p,color:e.target.value}))}/>
              </div>
            </div>
            <div><FL>Description</FL>
              <textarea style={S.textarea} value={catForm.description} onChange={e=>setCatForm(p=>({...p,description:e.target.value}))} placeholder="Short description shown on category card"/>
            </div>
            <div>
              <FL>Icon (choose or type emoji)</FL>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
                {ICONS.map(ic=>(
                  <button key={ic} onClick={()=>setCatForm(p=>({...p,icon:ic}))}
                    style={{width:36,height:36,borderRadius:8,fontSize:'1.1rem',cursor:'pointer',
                      border:`2px solid ${catForm.icon===ic?T.accent:T.border2}`,
                      background:catForm.icon===ic?T.accent+'22':T.card2}}>
                    {ic}
                  </button>
                ))}
                <input style={{...S.input,width:64,textAlign:'center',fontSize:'1.1rem'}} value={catForm.icon} onChange={e=>setCatForm(p=>({...p,icon:e.target.value}))} placeholder="🔥"/>
              </div>
            </div>
            <div style={{padding:'14px 18px',borderRadius:12,background:T.card2,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:48,height:48,borderRadius:12,background:(catForm.color||T.accent)+'22',border:`2px solid ${(catForm.color||T.accent)}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0}}>
                {catForm.icon||'📋'}
              </div>
              <div>
                <div style={{fontWeight:800,color:T.text,fontSize:'0.95rem'}}>{catForm.name||'Category Name'}</div>
                <div style={{color:T.muted,fontSize:'0.8rem',marginTop:2}}>{catForm.description||'Description preview'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button style={S.btn} onClick={handleSaveCat}><FiSave size={14}/> Save Category</button>
              <button style={S.btnGhost} onClick={()=>setCatModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {delRow && <ConfirmDelete label={delRow.title} onConfirm={handleDelete}    onCancel={()=>setDelRow(null)}/>}
      {delCat && <ConfirmDelete label={delCat.name}  onConfirm={handleDeleteCat} onCancel={()=>setDelCat(null)}/>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: THEORY MANAGER
// Firebase path: TheoryContent  { topicTitle, category, htmlContent, videoId }
// ═══════════════════════════════════════════════════════════════════════════════
function TheoryManager() {
  const { items, loading, msg, addItem, updateItem, deleteItem } = useAdminCrud('TheoryContent')
  const [modal, setModal]     = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [delRow, setDelRow]   = useState(null)
  const [form, setForm]       = useState({ topicTitle: '', category: '', videoId: '', htmlContent: '' })
  const { q, setQ, cat, setCat, sortF, sortD, toggleSort, filtered, uniqueCats } = useTableState(items, { searchKeys: ['topicTitle', 'category'], catKey: 'category' })

  const openAdd  = () => { setForm({ topicTitle: '', category: '', videoId: '', htmlContent: '' }); setModal('add') }
  const openEdit = row => {
    setEditRow(row)
    setForm({ topicTitle: row.topicTitle || '', category: row.category || '', videoId: row.videoId || '', htmlContent: row.htmlContent || '' })
    setModal('edit')
  }
  const handleSave = async () => {
    if (!form.topicTitle.trim() || !form.category.trim()) return
    const data = { topicTitle: form.topicTitle.trim(), category: form.category.trim(), videoId: form.videoId.trim(), htmlContent: form.htmlContent }
    if (modal === 'add') { const ok = await addItem(data); if (ok) setModal(null) }
    else { const ok = await updateItem(editRow._id, data); if (ok) setModal(null) }
  }
  const handleDelete = async () => { await deleteItem(delRow._id); setDelRow(null) }

  const columns = [
    { key: 'topicTitle', label: 'Topic Title', maxWidth: 260 },
    { key: 'category',   label: 'Subject',   render: v => <Badge color={T.purple}>{v || '—'}</Badge> },
    { key: 'videoId',    label: 'Video',     render: v => v ? <Badge color={T.red}>▶ YouTube</Badge> : <span style={{ color: T.muted }}>—</span> },
    { key: 'htmlContent',label: 'HTML',      render: v => v ? <Badge color={T.green}>✓ Content</Badge> : <span style={{ color: T.muted }}>—</span> },
  ]

  return (
    <div>
      <Msg text={msg} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <SearchBar value={q} onChange={setQ} placeholder="Search topics..." />
        <CatFilter cats={uniqueCats} value={cat} onChange={setCat} label="All Subjects" />
        <SortBtn field="topicTitle" label="Title" current={sortF} dir={sortD} onClick={toggleSort} />
        <SortBtn field="category"   label="Subject" current={sortF} dir={sortD} onClick={toggleSort} />
        <button style={S.btn} onClick={openAdd}><FiPlus size={14} /> Add Topic</button>
      </div>
      <div style={{ fontSize: '0.8rem', color: T.muted, marginBottom: 10 }}>{filtered.length} of {items.length} topics</div>
      {loading ? <div style={{ color: T.muted, padding: 24 }}>Loading...</div> : (
        <DataTable columns={columns} rows={filtered} onEdit={openEdit} onDelete={setDelRow} emptyMsg="No theory topics found." />
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? '➕ Add Theory Topic' : '✏️ Edit Theory Topic'} onClose={() => setModal(null)}>
          <Msg text={msg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><FL>Topic Title *</FL><input style={S.input} value={form.topicTitle} onChange={e => setForm(p => ({ ...p, topicTitle: e.target.value }))} placeholder="e.g. Introduction to Python" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><FL>Subject/Category *</FL><input style={S.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. M3-R5" /></div>
              <div><FL>YouTube Video ID</FL><input style={S.input} value={form.videoId} onChange={e => setForm(p => ({ ...p, videoId: e.target.value }))} placeholder="e.g. dQw4w9WgXcQ" /></div>
            </div>
            <div>
              <FL>HTML Content</FL>
              <textarea style={{ ...S.textarea, minHeight: 140, fontFamily: 'monospace', fontSize: '0.8rem' }}
                value={form.htmlContent} onChange={e => setForm(p => ({ ...p, htmlContent: e.target.value }))}
                placeholder="<h2>Topic</h2><p>Content here...</p>" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.btn} onClick={handleSave}><FiSave size={14} /> Save</button>
              <button style={S.btnGhost} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {delRow && <ConfirmDelete label={delRow.topicTitle} onConfirm={handleDelete} onCancel={() => setDelRow(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: PDFs / NOTES MANAGER
// Firebase path: Notifications  { title, category, url, date, desc, hidden }
// ═══════════════════════════════════════════════════════════════════════════════
function PDFsManager() {
  const { items, loading, msg, addItem, updateItem, deleteItem } = useAdminCrud('Notifications')
  const [modal, setModal]     = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [delRow, setDelRow]   = useState(null)
  const [form, setForm]       = useState({ title: '', category: '', url: '', date: '', desc: '', hidden: false })
  const { q, setQ, cat, setCat, sortF, sortD, toggleSort, filtered, uniqueCats } = useTableState(items, { searchKeys: ['title', 'category', 'desc'], catKey: 'category' })

  const openAdd  = () => { setForm({ title: '', category: '', url: '', date: new Date().toLocaleDateString('en-IN'), desc: '', hidden: false }); setModal('add') }
  const openEdit = row => { setEditRow(row); setForm({ title: row.title || '', category: row.category || '', url: row.url || '', date: row.date || '', desc: row.desc || '', hidden: row.hidden || false }); setModal('edit') }
  const handleSave = async () => {
    if (!form.title.trim() || !form.category.trim()) return
    const data = { title: form.title.trim(), category: form.category.trim(), url: form.url.trim(), date: form.date, desc: form.desc, hidden: form.hidden }
    if (modal === 'add') { const ok = await addItem(data); if (ok) setModal(null) }
    else { const ok = await updateItem(editRow._id, data); if (ok) setModal(null) }
  }
  const handleDelete = async () => { await deleteItem(delRow._id); setDelRow(null) }

  const columns = [
    { key: 'title',    label: 'Title',    maxWidth: 240 },
    { key: 'category', label: 'Category', render: v => <Badge color={T.green}>{v || '—'}</Badge> },
    { key: 'date',     label: 'Date',     maxWidth: 100 },
    { key: 'hidden',   label: 'Status',   render: v => v ? <Badge color={T.red}>Hidden</Badge> : <Badge color={T.green}>Visible</Badge> },
    { key: 'url',      label: 'URL',      render: v => v ? <a href={v} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: '0.78rem' }}>🔗 Open</a> : '—' },
  ]

  return (
    <div>
      <Msg text={msg} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <SearchBar value={q} onChange={setQ} placeholder="Search notes/PDFs..." />
        <CatFilter cats={uniqueCats} value={cat} onChange={setCat} />
        <SortBtn field="title"    label="Title"    current={sortF} dir={sortD} onClick={toggleSort} />
        <SortBtn field="category" label="Category" current={sortF} dir={sortD} onClick={toggleSort} />
        <SortBtn field="date"     label="Date"     current={sortF} dir={sortD} onClick={toggleSort} />
        <button style={S.btn} onClick={openAdd}><FiPlus size={14} /> Add PDF</button>
      </div>
      <div style={{ fontSize: '0.8rem', color: T.muted, marginBottom: 10 }}>{filtered.length} of {items.length} files</div>
      {loading ? <div style={{ color: T.muted, padding: 24 }}>Loading...</div> : (
        <DataTable columns={columns} rows={filtered} onEdit={openEdit} onDelete={setDelRow} emptyMsg="No PDFs found." />
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? '➕ Add PDF/Note' : '✏️ Edit PDF/Note'} onClose={() => setModal(null)}>
          <Msg text={msg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><FL>Title *</FL><input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. M1-R5 Complete Notes" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><FL>Category *</FL><input style={S.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. M1-R5" /></div>
              <div><FL>Date</FL><input style={S.input} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="e.g. 01 Jan 2026" /></div>
            </div>
            <div><FL>PDF URL (Google Drive / Direct)</FL><input style={S.input} value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://drive.google.com/..." /></div>
            <div><FL>Description</FL><textarea style={S.textarea} value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Short description of this file..." /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="pdfHidden" checked={!!form.hidden} onChange={e => setForm(p => ({ ...p, hidden: e.target.checked }))} />
              <label htmlFor="pdfHidden" style={{ color: T.muted, fontSize: '0.85rem', cursor: 'pointer' }}>Hide this file from users</label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.btn} onClick={handleSave}><FiSave size={14} /> Save</button>
              <button style={S.btnGhost} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {delRow && <ConfirmDelete label={delRow.title} onConfirm={handleDelete} onCancel={() => setDelRow(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: PROJECTS MANAGER
// Firebase path: Projects  { title, description, techStack, imageUrl, price, fileUrl, reportUrl, demoUrl }
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsManager() {
  const { items, loading, msg, addItem, updateItem, deleteItem } = useAdminCrud('Projects')
  const [modal, setModal]     = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [delRow, setDelRow]   = useState(null)
  const [form, setForm]       = useState({ title: '', description: '', techStack: '', imageUrl: '', price: '', fileUrl: '', reportUrl: '', demoUrl: '' })
  const { q, setQ, sortF, sortD, toggleSort, filtered } = useTableState(items, { searchKeys: ['title', 'description', 'techStack'] })

  const openAdd  = () => { setForm({ title: '', description: '', techStack: '', imageUrl: '', price: '', fileUrl: '', reportUrl: '', demoUrl: '' }); setModal('add') }
  const openEdit = row => {
    setEditRow(row)
    const ts = row.techStack
    const tsStr = ts ? (typeof ts === 'object' ? Object.values(ts).join(', ') : ts) : ''
    setForm({ title: row.title || '', description: row.description || '', techStack: tsStr, imageUrl: row.imageUrl || '', price: row.price || '', fileUrl: row.fileUrl || '', reportUrl: row.reportUrl || '', demoUrl: row.demoUrl || '' })
    setModal('edit')
  }
  const handleSave = async () => {
    if (!form.title.trim()) return
    const data = { title: form.title.trim(), description: form.description, techStack: form.techStack, imageUrl: form.imageUrl, price: form.price, fileUrl: form.fileUrl, reportUrl: form.reportUrl, demoUrl: form.demoUrl }
    if (modal === 'add') { const ok = await addItem(data); if (ok) setModal(null) }
    else { const ok = await updateItem(editRow._id, data); if (ok) setModal(null) }
  }
  const handleDelete = async () => { await deleteItem(delRow._id); setDelRow(null) }

  const columns = [
    { key: 'imageUrl',    label: 'Image',  render: v => v ? <img src={v} alt="" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 6 }} /> : <span style={{ color: T.muted }}>—</span> },
    { key: 'title',       label: 'Title',  maxWidth: 200 },
    { key: 'techStack',   label: 'Tech',   render: v => { const s = typeof v === 'object' ? Object.values(v || {}).join(', ') : v; return <span style={{ color: T.muted, fontSize: '0.8rem' }}>{s || '—'}</span> } },
    { key: 'price',       label: 'Price',  render: v => v ? <Badge color={T.yellow}>₹{v}</Badge> : <span style={{ color: T.muted }}>Free</span> },
  ]

  return (
    <div>
      <Msg text={msg} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <SearchBar value={q} onChange={setQ} placeholder="Search projects..." />
        <SortBtn field="title" label="Title" current={sortF} dir={sortD} onClick={toggleSort} />
        <SortBtn field="price" label="Price" current={sortF} dir={sortD} onClick={toggleSort} />
        <button style={S.btn} onClick={openAdd}><FiPlus size={14} /> Add Project</button>
      </div>
      <div style={{ fontSize: '0.8rem', color: T.muted, marginBottom: 10 }}>{filtered.length} of {items.length} projects</div>
      {loading ? <div style={{ color: T.muted, padding: 24 }}>Loading...</div> : (
        <DataTable columns={columns} rows={filtered} onEdit={openEdit} onDelete={setDelRow} emptyMsg="No projects found." />
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? '➕ Add Project' : '✏️ Edit Project'} onClose={() => setModal(null)}>
          <Msg text={msg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><FL>Title *</FL><input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Library Management System" /></div>
            <div><FL>Description</FL><textarea style={S.textarea} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe this project..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><FL>Tech Stack (comma separated)</FL><input style={S.input} value={form.techStack} onChange={e => setForm(p => ({ ...p, techStack: e.target.value }))} placeholder="Python, MySQL, HTML" /></div>
              <div><FL>Price (₹)</FL><input style={S.input} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="99 (leave blank = Free)" /></div>
            </div>
            <div><FL>Image URL</FL><input style={S.input} value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><FL>Project File URL</FL><input style={S.input} value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://drive.google.com/..." /></div>
            <div><FL>Report URL</FL><input style={S.input} value={form.reportUrl} onChange={e => setForm(p => ({ ...p, reportUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><FL>Demo URL / HTML</FL><textarea style={{ ...S.textarea, minHeight: 70 }} value={form.demoUrl} onChange={e => setForm(p => ({ ...p, demoUrl: e.target.value }))} placeholder="https://demo.com  OR  <html>...</html>" /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.btn} onClick={handleSave}><FiSave size={14} /> Save</button>
              <button style={S.btnGhost} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {delRow && <ConfirmDelete label={delRow.title} onConfirm={handleDelete} onCancel={() => setDelRow(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: SLIDER MANAGER
// Firebase path: Slider  { title, description, category, imageUrl, link }
// ═══════════════════════════════════════════════════════════════════════════════
function SliderManager() {
  const { items, loading, msg, addItem, updateItem, deleteItem } = useAdminCrud('Slider')
  const [modal, setModal]     = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [delRow, setDelRow]   = useState(null)
  const [form, setForm]       = useState({ title: '', description: '', category: '', imageUrl: '', link: '' })
  const { q, setQ, sortF, sortD, toggleSort, filtered } = useTableState(items, { searchKeys: ['title', 'category'] })

  const openAdd  = () => { setForm({ title: '', description: '', category: '', imageUrl: '', link: '' }); setModal('add') }
  const openEdit = row => { setEditRow(row); setForm({ title: row.title || '', description: row.description || '', category: row.category || '', imageUrl: row.imageUrl || '', link: row.link || '' }); setModal('edit') }
  const handleSave = async () => {
    if (!form.title.trim()) return
    const data = { title: form.title.trim(), description: form.description, category: form.category, imageUrl: form.imageUrl, link: form.link }
    if (modal === 'add') { const ok = await addItem(data); if (ok) setModal(null) }
    else { const ok = await updateItem(editRow._id, data); if (ok) setModal(null) }
  }
  const handleDelete = async () => { await deleteItem(delRow._id); setDelRow(null) }

  const columns = [
    { key: 'imageUrl',    label: 'Preview',  render: v => v ? <img src={v} alt="" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : <span style={{ color: T.muted }}>No Image</span> },
    { key: 'title',       label: 'Title',    maxWidth: 220 },
    { key: 'category',    label: 'Category', render: v => v ? <Badge color={T.pink}>{v}</Badge> : '—' },
    { key: 'link',        label: 'Link',     render: v => v ? <span style={{ color: T.accent, fontSize: '0.8rem' }}>{v}</span> : '—' },
  ]

  return (
    <div>
      <Msg text={msg} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <SearchBar value={q} onChange={setQ} placeholder="Search slides..." />
        <SortBtn field="title"    label="Title"    current={sortF} dir={sortD} onClick={toggleSort} />
        <SortBtn field="category" label="Category" current={sortF} dir={sortD} onClick={toggleSort} />
        <button style={S.btn} onClick={openAdd}><FiPlus size={14} /> Add Slide</button>
      </div>
      <div style={{ fontSize: '0.8rem', color: T.muted, marginBottom: 10 }}>{filtered.length} slides total</div>
      {loading ? <div style={{ color: T.muted, padding: 24 }}>Loading...</div> : (
        <DataTable columns={columns} rows={filtered} onEdit={openEdit} onDelete={setDelRow} emptyMsg="No slides found." />
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? '➕ Add Slide' : '✏️ Edit Slide'} onClose={() => setModal(null)}>
          <Msg text={msg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><FL>Title *</FL><input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Slide heading" /></div>
            <div><FL>Description</FL><textarea style={S.textarea} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Slide subtitle / description" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><FL>Category Tag</FL><input style={S.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. O-LEVEL SPECIAL" /></div>
              <div><FL>Link / URL</FL><input style={S.input} value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="/tests" /></div>
            </div>
            <div>
              <FL>Image URL</FL>
              <input style={S.input} value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://... (leave blank for gradient slide)" />
              {form.imageUrl && <img src={form.imageUrl} alt="preview" style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}` }} onError={e => e.target.style.display='none'} />}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.btn} onClick={handleSave}><FiSave size={14} /> Save</button>
              <button style={S.btnGhost} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {delRow && <ConfirmDelete label={delRow.title} onConfirm={handleDelete} onCancel={() => setDelRow(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: BLOGS MANAGER
// Firebase path: blogs  { title, excerpt, content, slug, category, image, author, readTime }
// ── GitHub Actions Config Section (inside BlogsManager) ─────────────────────
function GithubConfigSection() {
  const [token, setToken] = useState(() => localStorage.getItem('gh_actions_token') || '')
  const [repo, setRepo]   = useState(() => localStorage.getItem('gh_actions_repo') || 'div137/OLevelSarathi-webApp')
  const [show, setShow]   = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('gh_actions_token', token.trim())
    localStorage.setItem('gh_actions_repo', repo.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const isConfigured = !!(localStorage.getItem('gh_actions_token') && localStorage.getItem('gh_actions_repo'))

  return (
    <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
      <button
        onClick={() => setShow(s => !s)}
        style={{ ...S.btnGhost, fontSize: '0.78rem', gap: 6 }}
      >
        <FiCode size={13} />
        {isConfigured ? '✅ GitHub Config (configured)' : '⚙️ GitHub Config (setup required)'}
        {show ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
      </button>

      {show && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
          <div style={{ fontSize: '0.78rem', color: T.muted, lineHeight: 1.6, padding: '10px 14px', background: T.card2, borderRadius: 8, border: `1px solid ${T.border2}` }}>
            <strong style={{ color: T.text }}>Setup steps:</strong><br/>
            1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token<br/>
            2. Permissions: <strong>Actions → Read & Write</strong><br/>
            3. Repo naam format: <code style={{ color: T.accent }}>username/repo-name</code>
          </div>
          <div>
            <label style={S.label}>GitHub Repo (username/repo-name)</label>
            <input
              style={S.input}
              value={repo}
              onChange={e => setRepo(e.target.value)}
              placeholder="e.g. johndoe/olevel-sarathi-app"
            />
          </div>
          <div>
            <label style={S.label}>GitHub Personal Access Token</label>
            <input
              style={S.input}
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
          </div>
          <button style={S.btnGreen} onClick={handleSave}>
            <FiSave size={13} /> {saved ? '✅ Saved!' : 'Save Config'}
          </button>
          <p style={{ fontSize: '0.72rem', color: T.muted }}>
            ⚠️ Token sirf aapke browser mein store hota hai (localStorage) — server pe nahi jaata.
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
function BlogsManager() {
  const { blogs, loading, error, addBlog, updateBlog, deleteBlog } = useBlogManagement()
  const [modal, setModal]     = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [delRow, setDelRow]   = useState(null)
  const [msg, setMsg]         = useState('')
  const [genStatus, setGenStatus] = useState(null)
  const [genErrMsg, setGenErrMsg] = useState('')
  const [autoDeploy, setAutoDeploy] = useState(true)  // default ON
  const [form, setForm]       = useState({ title: '', excerpt: '', content: '', slug: '', category: '', image: '', author: '', readTime: '', keywords: '' })
  const { q, setQ, cat, setCat, sortF, sortD, toggleSort, filtered, uniqueCats } = useTableState(
    blogs.map(b => ({ ...b, _id: b.id })),
    { searchKeys: ['title', 'category', 'excerpt'], catKey: 'category' }
  )

  const flash = text => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const openAdd  = () => { setForm({ title: '', excerpt: '', content: '', slug: '', category: '', image: '', author: 'Admin', readTime: '5 min', keywords: '' }); setModal('add') }
  const openEdit = row => {
    setEditRow(row)
    setForm({ title: row.title || '', excerpt: row.excerpt || '', content: row.content || '', slug: row.slug || '', category: row.category || '', image: row.image || '', author: row.author || '', readTime: row.readTime || '', keywords: row.keywords || '' })
    setModal('edit')
  }

  // Trigger GitHub Actions deploy
  const triggerDeploy = async () => {
    const ghToken = localStorage.getItem('gh_actions_token')
    const ghRepo  = localStorage.getItem('gh_actions_repo') || 'div137/OLevelSarathi-webApp'
    if (!ghToken) { fireToast({ type: 'error', text: '⚠️ GitHub token set nahi hai — manually Publish Static Pages dabao' }); return }
    fireToast({ type: 'loading', text: '⏳ Static deploy trigger ho raha hai...' })
    try {
      const res = await fetch(`https://api.github.com/repos/${ghRepo}/dispatches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${ghToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: 'blog-updated', client_payload: { triggered_by: 'auto-save' } }),
      })
      if (res.status === 204) {
        fireToast({ type: 'success', text: '✅ Static deploy trigger ho gaya! ~3 min mein live.' })
        setGenStatus('triggered')
      } else {
        const t = await res.text()
        fireToast({ type: 'error', text: `❌ Deploy error ${res.status}: ${t}` })
      }
    } catch (e) {
      fireToast({ type: 'error', text: '❌ Network error: ' + e.message })
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    const slug = form.slug.trim() || form.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const data = { ...form, title: form.title.trim(), slug }
    let ok = false
    if (modal === 'add') {
      const id = await addBlog(data)
      ok = !!id
      ok ? flash('✅ Blog added!') : flash('❌ Failed')
    } else {
      ok = await updateBlog(editRow.id, data)
      ok ? flash('✅ Updated!') : flash('❌ Failed')
    }
    setModal(null)
    // Auto-deploy agar checked hai
    if (ok && autoDeploy) {
      setTimeout(() => triggerDeploy(), 800)  // slight delay taaki Firebase save complete ho
    }
  }
  const handleDelete = async () => { const ok = await deleteBlog(delRow.id); ok ? flash('✅ Deleted!') : flash('❌ Failed'); setDelRow(null) }

  const handleGenerateStatic = async () => {
    if (blogs.length === 0) { flash('❌ No blogs to deploy!'); return }
    setGenStatus('running')
    fireToast({ type: 'loading', text: '⏳ GitHub Actions deploy trigger ho raha hai...' })
    try {
      // Read GitHub token from localStorage (set in settings)
      const ghToken = localStorage.getItem('gh_actions_token')
      const ghRepo  = localStorage.getItem('gh_actions_repo') || 'div137/OLevelSarathi-webApp'

      if (!ghToken) {
        setGenStatus('config_needed')
        fireToast({ type: 'error', text: '❌ GitHub token configure karo pehle (Settings mein)' })
        return
      }

      const response = await fetch(
        `https://api.github.com/repos/${ghRepo}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${ghToken}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'blog-updated',
            client_payload: {
              blog_count: blogs.length,
              triggered_at: new Date().toISOString(),
              triggered_by: 'admin-panel',
            },
          }),
        }
      )

      if (response.status === 204) {
        setGenStatus('triggered')
        fireToast({ type: 'success', text: `✅ Deploy trigger ho gaya! ~2-3 min mein live ho jayega.` })
      } else {
        const errText = await response.text()
        setGenStatus('error')
        setGenErrMsg(`❌ GitHub API error: ${response.status} — ${errText}`)
        fireToast({ type: 'error', text: `❌ GitHub API error: ${response.status}` })
      }
    } catch (e) {
      setGenStatus('error')
      setGenErrMsg('❌ Network error: ' + e.message)
      fireToast({ type: 'error', text: '❌ Network error: ' + e.message })
    }
  }

  const columns = [
    { key: 'image',    label: 'Image',    render: v => v ? <img src={v} alt="" style={{ width: 60, height: 36, objectFit: 'cover', borderRadius: 6 }} /> : <span style={{ color: T.muted }}>—</span> },
    { key: 'title',    label: 'Title',    maxWidth: 220 },
    { key: 'category', label: 'Category', render: v => <Badge color={T.accent}>{v || '—'}</Badge> },
    { key: 'author',   label: 'Author',   maxWidth: 120 },
    { key: 'readTime', label: 'Read Time' },
  ]

  return (
    <div>
      <Msg text={msg} />
      {error && <div style={{ padding: '8px 14px', borderRadius: 8, marginBottom: 12, background: 'rgba(245,158,11,0.12)', color: T.yellow, fontSize: '0.82rem' }}>⚠️ {error}</div>}

      {/* ── Static Pages Generator Panel ── */}
      <div style={{ ...S.card, marginBottom: 20, borderColor: T.accent + '44', background: 'rgba(99,102,241,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FiUploadCloud size={18} style={{ color: T.accent }} />
              <span style={{ fontWeight: 800, color: T.text, fontSize: '0.95rem' }}>Auto Static Deploy</span>
              <Badge color={T.green}>{blogs.length} posts</Badge>
            </div>
            <p style={{ fontSize: '0.82rem', color: T.muted, lineHeight: 1.6, maxWidth: 560 }}>
              Ye button GitHub Actions trigger karta hai — automatically React build + static blog HTML pages generate + Firebase deploy ho jaata hai (~2-3 min mein live).
            </p>

            {/* Status messages */}
            {genStatus === 'triggered' && (
              <div style={{ marginTop: 8, fontSize: '0.82rem', color: T.green }}>
                ✅ Deploy trigger ho gaya! GitHub Actions chal raha hai (~2-3 min). Check karo:{' '}
                <a href={`https://github.com/${localStorage.getItem('gh_actions_repo') || 'your/repo'}/actions`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: T.accent2, textDecoration: 'underline' }}>
                  GitHub Actions →
                </a>
              </div>
            )}
            {genStatus === 'error' && (
              <div style={{ marginTop: 8, fontSize: '0.82rem', color: T.red }}>{genErrMsg || '❌ Deploy fail hua. Token aur repo naam check karo.'}</div>
            )}
            {genStatus === 'config_needed' && (
              <div style={{ marginTop: 8, fontSize: '0.82rem', color: T.yellow }}>⚠️ GitHub Token aur Repo naam configure karo (neeche Settings mein).</div>
            )}
          </div>
          <button
            style={{ ...S.btnGreen, opacity: genStatus === 'running' ? 0.6 : 1, cursor: genStatus === 'running' ? 'not-allowed' : 'pointer', flexShrink: 0 }}
            onClick={handleGenerateStatic}
            disabled={genStatus === 'running' || blogs.length === 0}
          >
            {genStatus === 'running'
              ? <><FiLoader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Triggering...</>
              : <><FiUploadCloud size={14} /> Publish Static Pages</>
            }
          </button>
        </div>

        {/* ── GitHub Config Section ── */}
        <GithubConfigSection />

        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <SearchBar value={q} onChange={setQ} placeholder="Search blogs..." />
        <CatFilter cats={uniqueCats} value={cat} onChange={setCat} />
        <SortBtn field="title"    label="Title"    current={sortF} dir={sortD} onClick={toggleSort} />
        <SortBtn field="category" label="Category" current={sortF} dir={sortD} onClick={toggleSort} />
        <button style={S.btn} onClick={openAdd}><FiPlus size={14} /> Add Blog</button>
      </div>
      <div style={{ fontSize: '0.8rem', color: T.muted, marginBottom: 10 }}>{filtered.length} of {blogs.length} blogs</div>
      {loading ? <div style={{ color: T.muted, padding: 24 }}>Loading...</div> : (
        <DataTable columns={columns} rows={filtered} onEdit={openEdit} onDelete={setDelRow} emptyMsg="No blogs found." />
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? '➕ Add Blog Post' : '✏️ Edit Blog Post'} onClose={() => setModal(null)}>
          <Msg text={msg} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><FL>Title *</FL><input style={S.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Blog post title" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><FL>Category</FL><input style={S.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Python" /></div>
              <div><FL>Slug (auto if blank)</FL><input style={S.input} value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="my-blog-post-title" /></div>
              <div><FL>Author</FL><input style={S.input} value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} placeholder="Author name" /></div>
              <div><FL>Read Time</FL><input style={S.input} value={form.readTime} onChange={e => setForm(p => ({ ...p, readTime: e.target.value }))} placeholder="5 min" /></div>
            </div>
            <div>
              <CloudinaryImageUpload
                value={form.image}
                onChange={url => setForm(p => ({ ...p, image: url }))}
                label="Featured Image"
              />
            </div>
            <div><FL>Excerpt</FL><textarea style={S.textarea} value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description shown in blog list..." /></div>
            <div><FL>Content (HTML)</FL><textarea style={{ ...S.textarea, minHeight: 120, fontFamily: 'monospace', fontSize: '0.8rem' }} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="<h2>Introduction</h2><p>...</p>" /></div>
            <div><FL>Keywords (SEO)</FL><input style={S.input} value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} placeholder="python tutorial, o level, nielit" /></div>

            {/* Auto-deploy toggle */}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: autoDeploy ? 'rgba(16,185,129,0.08)' : T.card2, border: `1px solid ${autoDeploy ? T.green + '44' : T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
              onClick={() => setAutoDeploy(v => !v)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: T.text, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <FiUploadCloud size={14} style={{ color: autoDeploy ? T.green : T.muted }} />
                  Save karte hi Static Deploy karo
                </div>
                <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 3 }}>
                  {autoDeploy ? '✅ GitHub Actions trigger hoga — ~3 min mein page live' : '⏸️ Manual deploy karni hogi baad mein'}
                </div>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 999, background: autoDeploy ? T.green : T.border2, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: autoDeploy ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.btn} onClick={handleSave}><FiSave size={14} /> Save{autoDeploy ? ' & Deploy' : ''}</button>
              <button style={S.btnGhost} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {delRow && <ConfirmDelete label={delRow.title} onConfirm={handleDelete} onCancel={() => setDelRow(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: ANNOUNCEMENT MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function AnnouncementManager() {
  const { announcement, loading } = useAnnouncement()
  const [form, setForm] = useState({ message: '', type: 'info', link: '', linkText: '' })
  const [msg, setMsg]   = useState('')

  useEffect(() => {
    if (announcement) setForm({ message: announcement.message || '', type: announcement.type || 'info', link: announcement.link || '', linkText: announcement.linkText || '' })
  }, [announcement])

  const flash = text => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const handleSave = async () => {
    if (!form.message.trim()) { flash('❌ Message is required'); return }
    try { await saveAnnouncement(form); flash('✅ Announcement saved!') }
    catch (e) { flash('❌ Error: ' + e.message) }
  }
  const handleDelete = async () => {
    try { await deleteAnnouncement(); setForm({ message: '', type: 'info', link: '', linkText: '' }); flash('✅ Announcement cleared!') }
    catch (e) { flash('❌ Error: ' + e.message) }
  }

  const typeColors = { info: T.blue, warning: T.yellow, success: T.green, danger: T.red }

  return (
    <div style={{ maxWidth: 640 }}>
      <Msg text={msg} />
      {/* Live preview */}
      {announcement && (
        <div style={{ marginBottom: 20, padding: '12px 18px', borderRadius: 10, border: `1px solid ${typeColors[announcement.type || 'info']}44`, background: typeColors[announcement.type || 'info'] + '12', color: T.text, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiBell size={16} style={{ color: typeColors[announcement.type || 'info'], flexShrink: 0 }} />
          <span><strong>Live:</strong> {announcement.message}</span>
          <Badge color={T.green}>Active</Badge>
        </div>
      )}
      <div style={{ ...S.card }}>
        <h3 style={{ color: T.text, marginBottom: 18, fontWeight: 700, fontSize: '0.95rem' }}>📢 Manage Site Announcement</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><FL>Announcement Message *</FL><textarea style={S.textarea} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="e.g. New M2-R5 Mock Tests are now available! 🎉" /></div>
          <div>
            <FL>Type</FL>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['info', 'success', 'warning', 'danger'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))} style={{ ...S.btnGhost, color: form.type === t ? typeColors[t] : T.muted, borderColor: form.type === t ? typeColors[t] : T.border2, background: form.type === t ? typeColors[t] + '15' : 'transparent', textTransform: 'capitalize' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><FL>CTA Link (optional)</FL><input style={S.input} value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="/tests" /></div>
            <div><FL>CTA Button Text</FL><input style={S.input} value={form.linkText} onChange={e => setForm(p => ({ ...p, linkText: e.target.value }))} placeholder="Take Test" /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={S.btn} onClick={handleSave}><FiSave size={14} /> Save Announcement</button>
            {announcement && <button style={S.btnRed} onClick={handleDelete}><FiTrash2 size={14} /> Remove</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: DASHBOARD (stats overview)
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ onNavigate }) {
  const { items: tests }    = useAdminCrud('Tests')
  const { items: theory }   = useAdminCrud('TheoryContent')
  const { items: pdfs }     = useAdminCrud('Notifications')
  const { items: projects } = useAdminCrud('Projects')
  const { items: slides }   = useAdminCrud('Slider')
  const { blogs }           = useBlogManagement()
  const { announcement }    = useAnnouncement()
  const [visitors, setVisitors] = useState(null)

  useEffect(() => {
    const r = ref(db, 'stats/visitorCount')
    const unsub = onValue(r, snap => { if (typeof snap.val() === 'number') setVisitors(snap.val()) })
    return () => unsub()
  }, [])

  const stats = [
    { icon: <FiClipboard size={20} />, label: 'Tests',       value: tests.length,    color: T.blue,   tab: 'tests' },
    { icon: <FiBookOpen  size={20} />, label: 'Theory Topics',value: theory.length,   color: T.purple, tab: 'theory' },
    { icon: <FiFileText  size={20} />, label: 'PDFs / Notes', value: pdfs.length,     color: T.green,  tab: 'pdfs' },
    { icon: <FiCode      size={20} />, label: 'Projects',     value: projects.length, color: T.yellow, tab: 'projects' },
    { icon: <FiImage     size={20} />, label: 'Slides',       value: slides.length,   color: T.pink,   tab: 'slider' },
    { icon: <FiLayers    size={20} />, label: 'Blogs',        value: blogs.length,    color: T.accent, tab: 'blogs' },
    { icon: <FiUsers     size={20} />, label: 'Total Visitors',value: visitors,       color: T.green,  tab: null },
    { icon: <FiBell      size={20} />, label: 'Announcement', value: announcement ? '🟢 Active' : '⭕ None', color: T.yellow, tab: 'announcement' },
  ]

  return (
    <div>
      <h2 style={{ color: T.text, marginBottom: 6, fontWeight: 800, fontSize: '1.1rem' }}>📊 Overview</h2>
      <p style={{ color: T.muted, marginBottom: 24, fontSize: '0.85rem' }}>All data fetched live from Firebase Realtime Database.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => s.tab && onNavigate(s.tab)}
            style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: s.tab ? 'pointer' : 'default', transition: 'border-color 0.2s' }}
            onMouseEnter={e => { if (s.tab) e.currentTarget.style.borderColor = s.color }}
            onMouseLeave={e => { if (s.tab) e.currentTarget.style.borderColor = T.border }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: T.text }}>{s.value ?? <span style={{ opacity: 0.4, fontSize: '1rem' }}>…</span>}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, padding: '16px 20px', borderRadius: 10, background: T.card2, border: `1px solid ${T.border}`, fontSize: '0.82rem', color: T.muted, lineHeight: 1.7 }}>
        <strong style={{ color: T.text }}>Quick Tips:</strong>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
          <li>Click any stat card above to jump to that section</li>
          <li>All changes are <strong style={{ color: T.green }}>live instantly</strong> — no deployment needed</li>
          <li>Tests: Use <code style={{ background: T.card, padding: '1px 6px', borderRadius: 4 }}>questionsJson</code> field for MCQ data as JSON array</li>
          <li>PDFs: Leave URL blank or set <code style={{ background: T.card, padding: '1px 6px', borderRadius: 4 }}>hidden: true</code> to draft</li>
        </ul>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN AdminPanel — Login + Tab Navigation
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'dashboard',    label: '📊 Dashboard',    icon: <FiGrid size={15} /> },
  { id: 'tests',        label: '📋 Tests',        icon: <FiClipboard size={15} /> },
  { id: 'theory',       label: '📚 Theory',       icon: <FiBookOpen size={15} /> },
  { id: 'pdfs',         label: '📄 PDFs/Notes',   icon: <FiFileText size={15} /> },
  { id: 'projects',     label: '💻 Projects',     icon: <FiCode size={15} /> },
  { id: 'slider',       label: '🖼️ Slider',       icon: <FiImage size={15} /> },
  { id: 'blogs',        label: '✍️ Blogs',        icon: <FiLayers size={15} /> },
  { id: 'announcement', label: '📢 Announcement', icon: <FiBell size={15} /> },
]

export default function AdminPanel() {
  const [authed, setAuthed]     = useState(() => localStorage.getItem('admin_auth') === '1')
  const [pw, setPw]             = useState('')
  const [pwErr, setPwErr]       = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebar] = useState(true)

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) { localStorage.setItem('admin_auth', '1'); setAuthed(true); setPwErr('') }
    else { setPwErr('Incorrect password. Please try again.') }
  }
  const handleLogout = () => { localStorage.removeItem('admin_auth'); setAuthed(false); setPw('') }

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 20, padding: 36, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: T.accent + '20', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <FiDatabase size={26} style={{ color: T.accent }} />
            </div>
            <h1 style={{ color: T.text, fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>O Level Sarathi</h1>
            <p style={{ color: T.muted, fontSize: '0.85rem', marginTop: 4 }}>Admin Control Panel</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <FL>Admin Password</FL>
              <input
                type="password"
                style={S.input}
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password..."
                autoFocus
              />
            </div>
            {pwErr && <div style={{ color: T.red, fontSize: '0.82rem', fontWeight: 600 }}>{pwErr}</div>}
            <button style={{ ...S.btn, width: '100%', justifyContent: 'center', padding: '11px 18px', fontSize: '0.9rem' }} onClick={handleLogin}>
              <FiCheck size={15} /> Login to Admin
            </button>
          </div>
          <p style={{ color: T.muted, fontSize: '0.72rem', textAlign: 'center', marginTop: 20 }}>
            Authorized access only. All actions are logged.
          </p>
        </div>
      </div>
    )
  }

  // ── Admin Layout ──────────────────────────────────────────────────────────
  const activeTabObj = TABS.find(t => t.id === activeTab) || TABS[0]

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSidebar(v => !v)} style={{ ...S.btnGhost, padding: '7px 9px', borderRadius: 8 }}>
            <FiList size={16} />
          </button>
          <span style={{ color: T.accent, fontWeight: 900, fontSize: '1rem' }}>⚡ Admin Panel</span>
          <span style={{ color: T.muted, fontSize: '0.8rem', display: 'none' }}>|</span>
          <span style={{ color: T.muted, fontSize: '0.82rem' }}>{activeTabObj.label}</span>
        </div>
        <button onClick={handleLogout} style={{ ...S.btnGhost, color: T.red, borderColor: T.red + '44' }}>
          <FiLogOut size={14} /> Logout
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width: 220, background: T.card, borderRight: `1px solid ${T.border}`, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, overflowY: 'auto' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                  background: activeTab === tab.id ? T.accent + '20' : 'transparent',
                  border: `1px solid ${activeTab === tab.id ? T.accent + '44' : 'transparent'}`,
                  color: activeTab === tab.id ? T.accent2 : T.muted,
                  fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.86rem',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 9,
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {activeTab === 'dashboard'    && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'tests'        && <TestsManager />}
            {activeTab === 'theory'       && <TheoryManager />}
            {activeTab === 'pdfs'         && <PDFsManager />}
            {activeTab === 'projects'     && <ProjectsManager />}
            {activeTab === 'slider'       && <SliderManager />}
            {activeTab === 'blogs'        && <BlogsManager />}
            {activeTab === 'announcement' && <AnnouncementManager />}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
