import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export function LoginView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, lang } = useDashboard()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as any)?.from?.pathname || null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email/mobile and password.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const user = await login(email.trim(), password)

      // Determine redirect path based strictly on server database role
      if (from && !from.startsWith('/admin')) {
        navigate(from, { replace: true })
      } else if (user.user_type === 'FARMER') {
        navigate('/farmer', { replace: true })
      } else if (user.user_type === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true })
      } else if (user.user_type === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/farmer', { replace: true })
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-monsoon flex flex-col justify-between relative overflow-hidden py-12 px-6">
      {/* Background Graphic Accents */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #5FD0C0 1px, transparent 1px), radial-gradient(circle, #E4A335 1px, transparent 1px)',
          backgroundSize: '40px 40px, 60px 60px',
        }}
      />

      {/* Header with Logo */}
      <div className="relative z-10 max-w-md w-full mx-auto text-center">
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
              Secure Gateway
            </span>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto">
        <div className="bg-wheat rounded-3xl p-8 sm:p-10 shadow-2xl border border-soil/15 text-soil space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-3xl font-bold text-soil">
              {lang === 'en' ? 'Sign In to FarmNexus' : 'FarmNexus में साइन इन करें'}
            </h2>
            <p className="font-body text-xs text-soil/70">
              {lang === 'en'
                ? 'Enter your registered credentials to access your portal'
                : 'अपने पोर्टल तक पहुंचने के लिए पंजीकृत क्रेडेंशियल दर्ज करें'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-body flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                {lang === 'en' ? 'Email or Mobile Number' : 'ईमेल या मोबाइल नंबर'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                <input
                  type="text"
                  required
                  placeholder="e.g. name@farmnexus.in / 9826144520"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-body text-xs font-semibold text-soil">
                  {lang === 'en' ? 'Password' : 'पासवर्ड'}
                </label>
                <span className="text-[11px] text-soil/50 font-body">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-turmeric text-monsoon font-body font-bold text-sm hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{lang === 'en' ? 'Sign In' : 'साइन इन करें'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="font-body text-xs text-soil/70">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-turmeric hover:underline">
                Register as Farmer or Buyer
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="relative z-10 text-center text-wheat/40 font-body text-xs mt-6">
        <p>FarmNexus Platform • Direct APMC & e-NAM Agri-Trading Rails</p>
      </div>
    </div>
  )
}
