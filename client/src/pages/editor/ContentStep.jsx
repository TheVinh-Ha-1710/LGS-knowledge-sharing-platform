import { useParams, useNavigate } from 'react-router-dom'
import { useEditor } from '../../context/EditorContext'
import { useEditor as useTipTap, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import StepIndicator from '../../components/StepIndicator'
import EditorToolbar from '../../components/EditorToolbar'

const lowlight = createLowlight(common)

function ContentStep() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const {
    content, setContent,
    existingSlug,
    clearDraft
  } = useEditor()

  const editor = useTipTap({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'editor-content' }
    }
  })

  function handleBack() {
    navigate(isEditing ? `/editor/${id}` : '/editor')
  }

  function handleReview() {
    navigate(isEditing ? `/editor/${id}/review` : '/editor/review')
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
    <div className="app-page-wide">
      <StepIndicator currentStep={2} />

      <div className="page-eyebrow">
        {isEditing ? '// edit material' : '// new material'}
      </div>
      <h1 className="page-title-sm" style={{ marginBottom: 4 }}>
        {isEditing ? 'Edit content' : 'Write your content'}
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 24 }}>
        // step 2 of 3 — write your material
      </p>

      <div className="editor-wrap" style={{ marginBottom: 6 }}>
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
        <button className="btn btn-primary" onClick={handleReview}>
          Review →
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

export default ContentStep
