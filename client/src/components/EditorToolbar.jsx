import { useRef, useState } from 'react'
import { api } from '../api'

const LANGUAGES = [
  { value: '',           label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'sql',        label: 'SQL' },
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'bash',       label: 'Bash' },
  { value: 'java',       label: 'Java' },
  { value: 'json',       label: 'JSON' },
]

function EditorToolbar({ editor }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  if (!editor) return null

  // Handle image file selection and upload to Cloudinary via backend
  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const { url } = await api.uploadImage(file)
      // Insert image at current cursor position
      editor.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      console.error('Image upload failed:', err.message)
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      e.target.value = ''
    }
  }

  const tools = [
    {
      group: 'text',
      items: [
        { label: 'B',  title: 'Bold',          action: () => editor.chain().focus().toggleBold().run(),          active: editor.isActive('bold') },
        { label: 'I',  title: 'Italic',         action: () => editor.chain().focus().toggleItalic().run(),        active: editor.isActive('italic') },
        { label: 'S',  title: 'Strikethrough',  action: () => editor.chain().focus().toggleStrike().run(),        active: editor.isActive('strike') },
      ]
    },
    {
      group: 'headings',
      items: [
        { label: 'H1', title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
        { label: 'H2', title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
        { label: 'H3', title: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
      ]
    },
    {
      group: 'lists',
      items: [
        { label: '•—', title: 'Bullet list',   action: () => editor.chain().focus().toggleBulletList().run(),   active: editor.isActive('bulletList') },
        { label: '1.', title: 'Ordered list',  action: () => editor.chain().focus().toggleOrderedList().run(),  active: editor.isActive('orderedList') },
      ]
    },
    {
      group: 'blocks',
      items: [
        { label: '</',                 title: 'Code block',      action: () => editor.chain().focus().toggleCodeBlock().run(),    active: editor.isActive('codeBlock') },
        { label: '❝',                  title: 'Blockquote',      action: () => editor.chain().focus().toggleBlockquote().run(),   active: editor.isActive('blockquote') },
        { label: '—',                  title: 'Horizontal rule', action: () => editor.chain().focus().setHorizontalRule().run(),  active: false },
        { label: uploading ? '...' : '🖼', title: 'Upload image', action: () => fileInputRef.current?.click(), active: false },
        { label: '⊞',                 title: 'Insert table',    action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), active: editor.isActive('table') },
      ]
    }
  ]

  const tableActions = [
    { label: '+←', title: 'Add col before',  action: () => editor.chain().focus().addColumnBefore().run() },
    { label: '+→', title: 'Add col after',   action: () => editor.chain().focus().addColumnAfter().run() },
    { label: '−col', title: 'Delete col',    action: () => editor.chain().focus().deleteColumn().run() },
    { label: '+↑', title: 'Add row before',  action: () => editor.chain().focus().addRowBefore().run() },
    { label: '+↓', title: 'Add row after',   action: () => editor.chain().focus().addRowAfter().run() },
    { label: '−row', title: 'Delete row',    action: () => editor.chain().focus().deleteRow().run() },
    { label: '✕',   title: 'Delete table',   action: () => editor.chain().focus().deleteTable().run() },
  ]

  return (
    <div className="editor-toolbar">
      {tools.map((group, groupIndex) => (
        <div key={group.group} style={{ display: 'flex', gap: 2 }}>
          {groupIndex > 0 && <div className="editor-toolbar-divider" />}
          {group.items.map(tool => (
            <button
              key={tool.label}
              title={tool.title}
              className={`editor-toolbar-btn ${tool.active ? 'active' : ''}`}
              onClick={tool.action}
              type="button"
              disabled={tool.title === 'Upload image' && uploading}
            >
              {tool.label}
            </button>
          ))}
        </div>
      ))}

      {/* Language selector — only visible when cursor is inside a code block */}
      {editor.isActive('codeBlock') && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="editor-toolbar-divider" />
          <select
            value={editor.getAttributes('codeBlock').language || ''}
            onChange={e => editor.chain().focus().updateAttributes('codeBlock', {
              language: e.target.value
            }).run()}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '3px 8px',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg)',
              color: 'var(--text-3)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table action row — only visible when cursor is inside a table */}
      {editor.isActive('table') && (
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          paddingTop: 6,
          marginTop: 4,
          borderTop: '0.5px solid var(--border)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-4)',
            marginRight: 4,
            letterSpacing: '0.05em',
          }}>
            table
          </span>
          {tableActions.map((action, i) => (
            <>
              {i === 3 && <div key={`div-${i}`} className="editor-toolbar-divider" />}
              {i === 6 && <div key={`div-del-${i}`} className="editor-toolbar-divider" />}
              <button
                key={action.title}
                title={action.title}
                className="editor-toolbar-btn"
                onClick={action.action}
                type="button"
              >
                {action.label}
              </button>
            </>
          ))}
        </div>
      )}

      {/* Hidden file input — triggered by image button click */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    </div>
  )
}

export default EditorToolbar