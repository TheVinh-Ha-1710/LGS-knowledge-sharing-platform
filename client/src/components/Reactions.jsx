import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

// Reaction definitions — emoji, label and type value sent to the API
const REACTIONS = [
  { type: 'helpful',    emoji: '💡', label: 'Helpful' },
  { type: 'mindblown',  emoji: '🤯', label: 'Mind blown' },
  { type: 'needs_work', emoji: '🔧', label: 'Needs work' }
]

function Reactions({ materialId }) {
  const queryClient = useQueryClient()

  // Fetch reaction counts and the current user's reaction for this material
  // enabled: !!materialId prevents the query running before materialId is available
  const { data: reactions, isLoading } = useQuery({
    queryKey: ['reactions', materialId],
    queryFn: () => api.getReactions(materialId),
    enabled: !!materialId
  })

  // Toggle mutation — sends the reaction type to the backend
  // The backend decides whether to insert, update, or delete based on current state
  // onSuccess invalidates the cache so the counts refresh immediately
  const mutation = useMutation({
    mutationFn: (type) => api.toggleReaction(materialId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', materialId] })
    }
  })

  // Helper — find the count for a specific reaction type from the counts array
  // Returns 0 if no reactions of that type exist yet
  // parseInt because PostgreSQL COUNT returns a string
  function getCount(type) {
    const found = reactions?.counts?.find(r => r.type === type)
    return found ? parseInt(found.count) : 0
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
        // reactions
      </p>

      {/* Reaction buttons row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {REACTIONS.map(({ type, emoji, label }) => {

          // True if this is the reaction the current user has chosen
          const isActive = reactions?.userReaction === type
          const count = getCount(type)

          return (
            <button
              key={type}
              onClick={() => mutation.mutate(type)}
              disabled={mutation.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 6,
                border: '1px solid',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                transition: 'all 0.15s',

                // Active (user's current reaction) — highlighted in accent color
                // Inactive — dimmed border and text
                background: isActive ? 'var(--accent-dim)' : 'var(--surface)',
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--text-2)',
              }}
            >
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <span>{label}</span>
              {/* Only show count if at least one person reacted */}
              {count > 0 && (
                <span style={{
                  background: isActive ? 'var(--accent)' : 'var(--border-2)',
                  color: isActive ? 'var(--bg)' : 'var(--text-3)',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: 10,
                  fontWeight: 700
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Reactions