import { useEffect, useRef } from 'react'

/**
 * Ad Slots:
 *  SLOT_AUTO      = '4071494566'  → data-ad-format="auto" data-full-width-responsive="true"
 *  SLOT_RELAXED   = '7315504925'  → data-ad-format="autorelaxed"  (in-article / between content)
 */
const CLIENT     = 'ca-pub-7027141927778682'
const SLOT_AUTO    = '4071494566'
const SLOT_RELAXED = '7315504925'

/* Load AdSense script once */
let _scriptLoaded = false
function ensureScript() {
  if (_scriptLoaded || typeof document === 'undefined') return
  if (document.querySelector(`script[src*="${CLIENT}"]`)) { _scriptLoaded = true; return }
  const s = document.createElement('script')
  s.async = true
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`
  s.crossOrigin = 'anonymous'
  document.head.appendChild(s)
  _scriptLoaded = true
}

/* Push one ad unit */
function pushAd() {
  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (e) { /* ignore */ }
}

/* ── Base Ad Component ────────────────────────────────────────────────────── */
function AdUnit({ slot, format, relaxed = false, style: extraStyle = {} }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!import.meta.env.PROD) return   // show placeholder in dev
    ensureScript()

    /* Intersection Observer — load ad only when visible */
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { pushAd(); obs.disconnect() }
        })
      },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [slot])

  /* Dev placeholder */
  if (!import.meta.env.PROD) {
    return (
      <div style={{
        width: '100%', minHeight: 90, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-card2, #1e293b)',
        border: '1px dashed #334155', borderRadius: 8, color: '#64748b',
        fontSize: '0.78rem', fontWeight: 600, margin: '12px 0',
        ...extraStyle,
      }}>
        📢 Ad — visible after deploy
      </div>
    )
  }

  /* Production */
  return (
    <div ref={ref} style={{ width: '100%', overflow: 'hidden', margin: '12px 0', ...extraStyle }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={relaxed ? 'autorelaxed' : format || 'auto'}
        {...(!relaxed && { 'data-full-width-responsive': 'true' })}
      />
    </div>
  )
}

/* ── Named exports used across pages ─────────────────────────────────────── */

/** Top-of-page / between sections — auto responsive */
export function AutoAd(props) {
  return <AdUnit slot={SLOT_AUTO} format="auto" {...props} />
}

/** Between paragraphs / in-article — autorelaxed */
export function RelaxedAd(props) {
  return <AdUnit slot={SLOT_RELAXED} relaxed {...props} />
}

/* Legacy names kept for backward compatibility */
export const HorizontalAd  = (props) => <AutoAd   {...props} />
export const ResponsiveAd  = (props) => <AutoAd   {...props} />
export const InlineAd      = (props) => <RelaxedAd {...props} />

export default AutoAd
