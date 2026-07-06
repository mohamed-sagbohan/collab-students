import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from '../components/LoadingScreen'

// La landing n'est téléchargée que par les visiteurs non connectés.
const Landing = lazy(() => import('./Landing'))

export default function RootPage() {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Landing />
      </Suspense>
    )
  }
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  if (profile?.role === 'formateur') return <Navigate to="/formateur" replace />
  return <Navigate to="/dashboard" replace />
}
