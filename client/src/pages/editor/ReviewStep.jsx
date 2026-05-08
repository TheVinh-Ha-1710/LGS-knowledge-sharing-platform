import { useParams, useNavigate } from 'react-router-dom'
import { useEditor } from '../../context/EditorContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import { DifficultyBadge, getFieldAccent } from '../../utils.jsx'
import DOMPurify from 'dompurify'
import StepIndicator from '../../components/StepIndicator'

function ReviewStep() {
  // Read :id from URL — present when editing, undefined when creating
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const queryClient = useQueryClient()

  // Pull all shared state from EditorContext
  // This is a read-only step — no setters needed, just displaying what was entered
  const {
    title,
    fieldId,
    difficulty,
    tags,
    content,
    existingSlug,
    clearDraft
  } = useEditor()

  // Fetch fields to resolve fieldId → field name and icon for display
  // We only have fieldId (a number) in context, not the full field object
  const { data: fields } = useQuery({
    queryKey: ['fields'],
    queryFn: api.getFields
  })

  // Find the full field object that matches the selected fieldId
  const selectedField = fields?.find(f => String(f.id) === String(fieldId))

  // Parse tags from comma-separated string into a clean array
  // e.g. "react, javascript, hooks" → ['react', 'javascript', 'hooks']
  const tagsArray = tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  // --- CREATE MUTATION ---
  // Fires when publishing a brand new material
  const createMutation = useMutation({
    mutationFn: () => api.createMaterial({
      title,
      content,
      field_id: fieldId,
      difficulty,
      tags: tagsArray
    }),
    onSuccess: (newMaterial) => {
      // Invalidate the materials list cache so Explore and Dashboard show the new material
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      // Clear draft from localStorage — we're done with it
      clearDraft()
      // Navigate to the newly created material
      navigate(`/materials/${newMaterial.slug}`)
    }
  })

  // --- UPDATE MUTATION ---
  // Fires when saving changes to an existing material
  const updateMutation = useMutation({
    mutationFn: () => api.updateMaterial(id, {
      title,
      content,
      field_id: fieldId,
      difficulty,
      tags: tagsArray
    }),
    onSuccess: () => {
      // Invalidate both the list and the individual material cache
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['material', id] })
      // Clear draft from localStorage — edit session complete
      clearDraft()
      // Navigate back to the material we just edited
      navigate(`/materials/${existingSlug}`)
    }
  })

  function handlePublish() {
    // Route to the correct mutation based on create vs edit
    if (isEditing) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  function handleBack() {
    // Navigate back to content step — context preserves all data
    navigate(isEditing ? `/editor/${id}/content` : '/editor/content')
  }

  function handleCancel() {
    if (isEditing) {
      // Edit flow — simple confirm, no draft option
      if (window.confirm('Discard all changes?')) {
        clearDraft()
        navigate(`/materials/${existingSlug}`)
      }
    } else {
      // Create flow — offer to save draft or discard completely
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
  const fieldAccent = getFieldAccent(selectedField?.slug)

  return (
    <div className="app-page" style={{ maxWidth: 720 }}>

      {/* Progress indicator — shows user is on step 3 of 3 */}
      <StepIndicator currentStep={3} />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
        Review
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 32 }}>
        // step 3 of 3 — check everything before publishing
      </p>

      {/* Summary card — shows all metadata at a glance */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 24,
        marginBottom: 24
      }}>

        {/* Field + difficulty row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          {selectedField && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: fieldAccent,
              letterSpacing: '0.08em'
            }}>
              {selectedField.icon} {selectedField.name}
            </span>
          )}
          <DifficultyBadge difficulty={difficulty} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em' }}>
          {title || <span style={{ color: 'var(--text-3)' }}>// no title</span>}
        </h2>

        {/* Tags */}
        {tagsArray.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {tagsArray.map(tag => (
              <span
                key={tag}
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
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

        {/* Content preview — safely rendered HTML from TipTap */}
        {content ? (
          <div
            className="material-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(content)
            }}
          />
        ) : (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
            // no content yet — go back to add some
          </p>
        )}
      </div>

      {/* Error display */}
      {(createMutation.error || updateMutation.error) && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          ⚠ {createMutation.error?.message || updateMutation.error?.message}
        </div>
      )}

      {/* Actions — Publish/Save is the final action, Back returns to step 2 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handlePublish}
          disabled={isPending}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 28px' }}
        >
          {isPending
            ? 'Saving...'
            : isEditing ? 'Save changes' : 'Publish'
          }
        </button>
        <button
          onClick={handleBack}
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '10px 20px' }}
        >
          ← Back
        </button>
        <button
          onClick={handleCancel}
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '10px 20px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ReviewStep
