import { Link } from 'react-router-dom'
import {
  Sprout,
  PackageCheck,
  Tag,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  Scale
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { DemoDataBadge, LiveSignalBadge } from '../components/DemoDataBadge'
import { NetRealisationCalculator } from '../components/NetRealisationCalculator'
import { Sparkline } from '../../ui/Sparkline'
import { Button } from '../../ui/Button'

export function OverviewView() {
  const { profile, lots, offers, payments, marketData, setIsListModalOpen, currentUser, lang } = useDashboard()

  const myLots = lots.filter(l => !currentUser || currentUser.user_type === 'ADMIN' || l.farmerId === currentUser.id)
  const myOffers = offers.filter(o => !currentUser || currentUser.user_type === 'ADMIN' || o.farmerId === currentUser.id || !o.farmerId)

  const activeLots = myLots.filter(l => l.status === 'Active')
  const totalProduceQtl = myLots.reduce((acc, l) => (l.status === 'Active' || l.status === 'Draft' ? acc + l.quantityQtl : acc), 0)
  const pendingOffers = myOffers.filter(o => o.status === 'Pending')
  const totalPendingPayout = payments
    .filter(p => p.status === 'Pending' || p.status === 'Processing')
    .reduce((acc, p) => acc + p.amount, 0)

  // Best Selling Opportunity item
  const bestOpportunity = {
    crop: 'Wheat (Sharbati C-306)',
    recommendedBuyer: 'AgroCorp International Direct Silo',
    buyerLocation: 'Indore Central Hub (145 km)',
    buyerReliability: 4.95,
    grossPrice: 2840,
    transportDeduction: 120,
    handlingFee: 25,
    netRealisation: 2695,
    benchmarkLocalMandi: 2620,
    extraNetGainPerQtl: 75,
    totalLotValue: 377300,
    quantityQtl: 140,
    reason: 'Indore export demand surge (+3.4% today) offsets freight cost, netting ₹75/qtl higher than local Harda yard.',
  }

  return (
    <div className="space-y-8">
      {/* 1. Farmer Profile Summary Hero Banner */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lang === 'en' ? 'Farmer Dashboard' : 'किसान डैशबोर्ड'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-body text-soil/80 bg-soil/5 px-2.5 py-0.5 rounded-full border border-soil/10">
                <MapPin className="w-3.5 h-3.5 text-turmeric" />
                {profile.village}, {profile.district} (MP)
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-body text-datateal bg-monsoon px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-datateal" />
                {lang === 'en' ? 'KYC & KCC Verified' : 'केवाईसी सत्यापित'}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-soil">
              {lang === 'en' ? `Welcome back, ${profile.name}` : `नमस्ते, ${profile.nameHi}`}
            </h1>
            <p className="font-body text-sm text-soil/70 mt-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-soil/50" />
              <span>{profile.fpoName}</span>
              <span className="text-soil/30">•</span>
              <span>{profile.totalLandAcres} {lang === 'en' ? 'Acres Cultivated' : 'एकड़ कृषि भूमि'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="fill"
              size="md"
              onClick={() => setIsListModalOpen(true)}
              className="flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {lang === 'en' ? 'List Your Produce' : 'उपज सूचीबद्ध करें'}
            </Button>
            <Link
              to="/farmer/market-intelligence"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-body font-semibold text-sm border-2 border-soil/20 text-soil hover:bg-soil/5 transition-colors"
            >
              <Scale className="w-4 h-4 text-turmeric" />
              {lang === 'en' ? 'Compare Mandis' : 'मंडी भाव तुलना'}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Metric 1: Active Lots */}
        <Link
          to="/farmer/lots"
          className="group bg-monsoon text-wheat p-5 rounded-2xl border border-wheat/10 hover:border-turmeric/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-wheat/60">{lang === 'en' ? 'Active Crop Lots' : 'सक्रिय लॉट'}</span>
            <div className="w-8 h-8 rounded-lg bg-wheat/10 flex items-center justify-center text-turmeric">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="font-mono text-3xl font-bold text-wheat">{activeLots.length}</span>
            <span className="font-body text-xs text-wheat/50 ml-2">({lots.length} total)</span>
          </div>
          <div className="flex items-center justify-between text-xs font-body text-turmeric group-hover:underline">
            <span>{lang === 'en' ? 'Manage produce' : 'लॉट प्रबंधित करें'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Metric 2: Total Quantity */}
        <div className="bg-wheat text-soil p-5 rounded-2xl border border-soil/15 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-soil/60">{lang === 'en' ? 'Produce in Market' : 'कुल उत्पादित मात्रा'}</span>
            <div className="w-8 h-8 rounded-lg bg-monsoon flex items-center justify-center text-datateal">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="font-mono text-3xl font-bold text-soil">{totalProduceQtl}</span>
            <span className="font-mono text-sm text-soil/70 ml-1.5">Quintals</span>
          </div>
          <div className="text-[11px] font-body text-soil/60">
            {lang === 'en' ? 'Estimated Lot Value:' : 'अनुमानित मूल्य:'}{' '}
            <span className="font-mono font-semibold text-soil">₹9.85 Lakh</span>
          </div>
        </div>

        {/* Metric 3: Active Offers */}
        <Link
          to="/farmer/offers"
          className="group bg-wheat text-soil p-5 rounded-2xl border border-soil/15 hover:border-turmeric/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-soil/60">{lang === 'en' ? 'Live Buyer Offers' : 'लाइव ऑफ़र'}</span>
            <div className="w-8 h-8 rounded-lg bg-turmeric/20 flex items-center justify-center text-monsoon">
              <Tag className="w-4 h-4 text-turmeric" />
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-soil">{pendingOffers.length}</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-turmeric/15 text-soil">
              {lang === 'en' ? '1 High Offer' : '1 उच्च ऑफ़र'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-body text-turmeric font-semibold group-hover:underline">
            <span>{lang === 'en' ? 'Review & counter' : 'समीक्षा करें'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Metric 4: Pending Payouts */}
        <Link
          to="/farmer/payments"
          className="group bg-monsoon text-wheat p-5 rounded-2xl border border-wheat/10 hover:border-datateal/50 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-wheat/60">{lang === 'en' ? 'In Escrow / Payout' : 'एस्क्रो में भुगतान'}</span>
            <div className="w-8 h-8 rounded-lg bg-wheat/10 flex items-center justify-center text-datateal">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="font-mono text-2xl lg:text-3xl font-bold text-datateal">
              ₹{totalPendingPayout.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-body text-datateal group-hover:underline">
            <span>{lang === 'en' ? 'Track 2 disbursements' : 'भुगतान ट्रैक करें'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* 3. Best Selling Opportunity Card */}
      <div className="bg-monsoon text-wheat rounded-3xl border-2 border-turmeric/40 p-6 md:p-8 relative overflow-hidden shadow-md">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-turmeric/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-turmeric flex items-center justify-center text-monsoon">
              <Award className="w-5 h-5 font-bold" />
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-turmeric font-semibold">
                {lang === 'en' ? 'Best Selling Opportunity Today' : 'आज का सबसे लाभदायक अवसर'}
              </span>
              <h3 className="font-serif text-2xl font-semibold text-wheat">{bestOpportunity.crop}</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LiveSignalBadge text="MATCH 98%" />
            <DemoDataBadge />
          </div>
        </div>

        {/* Opportunity Grid */}
        <div className="grid md:grid-cols-12 gap-6 relative z-10">
          {/* Left info */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-body text-sm text-wheat font-medium">{bestOpportunity.recommendedBuyer}</span>
              <span className="text-wheat/30">•</span>
              <span className="font-body text-xs text-wheat/60">{bestOpportunity.buyerLocation}</span>
              <span className="font-mono text-xs bg-wheat/10 text-turmeric px-2 py-0.5 rounded">
                ★ {bestOpportunity.buyerReliability} Reliability
              </span>
            </div>

            <p className="font-body text-xs text-wheat/80 leading-relaxed bg-wheat/5 p-3.5 rounded-xl border border-wheat/10">
              <Sparkles className="w-4 h-4 text-datateal inline mr-1.5" />
              {bestOpportunity.reason}
            </p>

            {/* Price breakdown cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-wheat/5 p-3 rounded-xl border border-wheat/10">
                <span className="font-body text-[11px] text-wheat/50 block">{lang === 'en' ? 'Gross Offer' : 'ऑफ़र भाव'}</span>
                <span className="font-mono text-base font-bold text-wheat">₹{bestOpportunity.grossPrice}</span>
                <span className="font-body text-[10px] text-wheat/40 block">/ qtl</span>
              </div>

              <div className="bg-wheat/5 p-3 rounded-xl border border-wheat/10">
                <span className="font-body text-[11px] text-wheat/50 block">{lang === 'en' ? 'Freight & Cess' : 'भाड़ा व उपकर'}</span>
                <span className="font-mono text-base font-semibold text-turmeric">-₹{bestOpportunity.transportDeduction + bestOpportunity.handlingFee}</span>
                <span className="font-body text-[10px] text-wheat/40 block">/ qtl</span>
              </div>

              <div className="bg-wheat/10 p-3 rounded-xl border border-datateal/30">
                <span className="font-body text-[11px] text-datateal font-semibold block">{lang === 'en' ? 'Net In-Hand' : 'शुद्ध प्राप्ति'}</span>
                <span className="font-mono text-lg font-bold text-datateal">₹{bestOpportunity.netRealisation}</span>
                <span className="font-body text-[10px] text-wheat/50 block">/ qtl</span>
              </div>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="md:col-span-5 bg-wheat/5 rounded-2xl p-5 border border-wheat/10 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-body text-xs text-wheat/60">{lang === 'en' ? 'Total Net Payout on 140 qtl' : '140 क्विंटल पर कुल शुद्ध भुगतान'}</span>
              <div className="font-mono text-3xl font-bold text-datateal my-1">
                ₹{bestOpportunity.totalLotValue.toLocaleString('en-IN')}
              </div>
              <p className="font-body text-xs text-datateal flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+₹{(bestOpportunity.extraNetGainPerQtl * bestOpportunity.quantityQtl).toLocaleString('en-IN')} vs local Mandi</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Link to="/farmer/offers" className="flex-1">
                <Button variant="fill" size="md" className="w-full text-sm">
                  {lang === 'en' ? 'Accept & Lock Deal' : 'सौदा लॉक करें'}
                </Button>
              </Link>
              <Link
                to="/farmer/market-intelligence"
                className="px-3.5 py-2.5 rounded-lg border border-wheat/20 text-wheat hover:bg-wheat/10 text-xs font-body flex items-center justify-center transition-colors"
                title="View in Market Intelligence"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Mandi Ticker Preview */}
      <div className="bg-wheat rounded-2xl border border-soil/15 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-semibold text-soil">
              {lang === 'en' ? 'Nearby Mandi Benchmarks' : 'निकटतम मंडी भाव'}
            </h3>
            <LiveSignalBadge text="UPDATED" />
          </div>
          <Link to="/farmer/market-intelligence" className="font-body text-xs text-turmeric font-semibold hover:underline flex items-center gap-1">
            {lang === 'en' ? 'Full Market Intelligence' : 'संपूर्ण मंडी विश्लेषण'}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {marketData.slice(0, 3).map((item, idx) => (
            <div key={idx} className="bg-soil/5 rounded-xl p-4 border border-soil/10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-body text-sm font-semibold text-soil">{item.crop}</h4>
                  <p className="font-body text-xs text-soil/60">{item.mandi} ({item.distanceKm} km)</p>
                </div>
                <Sparkline data={item.sparkline} width={64} height={20} />
              </div>

              <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-soil/10">
                <span className="font-mono text-lg font-bold text-soil">₹{item.modalPrice.toLocaleString('en-IN')}<span className="text-xs text-soil/50">/qtl</span></span>
                <span className="font-mono text-xs font-semibold text-datateal bg-monsoon px-2 py-0.5 rounded">
                  ▲ +{item.priceChange}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Net Realisation Interactive Calculator Section */}
      <NetRealisationCalculator />

      {/* 6. Recent Activity & Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-wheat rounded-2xl border border-soil/15 p-6 shadow-sm">
          <h3 className="font-serif text-xl font-semibold text-soil mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-turmeric" />
            {lang === 'en' ? 'Recent Farm Activity' : 'हाल की गतिविधियां'}
          </h3>
          <div className="space-y-3 font-body text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-soil/5 border border-soil/10">
              <CheckCircle2 className="w-4 h-4 text-datateal flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-soil">
                  {lang === 'en' ? 'Offer Received: ₹2,780/qtl for Sharbati Wheat' : 'ऑफ़र मिला: ₹2,780/क्विंटल शरबती गेहूं'}
                </p>
                <p className="text-soil/50 text-[11px]">AgroCorp International • 15 mins ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-soil/5 border border-soil/10">
              <CheckCircle2 className="w-4 h-4 text-datateal flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-soil">
                  {lang === 'en' ? 'Payout Escrow Verified: ₹1,62,000' : 'एस्क्रो सत्यापन पूर्ण: ₹1,62,000'}
                </p>
                <p className="text-soil/50 text-[11px]">e-NWR Warehouse Escrow • Today 11:30 AM</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-soil/5 border border-soil/10">
              <TrendingUp className="w-4 h-4 text-turmeric flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-soil">
                  {lang === 'en' ? 'Indore Mandi Price Alert: +3.4% Surge' : 'इंदौर मंडी भाव अलर्ट: +3.4% उछाल'}
                </p>
                <p className="text-soil/50 text-[11px]">Market Intelligence Signal • 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-monsoon text-wheat rounded-2xl border border-wheat/10 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl font-semibold text-wheat mb-2">
              {lang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
            </h3>
            <p className="font-body text-xs text-wheat/60 mb-5">
              {lang === 'en'
                ? 'Standardized agri-trading shortcuts aligned with national digital rails.'
                : 'राष्ट्रीय डिजिटल रेल के अनुरूप प्रत्यक्ष कृषि व्यापार टूल्स।'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsListModalOpen(true)}
              className="p-3 rounded-xl bg-turmeric text-monsoon font-body font-semibold text-xs text-left hover:bg-turmeric/90 transition-colors flex flex-col justify-between h-20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'en' ? 'List Produce' : 'उपज सूचीबद्ध करें'}</span>
            </button>

            <Link
              to="/farmer/market-intelligence"
              className="p-3 rounded-xl bg-wheat/10 text-wheat font-body font-medium text-xs text-left hover:bg-wheat/15 transition-colors flex flex-col justify-between h-20 border border-wheat/10"
            >
              <Scale className="w-4 h-4 text-turmeric" />
              <span>{lang === 'en' ? 'Compare Mandis' : 'मंडी तुलना'}</span>
            </Link>

            <Link
              to="/farmer/buyers"
              className="p-3 rounded-xl bg-wheat/10 text-wheat font-body font-medium text-xs text-left hover:bg-wheat/15 transition-colors flex flex-col justify-between h-20 border border-wheat/10"
            >
              <Sparkles className="w-4 h-4 text-datateal" />
              <span>{lang === 'en' ? 'Find Buyers' : 'खरीदार खोजें'}</span>
            </Link>

            <Link
              to="/farmer/offers"
              className="p-3 rounded-xl bg-wheat/10 text-wheat font-body font-medium text-xs text-left hover:bg-wheat/15 transition-colors flex flex-col justify-between h-20 border border-wheat/10"
            >
              <Tag className="w-4 h-4 text-turmeric" />
              <span>{lang === 'en' ? 'View Offers' : 'ऑफ़र देखें'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

