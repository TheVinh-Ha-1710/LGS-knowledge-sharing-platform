import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // Add a toast — auto-removes after duration
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  // Manual dismiss
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Convenience methods
  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info')
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container rendered inside provider */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              fontFamily: 'var(--font-display)',
              boxShadow: 'var(--shadow-md)',
              border: '0.5px solid',
              pointerEvents: 'all',
              cursor: 'pointer',
              animation: 'slideIn 0.2s ease',
              minWidth: 240,
              maxWidth: 360,
              background: t.type === 'success' ? 'var(--accent-dim)' :
                          t.type === 'error'   ? 'var(--red-dim)' : 'var(--bg-2)',
              borderColor: t.type === 'success' ? 'var(--accent-muted)' :
                           t.type === 'error'   ? 'var(--red)' : 'var(--border)',
              color: t.type === 'success' ? 'var(--accent-text)' :
                     t.type === 'error'   ? 'var(--red)' : 'var(--text-2)'
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>
              {t.type === 'success' ? '✓' :
               t.type === 'error'   ? '⚠' : 'ℹ'}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <span style={{ fontSize: 16, opacity: 0.5, flexShrink: 0 }}>×</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}