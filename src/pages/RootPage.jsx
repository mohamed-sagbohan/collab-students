import { Navigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import Landing from './Landing'
import LoadingScreen from '../components/LoadingScreen'

export default function RootPage() {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Landing />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  if (profile?.role === 'formateur') return <Navigate to="/formateur" replace />
  return <Navigate to="/dashboard" replace />
}
