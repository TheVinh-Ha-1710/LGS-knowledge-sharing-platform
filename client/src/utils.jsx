// client/src/utils.js
// Shared utility functions used across components
import { Link } from 'react-router-dom'

export function getFieldAccent(fieldSlug) {
  const map = {
    'technology':     'var(--field-technology)',
    'health-medicine':'var(--field-health)',
    'law-policy':     'var(--field-law)',
    'business':       'var(--field-business)',
    'science':        'var(--field-science)',
    'general':        'var(--field-general)',
  }
  return map[fieldSlug] || 'var(--accent)'
}

export function DifficultyBadge({ difficulty }) {
  return (
    <span className={`badge badge-${difficulty}`}>
      {difficulty}
    </span>
  )
}

export function MaterialCard({ material, onClick }) {
  const accent = getFieldAccent(material.field_slug)

  return (
    <div
      className="material-card"
      style={{ '--card-accent': accent }}
      onClick={onClick}
    >
      <div className="card-field">
        <span>{material.field_icon}</span>
        <span>{material.field_name}</span>
      </div>
      <div className="card-title">{material.title}</div>
      <div className="card-meta">
        <DifficultyBadge difficulty={material.difficulty} />
        <Link
          to={`/profile/${material.author_email?.split('@')[0]}`}
          onClick={e => e.stopPropagation()}  // prevent card click navigating to material
          style={{ color: 'var(--text-3)', textDecoration: 'none' }}
        >
          {material.author_email?.split('@')[0]}
        </Link>
      </div>
    </div>
  )
}
