import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

function Notes({ materialId }) {
  const queryClient = useQueryClient()

  // Local state for the text area — tracks what the user is currently typing
  // This is separate from the saved note in the cache
  const [draft, setDraft] = useState('')

  // Track whether the user is in edit mode
  // false = showing saved note (read mode)
  // true = showing text area (edit mode)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch the existing note for this material
  // Returns { note: { content, updated_at } } or { note: null }
  const { data, isLoading } = useQuery({
    queryKey: ['note', materialId],
    queryFn: () => api.getNote(materialId),
    enabled: !!materialId
  })

  const existingNote = data?.note

  // When the fetched note arrives, pre-fill the draft with existing content
  // This ensures the text area shows current content when entering edit mode
  useEffect(() => {
    if (existingNote) {
      setDraft(existingNote.content)
    }
  }, [existingNote])

  // Save mutation — upserts the note on the backend
  // On success, updates the cache and exits edit mode
  const saveMutation = useMutation({
    mutationFn: () => api.saveNote(materialId, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', materialId] })
      setIsEditing(false)
    }
  })

  // Delete mutation — removes the note from backend and clears local state
  const deleteMutation = useMutation({
    mutationFn: () => api.deleteNote(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', materialId] })
      setDraft('')
      setIsEditing(false)
    }
  })

  function handleEdit() {
    // Pre-fill draft with current saved content before entering edit mode
    setDraft(existingNote?.content || '')
    setIsEditing(true)
  }

  function handleCancel() {
    // Revert draft to last saved content and exit edit mode
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
    <div style={{ marginTop: 32 }}>

      {/* Section label */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-3)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: 12
      }}>
        // my notes
      </p>

      {/* Edit mode — show text area and save/cancel buttons */}
      {isEditing ? (
        <div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write your private notes here — only you can see this..."
            rows={5}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-2)',
              border: '1px solid var(--accent)',
              borderRadius: 6,
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'vertical',
              marginBottom: 10
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !draft.trim()}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '8px 20px', fontSize: 12 }}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save note'}
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '8px 16px', fontSize: 12 }}
            >
              Cancel
            </button>
          </div>
          {saveMutation.error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginTop: 8 }}>
              ⚠ {saveMutation.error.message}
            </p>
          )}
        </div>
      ) : (
        <div>
          {existingNote ? (
            // Read mode — show saved note with edit and delete buttons
            <div>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '12px 16px',
                marginBottom: 10
              }}>
                {/* Note content */}
                <p style={{
                  fontSize: 13,
                  color: 'var(--text-2)',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-wrap'   // preserve line breaks
                }}>
                  {existingNote.content}
                </p>

                {/* Last updated timestamp */}
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-3)',
                  marginTop: 8,
                  marginBottom: 0
                }}>
                  last updated {new Date(existingNote.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>

              {/* Edit and delete actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleEdit}
                  className="btn btn-ghost"
                  style={{ width: 'auto', padding: '8px 16px', fontSize: 12 }}
                >
                  Edit note
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="btn btn-danger"
                  style={{ width: 'auto', padding: '8px 16px', fontSize: 12 }}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            // No note yet — show prompt to add one
            <div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-3)',
                marginBottom: 10
              }}>
                // no notes yet — add your private thoughts about this material
              </p>
              <button
                onClick={handleEdit}
                className="btn btn-ghost"
                style={{ width: 'auto', padding: '8px 16px', fontSize: 12 }}
              >
                + Add note
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Notes