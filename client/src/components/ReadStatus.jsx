import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

function ReadStatus({ materialId }) {
  const queryClient = useQueryClient()

  // Fetch current read status for this material
  // Returns { read: bool, completed: bool }
  const { data: status, isLoading } = useQuery({
    queryKey: ['reads', materialId],
    queryFn: () => api.getReadStatus(materialId),
    enabled: !!materialId
  })

  // Toggle mutation — one endpoint handles all three state transitions:
  // no record → read, read → completed, completed → read
  // onSuccess invalidates cache so button updates immediately
  const mutation = useMutation({
    mutationFn: () => api.toggleRead(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reads', materialId] })
    }
  })

  if (isLoading) return null

  // Determine button appearance based on current state
  // State 0: not read     → neutral button "Mark as read"
  // State 1: read         → accent button  "Mark as complete"
  // State 2: completed    → green button   "✓ Completed"
  function getButtonStyle() {
    if (status?.completed) {
      return {
        borderColor: 'var(--green)',
        color: 'var(--green)',
        background: 'var(--green-dim)'
      }
    }
    if (status?.read) {
      return {
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
        background: 'var(--accent-dim)'
      }
    }
    return {
      borderColor: 'var(--border-2)',
      color: 'var(--text-2)',
      background: 'transparent'
    }
  }

  function getButtonLabel() {
    if (status?.completed) return '✓ Completed'
    if (status?.read) return '✓ Mark as complete'
    return '📖 Mark as read'
  }

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      style={{
        padding: '8px 18px',
        borderRadius: 6,
        border: '1px solid',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        transition: 'all 0.15s',
        ...getButtonStyle()
      }}
    >
      {mutation.isPending ? '...' : getButtonLabel()}
    </button>
  )
}

export default ReadStatus