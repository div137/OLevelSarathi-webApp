import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiYoutube, FiMessageCircle, FiFacebook, FiSend, FiGlobe, FiUsers } from 'react-icons/fi'
import Logo from './Logo'
import useVisitorCount from '../hooks/useVisitorCount'

export default function Footer() {
  const visitorCount = useVisitorCount()
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-card)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Gradient Border */}
      <div style={{ height: 4, width: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent2), var(--accent))', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '60px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40,
      }}>
        {/* Brand Column */}
        <div className="fade-up stagger-1">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, textDecoration: 'none' }}>
            <Logo alt="O Level Sarathi Logo - NIELIT Exam Preparation" />
            <span style={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1 }}>
              O Level<br /><span className="gradient-text" style={{ fontSize: '0.9rem' }}>Sarathi</span>
            </span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
            Your complete companion for O-Level & A-Level excellence with comprehensive study materials, practice tests, and learning resources.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: <FiYoutube size={18} />, href: 'https://www.youtube.com/@olevelsarathi', label: 'YouTube', color: '#ff0000' },
              { icon: <FiInstagram size={18} />, href: 'https://www.instagram.com/o_level_sarathi/', label: 'Instagram', color: '#e1306c' },
              { icon: <FiMessageCircle size={18} />, href: 'https://whatsapp.com/channel/0029VbBpxC90gcfRjuJ6Dc0Z', label: 'WhatsApp', color: '#25d366' },
              { icon: <FiSend size={18} />, href: 'https://t.me/olevelsarathi', label: 'Telegram', color: '#2ca5e0' },
              { icon: <FiFacebook size={18} />, href: 'https://www.facebook.com/er.divsir?mibextid=rS40aB7S9Ucbxw6v', label: 'Facebook', color: '#1877f2' },
              { icon: <FiGlobe size={18} />, href: 'https://olevelsarathi.in/', label: 'Website', color: 'var(--accent)' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.label}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--bg-card2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = social.color
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = social.color
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-card2)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="fade-up stagger-2">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['/tests', 'O Level Mock Tests'],
              ['/pdfs', 'Download PDF Material'],
              ['/projects', 'Practical Projects'],
              ['/blog', 'Latest Exam Updates'],
              ['/faq', 'FAQ - Common Questions'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'inline-block', textDecoration: 'none' }}
                  onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.transform = 'translateX(4px)' }}
                  onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateX(0)' }}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Support & Legal */}
        <div className="fade-up stagger-3">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Support</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['/about', 'About Us'],
              ['/contact', 'Contact Us'],
              ['/privacy', 'Privacy Policy'],
              ['/terms', 'Terms & Conditions']
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'inline-block', textDecoration: 'none' }}
                  onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.transform = 'translateX(4px)' }}
                  onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateX(0)' }}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="fade-up stagger-3">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Contact Us</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <li style={{ display: 'flex', gap: 10, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
              <FiMail style={{ color: 'var(--accent)', marginTop: 4 }} />
              <a href="mailto:er.divsir@gmail.com" style={{ transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>er.divsir@gmail.com</a>
            </li>
            <li style={{ display: 'flex', gap: 10, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
              <FiPhone style={{ color: 'var(--accent)', marginTop: 4 }} />
              <a href="tel:+919532595992" style={{ transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--accent)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>+91 9532595992</a>
            </li>
            <li style={{ display: 'flex', gap: 10, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
              <FiMapPin style={{ color: 'var(--accent)', marginTop: 4 }} />
              <span>India</span>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div className="fade-up stagger-4">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Follow Us</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
            {[
              { icon: <FiYoutube size={15} />, label: 'YouTube', href: 'https://www.youtube.com/@olevelsarathi', color: '#ff0000' },
              { icon: <FiInstagram size={15} />, label: 'Instagram', href: 'https://www.instagram.com/o_level_sarathi/', color: '#e1306c' },
              { icon: <FiMessageCircle size={15} />, label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029VbBpxC90gcfRjuJ6Dc0Z', color: '#25d366' },
              { icon: <FiSend size={15} />, label: 'Telegram', href: 'https://t.me/olevelsarathi', color: '#2ca5e0' },
              { icon: <FiFacebook size={15} />, label: 'Facebook', href: 'https://www.facebook.com/er.divsir?mibextid=rS40aB7S9Ucbxw6v', color: '#1877f2' },
              { icon: <FiGlobe size={15} />, label: 'olevelsarathi.in', href: 'https://olevelsarathi.in/', color: 'var(--accent)' },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = item.color }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--bg-card2)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: item.color,
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: '0.88rem' }}>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="fade-up stagger-4">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Our Products</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                name: 'TypingX',
                desc: 'Typing Learning Website',
                url: 'https://typingx.web.app/',
                emoji: '⌨️',
              },
            ].map((product) => (
              <li key={product.name}>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    textDecoration: 'none', color: 'var(--text-secondary)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'var(--accent-glow)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}>
                    {product.emoji}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: 2 }}>
                      {product.desc}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="fade-up stagger-4">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Download App</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
            Get the best learning experience on your mobile device.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="https://github.com/div137/application-olevel/raw/main/sarathi_5_0_0.apk" className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--bg-card2)' }}>
              <svg viewBox="0 0 512 512" width="24" height="24"><path fill="#4caf50" d="M49 97c-5 13-8 29-8 47v224c0 18 3 34 8 47L228 256z"/><path fill="#ffc107" d="M344 324l-116-68 116-68 83 48c26 15 26 25 0 40z"/><path fill="#f44336" d="M49 97L228 256 344 188 286 155c-27-15-70-13-102 5z"/><path fill="#2196f3" d="M49 415l135-121 160 93-58-33c-27-15-70-13-102 5z"/></svg>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Get it on</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.1 }}>Google Play</div>
              </div>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('App Store version is not available yet.'); }} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--bg-card2)' }}>
              <svg viewBox="0 0 384 512" width="24" height="24"><path fill="var(--text-primary)" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Download on the</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.1 }}>App Store</div>
              </div>
            </a>
          </div>
        </div>

        {/* Visitor Counter — Download App ke right me */}
        <div className="fade-up stagger-4">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: '1.1rem' }}>Website Visitors</h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-card2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FiUsers size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                Total Visitors
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>
                {visitorCount !== null ? visitorCount.toLocaleString('en-IN') : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
        <p>© {new Date().getFullYear()} O Level Sarathi. All rights reserved.</p>
        <p style={{ marginTop: 6 }}>
          Developed by <strong>ABCDarian Edutech</strong> | Credit: <strong>Bibhu Edutech</strong>
        </p>
        <div style={{ marginTop: 12 }}>
          <a
            href="/admin-olevelsarathi-2026"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.75rem', color: 'var(--text-muted)',
              textDecoration: 'none', padding: '5px 14px',
              border: '1px solid var(--border)', borderRadius: 999,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            🔐 Admin Panel
          </a>
        </div>
      </div>
    </footer>
  )
}
