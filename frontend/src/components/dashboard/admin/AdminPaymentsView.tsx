import { useState, useEffect } from 'react'
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowUpRight,
  RefreshCw,
  Receipt
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { paymentApi } from '../../../services/apiServices'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminPaymentsView() {
  const { transactions } = useDashboard()

  const [dbPayments, setDbPayments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)
        const res = await paymentApi.getAll()
        if (res.data && Array.isArray(res.data)) {
          setDbPayments(res.data)
        }
      } catch (err) {
        console.warn('[AdminPaymentsView] Gateway ledger fallback:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const filteredPayments = transactions.filter((txn) => {
    if (statusFilter !== 'All' && txn.paymentStatus !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        txn.id.toLowerCase().includes(q) ||
        txn.farmerName.toLowerCase().includes(q) ||
        txn.buyerOrganization.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalDisbursed = transactions
    .filter(t => t.paymentStatus === 'Payment Successful')
    .reduce((acc, t) => acc + t.finalAmount, 0)

  const totalPending = transactions
    .filter(t => t.paymentStatus === 'Payment Pending')
    .reduce((acc, t) => acc + t.finalAmount, 0)

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-turmeric" />
                ESCROW CLEARING & PAYMENTS MONITOR
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Escrow Vault & Payout Tracking
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect verified bank payouts, e-NWR warehouse receipt liens, gateway transaction references, and settlement timestamps.
            </p>
          </div>

          <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-turmeric uppercase block">TOTAL SECURED CAPITAL</span>
              <span className="font-mono text-xl font-bold text-datateal">₹{totalDisbursed.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 3 Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-soil/10">
          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="text-[10px] font-body text-soil/60 block uppercase">DISBURSED & VERIFIED</span>
            <p className="font-mono text-2xl font-bold text-datateal mt-1">₹{totalDisbursed.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-soil/50 block">Bank Transfer Settled</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="text-[10px] font-body text-soil/60 block uppercase">PENDING ESCROW DEPOSIT</span>
            <p className="font-mono text-2xl font-bold text-amber-700 mt-1">₹{totalPending.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-soil/50 block">Awaiting Buyer Transfer</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="text-[10px] font-body text-soil/60 block uppercase">ESCROW SETTLEMENT PROTOCOL</span>
            <p className="font-mono text-base font-bold text-soil mt-1">ICICI Bank Virtual Sub-Ledger</p>
            <span className="text-[10px] text-datateal font-semibold block">Zero Client-Side Keys</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search by transaction ID, buyer, farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Payment Successful">Payment Successful / Escrow Secured</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Payment Processing">Payment Processing</option>
              <option value="Payment Failed">Payment Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-soil">
            <thead className="bg-soil/5 border-b border-soil/10 uppercase font-mono text-[10px] text-soil/60">
              <tr>
                <th className="py-3.5 px-4">Transaction / Date</th>
                <th className="py-3.5 px-4">Beneficiary (Farmer)</th>
                <th className="py-3.5 px-4">Payer (Buyer)</th>
                <th className="py-3.5 px-4">Settlement Rail</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil/10">
              {filteredPayments.map((txn) => (
                <tr key={txn.id} className="hover:bg-soil/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-soil block">{txn.id}</span>
                    <span className="font-mono text-[10px] text-soil/50">{txn.createdDate}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-soil block">{txn.farmerName}</span>
                    <span className="text-[10px] font-mono text-soil/50">SBI Linked Account</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-soil block">{txn.buyerOrganization}</span>
                    <span className="text-[10px] font-mono text-soil/50">{txn.paymentDetails?.payerVpa || 'ICICI Escrow VPA'}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-soil">
                    {txn.paymentDetails?.method || 'e-NWR Escrow'}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-sm font-bold text-datateal">
                    ₹{txn.finalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      txn.paymentStatus === 'Payment Successful' ? 'bg-datateal/20 text-soil border border-datateal/30' :
                      txn.paymentStatus === 'Payment Pending' ? 'bg-amber-500/20 text-amber-900 border border-amber-400' : 'bg-red-500/10 text-red-800'
                    }`}>
                      {txn.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

