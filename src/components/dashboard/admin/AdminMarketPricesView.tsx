import { useState } from 'react'
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'
import { useDashboard, type MarketPriceData, type CropType } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminMarketPricesView() {
  const { marketData, addMarketPriceRecord, updateMarketPriceRecord, deleteMarketPriceRecord } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [cropFilter, setCropFilter] = useState('All')
  const [mandiFilter, setMandiFilter] = useState('All')

  // Add / Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MarketPriceData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<MarketPriceData | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    crop: 'Wheat (Sharbati)' as CropType,
    mandi: '',
    state: 'Madhya Pradesh',
    distanceKm: 45,
    minPrice: 2600,
    modalPrice: 2840,
    maxPrice: 2950,
    priceChange: 2.5,
    trend: 'up' as 'up' | 'down' | 'steady',
    source: 'AGMARKNET Direct Feed'
  })

  const cropsList: CropType[] = ['Wheat (Sharbati)', 'Soybean', 'Basmati Rice', 'Cotton', 'Maize', 'Chana (Gram)', 'Mustard']
  const mandisList = ['All', ...Array.from(new Set(marketData.map(m => m.mandi)))]

  const filteredPrices = marketData.filter((item) => {
    if (cropFilter !== 'All' && item.crop !== cropFilter) return false
    if (mandiFilter !== 'All' && item.mandi !== mandiFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        item.mandi.toLowerCase().includes(q) ||
        item.crop.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const handleOpenAdd = () => {
    setFormData({
      crop: 'Wheat (Sharbati)',
      mandi: '',
      state: 'Madhya Pradesh',
      distanceKm: 40,
      minPrice: 2600,
      modalPrice: 2840,
      maxPrice: 2950,
      priceChange: 1.8,
      trend: 'up',
      source: 'AGMARKNET Live Feed'
    })
    setEditingRecord(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (item: MarketPriceData) => {
    setFormData({
      crop: item.crop,
      mandi: item.mandi,
      state: item.state,
      distanceKm: item.distanceKm,
      minPrice: item.minPrice,
      modalPrice: item.modalPrice,
      maxPrice: item.maxPrice,
      priceChange: item.priceChange,
      trend: item.trend,
      source: 'APMC Authorized Terminal'
    })
    setEditingRecord(item)
    setIsAddModalOpen(true)
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.mandi.trim()) return

    if (editingRecord) {
      updateMarketPriceRecord(editingRecord.mandi, editingRecord.crop, {
        minPrice: Number(formData.minPrice),
        modalPrice: Number(formData.modalPrice),
        maxPrice: Number(formData.maxPrice),
        priceChange: Number(formData.priceChange),
        trend: formData.trend,
        distanceKm: Number(formData.distanceKm),
      })
    } else {
      addMarketPriceRecord({
        crop: formData.crop,
        mandi: formData.mandi,
        state: formData.state,
        distanceKm: Number(formData.distanceKm),
        minPrice: Number(formData.minPrice),
        modalPrice: Number(formData.modalPrice),
        maxPrice: Number(formData.maxPrice),
        priceChange: Number(formData.priceChange),
        trend: formData.trend,
        lastUpdated: 'Just now',
      })
    }

    setIsAddModalOpen(false)
    setEditingRecord(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return
    deleteMarketPriceRecord(deleteConfirm.mandi, deleteConfirm.crop)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-turmeric" />
                MANDI PRICE DATA AUTHORITY
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              APMC Mandi Price Feeds
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Maintain standardized commodity modal rates, publish daily APMC arrival figures, and prepare data pipelines for eNAM / AGMARKNET synchronizations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-monsoon text-wheat font-body text-xs font-bold rounded-xl hover:bg-monsoon/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-turmeric" />
            <span>Publish New Market Price</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-soil/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search mandi, crop, state..."
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
              <option value="All">All Commodities</option>
              {cropsList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={mandiFilter}
              onChange={(e) => setMandiFilter(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {mandisList.map((m) => (
                <option key={m} value={m}>{m === 'All' ? 'All APMC Mandis' : m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Market Prices Table */}
      <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-soil">
            <thead className="bg-soil/5 border-b border-soil/10 uppercase font-mono text-[10px] text-soil/60">
              <tr>
                <th className="py-3.5 px-4">APMC Mandi</th>
                <th className="py-3.5 px-4">Commodity</th>
                <th className="py-3.5 px-4">Min Price</th>
                <th className="py-3.5 px-4">Modal Price</th>
                <th className="py-3.5 px-4">Max Price</th>
                <th className="py-3.5 px-4">24h Trend</th>
                <th className="py-3.5 px-4">Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil/10">
              {filteredPrices.map((item, idx) => (
                <tr key={idx} className="hover:bg-soil/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-serif font-bold text-sm text-soil block">{item.mandi}</span>
                    <span className="text-[10px] text-soil/50 font-body">{item.state} &bull; {item.distanceKm} km</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-monsoon bg-soil/10 px-2 py-0.5 rounded-full">
                      {item.crop}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-soil">
                    ₹{item.minPrice.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-base font-bold text-datateal">
                      ₹{item.modalPrice.toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-soil">
                    ₹{item.maxPrice.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-mono text-xs font-bold inline-flex items-center gap-1 ${
                      item.trend === 'up' ? 'text-datateal' : item.trend === 'down' ? 'text-red-700' : 'text-soil/60'
                    }`}>
                      {item.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {item.priceChange > 0 ? `+${item.priceChange}%` : `${item.priceChange}%`}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[10px] text-soil/50">
                    {item.lastUpdated}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-soil/5 hover:bg-soil/10 text-soil transition-colors cursor-pointer"
                        title="Edit Price Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(item)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-700 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Delete Price Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Market Price Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">
                  {editingRecord ? 'Edit Market Price Feed' : 'Publish New Mandi Rate'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-soil/40 hover:text-soil cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-soil mb-1">Mandi Name</label>
                  <input
                    type="text"
                    required
                    value={formData.mandi}
                    onChange={(e) => setFormData({ ...formData, mandi: e.target.value })}
                    placeholder="e.g. Harda Mandi Yard"
                    disabled={!!editingRecord}
                    className="w-full bg-soil/5 border border-soil/20 rounded-xl px-3 py-2 text-xs font-body text-soil focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-soil mb-1">Commodity</label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value as any })}
                    disabled={!!editingRecord}
                    className="w-full bg-soil/5 border border-soil/20 rounded-xl px-3 py-2 text-xs font-body text-soil focus:outline-none focus:border-turmeric cursor-pointer"
                  >
                    {cropsList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-soil mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                    className="w-full bg-soil/5 border border-soil/20 rounded-xl px-3 py-2 font-mono text-xs text-soil focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-soil mb-1">Modal Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.modalPrice}
                    onChange={(e) => setFormData({ ...formData, modalPrice: Number(e.target.value) })}
                    className="w-full bg-soil/5 border border-soil/20 rounded-xl px-3 py-2 font-mono text-xs text-datateal font-bold focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-soil mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })}
                    className="w-full bg-soil/5 border border-soil/20 rounded-xl px-3 py-2 font-mono text-xs text-soil focus:outline-none focus:border-turmeric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-soil mb-1">Price Change (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.priceChange}
                    onChange={(e) => setFormData({ ...formData, priceChange: Number(e.target.value) })}
                    className="w-full bg-soil/5 border border-soil/20 rounded-xl px-3 py-2 font-mono text-xs text-soil focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-soil mb-1">Trend Direction</label>
                  <select
                    value={formData.trend}
                    onChange={(e) => setFormData({ ...formData, trend: e.target.value as any })}
                    className="w-full bg-soil/5 border border-soil/20 rounded-xl px-3 py-2 text-xs font-body text-soil focus:outline-none focus:border-turmeric cursor-pointer"
                  >
                    <option value="up">Rising (Bullish)</option>
                    <option value="down">Declining (Bearish)</option>
                    <option value="steady">Steady</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-soil/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-soil/10 text-soil font-body text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-turmeric text-monsoon font-body text-xs font-bold rounded-xl hover:bg-turmeric/90 cursor-pointer shadow-sm"
                >
                  {editingRecord ? 'Save Price Updates' : 'Publish Market Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-serif text-lg font-bold text-soil">Remove Market Price Record</h3>
            </div>

            <p className="text-xs font-body text-soil/80 leading-relaxed">
              Are you sure you want to remove the price feed for <strong>{deleteConfirm.mandi}</strong> ({deleteConfirm.crop})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-soil/10 text-soil font-body text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-body text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Remove Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

