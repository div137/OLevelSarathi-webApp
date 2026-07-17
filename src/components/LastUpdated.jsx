import { FiCalendar } from 'react-icons/fi'

export default function LastUpdated({ date = 'June 2026' }) {
  return (
    <p style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
      <FiCalendar size={14} />
      Last Updated: <strong style={{ color: 'var(--text-secondary)' }}>{date}</strong>
    </p>
  )
}
