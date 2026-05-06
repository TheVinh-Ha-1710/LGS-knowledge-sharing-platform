import { createContext, useContext, useState, useEffect } from 'react'

// 1. Create the context
const AuthContext = createContext()

// 2. Create a Provider component that wraps your app
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)  // null = not logged in
    const [loading, setLoading] = useState(true) // Start true

    // CHECK AUTH
    async function checkAuth() {
        setLoading(true)

        const res = await fetch('/api/me', {
            credentials: 'include'
        })

        if (res.ok) {
            const data = await res.json()
            setUser(data.user)
        } else {
            setUser(null)
        }

        setLoading(false)
    }

    // LOGIN
    async function login(email, password) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'    // sends cookies cross-origin
    })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error)  // bubble error up to the form
        }

        await checkAuth()  // populate user state after successful login
    }

    // REGISTER
    async function register(email, password) {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'    // sends cookies cross-origin
    })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.error)  // bubble error up to the form
        }
    }

    // LOGOUT
    async function logout() {
        const res = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        })

        setUser(null)
        setLoading(false)
    }

    // 3. Run checkAuth to reload user
    useEffect(() => {
        // don't auto-check on the OAuth callback page — AuthCallback handles it
        if (window.location.pathname === '/auth/callback') return
        checkAuth()
    }, [])

    // 4. Expose values and functions to the whole app
    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
        {children}
        </AuthContext.Provider>
    )
}

// 4. Custom hook so any component can access auth easily
export function useAuth() {
  return useContext(AuthContext)
}