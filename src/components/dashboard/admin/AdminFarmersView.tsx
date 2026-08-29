import { useState } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  Package,
  Receipt,
  CreditCard,
  Building2,
  Phone,
  MapPin,
  Eye,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'
import { useDashboard, type UserRecord } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminFarmersView() {
  const { users, lots, offers, transactions, verifyUser, updateUserStatus } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFarmer, setSelectedFarmer] = useState<UserRecord | null>(null)

  const farmers = users.filter((u) => u.userType === 'Farmer')

  const filteredFarmers = farmers.filter((f) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        f.name.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        (f.organization && f.organization.toLowerCase().includes(q)) ||
        f.location.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Get associated lots and transactions for selected farmer
  const farmerLots = lots.filter((l) => !selectedFarmer || l.location.includes(selectedFarmer.district) || l.location.includes('Sirali'))
  const farmerTransactions = transactions.filter((t) => !selectedFarmer || t.farmerName === selectedFarmer.name)

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-turmeric" />
                FARMER PRODUCER MANAGEMENT
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Farmer Profiles & FPO Directory
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect producer land holdings, FPO affiliations, active produce listings, and bank payout mandates.
            </p>
          </div>

          <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-turmeric uppercase block">VERIFIED PRODUCERS</span>
              <span className="font-mono text-xl font-bold text-datateal">{farmers.length} Farmers</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="pt-4 border-t border-soil/10 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search farmer name, FPO, village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
            />
          </div>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarmers.map((farmer) => (
          <div
            key={farmer.id}
            className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm hover:border-soil/30 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-monsoon text-turmeric flex items-center justify-center font-serif text-lg font-bold">
                    {farmer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-soil">{farmer.name}</h3>
                    <span className="font-mono text-[10px] text-soil/50">{farmer.id} &bull; {farmer.registeredDate}</span>
                  </div>
                </div>

                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  farmer.status === 'Active' ? 'bg-datateal/20 text-soil border border-datateal/40' : 'bg-amber-500/20 text-amber-900'
                }`}>
                  {farmer.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-body text-soil/80 pt-2 border-t border-soil/10">
                <p className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-turmeric flex-shrink-0" />
                  <span className="font-semibold text-soil">{farmer.organization || 'Individual Producer'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-soil/40 flex-shrink-0" />
                  <span>{farmer.location} ({farmer.state})</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-soil/40 flex-shrink-0" />
                  <span className="font-mono">{farmer.phone}</span>
                </p>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                <div className="bg-soil/5 rounded-xl p-2 border border-soil/10">
                  <span className="text-[9px] text-soil/50 block font-body">LOTS</span>
                  <span className="text-sm font-bold text-soil">{farmer.lotsCount || 1}</span>
                </div>
                <div className="bg-soil/5 rounded-xl p-2 border border-soil/10">
                  <span className="text-[9px] text-soil/50 block font-body">DEALS</span>
                  <span className="text-sm font-bold text-soil">{farmer.transactionsCount || 1}</span>
                </div>
                <div className="bg-soil/5 rounded-xl p-2 border border-soil/10">
                  <span className="text-[9px] text-soil/50 block font-body">KYC</span>
                  <span className="text-xs font-bold text-datateal">{farmer.kycVerified ? 'VERIFIED' : 'PENDING'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-soil/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedFarmer(farmer)}
                className="w-full py-2 bg-monsoon text-wheat font-body text-xs font-bold rounded-xl hover:bg-monsoon/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-turmeric" />
                <span>Inspect Farmer Dossier</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Farmer Dossier Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">Producer Profile & Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFarmer(null)}
                className="text-soil/40 hover:text-soil cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-monsoon text-wheat rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-2xl font-bold">{selectedFarmer.name}</h4>
                <span className="font-mono text-xs text-turmeric font-bold bg-wheat/10 px-2.5 py-0.5 rounded-full">
                  {selectedFarmer.status}
                </span>
              </div>
              <p className="text-xs text-wheat/80">{selectedFarmer.organization} &bull; {selectedFarmer.location}</p>
            </div>

            {/* Associated Lots */}
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-soil flex items-center gap-2">
                <Package className="w-4 h-4 text-turmeric" />
                <span>Current Produce Lots</span>
              </h4>
              <div className="space-y-2">
                {farmerLots.slice(0, 3).map((lot) => (
                  <div key={lot.id} className="p-3 bg-soil/5 rounded-xl border border-soil/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-soil">{lot.crop} ({lot.grade})</span>
                      <span className="text-xs text-soil/60 block">{lot.quantityQtl} {lot.unit} &bull; Expected ₹{lot.expectedPrice}/qtl</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-monsoon text-wheat">
                      {lot.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="pt-3 border-t border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!selectedFarmer.kycVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      verifyUser(selectedFarmer.id)
                      setSelectedFarmer(null)
                    }}
                    className="px-4 py-2 bg-datateal text-monsoon font-body text-xs font-bold rounded-xl"
                  >
                    Verify KYC Mandate
                  </button>
                )}
                {selectedFarmer.status === 'Active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      updateUserStatus(selectedFarmer.id, 'Suspended')
                      setSelectedFarmer(null)
                    }}
                    className="px-4 py-2 bg-red-600 text-white font-body text-xs font-bold rounded-xl"
                  >
                    Suspend Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      updateUserStatus(selectedFarmer.id, 'Active')
                      setSelectedFarmer(null)
                    }}
                    className="px-4 py-2 bg-datateal text-monsoon font-body text-xs font-bold rounded-xl"
                  >
                    Activate Account
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedFarmer(null)}
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

