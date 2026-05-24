import { useParams, useNavigate } from 'react-router-dom'
import { useEditor } from '../../context/EditorContext'
import { useToast } from '../../context/ToastContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import { DifficultyBadge } from '../../utils.jsx'
import DOMPurify from 'dompurify'
import StepIndicator from '../../components/StepIndicator'

function ReviewStep() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const queryClient = useQueryClient()
  const toast = useToast()

  const {
    title, fieldId, difficulty, tags, content,
    existingSlug, clearDraft
  } = useEditor()

  // Fetch fields to resolve fieldId → field name and icon
  const { data: fields } = useQuery({
    queryKey: ['fields'],
    queryFn: api.getFields
  })

  const selectedField = fields?.find(f => String(f.id) === String(fieldId))

  // Parse tags from comma-separated string into array
  const tagsArray = tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  // Create mutation — new material
  const createMutation = useMutation({
    mutationFn: () => api.createMaterial({
      title,
      content,
      field_id: fieldId,
      difficulty,
      tags: tagsArray
    }),
    onSuccess: (newMaterial) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      clearDraft()
      toast.success('Material published!')
      navigate(`/materials/${newMaterial.slug}`)
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish material')
    }
  })

  // Update mutation — existing material
  const updateMutation = useMutation({
    mutationFn: () => api.updateMaterial(id, {
      title,
      content,
      field_id: fieldId,
      difficulty,
      tags: tagsArray
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['material', id] })
      clearDraft()
      toast.success('Changes saved')
      navigate(`/materials/${existingSlug}`)
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save changes')
    }
  })

  function handlePublish() {
    isEditing ? updateMutation.mutate() : createMutation.mutate()
  }

  function handleBack() {
    navigate(isEditing ? `/editor/${id}/content` : '/editor/content')
  }

  function handleCancel() {
    if (isEditing) {
      if (window.confirm('Discard all changes?')) {
        clearDraft()
        navigate(`/materials/${existingSlug}`)
      }
    } else {
      const save = window.confirm('OK to save draft and come back later.\nCancel to discard everything.')
      if (save) {
        navigate('/explore')
      } else {
        clearDraft()
        navigate('/explore')
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="app-page-wide">
      <StepIndicator currentStep={3} />

      <div className="page-eyebrow">
        {isEditing ? '// edit material' : '// new material'}
      </div>
      <h1 className="page-title-sm" style={{ marginBottom: 4 }}>
        Looks good?
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 24 }}>
        // step 3 of 3 — review before publishing
      </p>

      {/* Review card — shows exactly how the published material will look */}
      <div style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        marginBottom: 20
      }}>
        {/* Field + difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          {selectedField && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>
              {selectedField.icon} {selectedField.name}
            </span>
          )}
          <DifficultyBadge difficulty={difficulty} />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 20,
          fontWeight: 500,
          marginBottom: 10,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
          lineHeight: 1.3
        }}>
          {title || (
            <span style={{ color: 'var(--text-4)', fontStyle: 'italic' }}>
              No title — go back and add one
            </span>
          )}
        </h2>

        {/* Tags */}
        {tagsArray.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
            {tagsArray.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                padding: '2px 8px',
                background: 'var(--bg-2)',
                color: 'var(--text-3)',
                borderRadius: 'var(--radius-full)',
                border: '0.5px solid var(--border)'
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="divider" style={{ margin: '16px 0' }} />

        {/* Content preview */}
        {content ? (
          <div
            className="material-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        ) : (
          <div className="empty-state" style={{ padding: '16px 0', textAlign: 'left' }}>
            // no content yet — go back and write something
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={handlePublish}
          disabled={isPending}
        >
          {isPending
            ? 'Saving...'
            : isEditing ? 'Save changes' : 'Publish →'
          }
        </button>
        <button className="btn btn-ghost" onClick={handleBack}>
          ← Back
        </button>
        <button
          className="btn btn-ghost"
          onClick={handleCancel}
          style={{ color: 'var(--text-4)', borderColor: 'transparent' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ReviewStep