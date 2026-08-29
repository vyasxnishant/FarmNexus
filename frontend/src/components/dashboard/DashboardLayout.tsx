import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { ListProduceModal } from './modals/ListProduceModal'
import { CounterOfferModal } from './modals/CounterOfferModal'
import { useDashboard } from '../../context/DashboardContext'

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { lang } = useDashboard()

  return (
    <div className="min-h-screen bg-monsoon flex text-wheat">
      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer (Collapsible) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-monsoon/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-monsoon z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Global Modals */}
      <ListProduceModal />
      <CounterOfferModal />
    </div>
  )
}

