import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import AuthCallback from './pages/AuthCallback'
import ExplorePage from './pages/ExplorePage'
import MaterialPage from './pages/MaterialPage'
import EditorPage from './pages/EditorPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/materials/:slug" element={<MaterialPage />} />
        <Route path="/editor" element={
          <ProtectedRoute><EditorPage /></ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute><EditorPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App