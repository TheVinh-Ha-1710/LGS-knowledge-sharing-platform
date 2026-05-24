import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'

function Navbar() {
  const { user, logout, streak } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  // Check if a path is active for nav link styling
  function isActive(path) {
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-dot" />
        let's.get.smarter
      </Link>

      {/* Nav links — only when logged in */}
      {user && (
        <Link
          to="/explore"
          className={isActive('/explore') || isActive('/materials') ? 'active' : ''}
        >
          Explore
        </Link>
      )}

      {/* Auth links — only when logged out */}
      {!user && <Link to="/login">Sign in</Link>}
      {!user && <Link to="/register">Register</Link>}

      {/* Spacer pushes right-side items to the edge */}
      <div className="navbar-spacer" />

      {/* Streak indicator */}
      {user && streak > 0 && (
        <span className="navbar-streak">🔥 {streak}</span>
      )}

      {/* Profile link — username */}
      {user && (
        <Link
          to="/profile"
          className={isActive('/profile') ? 'active' : ''}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
        >
          {user.email?.split('@')[0]}
        </Link>
      )}

      {/* New material button */}
      {user && (
        <Link to="/editor" className="navbar-new">
          + New
        </Link>
      )}

      {/* Theme toggle */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Sign out */}
      {user && (
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-3)',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.15s'
          }}
        >
          Sign out
        </button>
      )}
    </nav>
  )
}

export default Navbar
