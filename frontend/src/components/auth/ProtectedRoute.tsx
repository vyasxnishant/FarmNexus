import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDashboard } from '../../context/DashboardContext'
import { RefreshCw } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('FARMER' | 'BUYER' | 'ADMIN')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated, isLoadingAuth } = useDashboard()
  const location = useLocation()

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-monsoon flex flex-col items-center justify-center text-wheat space-y-4">
        <RefreshCw className="w-10 h-10 text-turmeric animate-spin" />
        <p className="font-serif text-lg font-semibold">Verifying Secure FarmNexus Session...</p>
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.user_type)) {
    // Redirect to Access Denied page with attempted path
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

