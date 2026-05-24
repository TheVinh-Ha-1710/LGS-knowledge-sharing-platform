import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

function Notes({ materialId }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['note', materialId],
    queryFn: () => api.getNote(materialId),
    enabled: !!materialId
  })

  const existingNote = data?.note

  useEffect(() => {
    if (existingNote) setDraft(existingNote.content)
  }, [existingNote])

  const saveMutation = useMutation({
    mutationFn: () => api.saveNote(materialId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', materialId] })
      setIsEditing(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteNote(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', materialId] })
      setDraft('')
      setIsEditing(false)
    }
  })

  function handleEdit() {
    setDraft(existingNote?.content || '')
    setIsEditing(true)
  }

  function handleCancel() {
    setDraft(existingNote?.content || '')
    setIsEditing(false)
  }

  function handleDelete() {
    if (window.confirm('Delete this note? This cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) return null

  return (
    <div style={{ marginTop: 28 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>// my notes</div>

      {isEditing ? (
        <div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write your private notes here — only you can see this..."
            rows={5}
            className="form-textarea"
            style={{ marginBottom: 10 }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !draft.trim()}
              className="btn btn-primary btn-sm"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save note'}
            </button>
            <button onClick={handleCancel} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          </div>
          {saveMutation.error && (
            <div className="form-error" style={{ marginTop: 8 }}>
              ⚠ {saveMutation.error.message}
            </div>
          )}
        </div>
      ) : existingNote ? (
        <div>
          <div className="note-display">{existingNote.content}</div>
          <div className="note-meta">
            last updated {new Date(existingNote.updated_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={handleEdit} className="btn btn-ghost btn-sm">
              Edit note
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="btn btn-danger btn-sm"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="empty-state" style={{ padding: '16px 0', textAlign: 'left' }}>
            // no notes yet — add your private thoughts about this material
          </div>
          <button onClick={handleEdit} className="btn btn-ghost btn-sm">
            + Add note
          </button>
        </div>
      )}
    </div>
  )
}

export default Notes
