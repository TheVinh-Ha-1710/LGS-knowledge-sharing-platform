function EditorToolbar({ editor }) {
  if (!editor) return null

  const tools = [
    {
      group: 'text',
      items: [
        { label: 'B', title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { label: 'I', title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
        { label: 'S', title: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
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
        { label: '•—', title: 'Bullet list', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
        { label: '1.', title: 'Ordered list', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
      ]
    },
    {
      group: 'blocks',
      items: [
        { label: '</', title: 'Code block', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
        { label: '❝', title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
        { label: '—', title: 'Horizontal rule', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
      ]
    }
  ]

  return (
    <div className="editor-toolbar">
      {tools.map((group, groupIndex) => (
        <div key={group.group} style={{ display: 'flex', gap: 2 }}>
          {/* Divider between groups */}
          {groupIndex > 0 && (
            <div className="editor-toolbar-divider" />
          )}
          {group.items.map(tool => (
            <button
              key={tool.label}
              title={tool.title}
              className={`editor-toolbar-btn ${tool.active ? 'active' : ''}`}
              onClick={tool.action}
              type="button"
            >
              {tool.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default EditorToolbar