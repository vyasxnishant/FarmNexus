import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './components/LandingPage'
import { DashboardProvider } from './context/DashboardContext'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { LoginView } from './components/auth/LoginView'
import { RegisterView } from './components/auth/RegisterView'
import { UnauthorizedView } from './components/auth/UnauthorizedView'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Farmer Views
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
import { TransactionsView } from './components/dashboard/views/TransactionsView'
import { TransactionDetailsView } from './components/dashboard/views/TransactionDetailsView'
import { NotificationsView } from './components/dashboard/views/NotificationsView'
import { ProfileView } from './components/dashboard/views/ProfileView'

// Buyer Views
import { BuyerDashboardView } from './components/dashboard/views/BuyerDashboardView'
import { BuyerBrowseLotsView } from './components/dashboard/views/BuyerBrowseLotsView'
import { BuyerLotDetailsView } from './components/dashboard/views/BuyerLotDetailsView'
import { BuyerOffersView } from './components/dashboard/views/BuyerOffersView'

// Admin Views
import { AdminDashboardView } from './components/dashboard/admin/AdminDashboardView'
import { AdminUsersView } from './components/dashboard/admin/AdminUsersView'
import { AdminFarmersView } from './components/dashboard/admin/AdminFarmersView'
import { AdminBuyersView } from './components/dashboard/admin/AdminBuyersView'
import { AdminLotsView } from './components/dashboard/admin/AdminLotsView'
import { AdminMarketPricesView } from './components/dashboard/admin/AdminMarketPricesView'
import { AdminOffersView } from './components/dashboard/admin/AdminOffersView'
import { AdminTransactionsView } from './components/dashboard/admin/AdminTransactionsView'
import { AdminPaymentsView } from './components/dashboard/admin/AdminPaymentsView'
import { AdminAuditLogsView } from './components/dashboard/admin/AdminAuditLogsView'

export default function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/unauthorized" element={<UnauthorizedView />} />

          {/* Authenticated Global Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfileView />} />
          </Route>

          {/* Authenticated Farmer Portal (Role Restricted: FARMER, ADMIN) */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
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
            <Route path="transactions" element={<TransactionsView />} />
            <Route path="transactions/:transactionId" element={<TransactionDetailsView />} />
            <Route path="payments" element={<TransactionsView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="profile" element={<ProfileView />} />
          </Route>

          {/* Authenticated Buyer Portal (Role Restricted: BUYER, ADMIN) */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/buyer/dashboard" replace />} />
            <Route path="dashboard" element={<BuyerDashboardView />} />
            <Route path="lots" element={<BuyerBrowseLotsView />} />
            <Route path="lots/:lotId" element={<BuyerLotDetailsView />} />
            <Route path="offers" element={<BuyerOffersView />} />
            <Route path="transactions" element={<TransactionsView isBuyer />} />
            <Route path="transactions/:transactionId" element={<TransactionDetailsView />} />
            <Route path="logistics" element={<LogisticsView />} />
            <Route path="storage" element={<StorageView />} />
            <Route path="market-intelligence" element={<MarketIntelligenceView />} />
            <Route path="market-prices" element={<MarketPricesComparisonView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="profile" element={<ProfileView />} />
          </Route>

          {/* Authenticated Admin Portal (Role Restricted: ADMIN) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardView />} />
            <Route path="users" element={<AdminUsersView />} />
            <Route path="users/:userId" element={<AdminUsersView />} />
            <Route path="farmers" element={<AdminFarmersView />} />
            <Route path="farmers/:farmerId" element={<AdminFarmersView />} />
            <Route path="buyers" element={<AdminBuyersView />} />
            <Route path="lots" element={<AdminLotsView />} />
            <Route path="market-prices" element={<AdminMarketPricesView />} />
            <Route path="offers" element={<AdminOffersView />} />
            <Route path="transactions" element={<AdminTransactionsView />} />
            <Route path="payments" element={<AdminPaymentsView />} />
            <Route path="logs" element={<AdminAuditLogsView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="profile" element={<ProfileView />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardProvider>
    </BrowserRouter>
  )
}
