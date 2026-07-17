import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { FiHome, FiSearch, FiBookOpen, FiClipboard } from 'react-icons/fi'

const popular = [
  { to: '/tests',    label: 'O Level Mock Tests', icon: <FiClipboard /> },
  { to: '/pdfs',     label: 'PDF Notes',          icon: <FiBookOpen /> },
  { to: '/projects', label: 'Projects',           icon: <FiSearch /> },
  { to: '/blog',     label: 'Blog',               icon: <FiBookOpen /> },
]

export default function NotFound() {
  return (
    <div className="page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
      <SEO
        title="Page Not Found - 404"
        description="The page you are looking for does not exist on O Level Sarathi. Browse mock tests, theory notes, and NIELIT exam preparation resources."
        canonical="https://olevelsarathi.in/404"
        robots="noindex, follow"
      />
      <div className="card" style={{ maxWidth: 640, width: '100%', padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '16px 0 12px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
          Ye page exist nahi karta. Ho sakta hai URL galat ho ya page move ho gaya ho.
          Neeche se popular sections choose karein ya home par wapas jayein.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, minHeight: 44, textDecoration: 'none' }}>
          <FiHome /> Home Page
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {popular.map((item) => (
            <Link key={item.to} to={item.to} className="card" style={{ padding: 16, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', minHeight: 88 }}>
              <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
