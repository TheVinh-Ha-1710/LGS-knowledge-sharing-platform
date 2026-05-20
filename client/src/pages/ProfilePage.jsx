import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { MaterialCard, DifficultyBadge } from '../utils.jsx'

function ProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const loggedInUsername = user?.email?.split('@')[0]
  const isOwnProfile = !username

  // ALL hooks must be declared before any conditional returns
  // This follows the Rules of Hooks — no hooks after early returns

  // Fetch own full profile — enabled when viewing own profile OR when
  // the username matches the logged-in user (so data is ready before redirect)
  const { data: ownProfile, isLoading: ownLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: api.getMyProfile,
    enabled: isOwnProfile || username === loggedInUsername
  })

  // Fetch public profile — only when viewing someone else's profile
  const { data: publicProfile, isLoading: publicLoading, error: publicError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.getUserProfile(username),
    enabled: !isOwnProfile && username !== loggedInUsername
  })

  // Safe to do conditional returns now — all hooks already called above
  // If the username in the URL matches the logged-in user, redirect to full profile
  if (username && username === loggedInUsername) {
    return <Navigate to="/profile" replace />
  }

  const isLoading = isOwnProfile ? ownLoading : publicLoading
  const profile = isOwnProfile ? ownProfile : publicProfile

  if (isLoading) return (
    <div className="app-page">
      <div className="empty-state">// loading profile...</div>
    </div>
  )

  if (publicError) return (
    <div className="app-page">
      <div className="empty-state">// user not found</div>
    </div>
  )

  // Display name — own profile uses email prefix, public uses username field
  const displayName = isOwnProfile
    ? profile?.user?.email?.split('@')[0]
    : profile?.user?.username

  return (
    <div className="app-page" style={{ maxWidth: 740 }}>

      {/* Back button — only on public profiles */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', padding: 0, marginBottom: 28, letterSpacing: '0.08em' }}
        >
          ← back
        </button>
      )}

      {/* Profile header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
          // profile
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {displayName}
        </h1>

        {/* Show email only on own profile */}
        {isOwnProfile && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
            {profile?.user?.email}
          </p>
        )}

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
          member since {new Date(profile?.user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="stats-row" style={{ marginBottom: 36 }}>
        <div className="stat-card">
          <div className="stat-label">Authored</div>
          <div className="stat-value">{profile?.stats?.materials_authored || 0}</div>
        </div>

        {/* Read and completed — own profile only */}
        {isOwnProfile && (
          <>
            <div className="stat-card">
              <div className="stat-label">Read</div>
              <div className="stat-value">{profile?.stats?.materials_read || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{profile?.stats?.materials_completed || 0}</div>
            </div>
          </>
        )}

        <div className="stat-card">
          <div className="stat-label">Reactions received</div>
          <div className="stat-value">{profile?.stats?.reactions_received || 0}</div>
        </div>

        {/* Fields explored — own profile only */}
        {isOwnProfile && (
          <div className="stat-card">
            <div className="stat-label">Fields explored</div>
            <div className="stat-value">{profile?.stats?.fields_explored || 0}</div>
          </div>
        )}
      </div>

      {/* Materials authored */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">
            {isOwnProfile ? 'My materials' : `Materials by ${displayName}`}
          </span>
        </div>

        {profile?.materials?.length > 0 ? (
          <div className="materials-grid">
            {profile.materials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onClick={() => navigate(`/materials/${material.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {isOwnProfile
              ? "// you haven't published anything yet — share something!"
              : `// ${displayName} hasn't published anything yet`
            }
          </div>
        )}
      </div>

      {/* Reading history — own profile only */}
      {isOwnProfile && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Reading history</span>
          </div>

          {profile?.reads?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profile.reads.map(read => (
                <Link
                  key={read.id}
                  to={`/materials/${read.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'border-color 0.15s'
                  }}>
                    {/* Completion status */}
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: read.completed ? 'var(--green)' : 'var(--accent)',
                      flexShrink: 0
                    }}>
                      {read.completed ? '✓' : '📖'}
                    </span>

                    {/* Field icon */}
                    <span style={{ fontSize: 16, flexShrink: 0 }}>
                      {read.field_icon}
                    </span>

                    {/* Title and field */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {read.title}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                        {read.field_name}
                      </div>
                    </div>

                    {/* Difficulty badge */}
                    <DifficultyBadge difficulty={read.difficulty} />

                    {/* Status label */}
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: read.completed ? 'var(--green)' : 'var(--text-3)',
                      flexShrink: 0
                    }}>
                      {read.completed ? 'completed' : 'reading'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              // no reading history yet — start exploring!
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default ProfilePage