// EditorPage.jsx
// Replace your existing client/src/pages/EditorPage.jsx with this

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import EditorToolbar from '../components/EditorToolbar'
import { api } from '../api'

// Set up lowlight with common languages
// common includes: js, ts, python, java, css, html, sql, bash, json, and more
const lowlight = createLowlight(common)

function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [title, setTitle] = useState('')
  const [fieldId, setFieldId] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')
  const [tags, setTags] = useState('')

  const { data: fields } = useQuery({
    queryKey: ['fields'],
    queryFn: api.getFields
  })

  const { data: existing } = useQuery({
    queryKey: ['material', id],
    queryFn: () => api.getMaterialById(id),
    enabled: isEditing
  })

  // TipTap editor — StarterKit WITHOUT its default CodeBlock
  // replaced by CodeBlockLowlight for syntax highlighting
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,   // disable default — using CodeBlockLowlight instead
      }),
      CodeBlockLowlight.configure({
        lowlight,           // pass in our configured lowlight instance
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        style: 'min-height: 300px; outline: none; padding: 4px;'
      }
    }
  })

  useEffect(() => {
    if (existing && editor) {
      setTitle(existing.title)
      setFieldId(existing.field_id)
      setDifficulty(existing.difficulty)
      setTags(existing.tags?.map(t => t.name).join(', ') || '')
      editor.commands.setContent(existing.content || '')
    }
  }, [existing, editor])

  const createMutation = useMutation({
    mutationFn: (data) => api.createMaterial(data),
    onSuccess: (newMaterial) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      navigate(`/materials/${newMaterial.slug}`)
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data) => api.updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.invalidateQueries({ queryKey: ['material', id] })
      navigate(`/materials/${existing.slug}`)
    }
  })

  function handleSubmit(e) {
    e.preventDefault()
    const content = editor.getHTML()
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)
    const data = { title, content, field_id: fieldId, difficulty, tags: tagsArray }

    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div style={{ padding: '80px 24px 40px', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 32 }}>{isEditing ? 'Edit Material' : 'New Material'}</h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Title
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="What is this about?"
            style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 14 }}
          />
        </div>

        {/* Field + Difficulty row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Field
            </label>
            <select
              value={fieldId}
              onChange={e => setFieldId(e.target.value)}
              required
              style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 14 }}
            >
              <option value="">Select a field</option>
              {fields?.map(f => (
                <option key={f.id} value={f.id}>
                  {f.icon} {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
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
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Tags — comma separated
          </label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="react, javascript, hooks"
            style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
          />
        </div>

        {/* Rich text editor */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Content
          </label>
          <div style={{ border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-2)' }}>
            <EditorToolbar editor={editor} />
            <div style={{ padding: '12px 16px' }}>
              <EditorContent editor={editor} />
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>
            // tip: for code blocks, select a language by typing after the opening ``` fence
          </p>
        </div>

        {/* Errors */}
        {(createMutation.error || updateMutation.error) && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠ {createMutation.error?.message || updateMutation.error?.message}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 28px' }}
          >
            {isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '10px 20px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditorPage
