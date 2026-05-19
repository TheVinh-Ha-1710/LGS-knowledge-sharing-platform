import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { MaterialCard } from '../utils.jsx'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Fetch all materials for recently added feed and community stats
  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: api.getMaterials
  })

  // Fetch top 10 contributors
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard
  })

  // Fetch top 5 trending materials from last 7 days
  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: api.getTrending
  })

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  // Community stats derived from materials list
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

      {/* Community stats */}
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

      {/* Two column layout — trending + leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>

        {/* Trending this week */}
        <div>
          <div className="section-header">
            <span className="section-title">🔥 Trending this week</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trending?.length > 0 ? trending.map((material, index) => (
              <Link
                key={material.id}
                to={`/materials/${material.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  transition: 'border-color 0.15s'
                }}>
                  {/* Rank number */}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: index === 0 ? 'var(--accent)' : 'var(--text-3)',
                    minWidth: 20,
                    marginTop: 2,
                    fontWeight: 700
                  }}>
                    {index + 1}
                  </span>
                  <div>
                    {/* Field */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>
                      {material.field_icon} {material.field_name}
                    </div>
                    {/* Title */}
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                      {material.title}
                    </div>
                    {/* View count */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                      {material.view_count} views
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                // no trending materials yet
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="section-header">
            <span className="section-title">🏆 Top contributors</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard?.length > 0 ? leaderboard.map((contributor, index) => (
              <div
                key={contributor.email}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                {/* Rank */}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: index === 0 ? 'var(--accent)' : 'var(--text-3)',
                  minWidth: 20,
                  fontWeight: 700
                }}>
                  {index + 1}
                </span>

                {/* Username */}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1 }}>
                  {contributor.email?.split('@')[0]}
                  {/* Highlight current user */}
                  {contributor.email === user?.email && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--accent)',
                      marginLeft: 6,
                      padding: '1px 6px',
                      background: 'var(--accent-dim)',
                      borderRadius: 3
                    }}>
                      you
                    </span>
                  )}
                </span>

                {/* Material count */}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-2)',
                  background: 'var(--surface-2)',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  {contributor.material_count} {parseInt(contributor.material_count) === 1 ? 'material' : 'materials'}
                </span>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                // no contributors yet
              </div>
            )}
          </div>
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

      {/* Sign out */}
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