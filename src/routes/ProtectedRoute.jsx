import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ role }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) return <Navigate to="/" replace />

  return <Outlet />
}
