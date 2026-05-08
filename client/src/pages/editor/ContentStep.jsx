import { useParams, useNavigate } from 'react-router-dom'
import { useEditor } from '../../context/EditorContext'
// TipTap's useEditor hook is named the same as ours — alias it to avoid collision
import { useEditor as useTipTap, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import StepIndicator from '../../components/StepIndicator'
import EditorToolbar from '../../components/EditorToolbar'

// Set up lowlight with common languages for syntax highlighting
const lowlight = createLowlight(common)

function ContentStep() {
  // Read :id from URL — present when editing, undefined when creating
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  // Pull content state and actions from EditorContext
  // content is the HTML string produced by TipTap
  const {
    content, setContent,
    existingSlug,
    clearDraft,
    isEditing: editorIsEditing
  } = useEditor()

  // Initialise TipTap editor
  // content from context pre-fills the editor — this handles both the create flow
  // (where content starts empty) and the edit flow (where loadExisting populated it)
  // onUpdate fires on every keystroke and saves the latest HTML to context
  // This means navigating Back to MetadataStep and returning preserves content
  const editor = useTipTap({
    extensions: [
      // Disable StarterKit's default CodeBlock — we use CodeBlockLowlight instead
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      // Save HTML to context on every change — also persists to localStorage
      // via EditorContext's useEffect listener
      setContent(editor.getHTML())
    },
    editorProps: {
      attributes: { style: 'min-height: 300px; outline: none; padding: 4px;' }
    }
  })

  function handleBack() {
    // Content is already saved to context via onUpdate — no extra save needed
    // Navigate back to metadata step — path differs based on create vs edit
    navigate(isEditing ? `/editor/${id}` : '/editor')
  }

  function handleReview() {
    // Navigate forward to review step — content already in context
    navigate(isEditing ? `/editor/${id}/review` : '/editor/review')
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
        // Draft already in localStorage — just navigate away
        navigate('/explore')
      } else {
        clearDraft()
        navigate('/explore')
      }
    }
  }

  return (
    <div className="app-page" style={{ maxWidth: 720 }}>

      {/* Progress indicator — shows user is on step 2 of 3 */}
      <StepIndicator currentStep={2} />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
        {isEditing ? 'Edit content' : 'Write content'}
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 32 }}>
        // step 2 of 3 — write your material
      </p>

      {/* TipTap rich text editor with toolbar */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-2)', marginBottom: 32 }}>
        <EditorToolbar editor={editor} />
        <div style={{ padding: '12px 16px' }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Actions — Review moves forward, Back returns to step 1, Cancel exits */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleReview}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 28px' }}
        >
          Review →
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

export default ContentStep
