import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

// Always-admin base list, merged with any VITE_ADMIN_EMAILS override so these
// stay admin even if the env var is set.
const BASE_ADMINS = ['sanikommuharshavardhanreddy6@gmail.com', 'info@vikku.in']
const ADMIN_EMAILS = [...BASE_ADMINS, ...(import.meta.env.VITE_ADMIN_EMAILS || '').split(',')]
  .map(e => e.trim().toLowerCase()).filter(Boolean)

export default function AdminGate({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!ADMIN_EMAILS.includes((user.email || '').toLowerCase())) return <Navigate to="/" replace />

  return children
}
