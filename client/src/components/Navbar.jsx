import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span style={{
          width: 6, height: 6,
          background: 'var(--accent)',
          borderRadius: '50%',
          boxShadow: '0 0 8px var(--accent)',
          display: 'inline-block',
          flexShrink: 0
        }} />
        let's.get.smarter
      </Link>

      <Link to="/explore">Explore</Link>

      {!user && <Link to="/login">Sign in</Link>}
      {!user && <Link to="/register">Register</Link>}

      {user && <Link to="/editor" className="navbar-new">+ New</Link>}
      {user && (
        <span className="navbar-user">
          {user.email?.split('@')[0]}
        </span>
      )}
      {user && (
        <button className="navbar-btn" onClick={handleLogout}>
          Sign out
        </button>
      )}
    </nav>
  )
}

export default Navbar
