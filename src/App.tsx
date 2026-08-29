import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './components/LandingPage'
import { DashboardProvider } from './context/DashboardContext'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { OverviewView } from './components/dashboard/views/OverviewView'
import { MarketIntelligenceView } from './components/dashboard/views/MarketIntelligenceView'
import { MarketPricesComparisonView } from './components/dashboard/views/MarketPricesComparisonView'
import { LogisticsView } from './components/dashboard/views/LogisticsView'
import { StorageView } from './components/dashboard/views/StorageView'
import { MyLotsView } from './components/dashboard/views/MyLotsView'
import { CreateLotView } from './components/dashboard/views/CreateLotView'
import { LotDetailsView } from './components/dashboard/views/LotDetailsView'
import { BuyerMatchesView } from './components/dashboard/views/BuyerMatchesView'
import { OffersView } from './components/dashboard/views/OffersView'
import { PaymentsView } from './components/dashboard/views/PaymentsView'
import { NotificationsView } from './components/dashboard/views/NotificationsView'
import { ProfileView } from './components/dashboard/views/ProfileView'

// Buyer Views
import { BuyerDashboardView } from './components/dashboard/views/BuyerDashboardView'
import { BuyerBrowseLotsView } from './components/dashboard/views/BuyerBrowseLotsView'
import { BuyerLotDetailsView } from './components/dashboard/views/BuyerLotDetailsView'
import { BuyerOffersView } from './components/dashboard/views/BuyerOffersView'

export default function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated Farmer Dashboard */}
          <Route path="/farmer" element={<DashboardLayout />}>
            <Route index element={<OverviewView />} />
            <Route path="market-intelligence" element={<MarketIntelligenceView />} />
            <Route path="market-prices" element={<MarketPricesComparisonView />} />
            <Route path="logistics" element={<LogisticsView />} />
            <Route path="storage" element={<StorageView />} />
            <Route path="lots" element={<MyLotsView />} />
            <Route path="lots/create" element={<CreateLotView />} />
            <Route path="lots/edit/:lotId" element={<CreateLotView isEditing />} />
            <Route path="lots/:lotId" element={<LotDetailsView />} />
            <Route path="buyers" element={<BuyerMatchesView />} />
            <Route path="offers" element={<OffersView />} />
            <Route path="transactions" element={<PaymentsView />} />
            <Route path="payments" element={<PaymentsView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="profile" element={<ProfileView />} />
          </Route>

          {/* Authenticated Buyer Portal */}
          <Route path="/buyer" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/buyer/dashboard" replace />} />
            <Route path="dashboard" element={<BuyerDashboardView />} />
            <Route path="lots" element={<BuyerBrowseLotsView />} />
            <Route path="lots/:lotId" element={<BuyerLotDetailsView />} />
            <Route path="offers" element={<BuyerOffersView />} />
          </Route>

          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardProvider>
    </BrowserRouter>
  )
}
