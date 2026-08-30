import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  Plus,
  MapPin,
  Menu,
  X,
  Building2,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { LanguageToggle } from '../ui/LanguageToggle'
import { Button } from '../ui/Button'

export function Header({
  onMobileMenuToggle,
  isMobileMenuOpen,
}: {
  onMobileMenuToggle: () => void
  isMobileMenuOpen: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout, notifications, setIsListModalOpen, lang, toggleLang } = useDashboard()
  
  const userType = currentUser?.user_type || 'FARMER'
  const isBuyer = userType === 'BUYER'
  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getInitials = (name?: string | null): string => {
    if (!name || typeof name !== 'string') return 'FN'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'FN'
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    const first = parts[0].charAt(0)
    const second = parts[1].charAt(0)
    return `${first}${second}`.toUpperCase()
  }

  return (
    <header className="sticky top-0 z-20 bg-monsoon border-b border-wheat/10 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Hamburger & Brand/Search */}
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-wheat/80 hover:text-wheat hover:bg-wheat/10 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="FarmNexus"
            className="w-8 h-8 rounded-lg object-cover border border-wheat/20"
          />
          <span className="font-serif text-lg font-bold text-wheat">FarmNexus</span>
        </Link>

        {/* User Location Badge */}
        <div className="hidden sm:flex items-center gap-1.5 font-body text-xs text-wheat/80 bg-wheat/5 border border-wheat/10 px-3 py-1.5 rounded-full">
          {isBuyer ? (
            <>
              <Building2 className="w-3.5 h-3.5 text-turmeric" />
              <span>{currentUser?.location || 'Central Procurement Hub'}</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-turmeric" />
              <span>{currentUser?.district || currentUser?.location || 'Mandi Hub (MP)'}</span>
            </>
          )}
        </div>

        {/* Verified KYC Tag */}
        {currentUser?.kyc_verified && (
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-datateal/15 text-datateal border border-datateal/30 text-[11px] font-body font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KYC Verified</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <LanguageToggle lang={lang} onToggle={toggleLang} />

        {/* Notification Bell */}
        <Link
          to={userType === 'FARMER' ? '/farmer/notifications' : userType === 'BUYER' ? '/buyer/notifications' : '/admin/notifications'}
          className="relative p-2 rounded-xl text-wheat/70 hover:text-wheat hover:bg-wheat/10 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-turmeric text-monsoon font-mono text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Quick Action */}
        {userType === 'BUYER' ? (
          <Link
            to="/buyer/lots"
            className="hidden md:flex items-center gap-1.5 text-xs py-2 px-4 rounded-lg bg-turmeric text-monsoon font-body font-bold hover:bg-turmeric/90 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Lots</span>
          </Link>
        ) : userType === 'FARMER' ? (
          <Button
            variant="fill"
            size="md"
            onClick={() => setIsListModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'List Produce' : 'उपज जोड़ें'}</span>
          </Button>
        ) : null}

        {/* Profile Chip & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-wheat/10">
          <Link
            to={userType === 'FARMER' ? '/farmer/profile' : userType === 'BUYER' ? '/buyer/profile' : '/admin/profile'}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-turmeric text-monsoon flex items-center justify-center font-serif text-xs font-bold">
              {getInitials(currentUser?.name)}
            </div>
            <span className="hidden lg:block font-body text-xs font-semibold text-wheat truncate max-w-[130px]">
              {currentUser?.name || 'User Profile'}
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-wheat/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
