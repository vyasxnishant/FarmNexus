import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Receipt,
  ExternalLink,
  MapPin
} from 'lucide-react'
import { useDashboard, type FarmTransaction } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminTransactionsView() {
  const { transactions } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedTxn, setSelectedTxn] = useState<FarmTransaction | null>(null)

  const filteredTxns = transactions.filter((t) => {
    if (statusFilter !== 'All' && t.transactionStatus !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        t.id.toLowerCase().includes(q) ||
        t.farmerName.toLowerCase().includes(q) ||
        t.buyerOrganization.toLowerCase().includes(q) ||
        t.crop.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-turmeric" />
                CENTRAL TRADE LEDGER & ESCROW
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Trade Transactions Ledger
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect binding trade agreements between farmers and corporate buyers, monitor carrier transit stages, and audit automated escrow payouts.
            </p>
          </div>

          <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-turmeric uppercase block">TOTAL CONTRACTS</span>
              <span className="font-mono text-xl font-bold text-datateal">{transactions.length} Deals</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-soil/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search transaction ID, farmer, buyer, crop..."
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
              <option value="All">All Transaction Statuses</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Payment Completed">Escrow Funded</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered & Verified</option>
              <option value="Completed">Completed & Disbursed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-soil">
            <thead className="bg-soil/5 border-b border-soil/10 uppercase font-mono text-[10px] text-soil/60">
              <tr>
                <th className="py-3.5 px-4">Transaction ID / Date</th>
                <th className="py-3.5 px-4">Seller (Farmer)</th>
                <th className="py-3.5 px-4">Buyer Organization</th>
                <th className="py-3.5 px-4">Commodity / Volume</th>
                <th className="py-3.5 px-4">Escrow Value</th>
                <th className="py-3.5 px-4">Lifecycle Stage</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil/10">
              {filteredTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-soil/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-soil block">{txn.id}</span>
                    <span className="font-mono text-[10px] text-soil/50">{txn.createdDate}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-soil block">{txn.farmerName}</span>
                    <span className="text-[11px] text-soil/60">{txn.farmerLocation}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-soil block">{txn.buyerOrganization}</span>
                    <span className="text-[11px] text-soil/60">Rep: {txn.buyerName}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-soil block">{txn.crop}</span>
                    <span className="font-mono text-[10px] text-soil/50">
                      {txn.quantityQtl} {txn.unit} @ ₹{txn.agreedPricePerQtl}/qtl
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-sm font-bold text-datateal block">
                      ₹{txn.finalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="font-mono text-[10px] text-soil/50">{txn.paymentStatus}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      txn.transactionStatus === 'Completed' ? 'bg-datateal/20 text-soil border border-datateal/30' :
                      txn.transactionStatus === 'In Transit' ? 'bg-blue-500/20 text-blue-900 border border-blue-400' :
                      txn.transactionStatus === 'Payment Pending' ? 'bg-amber-500/20 text-amber-900 border border-amber-400' : 'bg-monsoon text-wheat'
                    }`}>
                      {txn.transactionStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/farmer/transactions/${txn.id}`}
                      className="p-1.5 rounded-lg bg-soil/5 hover:bg-soil/10 text-soil inline-flex items-center gap-1 transition-colors"
                      title="Inspect Contract"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
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

