import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiTrendingUp } from 'react-icons/fi'

const KEY = 'sarathi_progress_v1'

export function trackProgress(type, id) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (!raw[type]) raw[type] = {}
    raw[type][id] = { done: true, at: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(raw))
    window.dispatchEvent(new Event('progress-updated'))
  } catch {
    /* ignore */
  }
}

export function getProgressStats() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    const tests = Object.keys(raw.tests || {}).length
    const theory = Object.keys(raw.theory || {}).length
    const pdfs = Object.keys(raw.pdfs || {}).length
    return { tests, theory, pdfs, total: tests + theory + pdfs }
  } catch {
    return { tests: 0, theory: 0, pdfs: 0, total: 0 }
  }
}

export default function ProgressDashboard() {
  const [stats, setStats] = useState(getProgressStats())

  useEffect(() => {
    const refresh = () => setStats(getProgressStats())
    window.addEventListener('progress-updated', refresh)
    return () => window.removeEventListener('progress-updated', refresh)
  }, [])

  if (stats.total === 0) return null

  return (
    <section style={{ padding: '0 24px', maxWidth: 1280, margin: '0 auto 40px' }}>
      <div className="card" style={{ padding: 24, border: '1px solid var(--border)', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiTrendingUp color="var(--accent)" size={22} />
          <strong>Your Progress</strong>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>Tests: <strong>{stats.tests}</strong></span>
          <span>Theory: <strong>{stats.theory}</strong></span>
          <span>PDFs: <strong>{stats.pdfs}</strong></span>
        </div>
        <Link to="/tests" style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Continue Learning →</Link>
      </div>
    </section>
  )
}
