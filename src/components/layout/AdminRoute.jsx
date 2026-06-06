import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  // Not logged in → send to login preserving destination
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // Logged in but not admin → back to app
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}
