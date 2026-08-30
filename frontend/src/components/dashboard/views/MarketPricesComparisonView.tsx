import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Search,
  MapPin,
  Truck,
  DollarSign,
  Scale,
  Award,
  Sparkles,
  ArrowRight,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Sprout,
  Sliders,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import {
  fetchMandiPrices,
  calculateMandiNetReturn,
  getBestMarketRecommendation,
  type MandiMarketRecord,
  type MandiNetReturnCalculation
} from '../../../services/mandiPriceService'
import { WeatherWidget } from '../components/WeatherWidget'
import { AgriMapView, type MapMarkerPoint } from '../components/AgriMapView'

export function MarketPricesComparisonView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lots, lang } = useDashboard()

  const lotIdParam = searchParams.get('lotId')

  // Selected Lot / Crop / Quantity State
  const [selectedLotId, setSelectedLotId] = useState<string>(lotIdParam || (lots.length > 0 ? lots[0].id : 'custom'))
  const [crop, setCrop] = useState<string>('Wheat (Sharbati)')
  const [quantity, setQuantity] = useState<number>(100)
  const [unit, setUnit] = useState<'Quintal' | 'Tonne' | 'Kg'>('Quintal')

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [maxDistance, setMaxDistance] = useState<number>(1000) // 1000 = All
  const [sortBy, setSortBy] = useState<'net_return' | 'modal_price' | 'distance' | 'transport_cost'>('net_return')

  // Freight & Handling Sensitivity Settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false)
  const [freightRate, setFreightRate] = useState<number>(3.0) // ₹/km/MT
  const [handlingRate, setHandlingRate] = useState<number>(20.0) // ₹/qtl

  // Mandi Data & Loading State
  const [mandiRecords, setMandiRecords] = useState<MandiMarketRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Sync with selected lot
  useEffect(() => {
    if (selectedLotId && selectedLotId !== 'custom') {
      const found = lots.find((l) => l.id === selectedLotId)
      if (found) {
        setCrop(found.crop)
        setQuantity(found.quantityQtl)
        setUnit(found.unit || 'Quintal')
      }
    }
  }, [selectedLotId, lots])

  // Load Mandi Prices when crop changes
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    fetchMandiPrices(crop)
      .then((data) => {
        if (isMounted) {
          setMandiRecords(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Failed to fetch regional mandi market feeds. Please retry.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [crop])

  // Quantity in Quintals
  const quantityInQuintals = unit === 'Quintal' ? quantity : unit === 'Tonne' ? quantity * 10 : quantity / 100

  // Filter and compute Net Returns for each mandi
  const comparisons: MandiNetReturnCalculation[] = useMemo(() => {
    if (!mandiRecords || mandiRecords.length === 0) return []

    // 1. Calculate net returns
    const calculated = mandiRecords.map((mandi) =>
      calculateMandiNetReturn(mandi, quantityInQuintals, freightRate, handlingRate)
    )

    // 2. Filter by search and distance
    const filtered = calculated.filter((calc) => {
      if (maxDistance < 1000 && calc.mandi.distanceKm > maxDistance) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          calc.mandi.mandiName.toLowerCase().includes(q) ||
          calc.mandi.district.toLowerCase().includes(q) ||
          calc.mandi.state.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })

    // 3. Sort dynamically
    return filtered.sort((a, b) => {
      if (sortBy === 'net_return') return b.netReturn - a.netReturn
      if (sortBy === 'modal_price') return b.mandi.modalPrice - a.mandi.modalPrice
      if (sortBy === 'distance') return a.mandi.distanceKm - b.mandi.distanceKm
      if (sortBy === 'transport_cost') return a.transportCost - b.transportCost
      return 0
    })
  }, [mandiRecords, quantityInQuintals, freightRate, handlingRate, maxDistance, searchQuery, sortBy])

  // Best market recommendation
  const recommendation = useMemo(() => {
    if (comparisons.length === 0) return null
    return getBestMarketRecommendation(
      comparisons.map((c) => c.mandi),
      quantityInQuintals,
      freightRate,
      handlingRate
    )
  }, [comparisons, quantityInQuintals, freightRate, handlingRate])

  const selectedLot = lots.find((l) => l.id === selectedLotId)

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Context Banner */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                Mandi Intelligence Engine
              </span>
              <span className="font-mono text-xs text-soil/60">
                {comparisons.length} {lang === 'en' ? 'Regional APMC Markets' : 'क्षेत्रीय मंडियां'}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              {lang === 'en' ? 'Mandi Price Comparison & Best Market Recommendation' : 'मंडी भाव तुलना व सर्वोत्तम बाजार चयन'}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              {lang === 'en'
                ? 'Compare live APMC modal prices, deduct real road-freight costs for your specific harvest volume, and discover your highest in-hand net return.'
                : 'विभिन्न मंडियों के भावों की तुलना करें, सटीक परिवहन लागत घटाएं और अपने लॉट पर सर्वाधिक शुद्ध लाभ प्राप्त करें।'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              to="/farmer/lots"
              className="px-4 py-2.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/15 hover:bg-soil/10 transition-colors flex items-center gap-1.5"
            >
              <Sprout className="w-4 h-4 text-turmeric" />
              <span>{lang === 'en' ? 'My Lots' : 'मेरी फसलें'}</span>
            </Link>

            <Link
              to="/farmer/market-intelligence"
              className="px-4 py-2.5 rounded-xl bg-monsoon text-wheat font-body text-xs font-semibold hover:bg-monsoon/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <TrendingUp className="w-4 h-4 text-turmeric" />
              <span>{lang === 'en' ? 'Agmarknet Trends' : 'मंडी रुझान'}</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Controls Bar: Lot Selector, Crop, Quantity & Distance */}
        <div className="pt-4 border-t border-soil/10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Select Existing Lot */}
          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              {lang === 'en' ? 'Select Produce Lot' : 'फसल लॉट चुनें'}
            </label>
            <select
              value={selectedLotId}
              onChange={(e) => {
                const val = e.target.value
                setSelectedLotId(val)
                if (val !== 'custom') {
                  setSearchParams({ lotId: val })
                } else {
                  setSearchParams({})
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id} — {l.crop} ({l.quantityQtl} {l.unit || 'qtl'})
                </option>
              ))}
              <option value="custom">{lang === 'en' ? 'Custom Commodity & Quantity' : 'कस्टम फसल व मात्रा'}</option>
            </select>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              {lang === 'en' ? 'Commodity Crop' : 'फसल'}
            </label>
            <select
              value={crop}
              disabled={selectedLotId !== 'custom'}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer disabled:opacity-70"
            >
              <option value="Wheat (Sharbati)">Wheat (Sharbati) / शरबती गेहूं</option>
              <option value="Soybean">Soybean / सोयाबीन</option>
              <option value="Basmati Rice">Basmati Rice / बासमती धान</option>
              <option value="Chana (Gram)">Chana (Gram) / चना (देसी)</option>
              <option value="Mustard">Mustard / सरसों</option>
              <option value="Maize">Maize / मक्का</option>
            </select>
          </div>

          {/* Quantity & Unit */}
          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              {lang === 'en' ? 'Volume Quantity' : 'मात्रा'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                disabled={selectedLotId !== 'custom'}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-bold focus:outline-none focus:border-turmeric disabled:opacity-70"
              />
              <select
                value={unit}
                disabled={selectedLotId !== 'custom'}
                onChange={(e) => setUnit(e.target.value as any)}
                className="px-2.5 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer disabled:opacity-70"
              >
                <option value="Quintal">qtl</option>
                <option value="Tonne">MT</option>
                <option value="Kg">kg</option>
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block font-body text-xs font-semibold text-soil mb-1.5">
              {lang === 'en' ? 'Sort Markets By' : 'क्रमबद्ध करें'}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
            >
              <option value="net_return">Highest In-Hand Net Return</option>
              <option value="modal_price">Highest Mandi Modal Price</option>
              <option value="distance">Closest Distance (km)</option>
              <option value="transport_cost">Lowest Freight Cost</option>
            </select>
          </div>
        </div>

        {/* Selected Lot Metadata Pill if selected */}
        {selectedLot && (
          <div className="p-3 bg-turmeric/10 rounded-2xl border border-turmeric/30 flex flex-wrap items-center justify-between gap-3 text-xs font-body text-soil">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-soil">{selectedLot.id}</span>
              <span>&bull;</span>
              <span>{selectedLot.variety}</span>
              <span>&bull;</span>
              <span className="font-semibold">{selectedLot.grade}</span>
              <span>&bull;</span>
              <span className="text-soil/70">{selectedLot.location}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-soil/70">
              <span>Target: ₹{selectedLot.expectedPrice}/qtl</span>
              <span>&bull;</span>
              <span>Floor: ₹{selectedLot.minAcceptablePrice || Math.round(selectedLot.expectedPrice * 0.95)}/qtl</span>
            </div>
          </div>
        )}
      </div>

      {/* BEST MARKET RECOMMENDATION HERO CARD */}
      {recommendation && (
        <div className="bg-monsoon text-wheat rounded-3xl border-2 border-turmeric p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
          {/* Top Recommendation Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-wheat/15">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-turmeric text-monsoon rounded-2xl shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold text-turmeric uppercase tracking-wider block">
                  RECOMMENDED OPPORTUNITY
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-wheat">
                  Best Market for Your Lot: {recommendation.recommendedMandi.mandiName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-datateal/20 border border-datateal/40 text-datateal">
                #1 HIGHEST NET REALISATION
              </span>
            </div>
          </div>

          {/* Financial Breakdown 4-Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Modal Price */}
            <div className="bg-wheat/5 border border-wheat/10 rounded-2xl p-4">
              <span className="font-body text-[11px] text-wheat/60 block">MANDI MODAL PRICE</span>
              <p className="font-mono text-2xl font-bold text-wheat mt-1">
                ₹{recommendation.recommendedMandi.modalPrice.toLocaleString('en-IN')}<span className="text-xs font-normal text-wheat/60">/qtl</span>
              </p>
              <span className="font-body text-[11px] text-wheat/50">
                Gross: ₹{recommendation.calculation.grossValue.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 2. Transport & Logistics */}
            <div className="bg-wheat/5 border border-wheat/10 rounded-2xl p-4">
              <span className="font-body text-[11px] text-wheat/60 block">DISTANCE & FREIGHT</span>
              <p className="font-mono text-2xl font-bold text-turmeric mt-1">
                {recommendation.recommendedMandi.distanceKm} <span className="text-xs font-normal text-wheat/60">km</span>
              </p>
              <span className="font-mono text-[11px] text-wheat/50">
                -₹{recommendation.calculation.transportCost.toLocaleString('en-IN')} freight
              </span>
            </div>

            {/* 3. Total Deductions */}
            <div className="bg-wheat/5 border border-wheat/10 rounded-2xl p-4">
              <span className="font-body text-[11px] text-wheat/60 block">HANDLING & DEDUCTIONS</span>
              <p className="font-mono text-2xl font-bold text-wheat mt-1">
                -₹{recommendation.calculation.totalDeductions.toLocaleString('en-IN')}
              </p>
              <span className="font-body text-[11px] text-wheat/50">
                incl. handling & APMC cess
              </span>
            </div>

            {/* 4. Expected Net Return */}
            <div className="bg-turmeric/15 border border-turmeric/40 rounded-2xl p-4">
              <span className="font-body text-[11px] text-turmeric font-bold block">EXPECTED NET CASH RETURN</span>
              <p className="font-mono text-3xl font-bold text-datateal mt-1">
                ₹{recommendation.calculation.netReturn.toLocaleString('en-IN')}
              </p>
              <span className="font-mono text-xs font-bold text-wheat">
                = ₹{recommendation.calculation.inHandNetPerQtl.toLocaleString('en-IN')}/qtl net in hand
              </span>
            </div>
          </div>

          {/* Rationale Explanation Box */}
          <div className="p-4 rounded-2xl bg-wheat/10 border border-wheat/15 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-turmeric flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-body text-xs font-bold text-wheat block">
                {lang === 'en' ? 'Why this market is recommended for your harvest:' : 'यह मंडी क्यों अनुशंसित है:'}
              </span>
              <p className="font-body text-xs text-wheat/80 leading-relaxed">
                {recommendation.rationale}
              </p>
              {recommendation.netAdvantageVsNearest > 0 && (
                <p className="font-mono text-xs font-bold text-datateal pt-1">
                  +₹{recommendation.netAdvantageVsNearest.toLocaleString('en-IN')} extra in-hand cash compared to nearest local market ({recommendation.nearestMandi.mandiName}).
                </p>
              )}
            </div>

            <Link
              to={`/farmer/logistics?lotId=${selectedLotId}&mandi=${encodeURIComponent(recommendation.recommendedMandi.mandiName)}`}
              className="px-4 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center gap-1.5 self-start sm:self-center shadow-sm flex-shrink-0"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Route & Transit</span>
            </Link>
          </div>
        </div>
      )}

      {/* WEATHER & TRANSIT ROUTE MAP CORRIDOR */}
      {recommendation && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 1. Live Weather & Agro Advisory */}
          <WeatherWidget
            location={selectedLot?.location || recommendation.recommendedMandi.district + ', ' + recommendation.recommendedMandi.state}
          />

          {/* 2. OpenStreetMap Transit Route Map */}
          <div className="bg-wheat p-6 rounded-2xl border border-soil/15 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-soil/60 block">OPENSTREETMAP CORRIDOR</span>
                <h4 className="font-serif text-lg font-bold text-soil flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-turmeric" />
                  Transit Route to {recommendation.recommendedMandi.mandiName}
                </h4>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-turmeric/15 text-soil border border-turmeric/30">
                {recommendation.recommendedMandi.distanceKm} km
              </span>
            </div>

            <AgriMapView
              height="280px"
              origin={{
                id: 'farmer-godown',
                title: selectedLot?.pickupLocation || 'Sirali Farm Godown #2',
                type: 'origin',
                coordinates: [22.3167, 77.0167],
                subtitle: selectedLot?.location || 'Sirali, Harda (MP)',
              }}
              destination={{
                id: recommendation.recommendedMandi.id,
                title: recommendation.recommendedMandi.mandiName,
                type: 'mandi',
                coordinates: recommendation.recommendedMandi.mandiName.toLowerCase().includes('indore')
                  ? [22.7196, 75.8577]
                  : recommendation.recommendedMandi.mandiName.toLowerCase().includes('ujjain')
                  ? [23.1765, 75.7885]
                  : recommendation.recommendedMandi.mandiName.toLowerCase().includes('bhopal')
                  ? [23.2599, 77.4126]
                  : [22.3395, 77.0945],
                subtitle: `${recommendation.recommendedMandi.district}, ${recommendation.recommendedMandi.state}`,
                badgeText: `₹${recommendation.recommendedMandi.modalPrice}/qtl`,
              }}
              storageFacilities={[
                {
                  id: 'str-harda',
                  title: 'MPWLC Harda Warehouse',
                  type: 'storage',
                  coordinates: [22.3364, 77.0984],
                  subtitle: 'WDRA Approved (1,450 MT free)',
                  badgeText: '₹0.28/bag/day',
                },
              ]}
              showRouteLine={true}
            />
          </div>
        </div>
      )}

      {/* SECONDARY FILTER & SEARCH BAR */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Mandis */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-soil/40" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search by Mandi, District, or State...' : 'मंडी, जिला या राज्य से खोजें...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
            />
          </div>

          {/* Distance Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="font-body text-xs text-soil/60 mr-1 hidden sm:inline">Distance:</span>
            {[
              { label: 'All Distances', value: 1000 },
              { label: '< 50 km', value: 50 },
              { label: '< 150 km', value: 150 },
              { label: '< 300 km', value: 300 },
            ].map((d) => (
              <button
                key={d.value}
                onClick={() => setMaxDistance(d.value)}
                className={`px-3 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer ${
                  maxDistance === d.value
                    ? 'bg-monsoon text-wheat font-semibold shadow-xs'
                    : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Freight Sensitivity Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvancedSettings((prev) => !prev)}
            className="px-3.5 py-1.5 rounded-xl bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15 font-body text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-turmeric" />
            <span>{showAdvancedSettings ? 'Hide Freight Calculator' : 'Adjust Freight Rates'}</span>
          </button>
        </div>

        {/* Advanced Freight Sensitivity Panel */}
        {showAdvancedSettings && (
          <div className="p-4 rounded-2xl bg-soil/5 border border-soil/10 grid sm:grid-cols-2 gap-4 animate-fade-in text-xs font-body text-soil">
            <div>
              <label className="block font-semibold mb-1">
                Road Freight Rate (₹ / km / Metric Tonne) — Default ₹3.0
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={freightRate}
                onChange={(e) => setFreightRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-wheat border border-soil/20 font-mono text-xs font-bold"
              />
              <span className="text-[11px] text-soil/60 mt-0.5 block">
                Standard commercial truck rate for rural mandis.
              </span>
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Handling & Loading (₹ / Quintal) — Default ₹20.0
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={handlingRate}
                onChange={(e) => setHandlingRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-wheat border border-soil/20 font-mono text-xs font-bold"
              />
              <span className="text-[11px] text-soil/60 mt-0.5 block">
                Pallet handling, weighment fee, and bag stitch labor.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MANDI COMPARISON TABLE / CARDS */}
      {isLoading ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-turmeric animate-spin mx-auto" />
          <h3 className="font-serif text-xl font-bold text-soil">Loading Mandi Prices & Calculating Net Returns...</h3>
        </div>
      ) : error ? (
        <div className="bg-wheat rounded-3xl border border-red-500/30 p-12 text-center space-y-4 text-red-700">
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h3 className="font-serif text-xl font-bold">{error}</h3>
        </div>
      ) : comparisons.length === 0 ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
          <Scale className="w-12 h-12 text-soil/30 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-soil">No Market Data Available</h3>
          <p className="font-body text-xs text-soil/60 max-w-sm mx-auto">
            No live mandi prices were found for {crop}. Connect official government AGMARKNET / e-NAM feeds to stream live benchmarks.
          </p>
        </div>
      ) : (
        <div className="bg-wheat rounded-3xl border border-soil/15 overflow-hidden shadow-sm">
          {/* Desktop Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-soil/15 bg-soil/5 text-soil/60 font-body text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Mandi & Location</th>
                  <th className="py-3.5 px-4 font-semibold">Distance</th>
                  <th className="py-3.5 px-4 font-semibold">Modal Price</th>
                  <th className="py-3.5 px-4 font-semibold">Gross Value</th>
                  <th className="py-3.5 px-4 font-semibold">Transport Deductions</th>
                  <th className="py-3.5 px-4 font-semibold">Net Return</th>
                  <th className="py-3.5 px-4 font-semibold">In-Hand ₹/qtl</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil/10 text-xs font-body text-soil">
                {comparisons.map((calc, idx) => {
                  const isTopRank = idx === 0
                  const isNearest = calc.mandi.distanceKm === Math.min(...comparisons.map((c) => c.mandi.distanceKm))

                  return (
                    <tr
                      key={calc.mandi.id}
                      className={`hover:bg-soil/5 transition-colors ${
                        isTopRank ? 'bg-turmeric/10 font-medium' : ''
                      }`}
                    >
                      {/* Mandi Name & District */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-soil">{calc.mandi.mandiName}</span>
                          {isTopRank && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-turmeric text-monsoon">
                              #1 BEST
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-soil/60 block">
                          {calc.mandi.district}, {calc.mandi.state} &bull; {calc.mandi.source || 'APMC Direct'}
                        </span>
                      </td>

                      {/* Distance */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold">{calc.mandi.distanceKm} km</span>
                        {isNearest && (
                          <span className="block text-[10px] text-datateal font-semibold">Nearest Mandi</span>
                        )}
                      </td>

                      {/* Modal Price */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-soil">₹{calc.mandi.modalPrice.toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-soil/50">
                          (₹{calc.mandi.minPrice} - ₹{calc.mandi.maxPrice})
                        </span>
                      </td>

                      {/* Gross Value */}
                      <td className="py-4 px-4 font-mono">
                        <span>₹{calc.grossValue.toLocaleString('en-IN')}</span>
                      </td>

                      {/* Transport Deductions */}
                      <td className="py-4 px-4 font-mono text-red-700">
                        <span>-₹{calc.totalDeductions.toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-soil/50">
                          (Freight ₹{calc.transportCost} + Handling ₹{calc.handlingCost})
                        </span>
                      </td>

                      {/* Net Return */}
                      <td className="py-4 px-4 font-mono">
                        <span className="text-sm font-bold text-datateal">
                          ₹{calc.netReturn.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* In-Hand / qtl */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-soil">₹{calc.inHandNetPerQtl.toLocaleString('en-IN')}/qtl</span>
                      </td>

                      {/* Recommendation Status */}
                      <td className="py-4 px-4 text-right">
                        {isTopRank ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-datateal/20 text-soil font-mono text-[11px] font-bold border border-datateal/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-datateal" />
                            RECOMMENDED
                          </span>
                        ) : isNearest ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-soil/10 text-soil/70 font-mono text-[10px]">
                            Local Option
                          </span>
                        ) : (
                          <span className="text-soil/40 font-mono text-[11px]">Rank #{idx + 1}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

