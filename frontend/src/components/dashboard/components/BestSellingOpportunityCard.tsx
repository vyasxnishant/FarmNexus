import { TrendingUp, TrendingDown, MapPin, Sparkles, Package, ArrowRight, ShieldCheck, Clock, AlertCircle } from 'lucide-react'
import { Sparkline } from '../../ui/Sparkline'

export interface SellingOpportunityData {
  market: string
  district: string
  state: string
  commodity: string
  variety: string
  modalPrice: number
  quantity: number
  grossSaleValue: number
  estimatedTransport: number
  estimatedHandling: number
  estimatedNetRealisation: number
  netPerQuintal: number
  arrivalQuantity: number
  trendChange: number
  sparkline: number[]
  reportingDate: string
  source: string
  isDemo: boolean
  fetchedAt: string
}

export interface TimingRecommendation {
  status: 'SELL NOW' | 'WATCH MARKET' | 'WAIT' | 'INSUFFICIENT_DATA'
  reason: string
  trendPercent: number
}

interface BestSellingOpportunityCardProps {
  opportunity: SellingOpportunityData | null
  explanation: string
  timing: TimingRecommendation
  lang: 'en' | 'hi'
  onQuickList?: () => void
}

export function BestSellingOpportunityCard({
  opportunity,
  explanation,
  timing,
  lang,
  onQuickList,
}: BestSellingOpportunityCardProps) {
  if (!opportunity) {
    return (
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 text-center text-soil/60 font-body text-xs">
        <Package className="w-8 h-8 mx-auto text-soil/30 mb-2" />
        <p className="font-semibold text-soil text-sm">{lang === 'en' ? 'No market data available' : 'कोई मंडी डेटा उपलब्ध नहीं है'}</p>
        <p className="mt-1">{lang === 'en' ? 'No live price feeds currently available for this commodity.' : 'इस फसल के लिए कोई लाइव मंडी भाव उपलब्ध नहीं हैं।'}</p>
      </div>
    )
  }

  // Timing badge styling
  const timingStyles = {
    'SELL NOW': {
      bg: 'bg-datateal/15 text-datateal border-datateal/40',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      labelEn: 'SELL NOW — Peak Capture',
      labelHi: 'तुरंत बेचें — उच्चतम भाव',
    },
    'WATCH MARKET': {
      bg: 'bg-turmeric/15 text-turmeric border-turmeric/40',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      labelEn: 'WATCH MARKET — Stable Corridor',
      labelHi: 'बाजार पर नजर रखें — स्थिर भाव',
    },
    'WAIT': {
      bg: 'bg-red-500/15 text-red-400 border-red-500/40',
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      labelEn: 'WAIT — Temporary Dip',
      labelHi: 'रुकें — अस्थाई गिरावट',
    },
    'INSUFFICIENT_DATA': {
      bg: 'bg-wheat/10 text-wheat/60 border-wheat/20',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      labelEn: 'DATA BASELINE — Monitor Mandi',
      labelHi: 'सीमित डेटा — मंडी पर नजर रखें',
    },
  }[timing.status]

  return (
    <div className="relative bg-gradient-to-br from-monsoon to-monsoon/95 text-wheat rounded-3xl p-6 md:p-8 border-2 border-turmeric/40 shadow-xl overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-turmeric/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-wheat/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-monsoon bg-turmeric px-3.5 py-1 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-monsoon" />
            {lang === 'en' ? 'Best Selling Opportunity' : 'सर्वोत्तम विक्रय अवसर'}
          </span>
          <span className="font-mono text-xs text-wheat/60 bg-wheat/5 border border-wheat/10 px-2.5 py-1 rounded-full">
            {opportunity.commodity}
          </span>
        </div>

        {/* Sell / Watch / Wait Recommendation Pill */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${timingStyles.bg}`}>
          {timingStyles.icon}
          <span>{lang === 'en' ? timingStyles.labelEn : timingStyles.labelHi}</span>
        </div>
      </div>

      {/* Main Grid: Left Stats & Right Net Realisation Hero */}
      <div className="relative z-10 grid lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left Column: Recommended Market & Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="font-body text-xs text-wheat/60 uppercase tracking-wider block mb-1">
              {lang === 'en' ? 'Recommended Mandi Hub' : 'अनुशंसित मंडी केंद्र'}
            </span>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-turmeric flex-shrink-0" />
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-wheat">
                {opportunity.market}
              </h2>
            </div>
            <p className="font-body text-xs text-wheat/70 ml-7">
              {opportunity.district}, {opportunity.state} &bull; <span className="text-wheat/50">{opportunity.variety}</span>
            </p>
          </div>

          {/* Core Numbers 3-column pill */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-wheat/5 border border-wheat/10 rounded-2xl p-3">
              <span className="font-body text-[11px] text-wheat/60 block">{lang === 'en' ? 'Modal Price' : 'मॉडल भाव'}</span>
              <span className="font-mono text-lg font-bold text-wheat">
                ₹{opportunity.modalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-wheat/40 block">/qtl</span>
            </div>

            <div className="bg-wheat/5 border border-wheat/10 rounded-2xl p-3">
              <span className="font-body text-[11px] text-wheat/60 block">{lang === 'en' ? 'Est. Logistics' : 'लॉजिस्टिक्स कटौती'}</span>
              <span className="font-mono text-lg font-bold text-turmeric">
                -₹{(opportunity.estimatedTransport + opportunity.estimatedHandling).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-wheat/40 block">({opportunity.quantity} qtl total)</span>
            </div>

            <div className="bg-wheat/5 border border-wheat/10 rounded-2xl p-3">
              <span className="font-body text-[11px] text-wheat/60 block">{lang === 'en' ? 'Daily Arrivals' : 'दैनिक आवक'}</span>
              <span className="font-mono text-lg font-bold text-wheat">
                {opportunity.arrivalQuantity.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-wheat/40 block">quintals</span>
            </div>
          </div>

          {/* Plain-Language Explanation */}
          <div className="bg-wheat/5 border border-wheat/10 rounded-2xl p-4">
            <p className="font-body text-xs text-wheat/90 leading-relaxed">
              <span className="text-turmeric font-semibold">{lang === 'en' ? 'Analysis: ' : 'विश्लेषण: '}</span>
              {explanation}
            </p>
            {timing.reason && (
              <p className="font-body text-xs text-wheat/60 mt-2 pt-2 border-t border-wheat/10">
                <span className="font-semibold text-wheat/80">{lang === 'en' ? 'Timing Context: ' : 'समय संदर्भ: '}</span>
                {timing.reason}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Hero Estimated Net Realisation Card (5 cols) */}
        <div className="lg:col-span-5 bg-wheat/10 border border-turmeric/30 rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-turmeric uppercase tracking-wider">
                ESTIMATED NET REALISATION
              </span>
              <ShieldCheck className="w-4 h-4 text-datateal" />
            </div>

            {/* In-Hand Total */}
            <div className="mt-3">
              <p className="font-mono text-3xl md:text-4xl font-bold text-datateal">
                ₹{opportunity.estimatedNetRealisation.toLocaleString('en-IN')}
              </p>
              <p className="font-body text-xs text-wheat/60 mt-0.5">
                {lang === 'en' ? 'Total estimated in-hand earnings for' : 'कुल शुद्ध प्राप्ति ('} {opportunity.quantity} {lang === 'en' ? 'quintals' : 'क्विंटल)'}
              </p>
            </div>

            {/* Net Realisation per Quintal */}
            <div className="mt-4 pt-4 border-t border-wheat/10 flex items-center justify-between">
              <span className="font-body text-xs text-wheat/70">{lang === 'en' ? 'Net In-Hand Rate:' : 'शुद्ध प्रति क्विंटल भाव:'}</span>
              <span className="font-mono text-base font-bold text-wheat">
                ₹{Math.round(opportunity.netPerQuintal).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-wheat/60"> /qtl</span>
              </span>
            </div>

            {/* 7-Day Sparkline */}
            {opportunity.sparkline && opportunity.sparkline.length > 1 && (
              <div className="mt-3 flex items-center justify-between">
                <span className="font-body text-xs text-wheat/60">{lang === 'en' ? '7d Price Trajectory' : '7 दिन का रुझान'}</span>
                <Sparkline data={opportunity.sparkline} width={90} height={24} />
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          {onQuickList && (
            <button
              onClick={onQuickList}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{lang === 'en' ? 'List Produce for this Opportunity' : 'इस भाव पर उपज लिस्ट करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Metadata & Data Transparency Footer */}
      <div className="relative z-10 mt-6 pt-4 border-t border-wheat/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-wheat/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-datateal" />
            {lang === 'en' ? 'Source: ' : 'स्रोत: '}
            <span className="text-wheat/80 font-medium">{opportunity.source}</span>
          </span>
          <span>
            {lang === 'en' ? 'Reporting Date: ' : 'तारीख: '}
            <span className="text-wheat/80 font-medium">{opportunity.reportingDate}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-wheat/40">
          <Clock className="w-3 h-3" />
          <span>
            {lang === 'en' ? 'Fetched: ' : 'अपडेट: '}
            {new Date(opportunity.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({new Date(opportunity.fetchedAt).toLocaleDateString('en-IN')})
          </span>
        </div>
      </div>
    </div>
  )
}

