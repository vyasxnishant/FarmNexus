import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: ('farmer' | 'buyer' | 'admin')[]
}

export function RoleGuard({ children, allowedRoles = ['admin'] }: RoleGuardProps) {
  const { currentUser, isAuthenticated } = useDashboard()

  const normalizedRole = currentUser?.user_type?.toLowerCase() || 'guest'
  const hasAccess = isAuthenticated && currentUser && (
    (allowedRoles.includes('admin') && currentUser.user_type === 'ADMIN') ||
    (allowedRoles.includes('farmer') && currentUser.user_type === 'FARMER') ||
    (allowedRoles.includes('buyer') && currentUser.user_type === 'BUYER')
  )

  if (!hasAccess) {
    return (
      <div className="bg-wheat rounded-3xl border-2 border-red-500/20 p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-500/15 text-red-700 border border-red-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-700 bg-red-500/10 px-3 py-1 rounded-full">
            ROLE ACCESS RESTRICTION &bull; ACCESS DENIED
          </span>
          <h2 className="font-serif text-3xl font-bold text-soil">
            Access Denied
          </h2>
          <p className="font-body text-xs text-soil/70 max-w-md mx-auto leading-relaxed">
            Administrative control desk access is restricted strictly to authenticated Administrator accounts.
            {currentUser ? (
              <> You are currently logged in as a <strong>{currentUser.user_type}</strong> ({currentUser.email}).</>
            ) : (
              <> Please log in with authorized administrator credentials.</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to={currentUser?.user_type === 'BUYER' ? '/buyer/dashboard' : '/farmer'}
            className="px-6 py-3 bg-turmeric text-monsoon font-body text-xs font-bold rounded-xl hover:bg-turmeric/90 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Return to Authorized Dashboard</span>
          </Link>

          <Link
            to="/login"
            className="px-5 py-3 bg-monsoon text-wheat font-body text-xs font-semibold rounded-xl hover:bg-monsoon/90 transition-all"
          >
            Sign In as Admin
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

