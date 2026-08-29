import { useState } from 'react'
import {
  Receipt,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  User,
  ShieldCheck
} from 'lucide-react'
import { useDashboard, type Offer } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminOffersView() {
  const { offers } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  const filteredOffers = offers.filter((offer) => {
    if (statusFilter !== 'All' && offer.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        offer.id.toLowerCase().includes(q) ||
        offer.buyerCompany.toLowerCase().includes(q) ||
        offer.lotTitle.toLowerCase().includes(q) ||
        offer.buyerName.toLowerCase().includes(q)
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
                <Receipt className="w-3.5 h-3.5 text-turmeric" />
                BUYER BIDDING & PROPOSAL OVERSIGHT
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Commercial Bids & Proposals
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect active offers, verify pricing spreads vs farmer expectations, and audit negotiation histories across all commodity lots.
            </p>
          </div>

          <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-turmeric uppercase block">TOTAL NETWORK BIDS</span>
              <span className="font-mono text-xl font-bold text-datateal">{offers.length} Offers</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-soil/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search offer ID, buyer, lot title..."
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
              <option value="All">All Bid Statuses</option>
              <option value="Pending">Pending Farmer Response</option>
              <option value="Accepted">Accepted & Transacted</option>
              <option value="Countered">Counter Offer Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-soil">
            <thead className="bg-soil/5 border-b border-soil/10 uppercase font-mono text-[10px] text-soil/60">
              <tr>
                <th className="py-3.5 px-4">Offer ID / Date</th>
                <th className="py-3.5 px-4">Buyer Company</th>
                <th className="py-3.5 px-4">Produce Lot</th>
                <th className="py-3.5 px-4">Bid Price</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil/10">
              {filteredOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-soil/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-soil block">{offer.id}</span>
                    <span className="font-mono text-[10px] text-soil/50">{offer.createdDate}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-serif font-bold text-sm text-soil block">{offer.buyerCompany}</span>
                    <span className="text-[11px] text-soil/60">Rep: {offer.buyerName}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-soil block">{offer.lotTitle}</span>
                    <span className="text-[10px] font-mono text-soil/50">Lot: {offer.lotId}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-sm font-bold text-datateal block">
                      ₹{offer.offeredPrice.toLocaleString('en-IN')}/qtl
                    </span>
                    <span className="font-mono text-[10px] text-soil/50">Expected: ₹{offer.lotExpectedPrice}/qtl</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-soil">
                    ₹{offer.totalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      offer.status === 'Accepted' ? 'bg-datateal/20 text-soil border border-datateal/30' :
                      offer.status === 'Pending' ? 'bg-amber-500/20 text-amber-900 border border-amber-400' :
                      offer.status === 'Countered' ? 'bg-blue-500/20 text-blue-900 border border-blue-400' : 'bg-red-500/10 text-red-800'
                    }`}>
                      {offer.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOffer(offer)}
                      className="p-1.5 rounded-lg bg-soil/5 hover:bg-soil/10 text-soil transition-colors cursor-pointer"
                      title="Inspect Offer Terms"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Terms Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">Buyer Offer Terms Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="text-soil/40 hover:text-soil cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-monsoon text-wheat rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-turmeric uppercase block">{selectedOffer.id} &bull; {selectedOffer.status}</span>
              <h4 className="font-serif text-xl font-bold">{selectedOffer.buyerCompany}</h4>
              <p className="text-xs text-wheat/80">Bid for: {selectedOffer.lotTitle}</p>
            </div>

            <div className="space-y-2 text-xs font-body text-soil/80">
              <p><strong className="text-soil">Offered Unit Price:</strong> <span className="font-mono font-bold text-datateal">₹{selectedOffer.offeredPrice.toLocaleString('en-IN')}/qtl</span></p>
              <p><strong className="text-soil">Total Deal Volume:</strong> <span className="font-mono font-bold text-soil">₹{selectedOffer.totalAmount.toLocaleString('en-IN')}</span></p>
              <p><strong className="text-soil">Payment Terms:</strong> {selectedOffer.paymentTerms}</p>
              <p><strong className="text-soil">Pickup / Delivery Location:</strong> {selectedOffer.pickupLocation}</p>
            </div>

            <div className="pt-3 border-t border-soil/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2 bg-monsoon text-wheat font-body text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
