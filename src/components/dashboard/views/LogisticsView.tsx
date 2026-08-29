import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  PhoneCall,
  ChevronRight,
  RotateCcw,
  Navigation,
  FileText
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import {
  transportVehicles,
  calculateTransportCost,
  type TransportVehicle,
  type VehicleType
} from '../../../services/logisticsService'
import { AgriMapView, type MapMarkerPoint } from '../components/AgriMapView'

export function LogisticsView() {
  const [searchParams] = useSearchParams()
  const { lots, lang } = useDashboard()

  const lotIdParam = searchParams.get('lotId')
  const mandiParam = searchParams.get('mandi')

  // Selected Lot
  const [selectedLotId, setSelectedLotId] = useState<string>(
    lotIdParam || (lots.length > 0 ? lots[0].id : 'LOT-AGN-081')
  )

  const activeLot = lots.find(l => l.id === selectedLotId) || lots[0]

  // Available Mandi Destinations
  const mandiOptions = useMemo(() => {
    return [
      { name: 'Harda APMC Mandi', district: 'Harda', distanceKm: 18, coords: [22.3395, 77.0945] as [number, number], modalPrice: 2840 },
      { name: 'Hoshangabad Mandi Hub', district: 'Narmadapuram', distanceKm: 78, coords: [22.751, 77.729] as [number, number], modalPrice: 2890 },
      { name: 'Indore APMC Mandi', district: 'Indore', distanceKm: 145, coords: [22.7196, 75.8577] as [number, number], modalPrice: 3010 },
      { name: 'Bhopal Karond APMC', district: 'Bhopal', distanceKm: 155, coords: [23.2599, 77.4126] as [number, number], modalPrice: 2960 },
      { name: 'Ujjain APMC Mandi', district: 'Ujjain', distanceKm: 195, coords: [23.1765, 75.7885] as [number, number], modalPrice: 2980 },
    ]
  }, [])

  const [selectedMandiName, setSelectedMandiName] = useState<string>(
    mandiParam || mandiOptions[0].name
  )

  const selectedMandi = mandiOptions.find(m => m.name === selectedMandiName) || mandiOptions[0]

  // Selected Vehicle Type
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('medium_truck')

  const selectedVehicle = transportVehicles.find(v => v.type === selectedVehicleType) || transportVehicles[2]

  // Quantity in Quintals
  const quantityQtl = activeLot ? activeLot.quantityQtl : 100

  // Calculate Transport Cost Breakdown
  const transportCostBreakdown = useMemo(() => {
    return calculateTransportCost(selectedMandi.distanceKm, selectedVehicle, quantityQtl)
  }, [selectedMandi.distanceKm, selectedVehicle, quantityQtl])

  // Financial Impact Calculations
  const grossSaleValue = (activeLot ? activeLot.expectedPrice : selectedMandi.modalPrice) * quantityQtl
  const mandiGrossValue = selectedMandi.modalPrice * quantityQtl
  const netInHandRealisation = mandiGrossValue - transportCostBreakdown.totalCost - Math.round(mandiGrossValue * 0.015)
  const netRatePerQtl = Math.round(netInHandRealisation / quantityQtl)

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Map Markers
  const originMarker: MapMarkerPoint = {
    id: 'origin-godown',
    title: activeLot ? activeLot.location : 'Sirali Farm Godown #2',
    type: 'origin',
    coordinates: [22.285, 77.012], // Sirali coordinates
    subtitle: `${activeLot ? activeLot.crop : 'Wheat'} (${quantityQtl} qtl ready for dispatch)`,
  }

  const destinationMarker: MapMarkerPoint = {
    id: 'dest-mandi',
    title: selectedMandi.name,
    type: 'mandi',
    coordinates: selectedMandi.coords,
    subtitle: `${selectedMandi.distanceKm} km from godown`,
    badgeText: `Modal Price: ₹${selectedMandi.modalPrice}/qtl`,
  }

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setBookingSuccess(true)
    setTimeout(() => {
      setIsBookingModalOpen(false)
      setBookingSuccess(false)
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
                <Truck className="w-3.5 h-3.5 text-turmeric" />
                Agri-Logistics & Freight Engine
              </span>
              <span className="font-mono text-xs text-soil/70 bg-soil/5 border border-soil/15 px-2.5 py-0.5 rounded-full">
                Multi-Axle Fleet Available
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Mandi Transport & Transit Routing
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Calculate road freight, compare carrier capacities, and optimize in-hand realization from farm-gate to APMC auction yard.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              to="/farmer/market-prices"
              className="px-4 py-2.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/15 hover:bg-soil/10 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-turmeric" />
              <span>Compare Mandis</span>
            </Link>
            <Link
              to="/farmer/storage"
              className="px-4 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all shadow-sm"
            >
              Find Storage
            </Link>
          </div>
        </div>

        {/* Dynamic Selectors Bar: Lot & Destination Mandi */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-soil/10">
          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              Select Produce Lot
            </label>
            <select
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs font-semibold text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id} — {l.crop} ({l.quantityQtl} {l.unit || 'qtl'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              Destination APMC Mandi
            </label>
            <select
              value={selectedMandiName}
              onChange={(e) => setSelectedMandiName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs font-semibold text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {mandiOptions.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.distanceKm} km &bull; ₹{m.modalPrice}/qtl)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 bg-soil/5 rounded-2xl p-3 border border-soil/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-body text-soil/50 block uppercase">ESTIMATED TRANSIT TIME</span>
              <span className="font-mono text-base font-bold text-soil">
                ~{Math.floor(transportCostBreakdown.estimatedTimeMinutes / 60)} hrs {transportCostBreakdown.estimatedTimeMinutes % 60} mins
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-body text-soil/50 block uppercase">DISTANCE</span>
              <span className="font-mono text-base font-bold text-datateal">
                {selectedMandi.distanceKm} km
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Vehicles & Map, Right Realisation Calculator */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Available Carrier Vehicles & Interactive Leaflet Route Map */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive OpenStreetMap Route View */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">
                  Transit Corridor & Route Map
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold text-soil/70 bg-soil/5 px-2.5 py-1 rounded-full border border-soil/10">
                OpenStreetMap Route
              </span>
            </div>

            {/* Map Component */}
            <AgriMapView
              origin={originMarker}
              destination={destinationMarker}
              height="300px"
              showRouteLine={true}
            />

            <div className="flex items-center justify-between text-xs font-body text-soil/70 pt-2 border-t border-soil/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-turmeric flex-shrink-0" />
                <span className="font-semibold text-soil">Origin:</span>
                <span className="truncate">{activeLot ? activeLot.location : 'Sirali Farm Godown'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-soil">Destination:</span>
                <span>{selectedMandi.name}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Fleet Selection Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">
                  Select Carrier Vehicle ({transportVehicles.length} Options)
                </h3>
              </div>
              <span className="text-xs font-body text-soil/60">
                Capacity based on {quantityQtl} qtl lot
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {transportVehicles.map((v) => {
                const breakdown = calculateTransportCost(selectedMandi.distanceKm, v, quantityQtl)
                const isSelected = selectedVehicleType === v.type
                const isSuitable = v.capacityQtl >= quantityQtl

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleType(v.type)}
                    className={`rounded-3xl border p-5 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-monsoon text-wheat border-turmeric shadow-md'
                        : 'bg-wheat text-soil border-soil/15 hover:border-soil/30 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-soil/10">
                        <div>
                          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-turmeric text-monsoon' : 'bg-soil/10 text-soil/70'
                          }`}>
                            {v.availability}
                          </span>
                          <h4 className="font-serif text-base font-bold mt-1.5">{v.name}</h4>
                          <span className={`text-[11px] block ${isSelected ? 'text-wheat/70' : 'text-soil/60'}`}>
                            Max Capacity: {v.capacityQtl} qtl ({v.capacityTon} MT)
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-lg font-bold block text-datateal">
                            ₹{breakdown.totalCost.toLocaleString('en-IN')}
                          </span>
                          <span className={`font-mono text-[10px] ${isSelected ? 'text-wheat/60' : 'text-soil/50'}`}>
                            ₹{breakdown.costPerQtl}/qtl
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs font-body pt-2 leading-relaxed ${isSelected ? 'text-wheat/80' : 'text-soil/70'}`}>
                        {v.description}
                      </p>
                    </div>

                    <div className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
                      isSelected ? 'border-wheat/10 text-wheat/70' : 'border-soil/10 text-soil/60'
                    }`}>
                      <span>Speed: ~{v.avgSpeedKmh} km/h</span>
                      <span className={isSuitable ? 'text-datateal font-bold' : 'text-orange-400 font-semibold'}>
                        {isSuitable ? '✓ Capacity Sufficient' : '⚠️ Multi-trip Required'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Net Return Impact & Logistics Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 bg-monsoon text-wheat rounded-3xl p-6 border-2 border-turmeric/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-wheat/15">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-turmeric" />
                <span className="font-mono text-xs font-bold text-turmeric uppercase tracking-wider">
                  FREIGHT & NET RETURN IMPACT
                </span>
              </div>
              <span className="font-mono text-[11px] text-wheat/60">
                {selectedMandi.name}
              </span>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-3 font-body text-xs text-wheat/80">
              <div className="flex items-center justify-between">
                <span>Gross Sale Value ({quantityQtl} qtl @ ₹{selectedMandi.modalPrice}/qtl):</span>
                <span className="font-mono font-bold text-wheat">₹{mandiGrossValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-wheat/10 space-y-2">
                <span className="font-mono text-[10px] text-turmeric uppercase tracking-wider block">
                  LOGISTICS DEDUCTIONS:
                </span>
                
                <div className="flex items-center justify-between text-wheat/70">
                  <span>&bull; Base Road Freight ({selectedMandi.distanceKm} km @ ₹{selectedVehicle.ratePerKm}/km):</span>
                  <span className="font-mono text-wheat">-₹{transportCostBreakdown.baseFreight.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-wheat/70">
                  <span>&bull; Farm-gate Loading / Handling:</span>
                  <span className="font-mono text-wheat">-₹{transportCostBreakdown.handlingCost.toLocaleString('en-IN')}</span>
                </div>

                {transportCostBreakdown.tollAndTransitTax > 0 && (
                  <div className="flex items-center justify-between text-wheat/70">
                    <span>&bull; Highway Toll & Statutory Overheads:</span>
                    <span className="font-mono text-wheat">-₹{transportCostBreakdown.tollAndTransitTax.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-wheat/70">
                  <span>&bull; APMC Statutory Mandi Cess (1.5%):</span>
                  <span className="font-mono text-wheat">-₹{Math.round(mandiGrossValue * 0.015).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total Deductions Callout */}
              <div className="p-3 bg-wheat/5 rounded-xl border border-wheat/10 flex items-center justify-between text-xs">
                <span className="text-wheat/70 font-semibold">Total Freight Deductions:</span>
                <span className="font-mono font-bold text-turmeric">
                  -₹{(transportCostBreakdown.totalCost + Math.round(mandiGrossValue * 0.015)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* In-Hand Net Cash Return Hero Card */}
            <div className="p-5 bg-wheat/10 rounded-2xl border border-turmeric/30 space-y-1.5">
              <span className="text-[11px] font-body text-wheat/70 block">
                EXPECTED IN-HAND CASH REALISATION
              </span>
              <p className="font-mono text-3xl font-bold text-datateal">
                ₹{netInHandRealisation.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-wheat/10 text-wheat/80">
                <span>In-Hand Rate per Quintal:</span>
                <span className="text-wheat font-bold text-sm">₹{netRatePerQtl}/qtl</span>
              </div>
            </div>

            {/* Book Vehicle CTA */}
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>Book Carrier Vehicle for this Lot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Driver Dispatch / Booking Confirmation Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl animate-fade-in">
            {bookingSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-datateal mx-auto animate-bounce" />
                <h3 className="font-serif text-2xl font-bold text-soil">
                  Logistics Request Placed!
                </h3>
                <p className="font-body text-xs text-soil/70 max-w-xs mx-auto">
                  Local transport partner assigned. Driver details will arrive via SMS and WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-soil/10">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-turmeric" />
                    <h3 className="font-serif text-xl font-bold text-soil">
                      Confirm Carrier Dispatch
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="text-soil/40 hover:text-soil"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-soil/5 rounded-xl border border-soil/10 space-y-1 text-xs font-body text-soil">
                  <p><span className="font-bold">Carrier:</span> {selectedVehicle.name}</p>
                  <p><span className="font-bold">Route:</span> {activeLot?.location} &rarr; {selectedMandi.name} ({selectedMandi.distanceKm} km)</p>
                  <p><span className="font-bold">Estimated Cost:</span> ₹{transportCostBreakdown.totalCost.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1">
                    Pickup Date & Time Slot
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
                  Confirm Transport Booking
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
