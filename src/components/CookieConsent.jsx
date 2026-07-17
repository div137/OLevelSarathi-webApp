import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cookie_consent_v1'

export function getCookieConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'accepted'
  } catch {
    return false
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'accepted') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      /* ignore */
    }
    setVisible(false)
    window.dispatchEvent(new Event('cookie-consent-accepted'))
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        padding: '16px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ flex: '1 1 280px', margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Ham cookies use karte hain taaki aapka experience better ho aur analytics/ads sahi kaam karein.
          {' '}<Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link> padhein.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={() => setVisible(false)} style={{ minHeight: 44, minWidth: 44 }}>
            Baad mein
          </button>
          <button type="button" className="btn btn-primary" onClick={accept} style={{ minHeight: 44, padding: '0 24px' }}>
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  )
}
