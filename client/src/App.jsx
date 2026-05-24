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
import ProfilePage from './pages/ProfilePage'
import ErrorBoundary from './components/ErrorBoundary'

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

        {/* App routes — protected + error boundary */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ExplorePage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/materials/:slug" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MaterialPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />

        {/* Create flow — 3 steps */}
        <Route path="/editor" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MetadataStep />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/editor/content" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ContentStep />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/editor/review" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ReviewStep />
            </ErrorBoundary>
          </ProtectedRoute>
        } />

        {/* Edit flow — same 3 steps, pre-filled */}
        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MetadataStep />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/editor/:id/content" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ContentStep />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/editor/:id/review" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ReviewStep />
            </ErrorBoundary>
          </ProtectedRoute>
        } />

        {/* Own profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ProfilePage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />

        {/* Public profile */}
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <ProfilePage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App