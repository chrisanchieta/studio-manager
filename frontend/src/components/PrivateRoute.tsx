import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

interface Props {
  children: React.ReactNode
}

export function PrivateRoute({ children }: Props) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
