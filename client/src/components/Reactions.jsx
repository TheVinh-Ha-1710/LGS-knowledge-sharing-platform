import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

const REACTIONS = [
  { type: 'helpful',    emoji: '💡', label: 'Helpful' },
  { type: 'mindblown',  emoji: '🤯', label: 'Mind blown' },
  { type: 'needs_work', emoji: '🔧', label: 'Needs work' }
]

function Reactions({ materialId }) {
  const queryClient = useQueryClient()

  const { data: reactions, isLoading } = useQuery({
    queryKey: ['reactions', materialId],
    queryFn: () => api.getReactions(materialId),
    enabled: !!materialId
  })

  const mutation = useMutation({
    mutationFn: (type) => api.toggleReaction(materialId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', materialId] })
    }
  })

  function getCount(type) {
    const found = reactions?.counts?.find(r => r.type === type)
    return found ? parseInt(found.count) : 0
  }

  if (isLoading) return null

  return (
    <div style={{ marginTop: 28 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>// reactions</div>
      <div className="reactions">
        {REACTIONS.map(({ type, emoji, label }) => {
          const isActive = reactions?.userReaction === type
          const count = getCount(type)
          return (
            <button
              key={type}
              className={`reaction-btn ${isActive ? 'active' : ''}`}
              onClick={() => mutation.mutate(type)}
              disabled={mutation.isPending}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {count > 0 && (
                <span className={`reaction-count ${isActive ? '' : 'inactive'}`}>
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
