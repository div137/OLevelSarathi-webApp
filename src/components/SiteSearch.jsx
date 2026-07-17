import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiX } from 'react-icons/fi'

const PAGES = [
  { title: 'O Level Mock Tests', path: '/tests', keywords: 'mcq test exam practice m1 m2 m3 m4 ccc' },
  { title: 'Theory Notes', path: '/theory', keywords: 'notes syllabus chapter theory hindi english' },
  { title: 'PDF Study Material', path: '/pdfs', keywords: 'pdf download notes papers' },
  { title: 'Practical Projects', path: '/projects', keywords: 'practical project assignment lab' },
  { title: 'Blog & Updates', path: '/blog', keywords: 'news tips updates nielit' },
  { title: 'FAQ - O Level Questions', path: '/faq', keywords: 'faq registration fees exam date syllabus' },
  { title: 'About O Level Sarathi', path: '/about', keywords: 'about mission team' },
  { title: 'Contact Us', path: '/contact', keywords: 'email phone support help' },
  { title: 'M1-R5 IT Tools', path: '/theory?category=M1-R5', keywords: 'it tools libreoffice windows network' },
  { title: 'M2-R5 Web Designing', path: '/theory?category=M2-R5', keywords: 'html css javascript web angular' },
  { title: 'M3-R5 Python', path: '/theory?category=M3-R5', keywords: 'python programming loops functions' },
  { title: 'M4-R5 IoT', path: '/theory?category=M4-R5', keywords: 'iot arduino sensors internet things' },
]

export default function SiteSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PAGES.slice(0, 8)
    return PAGES.filter((p) => `${p.title} ${p.keywords}`.toLowerCase().includes(q)).slice(0, 10)
  }, [query])

  const go = (path) => {
    navigate(path)
    setQuery('')
    onClose()
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', padding: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 100 }}
      onClick={onClose}
    >
      <div className="card" style={{ width: '100%', maxWidth: 560, padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <FiSearch color="var(--accent)" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests, notes, Python, M1-R5..."
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', minHeight: 44 }}
          />
          <button type="button" onClick={onClose} aria-label="Close search" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', minWidth: 44, minHeight: 44 }}>
            <FiX size={22} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: 12 }}>Koi result nahi mila. Alag keyword try karein.</p>
          ) : results.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => go(item.path)}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                minHeight: 44,
                fontWeight: 600,
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
