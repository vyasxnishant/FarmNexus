import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export function UnauthorizedView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout, lang } = useDashboard()

  const userRole = currentUser?.user_type || 'GUEST'
  const attemptedPath = (location.state as any)?.from || (location.state as any)?.attemptedPath || ''

  const getDashboardPath = () => {
    if (userRole === 'FARMER') return '/farmer'
    if (userRole === 'BUYER') return '/buyer/dashboard'
    if (userRole === 'ADMIN') return '/admin/dashboard'
    return '/'
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-monsoon flex flex-col justify-between relative overflow-hidden py-12 px-6">
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #5FD0C0 1px, transparent 1px), radial-gradient(circle, #E4A335 1px, transparent 1px)',
          backgroundSize: '40px 40px, 60px 60px',
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 max-w-xl w-full mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-3 group mb-4">
          <img
            src="/logo.jpg"
            alt="FarmNexus Logo"
            className="w-12 h-12 rounded-2xl object-cover border border-wheat/20 shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="text-left">
            <span className="font-serif text-2xl font-bold text-wheat tracking-tight block leading-none">
              FarmNexus
            </span>
            <span className="font-mono text-[10px] uppercase font-medium text-turmeric tracking-wider">
              Security & Authorization Desk
            </span>
          </div>
        </Link>
      </div>

      {/* Access Denied Main Card */}
      <div className="relative z-10 max-w-lg w-full mx-auto my-auto">
        <div className="bg-wheat rounded-3xl p-8 sm:p-10 shadow-2xl border border-soil/15 text-soil text-center space-y-6">
          {/* Warning Icon Badge */}
          <div className="w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/30 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-700 bg-red-500/10 px-3 py-1 rounded-full inline-block">
              HTTP 403 &bull; FORBIDDEN
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-soil">
              {lang === 'en' ? 'Access Denied' : 'पहुंच अस्वीकृत'}
            </h1>
            <p className="font-body text-xs sm:text-sm text-soil/80 max-w-md mx-auto leading-relaxed">
              {lang === 'en'
                ? "You don't have permission to access this area. This section is restricted to authorized roles only."
                : 'आपके पास इस अनुभाग तक पहुंचने की अनुमति नहीं है। यह अनुभाग केवल अधिकृत खातों के लिए सुरक्षित है।'}
            </p>
          </div>

          {/* User Session Info */}
          {currentUser && (
            <div className="p-4 bg-monsoon text-wheat rounded-2xl text-left border border-turmeric/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-wheat/60 font-body">Current Session</span>
                <span className="font-mono text-turmeric font-bold px-2 py-0.5 rounded bg-turmeric/10 border border-turmeric/30">
                  {currentUser.user_type} ACCOUNT
                </span>
              </div>
              <p className="font-serif text-sm font-bold text-wheat">{currentUser.name}</p>
              <p className="font-mono text-[11px] text-wheat/70">{currentUser.email}</p>
              {attemptedPath && (
                <p className="font-mono text-[10px] text-red-300 pt-1 border-t border-wheat/10">
                  Attempted Route: <span className="underline">{attemptedPath}</span>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              to={getDashboardPath()}
              className="w-full py-3 rounded-xl bg-turmeric text-monsoon font-body font-bold text-sm hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Your Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-soil/10 text-soil font-body font-semibold text-xs hover:bg-soil/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign In with a Different Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="relative z-10 text-center text-wheat/40 font-body text-xs mt-6">
        <p>FarmNexus Platform &bull; Role-Based Access Control & End-to-End Cryptographic Protection</p>
      </div>
    </div>
  )
}
