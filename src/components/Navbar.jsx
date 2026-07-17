import { useState, useEffect, useContext, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiSun, FiMoon, FiSearch, FiChevronDown } from 'react-icons/fi'
import { ThemeContext } from '../App'
import Logo from './Logo'
import SiteSearch from './SiteSearch'

const NAV_LINKS = [
  { to: '/',        label: 'Home',     icon: '🏠' },
  { to: '/tests',   label: 'Tests',    icon: '📋' },
  { to: '/pdfs',    label: 'Notes',    icon: '📄' },
  { to: '/projects',label: 'Projects', icon: '💻' },
  { to: '/blog',    label: 'Blog',     icon: '✍️' },
  { to: '/faq',     label: 'FAQ',      icon: '❓' },
]

export default function Navbar() {
  const [open,       setOpen]       = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIdx,  setActiveIdx]  = useState(null)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const location = useLocation()
  const navRef   = useRef(null)

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <style>{`
        /* ── Navbar base ── */
        .nb-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 900;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .nb-root.scrolled {
          box-shadow: 0 4px 32px rgba(0,0,0,0.28);
        }
        .nb-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; height: 66px;
          transition: height 0.3s ease;
        }
        .nb-root.scrolled .nb-inner { height: 58px; }

        /* ── Logo ── */
        .nb-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .nb-logo:hover { transform: scale(1.03); }
        .nb-logo-text { font-weight: 900; font-size: 1.18rem; letter-spacing: -0.03em; line-height: 1.1; color: var(--text-primary); }
        .nb-logo-sub  { font-size: 0.82rem; font-weight: 700; background: linear-gradient(90deg,#4caf50,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* ── Desktop nav links ── */
        .nb-links { display: flex; align-items: center; gap: 2px; list-style: none; margin: 0; padding: 0; }
        .nb-link {
          position: relative;
          padding: 8px 13px; border-radius: 10px;
          font-size: 0.87rem; font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 5px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nb-link:hover { color: var(--text-primary); background: var(--bg-card2); }
        .nb-link.active {
          color: var(--accent);
          background: var(--accent-glow);
          font-weight: 700;
        }
        /* Active underline bar */
        .nb-link.active::after {
          content: '';
          position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 18px; height: 2.5px; border-radius: 2px;
          background: var(--accent);
          animation: nbBarIn 0.25s ease forwards;
        }
        @keyframes nbBarIn {
          from { width: 0; opacity: 0; }
          to   { width: 18px; opacity: 1; }
        }

        /* ── Icon buttons ── */
        .nb-icon-btn {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 1px solid var(--border);
          background: var(--bg-card); color: var(--text-secondary);
          transition: all 0.2s ease; flex-shrink: 0;
        }
        .nb-icon-btn:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-glow); transform: translateY(-1px); }
        .nb-theme-btn { background: var(--accent-glow); color: var(--accent); border-color: var(--accent)33; }
        .nb-theme-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

        /* ── Hamburger ── */
        .nb-ham {
          width: 42px; height: 42px; border-radius: 11px; display: none;
          flex-direction: column; align-items: center; justify-content: center;
          gap: 5px; cursor: pointer; border: 1px solid var(--border);
          background: var(--bg-card); transition: all 0.2s;
        }
        .nb-ham:hover { border-color: var(--accent); background: var(--accent-glow); }
        .nb-ham span {
          display: block; height: 2px; border-radius: 2px;
          background: var(--text-secondary); transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .nb-ham span:nth-child(1) { width: 20px; }
        .nb-ham span:nth-child(2) { width: 14px; }
        .nb-ham span:nth-child(3) { width: 20px; }
        .nb-ham.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); width: 20px; background: var(--accent); }
        .nb-ham.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-ham.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); width: 20px; background: var(--accent); }

        /* ── Mobile drawer ── */
        .nb-drawer {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          z-index: 850; pointer-events: none;
        }
        .nb-drawer-backdrop {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
          opacity: 0; transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .nb-drawer.open .nb-drawer-backdrop { opacity: 1; pointer-events: all; }
        .nb-drawer-panel {
          position: absolute; top: 0; right: 0; bottom: 0;
          width: min(320px, 88vw);
          background: var(--bg-primary);
          border-left: 1px solid var(--border);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          pointer-events: all;
          box-shadow: -8px 0 40px rgba(0,0,0,0.3);
        }
        .nb-drawer.open .nb-drawer-panel { transform: translateX(0); }

        .nb-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; border-bottom: 1px solid var(--border);
        }
        .nb-drawer-body { flex: 1; overflow-y: auto; padding: 12px 14px; }
        .nb-drawer-link {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 16px; border-radius: 12px; margin-bottom: 4px;
          font-weight: 600; font-size: 0.92rem;
          color: var(--text-secondary); text-decoration: none;
          transition: all 0.2s ease; border: 1px solid transparent;
        }
        .nb-drawer-link:hover { background: var(--bg-card2); color: var(--text-primary); border-color: var(--border); }
        .nb-drawer-link.active { background: var(--accent-glow); color: var(--accent); border-color: var(--accent)33; font-weight: 700; }
        .nb-drawer-icon { font-size: 1.1rem; width: 26px; text-align: center; }
        .nb-drawer-footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .nb-links, .nb-search-btn { display: none !important; }
          .nb-ham { display: flex !important; }
        }
        @media (min-width: 901px) {
          .nb-drawer { display: none; }
        }
      `}</style>

      {/* ── Main Navbar ── */}
      <nav ref={navRef} className={`nb-root${scrolled ? ' scrolled' : ''}`} style={{
        background: scrolled
          ? 'rgba(var(--bg-primary-rgb, 10,15,30), 0.92)'
          : 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}>
        <div className="nb-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nb-logo" aria-label="O Level Sarathi Home">
            <Logo priority />
            <div>
              <div className="nb-logo-text">O Level</div>
              <div className="nb-logo-sub">Sarathi ✦</div>
            </div>
          </Link>

          {/* ── Desktop Links ── */}
          <ul className="nb-links">
            {NAV_LINKS.map((l, i) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) => `nb-link${isActive ? ' active' : ''}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Right Actions ── */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Search */}
            <button
              type="button"
              className="nb-icon-btn nb-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              title="Search (Ctrl+K)"
            >
              <FiSearch size={17} />
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              className="nb-icon-btn nb-theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              <span style={{ transition:'transform 0.4s ease', display:'flex', transform: theme==='dark' ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                {theme === 'dark' ? <FiSun size={17}/> : <FiMoon size={17}/>}
              </span>
            </button>

            {/* Hamburger */}
            <button
              type="button"
              className={`nb-ham${open ? ' is-open' : ''}`}
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`nb-drawer${open ? ' open' : ''}`}>
        <div className="nb-drawer-backdrop" onClick={() => setOpen(false)} />
        <div className="nb-drawer-panel">

          {/* Drawer header */}
          <div className="nb-drawer-header">
            <Link to="/" className="nb-logo" onClick={() => setOpen(false)}>
              <Logo />
              <div>
                <div className="nb-logo-text" style={{ fontSize:'1rem' }}>O Level</div>
                <div className="nb-logo-sub" style={{ fontSize:'0.75rem' }}>Sarathi ✦</div>
              </div>
            </Link>
            <button className="nb-icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
              <FiX size={18}/>
            </button>
          </div>

          {/* Search inside drawer */}
          <div style={{ padding:'12px 14px 0' }}>
            <button
              className="nb-icon-btn"
              onClick={() => { setSearchOpen(true); setOpen(false) }}
              style={{ width:'100%', borderRadius:12, height:44, gap:10, fontSize:'0.88rem', color:'var(--text-secondary)', justifyContent:'flex-start', paddingLeft:14 }}
            >
              <FiSearch size={16}/> Search...
            </button>
          </div>

          {/* Nav links */}
          <nav className="nb-drawer-body" aria-label="Mobile navigation">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `nb-drawer-link${isActive ? ' active' : ''}`}
              >
                <span className="nb-drawer-icon">{l.icon}</span>
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Drawer footer */}
          <div className="nb-drawer-footer">
            <button
              className="nb-icon-btn nb-theme-btn"
              onClick={toggleTheme}
              style={{ flex:1, borderRadius:12, height:44, gap:8, fontSize:'0.85rem', color:'var(--accent)' }}
            >
              {theme === 'dark' ? <><FiSun size={16}/> Light Mode</> : <><FiMoon size={16}/> Dark Mode</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Site Search ── */}
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
