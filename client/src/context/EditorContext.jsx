import { createContext, useContext, useState, useEffect } from 'react'

const EditorContext = createContext()

export function EditorProvider({ children }) {
  const [title, setTitle] = useState('')
  const [fieldId, setFieldId] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [existingId, setExistingId] = useState(null)
  const [existingSlug, setExistingSlug] = useState(null)

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('editor_draft')
    if (draft) {
      const parsed = JSON.parse(draft)
      setTitle(parsed.title || '')
      setFieldId(parsed.fieldId || '')
      setDifficulty(parsed.difficulty || 'beginner')
      setTags(parsed.tags || '')
      setContent(parsed.content || '')
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('editor_draft', JSON.stringify({
      title, fieldId, difficulty, tags, content
    }))
  }, [title, fieldId, difficulty, tags, content])

  function clearDraft() {
    localStorage.removeItem('editor_draft')
    setTitle('')
    setFieldId('')
    setDifficulty('beginner')
    setTags('')
    setContent('')
    setIsEditing(false)
    setExistingId(null)
    setExistingSlug(null)
  }

  function loadExisting(material) {
    setTitle(material.title)
    setFieldId(material.field_id)
    setDifficulty(material.difficulty)
    setTags(material.tags?.map(t => t.name).join(', ') || '')
    setContent(material.content || '')
    setIsEditing(true)
    setExistingId(material.id)
    setExistingSlug(material.slug)
  }

  return (
    <EditorContext.Provider value={{
      title, setTitle,
      fieldId, setFieldId,
      difficulty, setDifficulty,
      tags, setTags,
      content, setContent,
      isEditing,
      existingId,
      existingSlug,
      clearDraft,
      loadExisting
    }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  return useContext(EditorContext)
}