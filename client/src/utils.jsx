import { useNavigate, Link } from 'react-router-dom'

// ─── DifficultyBadge ──────────────────────────────────────────
export function DifficultyBadge({ difficulty }) {
  const classes = {
    beginner:     'badge badge-beginner',
    intermediate: 'badge badge-intermediate',
    advanced:     'badge badge-advanced'
  }
  return (
    <span className={classes[difficulty] || 'badge badge-beginner'}>
      {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1) || 'Beginner'}
    </span>
  )
}

// ─── getFieldAccent ───────────────────────────────────────────
export function getFieldAccent(fieldSlug) {
  // All fields use the main accent — consistent teal branding
  return 'var(--accent)'
}

// ─── MaterialCard ─────────────────────────────────────────────
export function MaterialCard({ material, onClick }) {
  return (
    <div className="material-card" onClick={onClick}>
      <div className="material-card-field">
        {material.field_icon} {material.field_name}
      </div>
      <div className="material-card-title">
        {material.title}
      </div>
      <div style={{ marginBottom: 8 }}>
        <DifficultyBadge difficulty={material.difficulty} />
      </div>
      <div className="material-card-meta">
        <Link
          to={`/profile/${material.author_email?.split('@')[0]}`}
          onClick={e => e.stopPropagation()}
          style={{ color: 'var(--text-4)', textDecoration: 'none' }}
        >
          {material.author_email?.split('@')[0]}
        </Link>
        <span>·</span>
        <span>{material.view_count} views</span>
        <span>·</span>
        <span>{new Date(material.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  )
}
