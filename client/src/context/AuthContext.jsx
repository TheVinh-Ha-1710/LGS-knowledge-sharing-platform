import { createContext, useContext, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile data when user is logged in — provides streak
  const { data: profileData } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: api.getMyProfile,
    enabled: !!user
  })

  const streak = profileData?.stats?.current_streak || 0

  async function checkAuth() {
    setLoading(true)
    const res = await fetch('/api/me', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setUser(data.user)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  async function login(email, password) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await checkAuth()
  }

  async function register(email, password) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
  }

  async function logout() {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    })
    setUser(null)
    setLoading(false)
  }

  useEffect(() => {
    if (window.location.pathname === '/auth/callback') return
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, streak }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}