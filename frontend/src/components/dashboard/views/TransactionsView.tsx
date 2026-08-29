import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Receipt,
  Search,
  Filter,
  DollarSign,
  Lock,
  ArrowUpRight,
  ExternalLink,
  MapPin
} from 'lucide-react'
import {
  useDashboard,
  type FarmTransaction,
  type TransactionLifecycleStatus,
  type TransactionPaymentStatus
} from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

interface TransactionsViewProps {
  isBuyer?: boolean
}

export function TransactionsView({ isBuyer = false }: TransactionsViewProps) {
  const location = useLocation()
  const isBuyerMode = isBuyer || location.pathname.startsWith('/buyer')
  const { transactions, lang } = useDashboard()

  const [activeTab, setActiveTab] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'All', label: 'All Transactions' },
    { id: 'Payment Pending', label: 'Payment Pending' },
    { id: 'Payment Completed', label: 'Escrow Funded' },
    { id: 'In Transit', label: 'In Transit' },
    { id: 'Completed', label: 'Settled & Completed' },
  ]

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === 'Payment Pending' && t.transactionStatus !== 'Payment Pending') return false
    if (activeTab === 'Payment Completed' && t.paymentStatus !== 'Payment Successful') return false
    if (activeTab === 'In Transit' && t.transactionStatus !== 'In Transit') return false
    if (activeTab === 'Completed' && t.transactionStatus !== 'Completed') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        t.id.toLowerCase().includes(q) ||
        t.crop.toLowerCase().includes(q) ||
        t.buyerOrganization.toLowerCase().includes(q) ||
        t.farmerName.toLowerCase().includes(q) ||
        t.lotId.toLowerCase().includes(q)
      if (!match) return false
    }

    return true
  })

  // Summary Metrics
  const totalVolume = transactions.reduce((acc, t) => acc + t.finalAmount, 0)
  const escrowSecured = transactions
    .filter((t) => t.paymentStatus === 'Payment Successful')
    .reduce((acc, t) => acc + t.finalAmount, 0)
  const pendingDeposit = transactions
    .filter((t) => t.paymentStatus === 'Payment Pending')
    .reduce((acc, t) => acc + t.finalAmount, 0)
  const activeInTransit = transactions.filter((t) => t.transactionStatus === 'In Transit').length

  const getPaymentStatusBadge = (status: TransactionPaymentStatus) => {
    switch (status) {
      case 'Payment Successful':
        return 'bg-datateal/20 text-soil border border-datateal/40'
      case 'Payment Processing':
        return 'bg-blue-500/20 text-blue-900 border border-blue-400'
      case 'Payment Pending':
        return 'bg-amber-500/20 text-amber-900 border border-amber-400'
      case 'Payment Failed':
        return 'bg-red-500/20 text-red-900 border border-red-400'
      default:
        return 'bg-soil/10 text-soil'
    }
  }

  const getLifecycleStatusBadge = (status: TransactionLifecycleStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-datateal text-monsoon font-bold'
      case 'In Transit':
        return 'bg-blue-600 text-white font-bold'
      case 'Delivered':
        return 'bg-emerald-700 text-white font-bold'
      case 'Payment Completed':
        return 'bg-monsoon text-wheat font-bold'
      case 'Payment Pending':
        return 'bg-amber-400 text-monsoon font-bold'
      default:
        return 'bg-soil/20 text-soil'
    }
  }

  const basePath = isBuyerMode ? '/buyer/transactions' : '/farmer/transactions'

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Payout Summary */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-turmeric" />
                {isBuyerMode ? 'Buyer Trade Contracts & Escrow' : 'Farmer Payouts & Escrow Desk'}
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              {isBuyerMode ? 'Procurement Deals & Transactions' : 'Payments & Transaction Contracts'}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              {isBuyerMode
                ? 'Track accepted procurement contracts, fund escrow vaults, verify delivery gate receipts, and release payouts.'
                : 'Track binding contracts, monitor buyer escrow security, and verify direct settlements to your linked Kisan bank account.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-monsoon text-wheat border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric flex-shrink-0" />
            <div>
              <span className="font-mono text-[10px] text-turmeric uppercase tracking-wider block">ESCROW PROTECTED</span>
              <span className="font-body text-xs text-wheat/90 font-medium">Safe Settlement Simulation</span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-soil/10">
          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="text-[10px] font-body text-soil/60 block uppercase">TOTAL TRANSACTIONS VALUE</span>
            <p className="font-mono text-2xl font-bold text-soil mt-1">₹{totalVolume.toLocaleString('en-IN')}</p>
            <span className="text-[10px] font-mono text-soil/50 block">{transactions.length} Total Contracts</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="text-[10px] font-body text-soil/60 block uppercase">SECURED IN ESCROW</span>
            <p className="font-mono text-2xl font-bold text-datateal mt-1">₹{escrowSecured.toLocaleString('en-IN')}</p>
            <span className="text-[10px] font-mono text-datateal font-semibold block">100% Capital Guaranteed</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="text-[10px] font-body text-soil/60 block uppercase">PENDING DEPOSIT</span>
            <p className="font-mono text-2xl font-bold text-amber-700 mt-1">₹{pendingDeposit.toLocaleString('en-IN')}</p>
            <span className="text-[10px] font-mono text-soil/50 block">Awaiting Buyer Transfer</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="text-[10px] font-body text-soil/60 block uppercase">ACTIVE IN-TRANSIT</span>
            <p className="font-mono text-2xl font-bold text-blue-800 mt-1">{activeInTransit} Shipments</p>
            <span className="text-[10px] font-mono text-blue-700 font-semibold block">Transit Tracking Live</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-body font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-monsoon text-wheat shadow-xs'
                  : 'bg-wheat text-soil/70 hover:text-soil border border-soil/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-soil/40" />
          <input
            type="text"
            placeholder="Search by ID, crop, buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-wheat border border-soil/15 rounded-xl pl-9 pr-3 py-2 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
          />
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
          <Receipt className="w-12 h-12 text-soil/30 mx-auto" />
          <h4 className="font-serif text-xl font-bold text-soil">No Transactions Found</h4>
          <p className="font-body text-xs text-soil/60 max-w-sm mx-auto">
            {activeTab === 'Payment Pending'
              ? 'No pending payments at the moment.'
              : 'Accepting incoming buyer offers will generate binding trade transactions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((txn) => {
            return (
              <div
                key={txn.id}
                className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm hover:border-soil/30 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header: ID, Date, Counterparty & Dual Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-soil/10">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-soil/60">{txn.id}</span>
                      <span className="font-mono text-[10px] text-soil/50">&bull; {txn.createdDate}</span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${getPaymentStatusBadge(txn.paymentStatus)}`}>
                        {txn.paymentStatus}
                      </span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${getLifecycleStatusBadge(txn.transactionStatus)}`}>
                        {txn.transactionStatus}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-soil mt-1.5">
                      {txn.crop} <span className="font-normal text-sm text-soil/60">({txn.variety})</span>
                    </h3>
                    <p className="font-body text-xs text-soil/70 mt-0.5">
                      {isBuyerMode ? (
                        <>Seller: <strong className="text-soil">{txn.farmerName}</strong> ({txn.farmerLocation})</>
                      ) : (
                        <>Buyer: <strong className="text-soil">{txn.buyerOrganization}</strong> ({txn.buyerName})</>
                      )}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
                    <div>
                      <span className="text-[10px] font-body text-soil/50 block uppercase">FINAL DEAL AMOUNT</span>
                      <span className="font-mono text-2xl font-bold text-datateal">
                        ₹{txn.finalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-soil/70">
                      ₹{txn.agreedPricePerQtl.toLocaleString('en-IN')}/qtl &bull; {txn.quantityQtl} {txn.unit}
                    </span>
                  </div>
                </div>

                {/* 3-Column Specs: Produce Value, Transport Freight, Escrow Mode */}
                <div className="grid grid-cols-3 gap-3 py-1">
                  <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                    <span className="text-[10px] font-body text-soil/50 block uppercase">PRODUCE VALUE</span>
                    <span className="font-mono text-sm font-bold text-soil">
                      ₹{txn.produceValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                    <span className="text-[10px] font-body text-soil/50 block uppercase">AGREED TRANSPORT</span>
                    <span className="font-mono text-sm font-bold text-soil">
                      {txn.transportCost > 0 ? `₹${txn.transportCost.toLocaleString('en-IN')}` : 'Farm-Gate Free'}
                    </span>
                  </div>

                  <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                    <span className="text-[10px] font-body text-soil/50 block uppercase">SETTLEMENT METHOD</span>
                    <span className="font-mono text-sm font-bold text-datateal truncate block">
                      {txn.paymentDetails?.method || 'e-NWR Escrow Vault'}
                    </span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-soil/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-body text-soil/70">
                    <MapPin className="w-3.5 h-3.5 text-turmeric" />
                    <span>Destination: {txn.mandiOrDeliveryLocation}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`${basePath}/${txn.id}`}
                      className="px-4 py-2 rounded-xl bg-monsoon text-wheat font-body text-xs font-bold hover:bg-monsoon/90 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <span>View Contract & Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5 text-turmeric" />
                    </Link>

                    {isBuyerMode && txn.paymentStatus === 'Payment Pending' && (
                      <Link
                        to={`${basePath}/${txn.id}?action=deposit`}
                        className="px-4 py-2 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all shadow-sm"
                      >
                        Deposit to Escrow
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
