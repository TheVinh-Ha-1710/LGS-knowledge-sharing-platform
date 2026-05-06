import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    // Check if loading then show waiting screen
    if (loading) {
        return (
            <div className="page">
            <div className="card">
                <div className="logo-badge">
                <span className="logo-dot" />
                auth.sys
                </div>
                <p className="card-subtitle">// verifying session...</p>
            </div>
            </div>
        )
    }

    // if user is null, redirect to login
    // otherwise render children
    if (!user) {
        return <Navigate to="/login" /> 
    }

    return children
}

export default ProtectedRoute