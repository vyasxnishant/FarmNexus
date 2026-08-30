import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Sprout,
  Tag,
  CreditCard,
  Plus,
  Scale,
  Users,
  Search,
  Receipt,
  User,
  Package
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export function MobileNav() {
  const location = useLocation()
  const { currentUser, setIsListModalOpen, lang } = useDashboard()

  const userType = currentUser?.user_type || 'FARMER'

  const farmerNavItems = [
    {
      name: lang === 'en' ? 'Overview' : 'डैशबोर्ड',
      path: '/farmer',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: lang === 'en' ? 'Prices' : 'मंडी भाव',
      path: '/farmer/market-intelligence',
      icon: Scale,
    },
    {
      name: lang === 'en' ? 'Lots' : 'लॉट',
      path: '/farmer/lots',
      icon: Sprout,
    },
    {
      name: lang === 'en' ? 'Offers' : 'ऑफ़र',
      path: '/farmer/offers',
      icon: Tag,
    },
    {
      name: lang === 'en' ? 'Payments' : 'भुगतान',
      path: '/farmer/payments',
      icon: CreditCard,
    },
  ]

  const buyerNavItems = [
    {
      name: lang === 'en' ? 'Overview' : 'डैशबोर्ड',
      path: '/buyer/dashboard',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: lang === 'en' ? 'Browse' : 'खोजें',
      path: '/buyer/lots',
      icon: Search,
    },
    {
      name: lang === 'en' ? 'Bids' : 'बोलियां',
      path: '/buyer/offers',
      icon: Receipt,
    },
    {
      name: lang === 'en' ? 'Deals' : 'लेनदेन',
      path: '/buyer/transactions',
      icon: CreditCard,
    },
    {
      name: lang === 'en' ? 'Profile' : 'प्रोफ़ाइल',
      path: '/buyer/profile',
      icon: User,
    },
  ]

  const adminNavItems = [
    {
      name: 'Admin',
      path: '/admin/dashboard',
      exact: true,
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Lots',
      path: '/admin/lots',
      icon: Package,
    },
    {
      name: 'Deals',
      path: '/admin/transactions',
      icon: CreditCard,
    },
    {
      name: 'Profile',
      path: '/admin/profile',
      icon: User,
    },
  ]

  const navItems = userType === 'ADMIN' ? adminNavItems : userType === 'BUYER' ? buyerNavItems : farmerNavItems

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-monsoon border-t border-wheat/10 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)

        const Icon = item.icon

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-center min-w-[54px] transition-colors ${
              isActive ? 'text-turmeric font-semibold' : 'text-wheat/60 hover:text-wheat'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="font-body text-[10px] truncate">{item.name}</span>
          </Link>
        )
      })}

      {/* Farmer produce listing shortcut */}
      {userType === 'FARMER' && (
        <button
          onClick={() => setIsListModalOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-monsoon bg-turmeric font-semibold min-w-[54px] shadow-sm hover:bg-turmeric/90 cursor-pointer"
        >
          <Plus className="w-4 h-4 mb-0.5" />
          <span className="font-body text-[10px]">{lang === 'en' ? 'List' : 'जोड़ें'}</span>
        </button>
      )}
    </div>
  )
}
