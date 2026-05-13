const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export const api = {
  // fields
  getFields: () => request('/fields'),

  // materials
  getMaterials: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/materials${query ? `?${query}` : ''}`)
  },
  getMaterial: (slug) => request(`/materials/${slug}`),
  getMaterialById: (id) => request(`/materials/id/${id}`),
  createMaterial: (data) => request('/materials', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  trackView: (slug) => request(`/materials/${slug}/view`, { method: 'POST' }),
  updateMaterial: (id, data) => request(`/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteMaterial: (id) => request(`/materials/${id}`, {
    method: 'DELETE'
  }),
  getReactions: (materialId) => request(`/reactions/${materialId}`),
  toggleReaction: (materialId, type) => request(`/reactions/${materialId}`, {
    method: 'POST',
    body: JSON.stringify({ type })
  })
}