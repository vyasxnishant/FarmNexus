import { useState, useMemo, useEffect } from 'react'
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
  FileText,
  Lock,
  Package
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import {
  transportVehicles,
  calculateTransportCost,
  type TransportVehicle,
  type VehicleType
} from '../../../services/logisticsService'
import {
  geocodeLocation,
  calculateGeoDistanceKm,
  INDIAN_AGRI_GEO_REGISTRY
} from '../../../services/geocodingService'
import { AgriMapView, type MapMarkerPoint } from '../components/AgriMapView'

export function LogisticsView() {
  const [searchParams] = useSearchParams()
  const { currentUser, lots, transactions, offers, lang } = useDashboard()

  const isBuyer = currentUser?.user_type === 'BUYER'
  const isFarmer = currentUser?.user_type === 'FARMER'

  const lotIdParam = searchParams.get('lotId')
  const dealIdParam = searchParams.get('dealId') || searchParams.get('transactionId')
  const mandiParam = searchParams.get('mandi')

  // 1. Filter eligible transactions strictly for the current user's role and accepted lifecycle
  const eligibleTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.transactionStatus === 'Cancelled') {
        return false
      }
      if (isBuyer) {
        return t.buyerId === currentUser?.id
      }
      if (isFarmer) {
        return t.farmerId === currentUser?.id
      }
      return true
    })
  }, [transactions, currentUser?.id, isBuyer, isFarmer])

  // 2. Filter eligible lots available to the current user for logistics
  const eligibleLots = useMemo(() => {
    if (isFarmer) {
      return lots.filter((l) => (l.farmerId === currentUser?.id || !l.farmerId) && l.status !== 'Sold' && l.status !== 'Expired' && l.quantityQtl > 0)
    }
    if (isBuyer) {
      // For a buyer, show lots associated with buyer's active transactions
      const buyerTxnLotIds = new Set(eligibleTransactions.map(t => t.lotId))
      return lots.filter(l => buyerTxnLotIds.has(l.id))
    }
    return lots.filter((l) => l.status !== 'Sold' && l.status !== 'Expired' && l.quantityQtl > 0)
  }, [lots, currentUser?.id, isFarmer, isBuyer, eligibleTransactions])

  // Selected Deal / Transaction ID (or active lot)
  const [selectedDealId, setSelectedDealId] = useState<string>(
    dealIdParam || (eligibleTransactions.length > 0 ? eligibleTransactions[0].id : '')
  )
  const [selectedLotId, setSelectedLotId] = useState<string>(
    lotIdParam || (eligibleLots.length > 0 ? eligibleLots[0].id : '')
  )

  // Auto-select first eligible trade deal or lot when loaded asynchronously
  useEffect(() => {
    if (dealIdParam) {
      const matchTx = eligibleTransactions.find(t => t.id === dealIdParam)
      if (matchTx) {
        setSelectedDealId(matchTx.id)
        setSelectedLotId(matchTx.lotId)
        if (matchTx.mandiOrDeliveryLocation) {
          setSelectedDestinationName(matchTx.mandiOrDeliveryLocation)
        }
        return
      }
    }
    if (lotIdParam) {
      const matchLot = eligibleLots.find(l => l.id === lotIdParam) || lots.find(l => l.id === lotIdParam)
      if (matchLot) {
        setSelectedLotId(matchLot.id)
        const txMatch = eligibleTransactions.find(t => t.lotId === matchLot.id)
        if (txMatch) {
          setSelectedDealId(txMatch.id)
          if (txMatch.mandiOrDeliveryLocation) {
            setSelectedDestinationName(txMatch.mandiOrDeliveryLocation)
          }
        } else {
          setSelectedDealId('')
        }
        return
      }
    }

    const hasValidDeal = selectedDealId && eligibleTransactions.some(t => t.id === selectedDealId)
    const hasValidLot = selectedLotId && eligibleLots.some(l => l.id === selectedLotId)

    if (!hasValidDeal && !hasValidLot) {
      if (eligibleTransactions.length > 0) {
        const firstTx = eligibleTransactions[0]
        setSelectedDealId(firstTx.id)
        setSelectedLotId(firstTx.lotId)
        if (firstTx.mandiOrDeliveryLocation) {
          setSelectedDestinationName(firstTx.mandiOrDeliveryLocation)
        }
      } else if (eligibleLots.length > 0) {
        const firstLot = eligibleLots[0]
        setSelectedLotId(firstLot.id)
        setSelectedDealId('')
      } else {
        setSelectedDealId('')
        setSelectedLotId('')
      }
    }
  }, [eligibleTransactions, eligibleLots, dealIdParam, lotIdParam, lots])

  const activeTxn = eligibleTransactions.find(t => t.id === selectedDealId) || (dealIdParam ? eligibleTransactions.find(t => t.id === dealIdParam) : undefined)
  const activeLot = lots.find(l => l.id === selectedLotId) || (activeTxn ? lots.find(l => l.id === activeTxn.lotId) : (eligibleLots.length > 0 ? eligibleLots[0] : lots[0]))

  // Traded deal or matching offer for this lot
  const matchingTransaction = activeTxn || eligibleTransactions.find(t => t.lotId === activeLot?.id)
  const matchingOffer = offers.find(o => o.lotId === activeLot?.id && o.status === 'Accepted')

  // Exact Shipment Quantity (Quintals) — Never 0 when valid lot/deal data exists
  const quantityQtl: number = useMemo(() => {
    if (matchingTransaction && typeof matchingTransaction.quantityQtl === 'number' && matchingTransaction.quantityQtl > 0) {
      return matchingTransaction.quantityQtl
    }
    if (matchingOffer && typeof matchingOffer.quantityQtl === 'number' && matchingOffer.quantityQtl > 0) {
      return matchingOffer.quantityQtl
    }
    if (activeLot && typeof activeLot.quantityQtl === 'number' && activeLot.quantityQtl > 0) {
      return activeLot.quantityQtl
    }
    if (activeLot && typeof activeLot.initialQuantityQtl === 'number' && activeLot.initialQuantityQtl > 0) {
      return activeLot.initialQuantityQtl
    }
    return 20
  }, [matchingTransaction, matchingOffer, activeLot])

  // Dynamic Origin Location from Farmer Deal / Lot
  const originLocationName = useMemo(() => {
    return (
      matchingTransaction?.farmerLocation ||
      activeLot?.pickupLocation ||
      activeLot?.location ||
      'Sirali Godown Bay #3, Harda, MP'
    )
  }, [matchingTransaction, activeLot])

  // Available Mandi Destinations List
  const mandiOptions = useMemo(() => {
    return [
      { name: 'Harda APMC Mandi', district: 'Harda', modalPrice: 2840 },
      { name: 'Hoshangabad Mandi Hub', district: 'Narmadapuram', modalPrice: 2890 },
      { name: 'Indore APMC Mandi', district: 'Indore', modalPrice: 3010 },
      { name: 'Bhopal Karond APMC', district: 'Bhopal', modalPrice: 2960 },
      { name: 'Ujjain APMC Mandi', district: 'Ujjain', modalPrice: 2980 },
      { name: 'Khandwa APMC Mandi', district: 'Khandwa', modalPrice: 2920 },
      { name: 'Dewas APMC Mandi', district: 'Dewas', modalPrice: 2950 },
      { name: 'Nagpur APMC Hub', district: 'Nagpur', modalPrice: 3100 },
      { name: 'Mumbai APMC Terminal, Vashi', district: 'Thane', modalPrice: 3450 },
      { name: 'Delhi Azadpur APMC Terminal', district: 'North Delhi', modalPrice: 3300 },
    ]
  }, [])

  // Dynamic Destination Selection: Prioritize Deal's destination if linked to a transaction
  const initialDestination = matchingTransaction?.mandiOrDeliveryLocation || mandiParam || mandiOptions[0].name
  const [selectedDestinationName, setSelectedDestinationName] = useState<string>(initialDestination)

  useEffect(() => {
    if (matchingTransaction?.mandiOrDeliveryLocation) {
      setSelectedDestinationName(matchingTransaction.mandiOrDeliveryLocation)
    }
  }, [matchingTransaction?.id, matchingTransaction?.mandiOrDeliveryLocation])

  // Geocoding Origin and Destination Locations
  const originGeo = useMemo(() => geocodeLocation(originLocationName), [originLocationName])
  const destGeo = useMemo(() => geocodeLocation(selectedDestinationName), [selectedDestinationName])

  // Calculate Real-world Driving Distance (Km) dynamically for ANY origin-destination pair
  const distanceKm = useMemo(() => {
    if (originGeo && destGeo) {
      return calculateGeoDistanceKm(originGeo.coordinates, destGeo.coordinates)
    }
    return 45 // Graceful fallback
  }, [originGeo, destGeo])

  // Selected Vehicle Type
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('medium_truck')
  const selectedVehicle = transportVehicles.find(v => v.type === selectedVehicleType) || transportVehicles[2]

  // Calculate Transport Cost Breakdown dynamically
  const transportCostBreakdown = useMemo(() => {
    return calculateTransportCost(distanceKm, selectedVehicle, quantityQtl)
  }, [distanceKm, selectedVehicle, quantityQtl])

  // Financial Realization Calculations
  const unitPrice = matchingTransaction?.agreedPricePerQtl || (activeLot ? activeLot.expectedPrice : 2850)
  const grossDealValue = unitPrice * quantityQtl
  const mandiCess = Math.round(grossDealValue * 0.015)
  const totalDeductions = transportCostBreakdown.totalCost + mandiCess
  const netInHandRealisation = grossDealValue - totalDeductions
  const netRatePerQtl = quantityQtl > 0 ? Math.round(netInHandRealisation / quantityQtl) : 0

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Map Markers with Safe Geocoded Coordinates
  const originMarker: MapMarkerPoint | undefined = originGeo
    ? {
        id: 'origin-godown',
        title: originLocationName,
        type: 'origin',
        coordinates: originGeo.coordinates,
        subtitle: `${activeLot ? activeLot.crop : 'Agricultural Produce'} (${quantityQtl} Quintal ready for dispatch)`,
      }
    : undefined

  const destinationMarker: MapMarkerPoint | undefined = destGeo
    ? {
        id: 'dest-mandi',
        title: selectedDestinationName,
        type: 'mandi',
        coordinates: destGeo.coordinates,
        subtitle: `${distanceKm} km transit corridor from origin`,
        badgeText: matchingTransaction ? `Deal: ${matchingTransaction.id}` : `APMC Mandi Terminal`,
      }
    : undefined

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
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-turmeric" />
                Agri-Logistics & Freight Engine
              </span>
              {matchingTransaction && (
                <span className="font-mono text-xs text-turmeric bg-monsoon border border-turmeric/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3 text-turmeric" />
                  Contract: {matchingTransaction.id}
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Mandi Transport & Transit Routing
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Calculate road freight, compare carrier capacities, and optimize in-hand realization from farm-gate to APMC auction yard or buyer delivery terminal.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              to={isBuyer ? '/buyer/market-prices' : '/farmer/market-prices'}
              className="px-4 py-2.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/15 hover:bg-soil/10 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-turmeric" />
              <span>Compare Mandis</span>
            </Link>
            <Link
              to={isBuyer ? '/buyer/storage' : '/farmer/storage'}
              className="px-4 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all shadow-sm"
            >
              Find Storage
            </Link>
          </div>
        </div>

        {/* Linked Deal Context Card (if transaction exists) */}
        {matchingTransaction && (
          <div className="p-4 rounded-2xl bg-monsoon text-wheat border border-turmeric/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-turmeric flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-turmeric">{matchingTransaction.id}</span>
                  <span className="font-mono text-[10px] text-wheat/60">&bull; Lot: {matchingTransaction.lotId}</span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-wheat/10 text-wheat border border-wheat/20">
                    {matchingTransaction.paymentStatus}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-turmeric text-monsoon">
                    {matchingTransaction.transactionStatus}
                  </span>
                </div>
                <p className="font-body text-xs text-wheat/90 mt-0.5">
                  <strong>{matchingTransaction.crop}</strong> ({matchingTransaction.variety}) &bull; Traded Shipment Quantity:{' '}
                  <strong className="text-datateal">{quantityQtl} Quintals</strong> &bull; Seller:{' '}
                  <strong>{matchingTransaction.farmerName}</strong> &bull; Buyer:{' '}
                  <strong>{matchingTransaction.buyerOrganization || matchingTransaction.buyerName}</strong>
                </p>
              </div>
            </div>

            <Link
              to={`/${isBuyer ? 'buyer' : 'farmer'}/transactions/${matchingTransaction.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-wheat/10 text-wheat font-body text-xs font-semibold hover:bg-wheat/20 border border-wheat/20 transition-all flex items-center gap-1"
            >
              <span>View Trade Contract</span>
              <ChevronRight className="w-3.5 h-3.5 text-turmeric" />
            </Link>
          </div>
        )}

        {/* Dynamic Selectors Bar: Lot / Deal & Destination Mandi */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-soil/10">
          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              Select Trade Deal or Lot
            </label>
            <select
              value={matchingTransaction ? matchingTransaction.id : selectedLotId}
              onChange={(e) => {
                const val = e.target.value
                const tx = eligibleTransactions.find(t => t.id === val)
                if (tx) {
                  setSelectedDealId(tx.id)
                  setSelectedLotId(tx.lotId)
                  if (tx.mandiOrDeliveryLocation) {
                    setSelectedDestinationName(tx.mandiOrDeliveryLocation)
                  }
                } else {
                  const lot = eligibleLots.find(l => l.id === val) || lots.find(l => l.id === val)
                  if (lot) {
                    setSelectedLotId(lot.id)
                    const txMatch = eligibleTransactions.find(t => t.lotId === lot.id)
                    if (txMatch) {
                      setSelectedDealId(txMatch.id)
                      if (txMatch.mandiOrDeliveryLocation) {
                        setSelectedDestinationName(txMatch.mandiOrDeliveryLocation)
                      }
                    } else {
                      setSelectedDealId('')
                    }
                  }
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs font-semibold text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {eligibleTransactions.length === 0 && eligibleLots.length === 0 && (
                <option value="" disabled>
                  {lang === 'en' ? 'No eligible trade deals or lots available' : 'कोई पात्र व्यापार सौदे या लॉट उपलब्ध नहीं'}
                </option>
              )}
              {eligibleTransactions.length > 0 && (
                <optgroup label={lang === 'en' ? 'Active Trade Contracts' : 'सक्रिय व्यापार अनुबंध'}>
                  {eligibleTransactions.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.id} — {tx.crop} — {tx.quantityQtl} {tx.unit || 'Qtl'}
                    </option>
                  ))}
                </optgroup>
              )}
              {eligibleLots.length > 0 && (
                <optgroup label={lang === 'en' ? 'Produce Lots' : 'फसल लॉट'}>
                  {eligibleLots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.id} — {l.crop} — {l.quantityQtl > 0 ? l.quantityQtl : (l.initialQuantityQtl || 100)} {l.unit || 'Qtl'}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              Destination Delivery Hub / APMC Mandi
            </label>
            <div className="relative">
              <input
                type="text"
                list="mandi-options-list"
                value={selectedDestinationName}
                onChange={(e) => setSelectedDestinationName(e.target.value)}
                placeholder="Enter or select delivery destination..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs font-semibold text-soil focus:outline-none focus:border-turmeric"
              />
              <datalist id="mandi-options-list">
                {mandiOptions.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.district}) &bull; ₹{m.modalPrice}/qtl
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 bg-soil/5 rounded-2xl p-3 border border-soil/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-body text-soil/50 block uppercase">ESTIMATED TRANSIT TIME</span>
              <span className="font-mono text-base font-bold text-soil">
                ~{Math.floor(transportCostBreakdown.estimatedTimeMinutes / 60)} hrs {transportCostBreakdown.estimatedTimeMinutes % 60} mins
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-body text-soil/50 block uppercase">ROAD DISTANCE</span>
              <span className="font-mono text-base font-bold text-datateal">
                {distanceKm} km
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
                Leaflet + OpenStreetMap
              </span>
            </div>

            {/* Geocoding Warning if address cannot be located */}
            {(!originGeo || !destGeo) && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs font-body text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  {!originGeo && !destGeo
                    ? `Unable to pinpoint origin (${originLocationName}) and destination (${selectedDestinationName}) on map. Estimated highway transit corridor active.`
                    : !originGeo
                    ? `Unable to pinpoint farm-gate origin (${originLocationName}) on map.`
                    : `Unable to pinpoint destination (${selectedDestinationName}) on map.`}
                </span>
              </div>
            )}

            {/* Map Component */}
            <AgriMapView
              origin={originMarker}
              destination={destinationMarker}
              height="320px"
              showRouteLine={Boolean(originMarker && destinationMarker)}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-body text-soil/70 pt-2 border-t border-soil/10">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-turmeric flex-shrink-0" />
                <span className="font-semibold text-soil">Origin:</span>
                <span className="truncate max-w-[200px]">{originLocationName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-soil">Destination:</span>
                <span className="truncate max-w-[200px]">{selectedDestinationName}</span>
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
              <span className="text-xs font-body text-soil/60 font-semibold">
                Shipment Payload: <span className="text-soil font-bold">{quantityQtl} Quintals</span>
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {transportVehicles.map((v) => {
                const breakdown = calculateTransportCost(distanceKm, v, quantityQtl)
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
                        {isSuitable ? '✓ Capacity Sufficient' : '⚠️ Exceeds Capacity'}
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
              <span className="font-mono text-[11px] text-wheat/60 truncate max-w-[150px]">
                {selectedDestinationName}
              </span>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-3 font-body text-xs text-wheat/80">
              <div className="flex items-center justify-between">
                <span>Gross Traded Value ({quantityQtl} qtl @ ₹{unitPrice.toLocaleString('en-IN')}/qtl):</span>
                <span className="font-mono font-bold text-wheat">₹{grossDealValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-wheat/10 space-y-2">
                <span className="font-mono text-[10px] text-turmeric uppercase tracking-wider block">
                  LOGISTICS DEDUCTIONS:
                </span>
                
                <div className="flex items-center justify-between text-wheat/70">
                  <span>&bull; Road Freight ({distanceKm} km @ ₹{selectedVehicle.ratePerKm}/km):</span>
                  <span className="font-mono text-wheat">-₹{transportCostBreakdown.baseFreight.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-wheat/70">
                  <span>&bull; Farm-gate Loading & Unloading:</span>
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
                  <span className="font-mono text-wheat">-₹{mandiCess.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total Deductions Callout */}
              <div className="p-3 bg-wheat/5 rounded-xl border border-wheat/10 flex items-center justify-between text-xs">
                <span className="text-wheat/70 font-semibold">Total Transport & Cess Deductions:</span>
                <span className="font-mono font-bold text-turmeric">
                  -₹{totalDeductions.toLocaleString('en-IN')}
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
                <span>Net In-Hand Rate per Quintal:</span>
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
              <span>Book Carrier Vehicle ({selectedVehicle.name})</span>
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
                  <p><span className="font-bold">Route:</span> {originLocationName} &rarr; {selectedDestinationName} ({distanceKm} km)</p>
                  <p><span className="font-bold">Payload:</span> {quantityQtl} Quintals</p>
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
