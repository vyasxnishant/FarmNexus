import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  Search,
  Plus,
  MapPin,
  Menu,
  X,
  Languages,
  ShieldCheck,
  Building2,
  ArrowRightLeft
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
  const { profile, buyerProfile, notifications, setIsListModalOpen, lang, toggleLang } = useDashboard()
  
  const isBuyer = location.pathname.startsWith('/buyer')
  const unreadCount = notifications.filter(n => !n.read).length

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

        {/* Hub / Location Pin */}
        <div className="hidden sm:flex items-center gap-1.5 font-body text-xs text-wheat/80 bg-wheat/5 border border-wheat/10 px-3 py-1.5 rounded-full">
          {isBuyer ? (
            <>
              <Building2 className="w-3.5 h-3.5 text-turmeric" />
              <span>{buyerProfile.deliveryLocation}</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-turmeric" />
              <span>{profile.district} APMC Hub (MP)</span>
            </>
          )}
        </div>

        {/* Quick Role Switcher Pill */}
        <Link
          to={isBuyer ? '/farmer' : '/buyer/dashboard'}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-turmeric/15 text-turmeric border border-turmeric/30 hover:bg-turmeric/25 text-xs font-mono font-semibold transition-colors"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Switch to {isBuyer ? 'Farmer Portal' : 'Buyer Hub'}</span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <LanguageToggle lang={lang} onToggle={toggleLang} />

        {/* Notification Bell */}
        <Link
          to="/farmer/notifications"
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
        {isBuyer ? (
          <Link
            to="/buyer/lots"
            className="hidden md:flex items-center gap-1.5 text-xs py-2 px-4 rounded-lg bg-turmeric text-monsoon font-body font-bold hover:bg-turmeric/90 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Lots</span>
          </Link>
        ) : (
          <Button
            variant="fill"
            size="md"
            onClick={() => setIsListModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'List Produce' : 'उपज जोड़ें'}</span>
          </Button>
        )}

        {/* Profile Chip */}
        {isBuyer ? (
          <Link
            to="/buyer/dashboard"
            className="flex items-center gap-2 pl-2 border-l border-wheat/10"
          >
            <div className="w-8 h-8 rounded-lg bg-turmeric text-monsoon flex items-center justify-center font-serif text-xs font-bold">
              AC
            </div>
            <span className="hidden lg:block font-body text-xs font-semibold text-wheat truncate max-w-[120px]">
              {buyerProfile.company.split(' ')[0]}
            </span>
          </Link>
        ) : (
          <Link
            to="/farmer/profile"
            className="flex items-center gap-2 pl-2 border-l border-wheat/10"
          >
            <div className="w-8 h-8 rounded-lg bg-turmeric text-monsoon flex items-center justify-center font-serif text-xs font-bold">
              RP
            </div>
            <span className="hidden lg:block font-body text-xs font-semibold text-wheat">
              {profile.name}
            </span>
          </Link>
        )}
      </div>
    </header>
  )
}
