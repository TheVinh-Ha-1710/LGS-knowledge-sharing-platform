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

  const { data: ownProfile, isLoading: ownLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: api.getMyProfile,
    enabled: isOwnProfile || username === loggedInUsername
  })

  const { data: publicProfile, isLoading: publicLoading, error: publicError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.getUserProfile(username),
    enabled: !isOwnProfile && username !== loggedInUsername
  })

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

  const displayName = isOwnProfile
    ? profile?.user?.email?.split('@')[0]
    : profile?.user?.username

  // Generate initials for avatar
  const initials = displayName?.slice(0, 2).toUpperCase() || '??'

  const currentStreak = profile?.stats?.current_streak || 0
  const longestStreak = profile?.stats?.longest_streak || 0

  return (
    <div className="app-page-wide">

      {/* Back button — public profiles only */}
      {!isOwnProfile && (
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← back
        </button>
      )}

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
        <div className="avatar">{initials}</div>
        <div>
          <div className="page-eyebrow">// profile</div>
          <h1 className="page-title-sm">{displayName}</h1>
          {isOwnProfile && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 4 }}>
              {profile?.user?.email}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 10 }}>
            member since {new Date(profile?.user?.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long'
            })}
          </div>
          {isOwnProfile && currentStreak > 0 && (
            <div className="streak-badge">
              🔥 {currentStreak} day streak
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Authored</div>
          <div className="stat-value">{profile?.stats?.materials_authored || 0}</div>
        </div>
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
        {isOwnProfile && (
          <>
            <div className="stat-card">
              <div className="stat-label">Fields explored</div>
              <div className="stat-value">{profile?.stats?.fields_explored || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🔥 Current streak</div>
              <div className="stat-value accent">{currentStreak} days</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Best streak</div>
              <div className="stat-value">{longestStreak} days</div>
            </div>
          </>
        )}
      </div>

      {/* Materials */}
      <div style={{ marginBottom: 36 }}>
        <div className="section-header" style={{ marginBottom: 14 }}>
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
          <div className="section-header" style={{ marginBottom: 14 }}>
            <span className="section-title">Reading history</span>
          </div>
          {profile?.reads?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profile.reads.map(read => (
                <Link
                  key={read.id}
                  to={`/materials/${read.slug}`}
                  className="read-history-item"
                >
                  <span className="read-history-status">
                    {read.completed ? '✓' : '📖'}
                  </span>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{read.field_icon}</span>
                  <div className="read-history-body">
                    <div className="read-history-title">{read.title}</div>
                    <div className="read-history-field">{read.field_name}</div>
                  </div>
                  <DifficultyBadge difficulty={read.difficulty} />
                  <span className={`read-history-label ${read.completed ? 'completed' : 'reading'}`}>
                    {read.completed ? 'completed' : 'reading'}
                  </span>
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

      {/* Notes — own profile only */}
      {isOwnProfile && profile?.notes?.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-header" style={{ marginBottom: 14 }}>
            <span className="section-title">My notes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.notes.map(note => (
              <Link
                key={note.id}
                to={`/materials/${note.slug}`}
                className="read-history-item"
              >
                <span style={{ fontSize: 16 }}>{note.field_icon}</span>
                <div className="read-history-body">
                  <div className="read-history-title">{note.title}</div>
                  <div className="read-history-field" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 300
                  }}>
                    {note.content}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default ProfilePage
