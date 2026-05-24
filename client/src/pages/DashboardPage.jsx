import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { MaterialCard } from '../utils.jsx'

function DashboardPage() {
  const { user, logout, streak } = useAuth()
  const navigate = useNavigate()

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: api.getMaterials
  })

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard
  })

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: api.getTrending
  })

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const totalMaterials = materials?.length || 0
  const uniqueAuthors = materials ? new Set(materials.map(m => m.author_email)).size : 0
  const uniqueFields = materials ? new Set(materials.map(m => m.field_slug).filter(Boolean)).size : 0

  return (
    <div className="app-page">

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="page-eyebrow">// welcome back</div>
        <h1 className="page-title" style={{ marginBottom: 12 }}>
          {user?.email?.split('@')[0]}
        </h1>

        {/* Streak banner */}
        {streak > 0 && (
          <div className="streak-badge" style={{ marginBottom: 20 }}>
            🔥 {streak} day streak — keep it going!
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/explore')}
            className="btn btn-primary"
          >
            Explore
          </button>
          <button
            onClick={() => navigate('/editor')}
            className="btn btn-ghost"
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
        <div className="stat-card">
          <div className="stat-label">🔥 Your streak</div>
          <div className="stat-value accent">{streak} days</div>
        </div>
      </div>

      {/* Two column — trending + leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>

        {/* Trending */}
        <div>
          <div className="section-header">
            <span className="section-title">🔥 Trending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {trending?.length > 0 ? trending.map((material, index) => (
              <Link
                key={material.id}
                to={`/materials/${material.slug}`}
                className="list-item"
              >
                <span className={`list-item-rank ${index === 0 ? 'first' : ''}`}>
                  {index + 1}
                </span>
                <div className="list-item-body">
                  <div className="list-item-field">
                    {material.field_icon} {material.field_name}
                  </div>
                  <div className="list-item-title">{material.title}</div>
                </div>
                <span className="list-item-meta">{material.view_count} views</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard?.length > 0 ? leaderboard.map((contributor, index) => (
              <Link
                key={contributor.email}
                to={`/profile/${contributor.email?.split('@')[0]}`}
                className="list-item"
              >
                <span className={`list-item-rank ${index === 0 ? 'first' : ''}`}>
                  {index + 1}
                </span>
                <div className="list-item-body">
                  <div className="list-item-title">
                    {contributor.email?.split('@')[0]}
                    {contributor.email === user?.email && (
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'var(--accent)',
                        marginLeft: 6,
                        padding: '1px 6px',
                        background: 'var(--accent-dim)',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        you
                      </span>
                    )}
                  </div>
                </div>
                <span className="list-item-pill">
                  {contributor.material_count} {parseInt(contributor.material_count) === 1 ? 'material' : 'materials'}
                </span>
              </Link>
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
        <Link to="/explore" className="section-link">View all →</Link>
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

    </div>
  )
}

export default DashboardPage
