import { useState } from 'react'
import {
  Building2,
  Search,
  CheckCircle2,
  Receipt,
  CreditCard,
  Phone,
  MapPin,
  Eye,
  ShieldCheck,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import { useDashboard, type UserRecord } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminBuyersView() {
  const { users, offers, transactions, verifyUser, updateUserStatus } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBuyer, setSelectedBuyer] = useState<UserRecord | null>(null)

  const buyers = users.filter((u) => u.userType === 'Buyer')

  const filteredBuyers = buyers.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        b.name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        (b.organization && b.organization.toLowerCase().includes(q)) ||
        b.location.toLowerCase().includes(q)
      )
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
                <Building2 className="w-3.5 h-3.5 text-turmeric" />
                CORPORATE BUYER DIRECTORY
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Verified Institutional Buyers
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Monitor procurement corporations, verified institutional processors, active buying requirements, and escrow credit reliability.
            </p>
          </div>

          <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-turmeric uppercase block">ACTIVE BUYERS</span>
              <span className="font-mono text-xl font-bold text-datateal">{buyers.length} Corporations</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="pt-4 border-t border-soil/10 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search company, buyer name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
            />
          </div>
        </div>
      </div>

      {/* Buyers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuyers.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm hover:border-soil/30 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-monsoon text-turmeric flex items-center justify-center font-serif text-lg font-bold">
                    {buyer.organization ? buyer.organization.charAt(0) : 'B'}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-soil line-clamp-1">{buyer.organization || buyer.name}</h3>
                    <span className="font-mono text-[10px] text-soil/50">Rep: {buyer.name}</span>
                  </div>
                </div>

                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  buyer.status === 'Active' ? 'bg-datateal/20 text-soil border border-datateal/40' : 'bg-amber-500/20 text-amber-900'
                }`}>
                  {buyer.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-body text-soil/80 pt-2 border-t border-soil/10">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-soil/40 flex-shrink-0" />
                  <span className="line-clamp-1">{buyer.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-soil/40 flex-shrink-0" />
                  <span className="font-mono">{buyer.phone}</span>
                </p>
              </div>

              {/* Volume metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-center font-mono">
                <div className="bg-soil/5 rounded-xl p-2 border border-soil/10">
                  <span className="text-[9px] text-soil/50 block font-body">TOTAL PROCUREMENT</span>
                  <span className="text-sm font-bold text-datateal">₹{((buyer.totalVolumeRs || 1200000) / 100000).toFixed(1)}L</span>
                </div>
                <div className="bg-soil/5 rounded-xl p-2 border border-soil/10">
                  <span className="text-[9px] text-soil/50 block font-body">DEALS SETTLED</span>
                  <span className="text-sm font-bold text-soil">{buyer.transactionsCount || 5}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-soil/10">
              <button
                type="button"
                onClick={() => setSelectedBuyer(buyer)}
                className="w-full py-2 bg-monsoon text-wheat font-body text-xs font-bold rounded-xl hover:bg-monsoon/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-turmeric" />
                <span>Inspect Buyer Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Buyer Details Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">Institutional Buyer Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBuyer(null)}
                className="text-soil/40 hover:text-soil cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-monsoon text-wheat rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-turmeric uppercase block">{selectedBuyer.id} &bull; GSTIN 23AAACA1234F1Z8</span>
              <h4 className="font-serif text-xl font-bold">{selectedBuyer.organization}</h4>
              <p className="text-xs text-wheat/80">Authorized Rep: {selectedBuyer.name}</p>
            </div>

            <div className="space-y-2 text-xs font-body text-soil/80">
              <p><strong className="text-soil">Delivery Terminal:</strong> {selectedBuyer.location}</p>
              <p><strong className="text-soil">Escrow Settlement Reliability:</strong> <span className="text-datateal font-bold">4.95 / 5.0 (Zero Default Record)</span></p>
              <p><strong className="text-soil">KYC & Banking Mandate:</strong> {selectedBuyer.kycVerified ? '✅ ICICI Bank Escrow Linked' : '⏳ Mandate Incomplete'}</p>
            </div>

            <div className="pt-3 border-t border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!selectedBuyer.kycVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      verifyUser(selectedBuyer.id)
                      setSelectedBuyer(null)
                    }}
                    className="px-4 py-2 bg-datateal text-monsoon font-body text-xs font-bold rounded-xl"
                  >
                    Verify Mandate
                  </button>
                )}
                {selectedBuyer.status === 'Active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      updateUserStatus(selectedBuyer.id, 'Suspended')
                      setSelectedBuyer(null)
                    }}
                    className="px-4 py-2 bg-red-600 text-white font-body text-xs font-bold rounded-xl"
                  >
                    Suspend Buyer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      updateUserStatus(selectedBuyer.id, 'Active')
                      setSelectedBuyer(null)
                    }}
                    className="px-4 py-2 bg-datateal text-monsoon font-body text-xs font-bold rounded-xl"
                  >
                    Activate Buyer
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedBuyer(null)}
                className="px-4 py-2 bg-monsoon text-wheat font-body text-xs font-semibold rounded-xl"
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

