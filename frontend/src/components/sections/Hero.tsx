import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useDashboard } from '../../context/DashboardContext'
import { LogIn, UserPlus, LogOut, LayoutDashboard, UserCheck } from 'lucide-react'

interface HeroProps {
  lang: 'en' | 'hi'
}

export function Hero({ lang }: HeroProps) {
  const { currentUser, isAuthenticated, logout } = useDashboard()

  const getDashboardPath = () => {
    if (!currentUser) return '/login'
    if (currentUser.user_type === 'FARMER') return '/farmer'
    if (currentUser.user_type === 'BUYER') return '/buyer/dashboard'
    if (currentUser.user_type === 'ADMIN') return '/admin/dashboard'
    return '/farmer'
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-between">
      {/* Scrim overlay for text legibility over 3D canvas */}
      <div className="absolute inset-0 bg-monsoon/70 backdrop-blur-[1px]" />

      {/* Top Navbar with Brand Logo & Auth Actions */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="FarmNexus Logo"
            className="w-11 h-11 rounded-2xl object-cover border border-wheat/20 shadow-md group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-serif text-2xl font-bold text-wheat tracking-tight group-hover:text-turmeric transition-colors block leading-none">
              FarmNexus
            </span>
            <span className="font-mono text-[10px] uppercase font-medium text-wheat/60 tracking-wider">
              Connecting Agriculture
            </span>
          </div>
        </Link>

        {/* Auth State Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-2.5">
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-body font-bold text-monsoon bg-turmeric hover:bg-turmeric/90 shadow-md transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{lang === 'en' ? 'Dashboard' : 'डैशबोर्ड'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-monsoon animate-pulse" />
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-semibold text-wheat/80 bg-wheat/10 hover:bg-wheat/20 hover:text-wheat transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-body font-bold text-wheat/90 hover:text-wheat bg-wheat/10 hover:bg-wheat/15 border border-wheat/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-turmeric" />
                <span>{lang === 'en' ? 'Sign In' : 'साइन इन'}</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-body font-bold text-monsoon bg-turmeric hover:bg-turmeric/90 shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Register' : 'रजिस्टर'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-12 my-auto">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-wheat leading-tight mb-6">
          {lang === 'en'
            ? 'Every harvest deserves a fair price.'
            : 'हर फसल को उचित मूल्य मिलना चाहिए।'}
        </h1>

        <p className="font-body text-lg md:text-xl text-wheat/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          {lang === 'en'
            ? 'FarmNexus connects farmers and FPOs to verified buyers with real-time mandi prices, quality grading, and transparent deals.'
            : 'FarmNexus किसानों और FPOs को रियल-टाइम मंडी भाव, गुणवत्ता ग्रेडिंग और पारदर्शी सौदों के साथ सत्यापित खरीदारों से जोड़ता है।'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={isAuthenticated && currentUser?.user_type === 'FARMER' ? '/farmer/lots/create' : '/register?role=farmer'}>
            <Button variant="fill" size="lg">
              {lang === 'en' ? 'List Your Produce' : 'अपनी उपज लिस्ट करें'}
            </Button>
          </Link>
          <Link to={isAuthenticated && currentUser?.user_type === 'BUYER' ? '/buyer/lots' : '/register?role=buyer'}>
            <Button variant="outline" size="lg">
              {lang === 'en' ? 'Source Verified Crops' : 'सत्यापित फसलें खोजें'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-wheat/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-wheat/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
