import { useState } from 'react'
import {
  Package,
  Search,
  Filter,
  Eye,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { useDashboard, type CropLot, type LotStatus } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminLotsView() {
  const { lots, flagLot, updateLotStatus, deleteLot } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [cropFilter, setCropFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedLot, setSelectedLot] = useState<CropLot | null>(null)
  const [flagModalLot, setFlagModalLot] = useState<CropLot | null>(null)
  const [flagReason, setFlagReason] = useState('Quality specifications require APMC assay re-verification')

  const cropOptions = ['All', ...Array.from(new Set(lots.map(l => l.crop)))]
  const statusOptions = ['All', 'Active', 'Draft', 'Under Offer', 'Under Review', 'Paused']

  const filteredLots = lots.filter((lot) => {
    if (cropFilter !== 'All' && lot.crop !== cropFilter) return false
    if (statusFilter !== 'All' && lot.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        lot.id.toLowerCase().includes(q) ||
        lot.crop.toLowerCase().includes(q) ||
        lot.variety.toLowerCase().includes(q) ||
        lot.location.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const handleConfirmFlag = () => {
    if (!flagModalLot) return
    flagLot(flagModalLot.id, flagReason)
    setFlagModalLot(null)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-turmeric" />
                COMMODITY LISTINGS CONTROL
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Produce Lot Inventory
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect listed crop lots across all farmer accounts, review standardized quality grading assays, flag suspicious listings, and enforce compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-turmeric flex-shrink-0" />
              <div>
                <span className="text-[10px] font-mono text-turmeric uppercase block">ACTIVE LOTS</span>
                <span className="font-mono text-lg font-bold text-datateal">
                  {lots.filter((l) => l.status === 'Active').length} / {lots.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-soil/10">
          <div className="bg-soil/5 p-3 rounded-2xl border border-soil/10 text-center font-mono">
            <span className="text-[10px] text-soil/60 block font-body uppercase">Total Lots</span>
            <span className="text-lg font-bold text-soil">{lots.length}</span>
          </div>
          <div className="bg-soil/5 p-3 rounded-2xl border border-soil/10 text-center font-mono">
            <span className="text-[10px] text-soil/60 block font-body uppercase">Active Lots</span>
            <span className="text-lg font-bold text-datateal">{lots.filter((l) => l.status === 'Active').length}</span>
          </div>
          <div className="bg-soil/5 p-3 rounded-2xl border border-soil/10 text-center font-mono">
            <span className="text-[10px] text-soil/60 block font-body uppercase">Sold Lots</span>
            <span className="text-lg font-bold text-soil">{lots.filter((l) => l.status === 'Sold').length}</span>
          </div>
          <div className="bg-soil/5 p-3 rounded-2xl border border-soil/10 text-center font-mono">
            <span className="text-[10px] text-soil/60 block font-body uppercase">Pending / Review</span>
            <span className="text-lg font-bold text-amber-700">{lots.filter((l) => l.status !== 'Active' && l.status !== 'Sold').length}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-soil/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search lot ID, crop, variety, farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
            />
          </div>

          <div>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {cropOptions.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Commodities' : c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Lot Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lots Table */}
      <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
        {filteredLots.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-soil/30 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-soil">No lots found</h3>
            <p className="font-body text-xs text-soil/60">No produce lots matched your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body text-soil">
              <thead className="bg-soil/5 border-b border-soil/10 uppercase font-mono text-[10px] text-soil/60">
                <tr>
                  <th className="py-3.5 px-4">Lot ID / Crop</th>
                  <th className="py-3.5 px-4">Farmer / Owner</th>
                  <th className="py-3.5 px-4">Grade & Quality</th>
                  <th className="py-3.5 px-4">Volume</th>
                  <th className="py-3.5 px-4">Expected Price</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil/10">
                {filteredLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-soil/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] text-soil/50 font-bold block">{lot.id}</span>
                      <span className="font-serif font-bold text-sm text-soil block">{lot.crop}</span>
                      <span className="text-[11px] text-soil/60 font-body">{lot.variety}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-serif font-bold text-soil block">{lot.farmerName || 'Ramesh Patel'}</span>
                      <span className="font-mono text-[10px] text-soil/50">{lot.farmerId || 'USR-FRM-01'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-monsoon text-wheat block w-fit mb-1">
                        {lot.grade}
                      </span>
                      <span className="text-[10px] text-soil/60">Moisture: {lot.moisturePercent ? `${lot.moisturePercent}%` : 'Standard'}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-soil">
                      {lot.quantityQtl} {lot.unit || 'qtl'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-datateal block">₹{lot.expectedPrice.toLocaleString('en-IN')}/qtl</span>
                      <span className="font-mono text-[10px] text-soil/50">Min ₹{lot.minAcceptablePrice}/qtl</span>
                    </td>

                    <td className="py-3.5 px-4 text-soil/70">
                      <span className="line-clamp-1">{lot.location}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lot.status === 'Active' ? 'bg-datateal/20 text-soil border border-datateal/30' :
                        lot.status === 'Under Review' ? 'bg-red-500/20 text-red-900 border border-red-400' :
                        lot.status === 'Under Offer' ? 'bg-amber-500/20 text-amber-900 border border-amber-400' : 'bg-soil/10 text-soil'
                      }`}>
                        {lot.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLot(lot)}
                          className="p-1.5 rounded-lg bg-soil/5 hover:bg-soil/10 text-soil transition-colors cursor-pointer"
                          title="Inspect Quality Assay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {lot.status !== 'Under Review' && (
                          <button
                            type="button"
                            onClick={() => setFlagModalLot(lot)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-700 hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Flag for Review"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lot Inspection Modal */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">Produce Lot Quality Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLot(null)}
                className="text-soil/40 hover:text-soil cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-monsoon text-wheat rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-turmeric uppercase block">{selectedLot.id} &bull; {selectedLot.grade}</span>
              <h4 className="font-serif text-xl font-bold">{selectedLot.crop} ({selectedLot.variety})</h4>
              <p className="text-xs text-wheat/80">{selectedLot.quantityQtl} {selectedLot.unit} &bull; Expected ₹{selectedLot.expectedPrice}/qtl</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-body">
              <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
                <span className="text-soil/50 block">Visual Quality</span>
                <strong className="text-soil">{selectedLot.visualQuality || 'Uniform Bold'}</strong>
              </div>
              <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
                <span className="text-soil/50 block">Damage Level</span>
                <strong className="text-soil">{selectedLot.damageLevel || 'None detected'}</strong>
              </div>
              <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
                <span className="text-soil/50 block">Moisture Content</span>
                <strong className="text-soil">{selectedLot.moisturePercent ? `${selectedLot.moisturePercent}%` : '10.4%'}</strong>
              </div>
              <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
                <span className="text-soil/50 block">Pickup Location</span>
                <strong className="text-soil line-clamp-1">{selectedLot.location}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-soil/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLot(null)}
                className="px-4 py-2 bg-monsoon text-wheat font-body text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {flagModalLot && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-700">
              <Flag className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-serif text-lg font-bold text-soil">Flag Lot for Review</h3>
            </div>

            <p className="text-xs font-body text-soil/80 leading-relaxed">
              Placing <strong>{flagModalLot.id}</strong> ({flagModalLot.crop}) under administrative review will temporarily hide it from buyer matching.
            </p>

            <div>
              <label className="block text-xs font-body font-semibold text-soil mb-1">
                Reason for Flagging
              </label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={2}
                className="w-full bg-soil/5 border border-soil/20 rounded-xl p-2 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFlagModalLot(null)}
                className="px-4 py-2 rounded-xl bg-soil/10 text-soil font-body text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFlag}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-body text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Flag Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

