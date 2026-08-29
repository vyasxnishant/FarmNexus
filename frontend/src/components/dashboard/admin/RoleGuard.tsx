import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: ('farmer' | 'buyer' | 'admin')[]
}

export function RoleGuard({ children, allowedRoles = ['admin'] }: RoleGuardProps) {
  const { userRole, setUserRole } = useDashboard()

  const hasAccess = allowedRoles.includes(userRole)

  if (!hasAccess) {
    return (
      <div className="bg-wheat rounded-3xl border-2 border-soil/20 p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-900 border border-amber-400/40 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-amber-700" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-turmeric bg-monsoon px-3 py-1 rounded-full">
            ROLE ACCESS RESTRICTION &bull; DEMO MODE
          </span>
          <h2 className="font-serif text-3xl font-bold text-soil">
            Admin Access Required
          </h2>
          <p className="font-body text-xs text-soil/70 max-w-md mx-auto leading-relaxed">
            You are currently viewing FarmNexus in <strong>{userRole.toUpperCase()}</strong> mode. The administrative control desk is restricted to authorized state operations staff.
          </p>
        </div>

        <div className="p-4 bg-soil/5 rounded-2xl border border-soil/10 text-left text-xs font-body text-soil/80 space-y-2">
          <div className="flex items-center gap-2 font-bold text-soil">
            <ShieldCheck className="w-4 h-4 text-turmeric" />
            <span>Frontend Role Simulation Notice:</span>
          </div>
          <p>
            In production, authentication is enforced on the server via signed JWT sessions. In this interactive demo sandbox, you can switch your active role instantly:
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setUserRole('admin')}
            className="px-6 py-3 bg-turmeric text-monsoon font-body text-xs font-bold rounded-xl hover:bg-turmeric/90 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to Admin Role & Open Desk</span>
          </button>

          <Link
            to="/farmer"
            className="px-5 py-3 bg-monsoon text-wheat font-body text-xs font-semibold rounded-xl hover:bg-monsoon/90 transition-all"
          >
            Return to Farmer Hub
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

