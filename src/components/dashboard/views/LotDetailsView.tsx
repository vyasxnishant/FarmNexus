import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sprout,
  ShieldCheck,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  Users,
  CheckCircle2,
  Clock,
  Edit,
  Pause,
  Play,
  Trash2,
  FileText,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react'
import { useDashboard, type CropLot } from '../../../context/DashboardContext'

export function LotDetailsView() {
  const { lotId } = useParams<{ lotId: string }>()
  const navigate = useNavigate()
  const { getLotById, pauseLot, deleteLot, publishDraftLot, lang } = useDashboard()

  const lot = lotId ? getLotById(lotId) : undefined
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (!lot) {
    return (
      <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center text-soil space-y-4">
        <AlertTriangle className="w-10 h-10 text-turmeric mx-auto" />
        <h2 className="font-serif text-2xl font-bold">{lang === 'en' ? 'Lot Not Found' : 'लॉट नहीं मिला'}</h2>
        <p className="font-body text-xs text-soil/70 max-w-md mx-auto">
          {lang === 'en' ? `The produce lot "${lotId}" does not exist or has been removed.` : `लॉट "${lotId}" उपलब्ध नहीं है।`}
        </p>
        <Link
          to="/farmer/lots"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-monsoon text-wheat font-body text-xs font-bold hover:bg-monsoon/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to My Lots' : 'सभी लॉट देखें'}</span>
        </Link>
      </div>
    )
  }

  // Financial Estimates
  const grossValue = lot.expectedPrice * lot.quantityQtl
  const estTransport = Math.round(lot.quantityQtl * 25) // ~₹25/qtl est
  const estHandling = Math.round(lot.quantityQtl * 20)
  const estNetRealisation = Math.max(0, grossValue - estTransport - estHandling)

  // FarmNexus 8-Stage Transaction Timeline Steps
  const timelineStages = [
    { title: 'Lot Created', desc: 'Harvest registered', completed: true },
    { title: 'Published to Network', desc: 'Live to verified buyers', completed: lot.status !== 'Draft' },
    { title: 'Buyer Matched', desc: `${lot.matchedBuyersCount} buyers matching specs`, completed: lot.matchedBuyersCount > 0 && lot.status !== 'Draft' },
    { title: 'Offer Received', desc: lot.activeOffersCount > 0 ? `${lot.activeOffersCount} active offers` : 'Awaiting bids', completed: lot.activeOffersCount > 0 },
    { title: 'Offer Accepted', desc: lot.status === 'Sold' ? 'Deal agreed' : 'Pending agreement', completed: lot.status === 'Sold' },
    { title: 'Logistics Arranged', desc: 'Pickup scheduled', completed: lot.status === 'Sold' },
    { title: 'Delivered to Mandi/Buyer', desc: 'Weighment confirmed', completed: lot.status === 'Sold' },
    { title: 'Payment Settled', desc: 'Instant UPI / Escrow credit', completed: lot.status === 'Sold' },
  ]

  const handleDelete = () => {
    deleteLot(lot.id)
    navigate('/farmer/lots')
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/lots"
            className="p-2.5 rounded-2xl bg-wheat text-soil hover:bg-wheat/80 border border-soil/15 transition-colors cursor-pointer"
            aria-label="Back to My Lots"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lot.id}
              </span>
              <span
                className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  lot.status === 'Active'
                    ? 'bg-datateal/20 text-soil border border-datateal/40'
                    : lot.status === 'Draft'
                    ? 'bg-soil/10 text-soil border border-soil/20'
                    : lot.status === 'Sold'
                    ? 'bg-turmeric/20 text-soil border border-turmeric/40'
                    : 'bg-red-500/10 text-red-700 border border-red-500/20'
                }`}
              >
                {lot.status}
              </span>

              {lot.isDemo && (
                <span className="font-mono text-[10px] text-soil/60 bg-soil/5 border border-soil/15 px-2 py-0.5 rounded-full">
                  DEMO DATA
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil mt-1">
              {lot.crop} — <span className="font-normal text-soil/70 text-2xl">{lot.variety}</span>
            </h1>
          </div>
        </div>

        {/* Top Lot Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {lot.status === 'Active' && (
            <Link
              to="/farmer/buyers"
              className="px-3.5 py-2 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/20 hover:bg-soil/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-turmeric" />
              <span>{lang === 'en' ? 'View Matches' : 'खरीदार मिलान'}</span>
            </Link>
          )}

          {lot.status === 'Sold' && (
            <Link
              to="/farmer/payments"
              className="px-3.5 py-2 rounded-xl bg-datateal/20 text-soil font-body text-xs font-semibold border border-datateal/40 hover:bg-datateal/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-soil" />
              <span>{lang === 'en' ? 'View Payment & Escrow' : 'भुगतान देखें'}</span>
            </Link>
          )}

          {lot.status === 'Draft' ? (
            <button
              onClick={() => publishDraftLot(lot.id)}
              className="px-4 py-2 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'Publish Lot' : 'लॉट प्रकाशित करें'}</span>
            </button>
          ) : lot.status === 'Active' || lot.status === 'Paused' ? (
            <button
              onClick={() => pauseLot(lot.id)}
              className="px-3.5 py-2 rounded-xl bg-wheat text-soil font-body text-xs font-semibold border border-soil/20 hover:bg-wheat/80 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {lot.status === 'Paused' ? <Play className="w-3.5 h-3.5 text-datateal" /> : <Pause className="w-3.5 h-3.5 text-turmeric" />}
              <span>{lot.status === 'Paused' ? 'Resume Listing' : 'Pause Listing'}</span>
            </button>
          ) : null}

          <Link
            to={`/farmer/lots/edit/${lot.id}`}
            className="px-3.5 py-2 rounded-xl bg-wheat text-soil font-body text-xs font-semibold border border-soil/20 hover:bg-wheat/80 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-turmeric" />
            <span>{lang === 'en' ? 'Edit Lot' : 'संपादित करें'}</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl bg-red-500/10 text-red-700 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
            title="Delete Lot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Financial / Action Cards */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Specifications & Quality Scorecard */}
        <div className="lg:col-span-8 space-y-6">
          {/* Produce Specifications Card */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-soil/10">
              <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                <Sprout className="w-5 h-5 text-turmeric" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-soil">
                  {lang === 'en' ? 'Produce Specifications' : 'फसल विवरण व मात्रा'}
                </h3>
                <p className="font-body text-xs text-soil/70 mt-0.5">
                  {lang === 'en' ? 'Registered harvest volume and storage dispatch location.' : 'पंजीकृत उपज मात्रा व भंडारण स्थान।'}
                </p>
              </div>
            </div>

            {lot.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-soil/15 max-h-64 shadow-xs">
                <img src={lot.imageUrl} alt={lot.crop} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
                <span className="font-body text-[11px] text-soil/60 block">HARVEST QUANTITY</span>
                <p className="font-mono text-2xl font-bold text-soil mt-1">
                  {lot.quantityQtl} <span className="text-xs font-normal text-soil/60">{lot.unit || 'Quintals'}</span>
                </p>
                <span className="font-mono text-[11px] text-soil/50">({(lot.quantityQtl / 10).toFixed(1)} Metric Tonnes)</span>
              </div>

              <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
                <span className="font-body text-[11px] text-soil/60 block">HARVEST DATE</span>
                <p className="font-mono text-base font-bold text-soil mt-1">{lot.harvestDate}</p>
                <span className="font-body text-[11px] text-soil/50">Registered {lot.createdAt}</span>
              </div>

              <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
                <span className="font-body text-[11px] text-soil/60 block">AVAILABILITY WINDOW</span>
                <p className="font-mono text-xs font-bold text-soil mt-1">
                  {lot.availableFrom || lot.harvestDate}
                </p>
                <span className="font-mono text-[11px] text-soil/50">to {lot.availableUntil || 'Open'}</span>
              </div>
            </div>

            {lot.description && (
              <div className="p-4 bg-soil/5 rounded-2xl border border-soil/10">
                <span className="font-body text-xs font-bold text-soil block mb-1">
                  {lang === 'en' ? 'Produce Description & Lot Highlights:' : 'उपज का विवरण:'}
                </span>
                <p className="font-body text-xs text-soil/80 leading-relaxed">{lot.description}</p>
              </div>
            )}

            <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-turmeric flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-body text-xs font-bold text-soil block">
                  {lang === 'en' ? 'Pickup Godown Location' : 'पिकअप गोदाम का पता'}
                </span>
                <p className="font-body text-xs text-soil/80 mt-0.5">{lot.location}</p>
                {lot.pickupLocation && (
                  <p className="font-body text-[11px] text-soil/60 mt-0.5 font-medium">
                    Gate / Bay: {lot.pickupLocation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quality Grading Scorecard */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-soil/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-turmeric" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-soil">
                    {lang === 'en' ? 'Quality Grading & Assay Scorecard' : 'गुणवत्ता ग्रेडिंग व लैब स्कोरकार्ड'}
                  </h3>
                  <p className="font-body text-xs text-soil/70 mt-0.5">
                    {lang === 'en' ? 'Physical grain parameters and purity assay.' : 'नमी व दाना गुणवत्ता मापदंड।'}
                  </p>
                </div>
              </div>

              <span className="font-mono text-[10px] font-semibold text-soil/80 bg-turmeric/15 border border-turmeric/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
                Farmer Provided Quality Information
              </span>
            </div>

            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/60 block uppercase">QUALITY GRADE</span>
                <p className="font-mono text-base font-bold text-datateal mt-0.5">{lot.grade}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/60 block uppercase">VISUAL QUALITY</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5">{lot.visualQuality || 'Good'}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/60 block uppercase">DAMAGE / DEFECTS</span>
                <p className="font-mono text-base font-bold text-turmeric mt-0.5">{lot.damageLevel || 'Low'}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/60 block uppercase">GRAIN UNIFORMITY</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5 truncate">{lot.grainSize || 'Medium'}</p>
              </div>
            </div>

            {/* Secondary Assay Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/60 block uppercase">MOISTURE CONTENT</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5">{lot.moisturePercent ? `${lot.moisturePercent}%` : 'Standard'}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/60 block uppercase">FOREIGN MATTER</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5">{lot.foreignMatterPercent ?? 0.8}%</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/60 block uppercase">DAMAGED GRAIN</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5">{lot.damagedGrainPercent ?? 0.5}%</p>
              </div>
            </div>

            {/* Quality Notes */}
            {lot.qualityNotes && (
              <div className="p-4 bg-soil/5 rounded-2xl border border-soil/10">
                <span className="font-body text-xs font-bold text-soil block mb-1">
                  {lang === 'en' ? 'Quality Notes & Handling Remarks:' : 'गुणवत्ता टिप्पणी:'}
                </span>
                <p className="font-body text-xs text-soil/80 leading-relaxed">{lot.qualityNotes}</p>
              </div>
            )}

            {/* Certificate Status */}
            <div className="p-4 rounded-2xl bg-wheat border border-soil/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-turmeric" />
                <div>
                  <p className="font-body text-xs font-bold text-soil">
                    {lot.certificateUrl ? 'Quality Assay Certificate Attached' : 'Self-Declared Quality Assay'}
                  </p>
                  <p className="text-[11px] text-soil/60">
                    {lot.certificateUrl ? 'NABL verified assay document attached by producer' : 'Declaration verified by Lead Producer / FPO'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-datateal/20 text-soil">
                Verified
              </span>
            </div>
          </div>

          {/* FarmNexus 8-Stage Transaction Timeline */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-soil/10">
              <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                <Layers className="w-5 h-5 text-turmeric" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-soil">
                  {lang === 'en' ? 'FarmNexus Transaction Lifecycle' : 'लेनदेन जीवन चक्र स्थिति'}
                </h3>
                <p className="font-body text-xs text-soil/70 mt-0.5">
                  {lang === 'en' ? 'Track lot progression from creation through buyer match, escrow, and settlement.' : 'लॉट निर्माण से लेकर खरीदार मिलान, एस्क्रो व भुगतान तक की प्रगति।'}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {timelineStages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    stage.completed
                      ? 'bg-monsoon text-wheat border-monsoon shadow-xs'
                      : 'bg-soil/5 text-soil/60 border-soil/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-turmeric">STEP 0{idx + 1}</span>
                    {stage.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-datateal" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-soil/40" />
                    )}
                  </div>
                  <p className="font-body text-xs font-bold leading-tight">{stage.title}</p>
                  <p className={`text-[10px] mt-1 ${stage.completed ? 'text-wheat/70' : 'text-soil/50'}`}>
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Pricing, Net Realisation, & Matches */}
        <div className="lg:col-span-4 space-y-6">
          {/* Financial Valuation Card */}
          <div className="bg-monsoon text-wheat rounded-3xl p-6 border-2 border-turmeric/40 shadow-xl space-y-5">
            <div>
              <span className="font-mono text-xs font-semibold text-turmeric uppercase tracking-wider block">
                VALUATION & PRICING
              </span>
              <p className="font-serif text-2xl font-bold text-wheat mt-1">
                ₹{grossValue.toLocaleString('en-IN')}
              </p>
              <p className="font-body text-xs text-wheat/60">
                Gross value for {lot.quantityQtl} quintals @ ₹{lot.expectedPrice}/qtl
              </p>
            </div>

            <div className="p-4 bg-wheat/10 rounded-2xl border border-turmeric/30 space-y-2">
              <span className="font-mono text-[11px] font-semibold text-turmeric uppercase tracking-wider block">
                ESTIMATED NET REALISATION
              </span>
              <p className="font-mono text-2xl font-bold text-datateal">
                ₹{estNetRealisation.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-wheat/10 text-wheat/70">
                <span>In-Hand Net Rate:</span>
                <span className="text-wheat font-bold">₹{Math.round(estNetRealisation / lot.quantityQtl)}/qtl</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-body text-wheat/80 pt-2 border-t border-wheat/10">
              <div className="flex items-center justify-between">
                <span>Floor Minimum Acceptable:</span>
                <span className="font-mono font-bold text-wheat">₹{lot.minAcceptablePrice || Math.round(lot.expectedPrice * 0.95)}/qtl</span>
              </div>
              <div className="flex items-center justify-between">
                <span>AGMARKNET Mandi Benchmark:</span>
                <span className="font-mono font-bold text-datateal">₹{lot.marketReferencePrice || 2840}/qtl</span>
              </div>
            </div>

            <Link
              to={`/farmer/market-prices?lotId=${lot.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{lang === 'en' ? 'Compare Mandi Prices for this Lot' : 'इस लॉट हेतु मंडी भाव तुलना'}</span>
            </Link>
          </div>

          {/* Buyer Match Placeholder */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-turmeric" />
                <h4 className="font-serif text-lg font-bold text-soil">
                  {lang === 'en' ? 'Matched Buyers' : 'सत्यापित खरीदार'}
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-monsoon bg-turmeric px-2 py-0.5 rounded-full">
                {lot.matchedBuyersCount} Matches
              </span>
            </div>

            <p className="font-body text-xs text-soil/70 leading-relaxed">
              {lang === 'en'
                ? `System matched ${lot.matchedBuyersCount} verified institutional millers & FPOs matching Grade ${lot.grade} ${lot.crop}.`
                : `${lot.matchedBuyersCount} सत्यापित खरीदार इस लॉट के गुणवत्ता मापदंडों से मेल खाते हैं।`}
            </p>

            <Link
              to="/farmer/buyers"
              className="w-full py-2.5 px-4 rounded-xl bg-monsoon text-wheat font-body text-xs font-bold hover:bg-monsoon/90 transition-all flex items-center justify-center gap-2"
            >
              <span>{lang === 'en' ? 'View Buyer Match Directory' : 'खरीदार मिलान देखें'}</span>
              <ArrowRight className="w-4 h-4 text-turmeric" />
            </Link>
          </div>

          {/* Active Offers Placeholder */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-turmeric" />
                <h4 className="font-serif text-lg font-bold text-soil">
                  {lang === 'en' ? 'Incoming Offers' : 'प्राप्त ऑफ़र'}
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-soil bg-soil/10 px-2 py-0.5 rounded-full">
                {lot.activeOffersCount} Offers
              </span>
            </div>

            {lot.highestOffer ? (
              <div className="p-3 bg-soil/5 rounded-2xl border border-soil/10">
                <span className="font-body text-[11px] text-soil/60 block">HIGHEST BID RECEIVED</span>
                <p className="font-mono text-xl font-bold text-datateal mt-0.5">
                  ₹{lot.highestOffer.toLocaleString('en-IN')}<span className="text-xs font-normal text-soil/60">/qtl</span>
                </p>
              </div>
            ) : (
              <p className="font-body text-xs text-soil/60 italic">
                {lang === 'en' ? 'No active bids placed yet for this lot.' : 'इस लॉट पर अभी कोई नई बोली नहीं आई है।'}
              </p>
            )}

            <Link
              to="/farmer/offers"
              className="w-full py-2.5 px-4 rounded-xl bg-soil/5 border border-soil/20 text-soil font-body text-xs font-bold hover:bg-soil/10 transition-all flex items-center justify-center gap-2"
            >
              <span>{lang === 'en' ? 'Check Offer Bids' : 'ऑफ़र विवरण देखें'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-xl font-bold">{lang === 'en' ? 'Delete Produce Lot?' : 'लॉट हटाएं?'}</h3>
            </div>
            <p className="font-body text-xs text-soil/80 leading-relaxed">
              {lang === 'en'
                ? `Are you sure you want to delete lot "${lot.id}" (${lot.crop})? This action cannot be undone.`
                : `क्या आप निश्चित रूप से लॉट "${lot.id}" को हटाना चाहते हैं?`}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-soil/10 text-soil font-body text-xs font-semibold hover:bg-soil/15 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
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

