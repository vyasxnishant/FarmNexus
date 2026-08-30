import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Sprout,
  Users,
  Tag,
  CreditCard,
  Bell,
  User,
  Plus,
  ArrowLeft,
  Building2,
  Search,
  Receipt,
  Truck,
  Package,
  Activity,
  DollarSign,
  UserCheck,
  LogOut,
  ShieldCheck,
  Scale
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

interface NavItem {
  name: string
  path: string
  exact?: boolean
  icon: any
  badge?: number
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout, notifications, setIsListModalOpen, lang } = useDashboard()

  const userType = currentUser?.user_type || 'FARMER'
  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const farmerNavItems: NavItem[] = [
    {
      name: lang === 'en' ? 'Overview' : 'अवलोकन',
      path: '/farmer',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: lang === 'en' ? 'Market Intelligence' : 'मंडी भाव व विश्लेषण',
      path: '/farmer/market-intelligence',
      icon: Scale,
    },
    {
      name: lang === 'en' ? 'Mandi Price Comparison' : 'मंडी भाव तुलना',
      path: '/farmer/market-prices',
      icon: TrendingUp,
    },
    {
      name: lang === 'en' ? 'Logistics & Transit' : 'परिवहन व लॉजिस्टिक्स',
      path: '/farmer/logistics',
      icon: Truck,
    },
    {
      name: lang === 'en' ? 'Nearby Warehousing' : 'गोदाम व भंडारण',
      path: '/farmer/storage',
      icon: Building2,
    },
    {
      name: lang === 'en' ? 'My Crops & Lots' : 'मेरी फसलें व लॉट',
      path: '/farmer/lots',
      icon: Sprout,
    },
    {
      name: lang === 'en' ? 'Buyer Matches' : 'खरीदार मिलान',
      path: '/farmer/buyers',
      icon: Users,
    },
    {
      name: lang === 'en' ? 'Incoming Offers' : 'प्राप्त ऑफ़र',
      path: '/farmer/offers',
      icon: Tag,
    },
    {
      name: lang === 'en' ? 'Payments & Escrow' : 'भुगतान व लेनदेन',
      path: '/farmer/payments',
      icon: CreditCard,
    },
    {
      name: lang === 'en' ? 'Notifications' : 'सूचनाएं',
      path: '/farmer/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: lang === 'en' ? 'Personal Profile' : 'मेरी प्रोफ़ाइल',
      path: '/farmer/profile',
      icon: User,
    },
  ]

  const buyerNavItems: NavItem[] = [
    {
      name: lang === 'en' ? 'Buyer Overview' : 'खरीदार डैशबोर्ड',
      path: '/buyer/dashboard',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: lang === 'en' ? 'Browse Produce Lots' : 'फसल लॉट खोजें',
      path: '/buyer/lots',
      icon: Search,
    },
    {
      name: lang === 'en' ? 'My Bids & Offers' : 'मेरे ऑफ़र व बोलियां',
      path: '/buyer/offers',
      icon: Receipt,
    },
    {
      name: lang === 'en' ? 'Deals & Escrow' : 'लेनदेन व एस्क्रो',
      path: '/buyer/transactions',
      icon: CreditCard,
    },
    {
      name: lang === 'en' ? 'Transit & Logistics' : 'परिवहन लॉजिस्टिक्स',
      path: '/buyer/logistics',
      icon: Truck,
    },
    {
      name: lang === 'en' ? 'Warehousing Directory' : 'भंडारण डायरेक्टरी',
      path: '/buyer/storage',
      icon: Building2,
    },
    {
      name: lang === 'en' ? 'Market Intelligence' : 'मंडी भाव विश्लेषण',
      path: '/buyer/market-intelligence',
      icon: Scale,
    },
    {
      name: lang === 'en' ? 'Mandi Comparison' : 'मंडी भाव तुलना',
      path: '/buyer/market-prices',
      icon: TrendingUp,
    },
    {
      name: lang === 'en' ? 'Buyer Profile' : 'खरीदार प्रोफ़ाइल',
      path: '/buyer/profile',
      icon: User,
    },
  ]

  const adminNavItems: NavItem[] = [
    {
      name: 'Admin Dashboard',
      path: '/admin/dashboard',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: 'Users Directory',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Farmer Profiles',
      path: '/admin/farmers',
      icon: UserCheck,
    },
    {
      name: 'Buyer Directory',
      path: '/admin/buyers',
      icon: Building2,
    },
    {
      name: 'Lot Management',
      path: '/admin/lots',
      icon: Package,
    },
    {
      name: 'Market Price Feeds',
      path: '/admin/market-prices',
      icon: TrendingUp,
    },
    {
      name: 'Commercial Offers',
      path: '/admin/offers',
      icon: Receipt,
    },
    {
      name: 'Trade Transactions',
      path: '/admin/transactions',
      icon: CreditCard,
    },
    {
      name: 'Payment Monitoring',
      path: '/admin/payments',
      icon: DollarSign,
    },
    {
      name: 'Activity Logs',
      path: '/admin/logs',
      icon: Activity,
    },
  ]

  const navItems = userType === 'ADMIN' ? adminNavItems : userType === 'BUYER' ? buyerNavItems : farmerNavItems

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
    <aside className="w-64 bg-monsoon border-r border-wheat/10 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 pb-4 border-b border-wheat/10">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="FarmNexus Logo"
              className="w-10 h-10 rounded-xl object-cover border border-wheat/20 shadow-sm"
            />
            <div>
              <span className="font-serif text-xl font-bold text-wheat tracking-tight group-hover:text-turmeric transition-colors block leading-none">
                FarmNexus
              </span>
              <span className="font-mono text-[9px] uppercase font-semibold text-turmeric/80 tracking-wider">
                {userType === 'ADMIN' ? 'Admin Desk' : userType === 'BUYER' ? 'Buyer Portal' : 'Farmer Produce Hub'}
              </span>
            </div>
          </Link>
        </div>

        {/* Action Button for Farmer */}
        {userType === 'FARMER' && (
          <div className="px-4 py-3">
            <button
              onClick={() => setIsListModalOpen(true)}
              className="w-full py-2.5 px-4 bg-turmeric text-monsoon font-body font-bold text-xs rounded-xl hover:bg-turmeric/90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'List New Produce Lot' : 'नया लॉट बनाएं'}</span>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)

            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-body text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-wheat text-soil font-semibold shadow-sm'
                    : 'text-wheat/70 hover:text-wheat hover:bg-wheat/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-monsoon' : 'text-turmeric'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-turmeric text-monsoon">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom User Info & Logout Button */}
      <div className="p-4 border-t border-wheat/10 space-y-3 bg-monsoon">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-wheat/5 border border-wheat/10">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-turmeric text-monsoon flex items-center justify-center font-serif text-xs font-bold shrink-0">
              {getInitials(currentUser?.name)}
            </div>
            <div className="overflow-hidden">
              <p className="font-body text-xs font-semibold text-wheat truncate">
                {currentUser?.name || 'Authorized User'}
              </p>
              <p className="font-mono text-[10px] text-turmeric/80 truncate">
                {currentUser?.user_type} {currentUser?.kyc_verified && '• KYC Verified'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-wheat/60 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-[11px] font-body text-wheat/50 hover:text-wheat transition-colors py-1"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>{lang === 'en' ? 'Back to Landing Page' : 'मुख्य पृष्ठ'}</span>
        </Link>
      </div>
    </aside>
  )
}
