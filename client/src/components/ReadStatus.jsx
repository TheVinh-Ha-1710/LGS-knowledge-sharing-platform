import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

function ReadStatus({ materialId }) {
  const queryClient = useQueryClient()

  const { data: status, isLoading } = useQuery({
    queryKey: ['reads', materialId],
    queryFn: () => api.getReadStatus(materialId),
    enabled: !!materialId
  })

  const mutation = useMutation({
    mutationFn: () => api.toggleRead(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reads', materialId] })
    }
  })

  if (isLoading) return null

  function getClass() {
    if (status?.completed) return 'read-btn completed'
    if (status?.read) return 'read-btn read'
    return 'read-btn'
  }

  function getLabel() {
    if (mutation.isPending) return '...'
    if (status?.completed) return '✓ Completed'
    if (status?.read) return '✓ Mark as complete'
    return '📖 Mark as read'
  }

  return (
    <button
      className={getClass()}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {getLabel()}
    </button>
  )
}

export default ReadStatus
