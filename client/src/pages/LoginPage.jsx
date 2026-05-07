import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="logo-badge">
          <span className="logo-dot" />
          auth.sys / login
        </div>

        <h1>Welcome back</h1>
        <p className="card-subtitle">// enter credentials to continue</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@domain.com"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : '→ Sign in'}
          </button>
        </form>

        <div className="divider">or</div>
        
        <a
          href="/api/auth/google"
          className="btn btn-ghost"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 8 }}
        >
          → Continue with Google
        </a>

        <div className="card-footer">
          No account?
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
