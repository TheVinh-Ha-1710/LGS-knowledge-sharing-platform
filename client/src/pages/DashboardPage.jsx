import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { MaterialCard } from '../utils.jsx'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: api.getMaterials
  })

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const totalMaterials = materials?.length || 0
  const uniqueAuthors = materials
    ? new Set(materials.map(m => m.author_email)).size
    : 0
  const uniqueFields = materials
    ? new Set(materials.map(m => m.field_slug).filter(Boolean)).size
    : 0

  return (
    <div className="app-page">

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
          // welcome back
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>
          {user?.email?.split('@')[0]}
        </h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/explore')}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
          >
            Explore
          </button>
          <button
            onClick={() => navigate('/editor')}
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '10px 24px' }}
          >
            + Share knowledge
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Materials</div>
          <div className="stat-value">{totalMaterials}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Contributors</div>
          <div className="stat-value">{uniqueAuthors}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Fields covered</div>
          <div className="stat-value">{uniqueFields}</div>
        </div>
      </div>

      {/* Recently added */}
      <div className="section-header">
        <span className="section-title">Recently added</span>
        <Link
          to="/explore"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}
        >
          View all →
        </Link>
      </div>

      <div className="materials-grid">
        {materials?.slice(0, 6).map(material => (
          <MaterialCard
            key={material.id}
            material={material}
            onClick={() => navigate(`/materials/${material.slug}`)}
          />
        ))}
      </div>

      {materials?.length === 0 && (
        <div className="empty-state">
          // no materials yet — be the first to share something!
        </div>
      )}

      <button
        onClick={handleLogout}
        className="btn btn-danger"
        style={{ marginTop: 48, width: 'auto', padding: '10px 24px' }}
      >
        → Sign out
      </button>

    </div>
  )
}

export default DashboardPage
