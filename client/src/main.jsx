import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { EditorProvider } from './context/EditorContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './context/ToastContext.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EditorProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </EditorProvider>
    </AuthProvider>
  </QueryClientProvider>
)
