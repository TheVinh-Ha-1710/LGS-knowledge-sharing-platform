import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEditor } from '../../context/EditorContext'
import { api } from '../../api'
import StepIndicator from '../../components/StepIndicator'

function MetadataStep() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const {
    title, setTitle,
    fieldId, setFieldId,
    difficulty, setDifficulty,
    tags, setTags,
    isEditing: editorIsEditing,
    existingSlug,
    clearDraft,
    loadExisting
  } = useEditor()

  const { data: fields } = useQuery({
    queryKey: ['fields'],
    queryFn: api.getFields
  })

  const { data: existing } = useQuery({
    queryKey: ['material', id],
    queryFn: () => api.getMaterialById(id),
    enabled: isEditing
  })

  useEffect(() => {
    if (existing && !editorIsEditing) {
      loadExisting(existing)
    }
  }, [existing])

  function handleNext() {
    if (!title || !fieldId) {
      alert('Please fill in a title and select a field')
      return
    }
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

  return (
    <div className="app-page-narrow">
      <StepIndicator currentStep={1} />

      <div className="page-eyebrow">
        {isEditing ? '// edit material' : '// new material'}
      </div>
      <h1 className="page-title-sm" style={{ marginBottom: 4 }}>
        {isEditing ? 'Edit material' : 'What are you sharing?'}
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 32 }}>
        // step 1 of 3 — fill in the details
      </p>

      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What is this about?"
          autoFocus
        />
      </div>

      <div className="form-2col">
        <div className="form-group">
          <label className="form-label">Field</label>
          <select
            className="form-select"
            value={fieldId}
            onChange={e => setFieldId(e.target.value)}
          >
            <option value="">Select a field</option>
            {fields?.map(f => (
              <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Difficulty</label>
          <select
            className="form-select"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags — comma separated</label>
        <input
          className="form-input"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="react, javascript, hooks"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
        />
        <div className="form-hint">Add tags to help others discover this material</div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button className="btn btn-primary" onClick={handleNext}>
          Next →
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

export default MetadataStep
