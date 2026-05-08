import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import AuthCallback from './pages/AuthCallback'
import ExplorePage from './pages/ExplorePage'
import MaterialPage from './pages/MaterialPage'
import MetadataStep from './pages/editor/MetadataStep'
import ContentStep from './pages/editor/ContentStep'
import ReviewStep from './pages/editor/ReviewStep'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Auth routes — public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* App routes — protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute><ExplorePage /></ProtectedRoute>
        } />
        <Route path="/materials/:slug" element={
          <ProtectedRoute><MaterialPage /></ProtectedRoute>
        } />

        {/* Create flow — 3 steps */}
        <Route path="/editor" element={
          <ProtectedRoute><MetadataStep /></ProtectedRoute>
        } />
        <Route path="/editor/content" element={
          <ProtectedRoute><ContentStep /></ProtectedRoute>
        } />
        <Route path="/editor/review" element={
          <ProtectedRoute><ReviewStep /></ProtectedRoute>
        } />

        {/* Edit flow — same 3 steps, pre-filled */}
        <Route path="/editor/:id" element={
          <ProtectedRoute><MetadataStep /></ProtectedRoute>
        } />
        <Route path="/editor/:id/content" element={
          <ProtectedRoute><ContentStep /></ProtectedRoute>
        } />
        <Route path="/editor/:id/review" element={
          <ProtectedRoute><ReviewStep /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App