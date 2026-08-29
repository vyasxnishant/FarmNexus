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
  Truck
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
  const { profile, buyerProfile, notifications, setIsListModalOpen, lang } = useDashboard()

  const isBuyerRoute = location.pathname.startsWith('/buyer')
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

  const navItems = isBuyerRoute ? buyerNavItems : farmerNavItems

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
                Connecting Agriculture
              </span>
            </div>
          </Link>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-wheat/10">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase font-semibold text-turmeric bg-wheat/10 px-2 py-0.5 rounded">
                {isBuyerRoute ? 'BUYER PORTAL' : 'FARMER PORTAL'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-datateal animate-pulse" />
            </div>

            <Link
              to={isBuyerRoute ? '/farmer' : '/buyer/dashboard'}
              className="text-[11px] font-body text-turmeric hover:underline flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{isBuyerRoute ? 'Farmer' : 'Buyer'}</span>
            </Link>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-4">
          {isBuyerRoute ? (
            <Link
              to="/buyer/lots"
              className="w-full bg-turmeric text-monsoon font-body font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-turmeric/90 active:bg-turmeric/80 shadow-md transition-all cursor-pointer text-xs"
            >
              <Search className="w-4 h-4" />
              <span>{lang === 'en' ? 'Browse Farmer Lots' : 'फसल लॉट खोजें'}</span>
            </Link>
          ) : (
            <button
              onClick={() => setIsListModalOpen(true)}
              className="w-full bg-turmeric text-monsoon font-body font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-turmeric/90 active:bg-turmeric/80 shadow-md transition-all cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'List Your Produce' : 'उपज सूचीबद्ध करें'}</span>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
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

        {isBuyerRoute ? (
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
