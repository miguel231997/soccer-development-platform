import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleBasedRoute({ children, roles }) {
  const { user, loading, hasRole } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  const allowed = roles.some((r) => hasRole(r))
  if (!allowed) return <Navigate to="/dashboard" replace />

  return children
}
