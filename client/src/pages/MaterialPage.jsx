import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { DifficultyBadge } from '../utils.jsx'
import DOMPurify from 'dompurify'
import Reactions from '../components/Reactions'
import ReadStatus from '../components/ReadStatus'
import Notes from '../components/Notes'

function MaterialPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Track view once on mount
  useEffect(() => {
    api.trackView(slug).then(() => {
      queryClient.invalidateQueries({ queryKey: ['material', slug] })
    })
  }, [slug])

  const { data: material, isLoading, error } = useQuery({
    queryKey: ['material', slug],
    queryFn: () => api.getMaterial(slug),
    refetchOnWindowFocus: false
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteMaterial(material.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      navigate('/explore')
    }
  })

  function handleDelete() {
    if (window.confirm('Are you sure you want to delete this material? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) return (
    <div className="app-page">
      <div className="empty-state">// loading...</div>
    </div>
  )

  if (error) return (
    <div className="app-page">
      <div className="empty-state">// material not found</div>
    </div>
  )

  const isAuthor = user && material?.author_id === user.id

  return (
    <div className="app-page-wide">

      {/* Back */}
      <button className="back-btn" onClick={() => navigate('/explore')}>
        ← back to explore
      </button>

      {/* Field + difficulty + views */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>
          {material?.field_icon} {material?.field_name}
        </span>
        <DifficultyBadge difficulty={material?.difficulty} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)' }}>
          // {material?.view_count} views
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: '-0.02em',
        marginBottom: 10,
        lineHeight: 1.25,
        color: 'var(--text)'
      }}>
        {material?.title}
      </h1>

      {/* Author + date */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 14 }}>
        by{' '}
        <Link
          to={`/profile/${material?.author_email?.split('@')[0]}`}
          style={{ color: 'var(--text-3)', textDecoration: 'none' }}
        >
          {material?.author_email?.split('@')[0]}
        </Link>
        {' · '}
        {new Date(material?.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })}
      </p>

      {/* Tags */}
      {material?.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {material.tags.map(tag => (
            <span
              key={tag.slug}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                padding: '2px 8px',
                background: 'var(--bg-2)',
                color: 'var(--text-3)',
                borderRadius: 'var(--radius-full)',
                border: '0.5px solid var(--border)'
              }}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="divider" />

      {/* Content */}
      <div
        className="material-content"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(material?.content || '')
        }}
      />

      <div className="divider" />

      {/* Reactions */}
      <Reactions materialId={material?.id} />

      {/* Read status — only for non-authors */}
      {!isAuthor && (
        <div style={{ marginTop: 16 }}>
          <ReadStatus materialId={material?.id} />
        </div>
      )}

      {/* Notes */}
      <Notes materialId={material?.id} />

      <div className="divider" />

      {/* Author actions */}
      {isAuthor && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate(`/editor/${material.id}`)}
            className="btn btn-ghost btn-sm"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn btn-danger btn-sm"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

export default MaterialPage
