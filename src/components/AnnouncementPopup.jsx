import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { useAnnouncement } from '../hooks/useAnnouncement'
import { useLocation } from 'react-router-dom'

export default function AnnouncementPopup() {
  const { announcement, loading } = useAnnouncement()
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    // Sirf home page par dikhao
    if (pathname !== '/') return
    if (!announcement) return

    // Har refresh pe dikhao — sessionStorage clear hoti hai on refresh
    // performance.navigation.type === 1 means page was refreshed
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [announcement, pathname])

  const handleClose = () => {
    setVisible(false)
  }

  if (loading || !visible || !announcement) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.25s ease',
        }}
      />

      {/* Popup Box */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '92%',
        maxWidth: 480,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        animation: 'popupIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)',
            border: 'none', color: '#fff',
            cursor: 'pointer', zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        {/* Image */}
        {announcement.imageUrl && (
          announcement.linkUrl ? (
            <a href={announcement.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
              <img
                src={announcement.imageUrl}
                alt="Announcement"
                style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
              />
            </a>
          ) : (
            <img
              src={announcement.imageUrl}
              alt="Announcement"
              style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
            />
          )
        )}

        {/* Content */}
        {announcement.content && (
          <div style={{ padding: '18px 20px 22px' }}>
            {announcement.title && (
              <h3 style={{
                fontSize: '1.1rem', fontWeight: 800,
                color: 'var(--text-primary)', marginBottom: 8,
              }}>
                {announcement.title}
              </h3>
            )}
            <p style={{
              fontSize: '0.92rem', color: 'var(--text-secondary)',
              lineHeight: 1.65, whiteSpace: 'pre-wrap',
            }}>
              {announcement.content}
            </p>
            {announcement.linkUrl && (
              <a
                href={announcement.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', marginTop: 14,
                  padding: '8px 20px', borderRadius: 8,
                  background: 'var(--accent)', color: '#fff',
                  fontWeight: 700, fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                {announcement.linkLabel || 'Learn More →'}
              </a>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popupIn {
          from { opacity:0; transform: translate(-50%, -50%) scale(0.85) }
          to   { opacity:1; transform: translate(-50%, -50%) scale(1) }
        }
      `}</style>
    </>
  )
}
