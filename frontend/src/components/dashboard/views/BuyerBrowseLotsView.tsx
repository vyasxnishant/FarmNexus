import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sprout,
  Search,
  Sliders,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle2,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar
} from 'lucide-react'
import { useDashboard, type CropLot } from '../../../context/DashboardContext'

export function BuyerBrowseLotsView() {
  const { lots, buyerRequirement, calculateLotMatchScore, lang } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [cropFilter, setCropFilter] = useState('All')
  const [gradeFilter, setGradeFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [matchThreshold, setMatchThreshold] = useState<'all' | 'high'>('all')
  const [statusFilter, setStatusFilter] = useState<'Active' | 'All'>('Active')
  const [sortBy, setSortBy] = useState<'match' | 'price_low' | 'price_high' | 'quantity' | 'newest'>('match')

  // Calculate matching scores and filter
  const processedLots = useMemo(() => {
    return lots
      .filter((lot) => {
        // Status filter
        if (statusFilter === 'Active' && lot.status !== 'Active') return false

        // Crop filter
        if (cropFilter !== 'All' && lot.crop !== cropFilter) return false

        // Grade filter
        if (gradeFilter !== 'All' && !lot.grade.includes(gradeFilter)) return false

        // Location filter
        if (locationFilter !== 'All' && !lot.location.toLowerCase().includes(locationFilter.toLowerCase())) return false

        // Search query
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
      .map((lot) => {
        const match = calculateLotMatchScore(lot, buyerRequirement)
        return { lot, match }
      })
      .filter((item) => {
        if (matchThreshold === 'high' && !item.match.isHighMatch) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.match.score - a.match.score
        if (sortBy === 'price_low') return a.lot.expectedPrice - b.lot.expectedPrice
        if (sortBy === 'price_high') return b.lot.expectedPrice - a.lot.expectedPrice
        if (sortBy === 'quantity') return b.lot.quantityQtl - a.lot.quantityQtl
        return 0
      })
  }, [lots, buyerRequirement, statusFilter, cropFilter, gradeFilter, locationFilter, searchQuery, matchThreshold, sortBy])

  const availableCrops = ['All', ...Array.from(new Set(lots.map((l) => l.crop)))]
  const availableGrades = ['All', 'Grade A (Export)', 'Grade A', 'Grade B', 'Grade C']
  const availableLocations = ['All', 'Madhya Pradesh', 'Harda', 'Sirali', 'Indore', 'Bhopal']

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Search/Filter Controls */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-turmeric" />
                Produce Discovery Marketplace
              </span>
              <span className="font-mono text-xs text-soil/60">
                {processedLots.length} Lots Available
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Browse Available Farmer Lots
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect farm-gate lots with verified self-declared quality grading, moisture testing, and direct escrow deal enablement.
            </p>
          </div>

          <Link
            to="/buyer/dashboard"
            className="px-4 py-2.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/15 hover:bg-soil/10 transition-colors self-start md:self-auto"
          >
            Buyer Overview
          </Link>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-4 border-t border-soil/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-soil/40" />
              <input
                type="text"
                placeholder="Search by Crop, Variety, Location, Lot ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            {/* Match Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMatchThreshold('all')}
                className={`px-3 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer ${
                  matchThreshold === 'all'
                    ? 'bg-monsoon text-wheat font-semibold shadow-xs'
                    : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                }`}
              >
                All Lots ({lots.length})
              </button>

              <button
                type="button"
                onClick={() => setMatchThreshold('high')}
                className={`px-3 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  matchThreshold === 'high'
                    ? 'bg-turmeric text-monsoon font-bold shadow-xs'
                    : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>High Match (&ge;75%)</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">Crop</label>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                {availableCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">Quality Grade</label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                {availableGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                {availableLocations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">Sort Lots</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                <option value="match">Sort: Highest Match %</option>
                <option value="price_low">Sort: Lowest Price</option>
                <option value="price_high">Sort: Highest Price</option>
                <option value="quantity">Sort: Largest Volume</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* LOTS GRID */}
      {processedLots.length === 0 ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
          <Sprout className="w-12 h-12 text-soil/30 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-soil">No Produce Lots Found</h3>
          <p className="font-body text-xs text-soil/60 max-w-sm mx-auto">
            Try adjusting your search terms, grade filter, or location criteria.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedLots.map(({ lot, match }) => {
            const grossVal = lot.expectedPrice * lot.quantityQtl

            return (
              <div
                key={lot.id}
                className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm hover:border-turmeric/60 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header: Lot ID, Score Badge, Crop */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-soil/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-soil/60">{lot.id}</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            match.score >= 80
                              ? 'bg-datateal/20 text-soil border border-datateal/40'
                              : 'bg-turmeric/20 text-soil border border-turmeric/40'
                          }`}
                        >
                          {match.score}% MATCH
                        </span>
                        {lot.status !== 'Active' && (
                          <span className="font-mono text-[10px] bg-orange-500/15 text-orange-700 px-2 py-0.5 rounded-full">
                            {lot.status}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-soil mt-1">{lot.crop}</h3>
                      <p className="font-body text-xs text-soil/70">{lot.variety}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-soil block">
                        ₹{lot.expectedPrice.toLocaleString('en-IN')}<span className="text-[10px] text-soil/60">/qtl</span>
                      </span>
                      <span className="font-mono text-[11px] text-datateal font-bold">
                        ₹{grossVal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Sample Photo Thumbnail if available */}
                  {lot.imageUrl && (
                    <div className="rounded-xl overflow-hidden max-h-28 border border-soil/10 mt-2">
                      <img src={lot.imageUrl} alt={lot.crop} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Specifications 3-Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3">
                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="text-[10px] text-soil/50 block">VOLUME</span>
                      <span className="font-mono text-xs font-bold text-soil">
                        {lot.quantityQtl} {lot.unit || 'qtl'}
                      </span>
                    </div>

                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="text-[10px] text-soil/50 block">GRADE / LOOKS</span>
                      <span className="font-mono text-xs font-bold text-soil truncate block">
                        {lot.grade} &bull; {lot.visualQuality || 'Good'}
                      </span>
                    </div>

                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="text-[10px] text-soil/50 block">MOISTURE / DAMAGE</span>
                      <span className="font-mono text-xs font-bold text-soil">
                        {lot.moisturePercent}% &bull; {lot.damageLevel || 'Low'}
                      </span>
                    </div>
                  </div>

                  {/* Location & Harvest Date */}
                  <div className="space-y-1 text-xs font-body text-soil/70 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-turmeric flex-shrink-0" />
                      <span className="truncate">{lot.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-soil/50">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Harvest: {lot.harvestDate}</span>
                    </div>
                  </div>

                  {/* Match Reasons Tag Pills */}
                  <div className="mt-3 pt-3 border-t border-soil/10 space-y-1">
                    <span className="text-[10px] font-mono text-soil/50 uppercase tracking-wider block">
                      MATCHING REASONS:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {match.matchReasons.slice(0, 3).map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="text-[10px] font-body px-2 py-0.5 rounded-full bg-soil/5 border border-soil/10 text-soil/80"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-soil/10 flex items-center justify-between gap-2">
                  <Link
                    to={`/buyer/lots/${lot.id}`}
                    className="px-3 py-2 rounded-xl bg-monsoon text-wheat font-body text-xs font-semibold hover:bg-monsoon/90 transition-colors flex items-center gap-1"
                  >
                    <span>Inspect Lot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/buyer/lots/${lot.id}?action=offer`}
                    className="px-4 py-2 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Make Offer</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

