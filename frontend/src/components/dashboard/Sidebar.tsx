import { Link, useLocation } from 'react-router-dom'
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
  ShieldCheck,
  Scale,
  Building2,
  Search,
  Receipt,
  ArrowRightLeft,
  Truck,
  Package,
  Activity,
  DollarSign,
  UserCheck,
  Lock
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
  const { profile, buyerProfile, notifications, setIsListModalOpen, lang, userRole, setUserRole } = useDashboard()

  const isBuyerRoute = location.pathname.startsWith('/buyer')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const unreadCount = notifications.filter(n => !n.read).length

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
      name: lang === 'en' ? 'Farmer Profile' : 'किसान प्रोफ़ाइल',
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
      path: '/farmer/logistics',
      icon: Truck,
    },
    {
      name: lang === 'en' ? 'Warehousing Directory' : 'भंडारण डायरेक्टरी',
      path: '/farmer/storage',
      icon: Building2,
    },
    {
      name: lang === 'en' ? 'Market Intelligence' : 'मंडी भाव विश्लेषण',
      path: '/farmer/market-intelligence',
      icon: Scale,
    },
    {
      name: lang === 'en' ? 'Mandi Comparison' : 'मंडी भाव तुलना',
      path: '/farmer/market-prices',
      icon: TrendingUp,
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

  const navItems = isAdminRoute ? adminNavItems : isBuyerRoute ? buyerNavItems : farmerNavItems

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
                {isAdminRoute ? 'Admin Control Portal' : isBuyerRoute ? 'Buyer Sourcing Desk' : 'Farmer Produce Hub'}
              </span>
            </div>
          </Link>
        </div>

        {/* Portal Switcher & Action */}
        <div className="px-4 py-3 space-y-2">
          {/* Quick Role Switcher Bar */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-wheat/5 border border-wheat/10 rounded-xl">
            <Link
              to="/farmer"
              onClick={() => setUserRole('farmer')}
              className={`py-1 text-[10px] font-mono font-bold rounded-lg text-center transition-all ${
                !isBuyerRoute && !isAdminRoute ? 'bg-turmeric text-monsoon shadow-xs' : 'text-wheat/60 hover:text-wheat'
              }`}
            >
              Farmer
            </Link>
            <Link
              to="/buyer/dashboard"
              onClick={() => setUserRole('buyer')}
              className={`py-1 text-[10px] font-mono font-bold rounded-lg text-center transition-all ${
                isBuyerRoute ? 'bg-turmeric text-monsoon shadow-xs' : 'text-wheat/60 hover:text-wheat'
              }`}
            >
              Buyer
            </Link>
            <Link
              to="/admin/dashboard"
              onClick={() => setUserRole('admin')}
              className={`py-1 text-[10px] font-mono font-bold rounded-lg text-center transition-all ${
                isAdminRoute ? 'bg-turmeric text-monsoon shadow-xs' : 'text-wheat/60 hover:text-wheat'
              }`}
            >
              Admin
            </Link>
          </div>

          {!isBuyerRoute && !isAdminRoute && (
            <button
              onClick={() => setIsListModalOpen(true)}
              className="w-full py-2.5 px-4 bg-turmeric text-monsoon font-body font-bold text-xs rounded-xl hover:bg-turmeric/90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'List New Produce Lot' : 'नया लॉट बनाएं'}</span>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-290px)]">
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

      {/* Bottom Profile / Role Switch Link */}
      <div className="p-4 border-t border-wheat/10 space-y-3 bg-monsoon">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-body text-wheat/60 hover:text-wheat transition-colors px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Back to Landing Page' : 'मुख्य पृष्ठ पर लौटें'}</span>
        </Link>

        {isAdminRoute ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-wheat/5 border border-wheat/10">
            <div className="w-8 h-8 rounded-lg bg-turmeric text-monsoon flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="font-body text-xs font-semibold text-wheat truncate">Admin Operations</p>
              <p className="font-body text-[10px] text-wheat/50 truncate">Bhopal State HQ</p>
            </div>
          </div>
        ) : isBuyerRoute ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-wheat/5 border border-wheat/10">
            <div className="w-8 h-8 rounded-lg bg-turmeric text-monsoon flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
              AC
            </div>
            <div className="overflow-hidden">
              <p className="font-body text-xs font-semibold text-wheat truncate">{buyerProfile.company}</p>
              <p className="font-body text-[10px] text-wheat/50 truncate">{buyerProfile.name}</p>
            </div>
          </div>
        ) : (
          <Link
            to="/farmer/profile"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-wheat/5 hover:bg-wheat/10 transition-colors border border-wheat/10"
          >
            <div className="w-8 h-8 rounded-lg bg-turmeric text-monsoon flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
              RP
            </div>
            <div className="overflow-hidden">
              <p className="font-body text-xs font-semibold text-wheat truncate">{profile.name}</p>
              <p className="font-body text-[10px] text-wheat/50 truncate">{profile.village}</p>
            </div>
          </Link>
        )}
      </div>
    </aside>
  )
}
