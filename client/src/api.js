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
  }),

    // reads
  getReadStatus: (materialId) => request(`/reads/${materialId}`),
  toggleRead: (materialId) => request(`/reads/${materialId}`, { method: 'POST' }),

  // stats
  getLeaderboard: () => request('/stats/leaderboard'),
  getTrending: () => request('/stats/trending'),

  //users
  getMyProfile: () => request('/users/me'),
  getUserProfile: (username) => request(`/users/${username}`),

  // notes
  getNote: (materialId) => request(`/notes/${materialId}`),
  saveNote: (materialId, content) => request(`/notes/${materialId}`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }),
  deleteNote: (materialId) => request(`/notes/${materialId}`, {
    method: 'DELETE'
  }),

  // upload
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData  // no Content-Type header — browser sets it with boundary
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data
  }
}