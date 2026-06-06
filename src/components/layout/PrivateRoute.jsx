import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'

export default function PrivateRoute({ children }) {
  const { user, isActive, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isActive) {
    return <Navigate to="/suscribirse" state={{ from: location }} replace />
  }

  return children
}
