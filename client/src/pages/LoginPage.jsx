import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
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
    <div className="auth-split">
      {/* Left — brand panel */}
      <div className="auth-left">
        <div>
          <div className="auth-left-brand">
            <div className="auth-left-dot" />
            <span className="auth-left-name">let's.get.smarter</span>
          </div>
          <div className="auth-left-headline">
            <div className="auth-left-title">
              Share what you know.<br />Learn what you don't.
            </div>
            <div className="auth-left-sub">
              A private knowledge base for our group — where every field of study becomes everyone's advantage.
            </div>
            <div className="auth-left-fields">
              {[
                '💻 Technology',
                '🏥 Health & Medicine',
                '⚖️ Law & Policy',
                '📊 Business',
                '🔬 Science',
                '🌐 General'
              ].map(field => (
                <div key={field} className="auth-left-field">
                  <div className="auth-left-field-dot" />
                  {field}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="auth-left-footer">v1.1.0 — private access only</div>
      </div>

      {/* Right — form panel */}
      <div className="auth-right">
        <div className="auth-form-eyebrow">// sign in</div>
        <div className="auth-form-title">Welcome back</div>
        <div className="auth-form-sub">
          New here? <Link to="/register">Create an account</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: 16 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        <a href="/api/auth/google">
          <button className="btn-google">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </a>
      </div>
    </div>
  )
}

export default LoginPage
