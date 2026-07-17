import { Link, useLocation } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  if (pathnames.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
        <FiHome size={16} />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')

        return (
          <div key={to} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiChevronRight size={14} />
            {last ? (
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{label}</span>
            ) : (
              <Link to={to} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
