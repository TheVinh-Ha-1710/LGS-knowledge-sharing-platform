import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { DifficultyBadge, getFieldAccent } from '../utils.jsx'
import DOMPurify from 'dompurify'
import { useEffect } from 'react'

function MaterialPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    api.trackView(slug).then(() => {
      queryClient.invalidateQueries({ queryKey: ['material', slug] })
    })
  }, [slug])

  const { data: material, isLoading, error } = useQuery({
    queryKey: ['material', slug],
    queryFn: () => api.getMaterial(slug),
    refetchOnWindowFocus: false     // Not fetch on tab switch
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
  const fieldAccent = getFieldAccent(material?.field_slug)

  return (
    <div className="app-page" style={{ maxWidth: 740 }}>

      {/* Back */}
      <button
        onClick={() => navigate('/explore')}
        style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', padding: 0, marginBottom: 28, letterSpacing: '0.08em' }}
      >
        ← back to explore
      </button>

      {/* Field + difficulty */}
      <div style={{ display: 'flex', align: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: fieldAccent,
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }}>
          {material?.field_icon} {material?.field_name}
        </span>
        <DifficultyBadge difficulty={material?.difficulty} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
          // {material?.view_count} views
        </span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.2 }}>
        {material?.title}
      </h1>

      {/* Author + date */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>
        by <span style={{ color: 'var(--text-2)' }}>{material?.author_email?.split('@')[0]}</span>
        {' · '}
        {new Date(material?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                borderRadius: 3,
                letterSpacing: '0.05em'
              }}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

      {/* Content */}
      <div
        className="material-content"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(material?.content || '')
        }}
      />

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '40px 0 24px' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {isAuthor && (
          <>
            <button
              onClick={() => navigate(`/editor/${material.id}`)}
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="btn btn-danger"
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
      </div>

    </div>
  )
}

export default MaterialPage
