import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthCallback() {
  const navigate = useNavigate()
  const { checkAuth } = useAuth()
  const called = useRef(false)  // ← guard

  useEffect(() => {
    if (called.current) return  // ← already ran, bail out
    called.current = true       // ← mark as ran

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      fetch('/api/login/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include'
      })
        .then(() => checkAuth())
        .then(() => navigate('/dashboard'))
    } else {
      navigate('/login')
    }
  }, [])

  return (
    <div className="page">
      <div className="card">
        <div className="logo-badge">
          <span className="logo-dot" />
          auth.sys
        </div>
        <p className="card-subtitle">// establishing session...</p>
      </div>
    </div>
  )
}

export default AuthCallback