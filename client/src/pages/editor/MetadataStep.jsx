import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEditor } from '../../context/EditorContext'
import { api } from '../../api'
import StepIndicator from '../../components/StepIndicator'

function MetadataStep() {
  // Read :id from URL — present when editing, undefined when creating
  const { id } = useParams()
  const navigate = useNavigate()

  // If id exists in the URL, we are in edit mode
  const isEditing = !!id

  // Pull shared state and actions from EditorContext
  // All three steps read/write from the same context so data persists across navigation
  const {
    title, setTitle,
    fieldId, setFieldId,
    difficulty, setDifficulty,
    tags, setTags,
    isEditing: editorIsEditing,   // true once loadExisting has been called
    existingSlug,                  // needed to navigate back after cancel in edit mode
    clearDraft,                    // clears localStorage and resets all state
    loadExisting                   // pre-fills context state from an existing material object
  } = useEditor()

  // Fetch all fields for the dropdown — same as the old EditorPage
  const { data: fields } = useQuery({
    queryKey: ['fields'],
    queryFn: api.getFields
  })

  // Only fetch the existing material when editing — `enabled: isEditing` prevents
  // this query from running on the create flow where there is no id
  const { data: existing } = useQuery({
    queryKey: ['material', id],
    queryFn: () => api.getMaterialById(id),
    enabled: isEditing
  })

  // When the existing material data arrives, load it into context
  // The !editorIsEditing guard prevents re-loading on every render —
  // once loadExisting has been called, editorIsEditing becomes true and we stop
  useEffect(() => {
    if (existing && !editorIsEditing) {
      loadExisting(existing)
    }
  }, [existing])

  function handleNext() {
    // Validate the two required fields before proceeding
    if (!title || !fieldId) {
      alert('Please fill in a title and select a field')
      return
    }
    // Navigate to the content step — path differs based on create vs edit
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
      // window.confirm only has OK/Cancel — OK = save draft, Cancel = discard
      const save = window.confirm('OK to save draft and come back later.\nCancel to discard everything.')
      if (save) {
        // Draft is already in localStorage — just navigate away
        navigate('/explore')
      } else {
        // Clear localStorage and all state before leaving
        clearDraft()
        navigate('/explore')
      }
    }
  }

  return (
    <div className="app-page" style={{ maxWidth: 640 }}>

      {/* Progress indicator — shows user is on step 1 of 3 */}
      <StepIndicator currentStep={1} />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
        {isEditing ? 'Edit material' : 'New material'}
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 32 }}>
        // step 1 of 3 — fill in the details
      </p>

      {/* Title — controlled input bound to context state */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
          Title
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What is this about?"
          style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 14 }}
        />
      </div>

      {/* Field dropdown — populated from the fields query */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
          Field
        </label>
        <select
          value={fieldId}
          onChange={e => setFieldId(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 14 }}
        >
          <option value="">Select a field</option>
          {fields?.map(f => (
            <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
          ))}
        </select>
      </div>

      {/* Difficulty — three fixed options */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
          Difficulty
        </label>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 14 }}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Tags — comma separated free text, split into array at publish time */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
          Tags — comma separated
        </label>
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="react, javascript, hooks"
          style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleNext}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 28px' }}
        >
          Next →
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

export default MetadataStep
