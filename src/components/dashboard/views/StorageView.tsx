import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Building2,
  MapPin,
  ShieldCheck,
  Search,
  Sliders,
  Sparkles,
  PhoneCall,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Layers
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import {
  demoStorageFacilities,
  calculateStorageCost,
  type StorageFacility,
  type StorageType
} from '../../../services/logisticsService'
import { AgriMapView, type MapMarkerPoint } from '../components/AgriMapView'

export function StorageView() {
  const [searchParams] = useSearchParams()
  const { lots, lang } = useDashboard()

  const lotIdParam = searchParams.get('lotId')
  const [selectedLotId, setSelectedLotId] = useState<string>(
    lotIdParam || (lots.length > 0 ? lots[0].id : 'LOT-AGN-081')
  )

  const activeLot = lots.find(l => l.id === selectedLotId) || lots[0]
  const quantityQtl = activeLot ? activeLot.quantityQtl : 100

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedDistance, setSelectedDistance] = useState<'all' | '20' | '50' | '100'>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'distance' | 'cost' | 'capacity'>('distance')

  // Selected Facility for Rent Calculator / Details Modal
  const [calculatorFacility, setCalculatorFacility] = useState<StorageFacility | null>(demoStorageFacilities[0])
  const [durationDays, setDurationDays] = useState<number>(30)
  const [selectedDetailFacility, setSelectedDetailFacility] = useState<StorageFacility | null>(null)

  // Booking Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [bookSuccess, setBookSuccess] = useState(false)

  // Processed Facilities
  const filteredFacilities = useMemo(() => {
    return demoStorageFacilities
      .filter((fac) => {
        if (selectedType !== 'All' && fac.type !== selectedType) return false
        if (selectedStatus !== 'All' && fac.status !== selectedStatus) return false

        if (selectedDistance === '20' && fac.distanceKm > 20) return false
        if (selectedDistance === '50' && fac.distanceKm > 50) return false
        if (selectedDistance === '100' && fac.distanceKm > 100) return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const match =
            fac.name.toLowerCase().includes(q) ||
            fac.district.toLowerCase().includes(q) ||
            fac.type.toLowerCase().includes(q)
          if (!match) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm
        if (sortBy === 'cost') return a.costPerQtlPerMonth - b.costPerQtlPerMonth
        if (sortBy === 'capacity') return b.availableCapacityQtl - a.availableCapacityQtl
        return 0
      })
  }, [selectedType, selectedStatus, selectedDistance, searchQuery, sortBy])

  // Map Markers
  const originMarker: MapMarkerPoint = {
    id: 'origin-godown',
    title: activeLot ? activeLot.location : 'Sirali Farm Godown #2',
    type: 'origin',
    coordinates: [22.285, 77.012],
    subtitle: `${activeLot ? activeLot.crop : 'Produce'} Storage Origin`,
  }

  const storageMarkers: MapMarkerPoint[] = filteredFacilities.map((fac) => ({
    id: fac.id,
    title: fac.name,
    type: 'storage',
    coordinates: fac.coordinates,
    subtitle: `${fac.type} &bull; ${fac.distanceKm} km`,
    badgeText: `₹${fac.costPerQtlPerMonth}/qtl/month (${fac.availableCapacityQtl.toLocaleString('en-IN')} qtl space)`,
  }))

  const rentEstimate = calculatorFacility
    ? calculateStorageCost(calculatorFacility, quantityQtl, durationDays)
    : null

  const handleConfirmSpace = (e: React.FormEvent) => {
    e.preventDefault()
    setBookSuccess(true)
    setTimeout(() => {
      setIsBookModalOpen(false)
      setBookSuccess(false)
    }, 2000)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-turmeric" />
                Agri-Storage & Warehousing Directory
              </span>
              <span className="font-mono text-xs text-soil/70 bg-soil/5 border border-soil/15 px-2.5 py-0.5 rounded-full">
                WDRA Approved Godowns
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Nearby Storage & Silo Facilities
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Locate certified warehouses, scientific cold chains, and rural grain silos with electronic warehouse receipt (e-NWR) pledge financing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              to="/farmer/logistics"
              className="px-4 py-2.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/15 hover:bg-soil/10 transition-colors"
            >
              Transit Logistics
            </Link>
            <Link
              to="/farmer/market-prices"
              className="px-4 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all shadow-sm"
            >
              Compare Mandis
            </Link>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="pt-4 border-t border-soil/10 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-soil/40" />
              <input
                type="text"
                placeholder="Search storage facilities by name, district, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
              />
            </div>

            {/* Distance Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-body font-semibold text-soil/60 mr-1">Distance:</span>
              {[
                { id: 'all', label: 'All Distances' },
                { id: '20', label: '< 20 km' },
                { id: '50', label: '< 50 km' },
                { id: '100', label: '< 100 km' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDistance(d.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-body font-medium transition-all cursor-pointer ${
                    selectedDistance === d.id
                      ? 'bg-monsoon text-wheat font-semibold shadow-xs'
                      : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">Storage Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold cursor-pointer"
              >
                <option value="All">All Storage Types</option>
                <option value="Dry Warehouse">Dry Warehouse</option>
                <option value="Silo Complex">Silo Complex</option>
                <option value="Cold Storage">Cold Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">Availability</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold cursor-pointer"
              >
                <option value="All">All Availability</option>
                <option value="Available">Space Available</option>
                <option value="Limited Space">Limited Space</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">Sort Facilities</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold cursor-pointer"
              >
                <option value="distance">Sort: Nearest Distance</option>
                <option value="cost">Sort: Lowest Cost / Month</option>
                <option value="capacity">Sort: Largest Available Space</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil/70 mb-1">For Lot</label>
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold cursor-pointer"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} ({l.quantityQtl} {l.unit || 'qtl'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Map & Facilities, Right Live Storage Rent Estimator */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Leaflet OpenStreetMap & Facilities List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Leaflet OpenStreetMap Container */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">
                  Regional Warehousing Network Map
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold text-soil/70 bg-soil/5 px-2.5 py-1 rounded-full border border-soil/10">
                {filteredFacilities.length} Facilities in Radius
              </span>
            </div>

            <AgriMapView
              origin={originMarker}
              storageFacilities={storageMarkers}
              height="300px"
              showRouteLine={false}
            />
          </div>

          {/* Facilities Cards List */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-soil">
              Available Facilities ({filteredFacilities.length})
            </h3>

            {filteredFacilities.length === 0 ? (
              <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
                <Building2 className="w-12 h-12 text-soil/30 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-soil">No Storage Facilities Found</h4>
                <p className="font-body text-xs text-soil/60 max-w-sm mx-auto">
                  Try broadening your distance filter or selecting all storage categories.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFacilities.map((fac) => {
                  const isSelectedForCalc = calculatorFacility?.id === fac.id

                  return (
                    <div
                      key={fac.id}
                      className={`bg-wheat rounded-3xl border p-6 shadow-sm transition-all flex flex-col justify-between space-y-4 ${
                        isSelectedForCalc ? 'border-turmeric shadow-md' : 'border-soil/15 hover:border-soil/30'
                      }`}
                    >
                      <div>
                        {/* Top Bar: Name, Type Badge, Distance & Cost */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-soil/10">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-soil/60">{fac.id}</span>
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-soil/5 border border-soil/15 text-soil">
                                {fac.type}
                              </span>
                              {fac.isWDRAApproved && (
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-datateal/20 text-soil border border-datateal/40">
                                  WDRA Certified
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-xl font-bold text-soil mt-1">{fac.name}</h4>
                            <p className="font-body text-xs text-soil/70 mt-0.5">{fac.location}</p>
                          </div>

                          <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
                            <span className="font-mono text-xl font-bold text-soil block">
                              ₹{fac.costPerQtlPerMonth}<span className="text-xs font-normal text-soil/60">/qtl/mo</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-datateal">
                              {fac.distanceKm} km from godown
                            </span>
                          </div>
                        </div>

                        {/* Capacity 2-Grid */}
                        <div className="grid grid-cols-2 gap-3 py-3">
                          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                            <span className="text-[10px] font-body text-soil/50 block uppercase">AVAILABLE SPACE</span>
                            <span className="font-mono text-sm font-bold text-datateal">
                              {fac.availableCapacityQtl.toLocaleString('en-IN')} Quintals
                            </span>
                            <span className="text-[10px] font-mono text-soil/50 block">({Math.round(fac.availableCapacityQtl / 10)} MT)</span>
                          </div>

                          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                            <span className="text-[10px] font-body text-soil/50 block uppercase">TOTAL CAPACITY</span>
                            <span className="font-mono text-sm font-bold text-soil">
                              {fac.totalCapacityQtl.toLocaleString('en-IN')} Quintals
                            </span>
                            <span className="text-[10px] font-mono text-soil/50 block">({Math.round(fac.totalCapacityQtl / 10)} MT)</span>
                          </div>
                        </div>

                        {/* Key Features Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {fac.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="text-[11px] font-body px-2.5 py-1 rounded-full bg-soil/5 border border-soil/10 text-soil/80"
                            >
                              &bull; {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="pt-3 border-t border-soil/10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCalculatorFacility(fac)}
                            className={`px-3.5 py-2 rounded-xl font-body text-xs font-semibold transition-all cursor-pointer ${
                              isSelectedForCalc
                                ? 'bg-monsoon text-wheat font-bold shadow-xs'
                                : 'bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15'
                            }`}
                          >
                            {isSelectedForCalc ? '✓ Estimating Rent' : 'Calculate Rent'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedDetailFacility(fac)}
                            className="px-3 py-2 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold hover:bg-soil/10 border border-soil/15 transition-colors"
                          >
                            Facility Info
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCalculatorFacility(fac)
                            setIsBookModalOpen(true)
                          }}
                          className="px-4 py-2 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all shadow-sm cursor-pointer"
                        >
                          Book Space
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Live Storage Rent Calculator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 bg-monsoon text-wheat rounded-3xl p-6 border-2 border-turmeric/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-wheat/15">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-turmeric" />
                <span className="font-mono text-xs font-bold text-turmeric uppercase tracking-wider">
                  STORAGE RENT ESTIMATOR
                </span>
              </div>
              <span className="font-mono text-[11px] text-wheat/60 truncate max-w-[150px]">
                {calculatorFacility ? calculatorFacility.name.split(' ')[0] : 'Facility'}
              </span>
            </div>

            {calculatorFacility && rentEstimate ? (
              <div className="space-y-5">
                <div className="p-3.5 bg-wheat/5 rounded-2xl border border-wheat/10 space-y-1">
                  <span className="text-xs font-bold text-wheat block">{calculatorFacility.name}</span>
                  <p className="text-[11px] text-wheat/60">{calculatorFacility.location} &bull; {calculatorFacility.distanceKm} km</p>
                </div>

                {/* Storage Duration Selector Pills */}
                <div>
                  <label className="block font-body text-xs font-semibold text-wheat mb-2">
                    Storage Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { days: 15, label: '15 Days' },
                      { days: 30, label: '1 Month' },
                      { days: 90, label: '3 Months' },
                      { days: 180, label: '6 Months' },
                    ].map((d) => (
                      <button
                        key={d.days}
                        type="button"
                        onClick={() => setDurationDays(d.days)}
                        className={`py-2 px-2 rounded-xl font-mono text-xs font-bold border text-center transition-all cursor-pointer ${
                          durationDays === d.days
                            ? 'bg-turmeric text-monsoon border-turmeric shadow-xs'
                            : 'bg-wheat/5 text-wheat/80 border-wheat/15 hover:bg-wheat/10'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-2.5 font-body text-xs text-wheat/80 pt-2 border-t border-wheat/10">
                  <div className="flex items-center justify-between">
                    <span>Lot Harvest Volume:</span>
                    <span className="font-mono font-bold text-wheat">{quantityQtl} Quintals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Rate:</span>
                    <span className="font-mono font-bold text-wheat">₹{calculatorFacility.costPerQtlPerMonth}/qtl/month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Daily Storage Cost:</span>
                    <span className="font-mono font-bold text-wheat">~₹{rentEstimate.costPerDay}/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Rate per Quintal:</span>
                    <span className="font-mono font-bold text-turmeric">₹{rentEstimate.ratePerQtl}/qtl</span>
                  </div>
                </div>

                {/* Total Rent Card */}
                <div className="p-5 bg-wheat/10 rounded-2xl border border-turmeric/30 space-y-1.5">
                  <span className="text-[11px] font-body text-wheat/70 block uppercase">
                    ESTIMATED TOTAL STORAGE CHARGE ({durationDays} DAYS)
                  </span>
                  <p className="font-mono text-3xl font-bold text-datateal">
                    ₹{rentEstimate.totalCost.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] font-mono text-wheat/50 block">
                    e-NWR pledge loan eligibility: Up to 70% produce valuation
                  </span>
                </div>

                {/* Inquire CTA */}
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Reserve Storage Space for {quantityQtl} qtl</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-wheat/60 py-4 text-center">
                Select a facility from the list on the left to calculate storage rent.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Facility Details Modal */}
      {selectedDetailFacility && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div>
                <span className="font-mono text-xs font-bold text-soil/60">{selectedDetailFacility.id}</span>
                <h3 className="font-serif text-2xl font-bold text-soil mt-0.5">{selectedDetailFacility.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailFacility(null)}
                className="text-soil/40 hover:text-soil"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-body text-soil">
              <p><span className="font-bold">Address:</span> {selectedDetailFacility.location}, {selectedDetailFacility.district}, {selectedDetailFacility.state}</p>
              <p><span className="font-bold">Facility Manager:</span> {selectedDetailFacility.managerName}</p>
              <p><span className="font-bold">Direct Phone:</span> <span className="font-mono font-bold text-datateal">{selectedDetailFacility.contactPhone}</span></p>
              <p><span className="font-bold">Storage Type:</span> {selectedDetailFacility.type}</p>
              <p><span className="font-bold">Available Capacity:</span> {selectedDetailFacility.availableCapacityQtl.toLocaleString('en-IN')} Quintals</p>
              <p><span className="font-bold">Monthly Charge:</span> ₹{selectedDetailFacility.costPerQtlPerMonth}/quintal/month</p>
            </div>

            <div className="pt-2 border-t border-soil/10">
              <span className="font-bold text-xs text-soil block mb-2">Facility Amenities & Standards:</span>
              <div className="space-y-1.5">
                {selectedDetailFacility.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-soil/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-datateal flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-soil/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDetailFacility(null)}
                className="px-4 py-2 rounded-xl bg-soil/5 border border-soil/15 text-soil font-semibold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalculatorFacility(selectedDetailFacility)
                  setSelectedDetailFacility(null)
                  setIsBookModalOpen(true)
                }}
                className="px-4 py-2 rounded-xl bg-turmeric text-monsoon font-bold text-xs shadow-xs"
              >
                Reserve Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl animate-fade-in">
            {bookSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-datateal mx-auto animate-bounce" />
                <h3 className="font-serif text-2xl font-bold text-soil">
                  Space Reservation Request Sent!
                </h3>
                <p className="font-body text-xs text-soil/70 max-w-xs mx-auto">
                  Warehouse manager has been notified. An e-NWR space allotment receipt will be generated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSpace} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-soil/10">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-turmeric" />
                    <h3 className="font-serif text-xl font-bold text-soil">
                      Reserve Storage Space
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="text-soil/40 hover:text-soil"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-soil/5 rounded-xl border border-soil/10 space-y-1 text-xs font-body text-soil">
                  <p><span className="font-bold">Facility:</span> {calculatorFacility?.name}</p>
                  <p><span className="font-bold">Quantity:</span> {quantityQtl} Quintals ({activeLot ? activeLot.crop : 'Produce'})</p>
                  <p><span className="font-bold">Duration:</span> {durationDays} Days</p>
                  <p><span className="font-bold">Estimated Rent:</span> ₹{rentEstimate?.totalCost.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1">
                    Expected Storage Intake Date
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-body text-xs text-soil font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1">
                    Farmer Contact Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+91 98261 44520"
                    className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-mono text-xs font-bold text-soil"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-turmeric text-monsoon font-body text-xs font-bold rounded-xl hover:bg-turmeric/90 transition-all shadow-sm cursor-pointer"
                >
                  Submit Space Reservation
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
