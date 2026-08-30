import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  Package,
  Receipt,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Search,
  Filter,
  DollarSign,
  UserCheck,
  FileText,
  CloudSun,
  Server,
  Database,
  Radio,
  RefreshCw
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'
import { adminApi } from '../../../services/apiServices'

export function AdminDashboardView() {
  const {
    users,
    lots,
    offers,
    transactions,
    marketData,
    auditLogs,
    lang,
    userRole,
    setUserRole,
  } = useDashboard()

  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [isStatusLoading, setIsStatusLoading] = useState<boolean>(false)

  const loadSystemStatus = async () => {
    setIsStatusLoading(true)
    try {
      const res = await adminApi.getSystemStatus()
      if (res.data) setSystemStatus(res.data)
    } catch (e) {
      console.warn('[AdminDashboard] System status fetch fallback', e)
    } finally {
      setIsStatusLoading(false)
    }
  }

  useEffect(() => {
    loadSystemStatus()
  }, [])

  const farmers = users.filter(u => u.userType === 'Farmer')
  const buyers = users.filter(u => u.userType === 'Buyer')
  const activeLots = lots.filter(l => l.status === 'Active')
  const pendingOffers = offers.filter(o => o.status === 'Pending')
  const completedTransactions = transactions.filter(t => t.transactionStatus === 'Completed')
  const pendingPayments = transactions.filter(t => t.paymentStatus === 'Payment Pending')

  const totalVolumeSettled = transactions
    .filter(t => t.paymentStatus === 'Payment Successful')
    .reduce((acc, t) => acc + t.finalAmount, 0)

  const totalEscrowLocked = transactions
    .filter(t => t.transactionStatus === 'In Transit' || t.transactionStatus === 'Payment Completed')
    .reduce((acc, t) => acc + t.finalAmount, 0)

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Role Switcher Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-turmeric" />
                CENTRAL OPERATIONS & AUDIT DESK
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              FarmNexus Network Administration
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Real-time oversight of verified producers, corporate buyers, commodity lots, price feeds, and escrow settlement pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-monsoon p-2 rounded-2xl border border-turmeric/30">
            <span className="text-[11px] font-mono text-wheat/80 px-2">ACTIVE ROLE:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-wheat text-monsoon font-body text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none"
            >
              <option value="admin">Admin Portal</option>
              <option value="farmer">Farmer Hub</option>
              <option value="buyer">Buyer Desk</option>
            </select>
          </div>
        </div>

        {/* 7 Summary KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-4 border-t border-soil/10">
          <Link
            to="/admin/farmers"
            className="bg-soil/5 rounded-2xl p-3 border border-soil/10 hover:border-turmeric/50 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-soil/60 block uppercase">FARMERS</span>
              <Users className="w-3.5 h-3.5 text-turmeric" />
            </div>
            <p className="font-mono text-xl font-bold text-soil mt-1">{farmers.length}</p>
            <span className="text-[10px] text-soil/50 block">Verified Producers</span>
          </Link>

          <Link
            to="/admin/buyers"
            className="bg-soil/5 rounded-2xl p-3 border border-soil/10 hover:border-turmeric/50 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-soil/60 block uppercase">BUYERS</span>
              <Building2 className="w-3.5 h-3.5 text-turmeric" />
            </div>
            <p className="font-mono text-xl font-bold text-soil mt-1">{buyers.length}</p>
            <span className="text-[10px] text-soil/50 block">Corporate Buyers</span>
          </Link>

          <Link
            to="/admin/lots"
            className="bg-soil/5 rounded-2xl p-3 border border-soil/10 hover:border-turmeric/50 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-soil/60 block uppercase">ACTIVE LOTS</span>
              <Package className="w-3.5 h-3.5 text-turmeric" />
            </div>
            <p className="font-mono text-xl font-bold text-datateal mt-1">{activeLots.length}</p>
            <span className="text-[10px] text-soil/50 block">Listed Crops</span>
          </Link>

          <Link
            to="/admin/offers"
            className="bg-soil/5 rounded-2xl p-3 border border-soil/10 hover:border-turmeric/50 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-soil/60 block uppercase">PENDING BIDS</span>
              <Receipt className="w-3.5 h-3.5 text-turmeric" />
            </div>
            <p className="font-mono text-xl font-bold text-amber-700 mt-1">{pendingOffers.length}</p>
            <span className="text-[10px] text-soil/50 block">Active Offers</span>
          </Link>

          <Link
            to="/admin/transactions"
            className="bg-soil/5 rounded-2xl p-3 border border-soil/10 hover:border-turmeric/50 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-soil/60 block uppercase">DEALS</span>
              <CreditCard className="w-3.5 h-3.5 text-turmeric" />
            </div>
            <p className="font-mono text-xl font-bold text-soil mt-1">{transactions.length}</p>
            <span className="text-[10px] text-datateal font-semibold block">{completedTransactions.length} Settled</span>
          </Link>

          <Link
            to="/admin/payments"
            className="bg-soil/5 rounded-2xl p-3 border border-soil/10 hover:border-turmeric/50 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-soil/60 block uppercase">ESCROW LOCKED</span>
              <DollarSign className="w-3.5 h-3.5 text-turmeric" />
            </div>
            <p className="font-mono text-base font-bold text-datateal mt-1">₹{(totalEscrowLocked / 100000).toFixed(1)}L</p>
            <span className="text-[10px] text-soil/50 block">{pendingPayments.length} Pending Payout</span>
          </Link>

          <Link
            to="/admin/market-prices"
            className="bg-soil/5 rounded-2xl p-3 border border-soil/10 hover:border-turmeric/50 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-soil/60 block uppercase">MARKET FEEDS</span>
              <TrendingUp className="w-3.5 h-3.5 text-turmeric" />
            </div>
            <p className="font-mono text-xl font-bold text-soil mt-1">{marketData.length}</p>
            <span className="text-[10px] text-soil/50 block">APMC Mandis</span>
          </Link>
        </div>
      </div>

      {/* EXTERNAL SERVICES & DATA INTEGRATION HEALTH DECK */}
      <div className="bg-monsoon text-wheat rounded-3xl border border-wheat/15 p-6 md:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-wheat/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-turmeric/20 text-turmeric border border-turmeric/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-turmeric block">INTEGRATION MONITOR</span>
              <h3 className="font-serif text-2xl font-bold text-wheat">External Services & Data Integrity Status</h3>
            </div>
          </div>

          <button
            onClick={loadSystemStatus}
            disabled={isStatusLoading}
            className="px-3.5 py-2 rounded-xl bg-soil/50 hover:bg-soil/80 border border-wheat/15 text-xs font-body font-semibold text-wheat flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStatusLoading ? 'animate-spin text-turmeric' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. AGMARKNET */}
          <div className="p-4 rounded-2xl bg-soil/30 border border-wheat/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-wheat/60">GOVERNMENT APMC</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                systemStatus?.services?.agmarknet?.status === 'Live' || systemStatus?.services?.agmarknet?.status === 'Connected'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {systemStatus?.services?.agmarknet?.status || 'Demo Fallback'}
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-wheat">AGMARKNET</h4>
            <p className="text-xs text-wheat/70 font-body">data.gov.in Mandi Arrival & Modal Price Feed</p>
            <div className="pt-2 border-t border-wheat/10 text-[11px] text-wheat/50 font-mono">
              API Key: {systemStatus?.services?.agmarknet?.hasApiKey ? 'Configured' : 'No Key (Demo Fallback)'}
            </div>
          </div>

          {/* 2. eNAM */}
          <div className="p-4 rounded-2xl bg-soil/30 border border-wheat/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-wheat/60">ELECTRONIC AUCTION</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {systemStatus?.services?.enam?.status || 'Demo Provider'}
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-wheat">e-NAM Gateway</h4>
            <p className="text-xs text-wheat/70 font-body">National Agriculture Market Trade Index</p>
            <div className="pt-2 border-t border-wheat/10 text-[11px] text-wheat/50 font-mono">
              Provider Adapter: Active
            </div>
          </div>

          {/* 3. Weather API */}
          <div className="p-4 rounded-2xl bg-soil/30 border border-wheat/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-wheat/60">AGRO-METEOROLOGY</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Connected
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-wheat">Open-Meteo Weather</h4>
            <p className="text-xs text-wheat/70 font-body">Live Global & India Weather & Rain Risk</p>
            <div className="pt-2 border-t border-wheat/10 text-[11px] text-wheat/50 font-mono">
              Latency: {systemStatus?.services?.weather?.latencyMs || 120}ms (Live)
            </div>
          </div>

          {/* 4. Database & Storage */}
          <div className="p-4 rounded-2xl bg-soil/30 border border-wheat/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-wheat/60">PERSISTENCE LAYER</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#5FD0C0]/20 text-[#5FD0C0] border border-[#5FD0C0]/40">
                Active Store
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-wheat">PostgreSQL / Storage</h4>
            <p className="text-xs text-wheat/70 font-body">13 Tables & Normalized Price History</p>
            <div className="pt-2 border-t border-wheat/10 text-[11px] text-wheat/50 font-mono">
              {users.length} Users &bull; {lots.length} Lots &bull; {transactions.length} Deals
            </div>
          </div>
        </div>
      </div>

      {/* 4 Live Operations Sections Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 1. Recent Produce Lots */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soil/10">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-turmeric" />
              <h3 className="font-serif text-xl font-bold text-soil">Recent Listed Lots</h3>
            </div>
            <Link to="/admin/lots" className="text-xs font-body font-semibold text-turmeric hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {lots.slice(0, 4).map((lot) => (
              <div key={lot.id} className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-soil">{lot.crop}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-monsoon text-wheat font-bold">
                      {lot.grade}
                    </span>
                    <span className="font-mono text-[10px] text-soil/50">&bull; {lot.quantityQtl} {lot.unit || 'qtl'}</span>
                  </div>
                  <p className="font-body text-xs text-soil/70 mt-0.5">
                    Expected: <strong className="font-mono text-soil">₹{lot.expectedPrice.toLocaleString('en-IN')}/qtl</strong> &bull; {lot.location}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lot.status === 'Active' ? 'bg-datateal/20 text-soil border border-datateal/30' : 'bg-soil/10 text-soil'
                  }`}>
                    {lot.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Recent Buyer Offers */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soil/10">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-turmeric" />
              <h3 className="font-serif text-xl font-bold text-soil">Recent Buyer Bids & Offers</h3>
            </div>
            <Link to="/admin/offers" className="text-xs font-body font-semibold text-turmeric hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {offers.slice(0, 4).map((offer) => (
              <div key={offer.id} className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs font-bold text-soil">{offer.buyerCompany}</span>
                    <span className="font-mono text-[10px] text-soil/50">&bull; {offer.id}</span>
                  </div>
                  <p className="font-body text-xs text-soil/70 mt-0.5">
                    {offer.lotTitle} &bull; <strong className="font-mono text-datateal">₹{offer.offeredPrice.toLocaleString('en-IN')}/qtl</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    offer.status === 'Accepted' ? 'bg-datateal/20 text-soil border border-datateal/30' :
                    offer.status === 'Pending' ? 'bg-amber-500/20 text-amber-900 border border-amber-400' : 'bg-soil/10 text-soil'
                  }`}>
                    {offer.status}
                  </span>
                  <span className="font-mono text-[10px] text-soil/40 block mt-0.5">₹{offer.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recent Transactions & Escrow Pipeline */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soil/10">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-turmeric" />
              <h3 className="font-serif text-xl font-bold text-soil">Recent Trade Contracts</h3>
            </div>
            <Link to="/admin/transactions" className="text-xs font-body font-semibold text-turmeric hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 4).map((txn) => (
              <div key={txn.id} className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-soil">{txn.id}</span>
                    <span className="font-body text-xs font-medium text-soil/80">{txn.crop}</span>
                  </div>
                  <p className="font-body text-xs text-soil/60 mt-0.5">
                    {txn.farmerName} &rarr; {txn.buyerOrganization}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-datateal block">
                    ₹{txn.finalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-monsoon text-wheat">
                    {txn.transactionStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Recent System Audit Logs */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soil/10">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-turmeric" />
              <h3 className="font-serif text-xl font-bold text-soil">System Audit Trail</h3>
            </div>
            <Link to="/admin/logs" className="text-xs font-body font-semibold text-turmeric hover:underline flex items-center gap-1">
              <span>View Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs font-bold text-soil">{log.action}</span>
                  <span className="font-mono text-[10px] text-soil/50">{log.timestamp}</span>
                </div>
                <p className="font-body text-xs text-soil/70 line-clamp-1">{log.details}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-soil/50">
                  <span>Target: {log.targetId}</span>
                  <span>&bull;</span>
                  <span>By: {log.adminUser}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

