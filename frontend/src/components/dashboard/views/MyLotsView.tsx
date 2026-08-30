import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout,
  Plus,
  Search,
  Users,
  Calendar,
  MapPin,
  Droplets,
  Award,
  Trash2,
  CheckCircle2,
  Clock,
  Edit,
  Pause,
  Play,
  ArrowRight,
  Filter,
  DollarSign,
  Receipt,
  Layers,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  ShieldCheck
} from 'lucide-react'
import { useDashboard, type CropLot, type LotStatus } from '../../../context/DashboardContext'

type TabType = 'All' | 'Active' | 'Draft' | 'Offers Received' | 'Sold' | 'Expired'

export function MyLotsView() {
  const navigate = useNavigate()
  const { lots, offers, acceptOffer, rejectOffer, deleteLot, pauseLot, publishDraftLot, currentUser, lang } = useDashboard()

  const [activeTab, setActiveTab] = useState<TabType>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cropFilter, setCropFilter] = useState<string>('All')
  const [gradeFilter, setGradeFilter] = useState<string>('All')
  const [locationFilter, setLocationFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'offer' | 'quantity'>('newest')

  const [deleteModalLot, setDeleteModalLot] = useState<CropLot | null>(null)

  // Filter lots by authenticated farmer
  const myLots = lots.filter(l => !currentUser || currentUser.user_type === 'ADMIN' || l.farmerId === currentUser.id)

  // Map each lot with dynamically calculated offers based on exact lot.id match
  const myLotsWithOffers = myLots.map(lot => {
    const lotOffers = offers.filter(o => o.lotId === lot.id)
    const pendingOffers = lotOffers.filter(o => o.status === 'Pending')
    const activeOffersCount = pendingOffers.length || (lotOffers.length > 0 ? lotOffers.length : (lot.activeOffersCount || 0))
    const highestOffer = pendingOffers.length > 0
      ? Math.max(...pendingOffers.map(o => o.offeredPrice))
      : (lotOffers.length > 0 ? Math.max(...lotOffers.map(o => o.offeredPrice)) : lot.highestOffer)

    return {
      ...lot,
      lotOffers,
      activeOffersCount,
      highestOffer,
    }
  })

  // Summary Metrics
  const totalLots = myLotsWithOffers.length
  const activeLots = myLotsWithOffers.filter((l) => l.status === 'Active').length
  const offersReceivedLots = myLotsWithOffers.filter((l) => l.lotOffers.length > 0 || l.activeOffersCount > 0).length
  const soldLots = myLotsWithOffers.filter((l) => l.status === 'Sold').length
  const draftLots = myLotsWithOffers.filter((l) => l.status === 'Draft').length

  const tabs: TabType[] = ['All', 'Active', 'Draft', 'Offers Received', 'Sold', 'Expired']

  // Available Crops, Grades & Locations for filter dropdowns
  const availableCrops = ['All', ...Array.from(new Set(myLotsWithOffers.map((l) => l.crop)))]
  const availableGrades = ['All', 'Grade A', 'Grade A (Export)', 'Grade B', 'Grade C']
  const availableLocations = ['All', ...Array.from(new Set(myLotsWithOffers.map((l) => l.location.split(',')[0].trim())))]

  // Filter & Search Logic
  const filteredLots = myLotsWithOffers
    .filter((lot) => {
      // Tab matching
      if (activeTab === 'Active' && lot.status !== 'Active') return false
      if (activeTab === 'Draft' && lot.status !== 'Draft') return false
      if (activeTab === 'Offers Received' && lot.lotOffers.length === 0 && lot.activeOffersCount === 0) return false
      if (activeTab === 'Sold' && lot.status !== 'Sold') return false
      if (activeTab === 'Expired' && lot.status !== 'Expired') return false

      // Crop filter
      if (cropFilter !== 'All' && lot.crop !== cropFilter) return false

      // Grade filter
      if (gradeFilter !== 'All' && !lot.grade.includes(gradeFilter)) return false

      // Location filter
      if (locationFilter !== 'All' && !lot.location.toLowerCase().includes(locationFilter.toLowerCase())) return false

      // Search Query (Crop, Variety, Lot ID, Location)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const match =
          lot.id.toLowerCase().includes(query) ||
          lot.crop.toLowerCase().includes(query) ||
          lot.variety.toLowerCase().includes(query) ||
          lot.location.toLowerCase().includes(query)
        if (!match) return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price') return b.expectedPrice - a.expectedPrice
      if (sortBy === 'offer') return (b.highestOffer || 0) - (a.highestOffer || 0)
      if (sortBy === 'quantity') return b.quantityQtl - a.quantityQtl
      return 0 // Newest default
    })

  const confirmDelete = () => {
    if (deleteModalLot) {
      deleteLot(deleteModalLot.id)
      setDeleteModalLot(null)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Summary KPI Bar */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                Produce Inventory & Lot Management
              </span>
              <span className="font-mono text-xs text-soil/60">
                {totalLots} {lang === 'en' ? 'Total Lots' : 'कुल लॉट'}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              {lang === 'en' ? 'My Harvest & Produce Lots' : 'मेरी फसलें व लॉट प्रबंधन'}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1">
              {lang === 'en'
                ? 'Create, grade, and manage lots with direct verified buyer broadcasting and market reference benchmarking.'
                : 'फसल लॉट बनाएं, गुणवत्ता ग्रेडिंग करें और सत्यापित खरीदारों से सीधे संपर्क साधें।'}
            </p>
          </div>

          <Link
            to="/farmer/lots/create"
            className="px-5 py-3 rounded-2xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? '+ Create New Lot' : '+ नया लॉट बनाएं'}</span>
          </Link>
        </div>

        {/* 5 KPI Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-soil/10">
          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">{lang === 'en' ? 'Total Lots' : 'कुल लॉट'}</span>
            <p className="font-mono text-xl font-bold text-soil mt-0.5">{totalLots}</p>
          </div>

          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">{lang === 'en' ? 'Active Lots' : 'सक्रिय लॉट'}</span>
            <p className="font-mono text-xl font-bold text-datateal mt-0.5">{activeLots}</p>
          </div>

          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">{lang === 'en' ? 'Offers Received' : 'प्राप्त ऑफ़र'}</span>
            <p className="font-mono text-xl font-bold text-turmeric mt-0.5">{offersReceivedLots}</p>
          </div>

          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">{lang === 'en' ? 'Sold Lots' : 'बिक चुके लॉट'}</span>
            <p className="font-mono text-xl font-bold text-soil mt-0.5">{soldLots}</p>
          </div>

          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">{lang === 'en' ? 'Draft Lots' : 'ड्राफ्ट लॉट'}</span>
            <p className="font-mono text-xl font-bold text-soil/60 mt-0.5">{draftLots}</p>
          </div>
        </div>

        {/* 6 Tabs & Search / Filter Controls */}
        <div className="space-y-4 pt-4 border-t border-soil/10">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const count =
                tab === 'All'
                  ? lots.length
                  : tab === 'Active'
                  ? activeLots
                  : tab === 'Draft'
                  ? draftLots
                  : tab === 'Offers Received'
                  ? offersReceivedLots
                  : tab === 'Sold'
                  ? soldLots
                  : lots.filter((l) => l.status === 'Expired').length

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-monsoon text-wheat font-semibold shadow-sm'
                      : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab ? 'bg-turmeric text-monsoon font-bold' : 'bg-soil/10 text-soil/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search, Filter Dropdowns, and Sort Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-soil/40" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search by Crop, Variety, Lot ID, Location...' : 'लॉट, फसल, स्थान से खोजें...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            {/* Filter Dropdowns (Crop, Grade, Location, Sort) */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                {availableCrops.map((c) => (
                  <option key={c} value={c}>
                    Crop: {c}
                  </option>
                ))}
              </select>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                {availableGrades.map((g) => (
                  <option key={g} value={g}>
                    Grade: {g}
                  </option>
                ))}
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                {availableLocations.map((l) => (
                  <option key={l} value={l}>
                    Location: {l}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price">Sort: Highest Expected Price</option>
                <option value="offer">Sort: Highest Offer Bid</option>
                <option value="quantity">Sort: Largest Quantity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lots Grid */}
      {filteredLots.length === 0 ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
          <Sprout className="w-12 h-12 text-soil/30 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-soil">
            {lang === 'en' ? 'No Produce Lots Found' : 'कोई फसल लॉट नहीं मिला'}
          </h3>
          <p className="font-body text-xs text-soil/60 max-w-sm mx-auto">
            {lang === 'en'
              ? 'Try changing your search keywords, clearing filters, or create a new produce lot.'
              : 'कृपया फ़िल्टर बदलें या नया फसल लॉट दर्ज करें।'}
          </p>
          <Link
            to="/farmer/lots/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'Create New Lot' : 'नया लॉट बनाएं'}</span>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredLots.map((lot) => {
            const grossVal = lot.expectedPrice * lot.quantityQtl

            return (
              <div
                key={lot.id}
                className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm hover:border-soil/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header: Lot ID, Status & Demo Tag */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-soil/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-soil/60">{lot.id}</span>
                        <span
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            lot.status === 'Active'
                              ? 'bg-datateal/20 text-soil border border-datateal/40'
                              : lot.status === 'Draft'
                              ? 'bg-soil/10 text-soil/70 border border-soil/20'
                              : lot.status === 'Sold'
                              ? 'bg-turmeric/20 text-soil border border-turmeric/40'
                              : lot.status === 'Paused'
                              ? 'bg-orange-500/15 text-orange-700 border border-orange-500/30'
                              : 'bg-red-500/10 text-red-700 border border-red-500/20'
                          }`}
                        >
                          {lot.status}
                        </span>

                        {lot.isDemo && (
                          <span className="font-mono text-[9px] text-soil/50 bg-soil/5 px-1.5 py-0.5 rounded">
                            DEMO DATA
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-soil mt-1">{lot.crop}</h3>
                      <p className="font-body text-xs text-soil/70">{lot.variety}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-soil block">
                        ₹{lot.expectedPrice.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-soil/60">/qtl</span>
                      </span>
                      <span className="font-mono text-[11px] text-datateal font-bold">
                        ₹{grossVal.toLocaleString('en-IN')} gross
                      </span>
                    </div>
                  </div>

                  {/* Sample Image Thumbnail if attached */}
                  {lot.imageUrl && (
                    <div className="rounded-xl overflow-hidden max-h-28 border border-soil/10 mt-2">
                      <img src={lot.imageUrl} alt={lot.crop} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Specifications 3-Column Pill */}
                  <div className="grid grid-cols-3 gap-2 py-3">
                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="font-body text-[10px] text-soil/50 block">VOLUME</span>
                      <span className="font-mono text-xs font-bold text-soil">
                        {lot.quantityQtl} {lot.unit || 'qtl'}
                      </span>
                    </div>

                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="font-body text-[10px] text-soil/50 block">GRADE / MOISTURE</span>
                      <span className="font-mono text-xs font-bold text-soil">
                        {lot.grade} &bull; {lot.moisturePercent}%
                      </span>
                    </div>

                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="font-body text-[10px] text-soil/50 block">BUYER MATCHES</span>
                      <span className="font-mono text-xs font-bold text-datateal">
                        {lot.matchedBuyersCount} Verified
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
                      <span>Harvest: {lot.harvestDate} &bull; Created {lot.createdAt}</span>
                    </div>
                  </div>

                  {/* Highest Offer Callout & Received Bids List */}
                  {lot.highestOffer && (
                    <div className="mt-3 p-2.5 bg-turmeric/10 rounded-xl border border-turmeric/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-soil font-body text-xs">
                        <Receipt className="w-3.5 h-3.5 text-turmeric" />
                        <span>Best Buyer Bid:</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-soil">
                        ₹{lot.highestOffer.toLocaleString('en-IN')}/qtl ({lot.activeOffersCount} {lot.activeOffersCount === 1 ? 'offer' : 'offers'})
                      </span>
                    </div>
                  )}

                  {/* Received Bids on this Lot */}
                  {lot.lotOffers && lot.lotOffers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-soil/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-xs font-bold text-soil flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-turmeric" />
                          {lang === 'en' ? 'Offers Received' : 'प्राप्त ऑफ़र'} ({lot.lotOffers.length})
                        </span>
                        <Link
                          to={`/farmer/lots/${lot.id}`}
                          className="font-body text-[11px] text-turmeric hover:underline font-semibold"
                        >
                          {lang === 'en' ? 'View details →' : 'विवरण देखें →'}
                        </Link>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {lot.lotOffers.map((offer) => (
                          <div
                            key={offer.id}
                            className="p-2.5 rounded-xl bg-soil/5 border border-soil/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-body text-xs font-bold text-soil truncate">
                                  {offer.buyerName}
                                </span>
                                {offer.buyerVerified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-datateal flex-shrink-0" />
                                )}
                                <span
                                  className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    offer.status === 'Pending'
                                      ? 'bg-turmeric/20 text-turmeric'
                                      : offer.status === 'Accepted'
                                      ? 'bg-datateal/20 text-datateal'
                                      : offer.status === 'Rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-soil/10 text-soil/60'
                                  }`}
                                >
                                  {offer.status}
                                </span>
                              </div>
                              <p className="font-body text-[10px] text-soil/60 truncate">
                                {offer.buyerCompany}
                              </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 text-right">
                              <div>
                                <span className="font-mono text-xs font-bold text-soil block">
                                  ₹{offer.offeredPrice.toLocaleString('en-IN')}/qtl
                                </span>
                                <span className="font-body text-[10px] text-soil/50">
                                  {offer.quantityQtl} qtl &bull; ₹{offer.totalAmount.toLocaleString('en-IN')}
                                </span>
                              </div>

                              {offer.status === 'Pending' && (
                                <div className="flex items-center gap-1 ml-1">
                                  <button
                                    type="button"
                                    onClick={() => acceptOffer(offer.id)}
                                    className="px-2 py-1 rounded-lg bg-datateal text-wheat font-body text-[10px] font-bold hover:bg-datateal/90 transition-colors cursor-pointer"
                                    title="Accept Bid"
                                  >
                                    {lang === 'en' ? 'Accept' : 'स्वीकार'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => rejectOffer(offer.id)}
                                    className="px-2 py-1 rounded-lg bg-soil/10 text-soil font-body text-[10px] font-bold hover:bg-soil/15 transition-colors cursor-pointer"
                                    title="Reject Bid"
                                  >
                                    {lang === 'en' ? 'Reject' : 'अस्वीकार'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-soil/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/farmer/lots/${lot.id}`}
                      className="px-3 py-1.5 rounded-xl bg-monsoon text-wheat font-body text-xs font-semibold hover:bg-monsoon/90 transition-colors flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/farmer/market-prices?lotId=${lot.id}`}
                      className="px-2.5 py-1.5 rounded-xl bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15 font-body text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Compare Mandis & Net Realisation"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-turmeric" />
                      <span>Compare</span>
                    </Link>

                    {lot.status === 'Active' && (
                      <Link
                        to="/farmer/buyers"
                        className="px-2.5 py-1.5 rounded-xl bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15 font-body text-xs font-medium transition-colors flex items-center gap-1"
                        title="View Buyer Matches"
                      >
                        <Users className="w-3.5 h-3.5 text-turmeric" />
                        <span>Matches</span>
                      </Link>
                    )}

                    {lot.status === 'Sold' && (
                      <Link
                        to="/farmer/payments"
                        className="px-2.5 py-1.5 rounded-xl bg-datateal/20 text-soil hover:bg-datateal/30 border border-datateal/40 font-body text-xs font-semibold transition-colors flex items-center gap-1"
                        title="View Payment / Settlement"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-soil" />
                        <span>View Payment</span>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {lot.status === 'Draft' ? (
                      <>
                        <Link
                          to={`/farmer/lots/edit/${lot.id}`}
                          className="px-2.5 py-1.5 rounded-xl bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15 font-body text-xs font-semibold transition-colors"
                        >
                          Continue Editing
                        </Link>
                        <button
                          onClick={() => publishDraftLot(lot.id)}
                          className="px-3 py-1.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all cursor-pointer shadow-xs"
                        >
                          Publish
                        </button>
                      </>
                    ) : lot.status === 'Active' || lot.status === 'Paused' ? (
                      <>
                        <Link
                          to={`/farmer/lots/edit/${lot.id}`}
                          className="p-1.5 rounded-xl bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15 transition-colors"
                          title="Edit Lot"
                        >
                          <Edit className="w-3.5 h-3.5 text-turmeric" />
                        </Link>
                        <button
                          onClick={() => pauseLot(lot.id)}
                          className="p-1.5 rounded-xl bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15 transition-colors cursor-pointer"
                          title={lot.status === 'Paused' ? 'Resume Lot' : 'Pause Lot'}
                        >
                          {lot.status === 'Paused' ? <Play className="w-3.5 h-3.5 text-datateal" /> : <Pause className="w-3.5 h-3.5 text-turmeric" />}
                        </button>
                      </>
                    ) : null}

                    <button
                      onClick={() => setDeleteModalLot(lot)}
                      className="p-1.5 rounded-xl bg-red-500/10 text-red-700 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Delete Lot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalLot && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-xl font-bold">{lang === 'en' ? 'Delete Produce Lot?' : 'लॉट हटाएं?'}</h3>
            </div>
            <p className="font-body text-xs text-soil/80 leading-relaxed">
              {lang === 'en'
                ? `Are you sure you want to delete lot "${deleteModalLot.id}" (${deleteModalLot.crop})? This action cannot be undone.`
                : `क्या आप निश्चित रूप से लॉट "${deleteModalLot.id}" को हटाना चाहते हैं?`}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalLot(null)}
                className="px-4 py-2 rounded-xl bg-soil/10 text-soil font-body text-xs font-semibold hover:bg-soil/15 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-700 text-wheat font-body text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer shadow-sm"
              >
                {lang === 'en' ? 'Confirm Delete' : 'हटाएं'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
