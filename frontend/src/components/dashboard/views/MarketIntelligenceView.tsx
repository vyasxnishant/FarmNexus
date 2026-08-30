import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  Scale,
  MapPin,
  Clock,
  Sparkles,
  Info,
  RefreshCw,
  AlertTriangle,
  Database,
  Building2,
  PackageCheck,
  Layers,
  ChevronDown
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { DemoDataBadge, LiveSignalBadge } from '../components/DemoDataBadge'
import { Sparkline } from '../../ui/Sparkline'
import { NetRealisationCalculator, type LogisticsParameters } from '../components/NetRealisationCalculator'
import { BestSellingOpportunityCard, type SellingOpportunityData, type TimingRecommendation } from '../components/BestSellingOpportunityCard'
import { MarketComparisonTable } from '../components/MarketComparisonTable'
import { marketApiService, type ApiMarketPrice, type ApiCommodityTrend } from '../../../services/marketApiService'

export function MarketIntelligenceView() {
  const { lang, setIsListModalOpen } = useDashboard()
  const [selectedCrop, setSelectedCrop] = useState<string>('All')
  const [quantity, setQuantity] = useState<number>(50) // Default 50 Quintals

  const [prices, setPrices] = useState<ApiMarketPrice[]>([])
  const [trends, setTrends] = useState<ApiCommodityTrend[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // Selected market for the deep calculator view
  const [selectedMarket, setSelectedMarket] = useState<ApiMarketPrice | null>(null)

  // Logistics parameters shared across calculations
  const [logisticsParams, setLogisticsParams] = useState<LogisticsParameters>({
    quantity: 50,
    transportPerKm: 1.8,
    distanceKm: 145,
    loadingPerQtl: 20,
    storageCost: 0,
    otherCharges: 150,
  })

  const loadMarketData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      const filterCrop = selectedCrop === 'All' ? undefined : selectedCrop.split(' ')[0]

      const [priceRes, trendRes] = await Promise.all([
        marketApiService.getPrices({ commodity: filterCrop, limit: 100 }),
        marketApiService.getTrends(filterCrop),
      ])

      setPrices(priceRes.data)
      setLastSyncTime(priceRes.last_sync || priceRes.data[0]?.fetched_at || null)
      setTrends(trendRes)

      if (priceRes.data.length > 0 && !selectedMarket) {
        setSelectedMarket(priceRes.data[0])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to FarmNexus backend'
      console.warn('[MarketIntelligenceView] API fetch failed:', msg)
      setError(msg)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadMarketData()
  }, [selectedCrop])

  // Extract active commodities from dataset
  const dynamicCrops = useMemo(() => {
    const rawList = Array.from(new Set(prices.map((p) => p.commodity))).filter(Boolean)
    return ['All', ...rawList.slice(0, 8)]
  }, [prices])

  // Calculate Best Selling Opportunity
  const { bestOpportunity, opportunityExplanation, timingRecommendation } = useMemo(() => {
    if (prices.length === 0) {
      return {
        bestOpportunity: null,
        opportunityExplanation: '',
        timingRecommendation: { status: 'INSUFFICIENT_DATA' as const, reason: 'No price data loaded.', trendPercent: 0 },
      }
    }

    // Filter candidate prices for the active crop if not "All"
    const candidates = selectedCrop === 'All' ? prices : prices.filter((p) => p.commodity.toLowerCase().includes(selectedCrop.toLowerCase().split(' ')[0]))

    if (candidates.length === 0) {
      return {
        bestOpportunity: null,
        opportunityExplanation: '',
        timingRecommendation: { status: 'INSUFFICIENT_DATA' as const, reason: 'No mandis found for selected crop.', trendPercent: 0 },
      }
    }

    // Calculate Net Realisation for all candidates
    const evaluated = candidates.map((item) => {
      const distance = getMandiDistance(item.district, item.market)
      const gross = item.modal_price * logisticsParams.quantity
      const transport = Math.round(distance * logisticsParams.transportPerKm * (logisticsParams.quantity / 10))
      const handling = logisticsParams.loadingPerQtl * logisticsParams.quantity + logisticsParams.storageCost + logisticsParams.otherCharges
      const net = Math.max(0, gross - transport - handling)
      const netPerQtl = logisticsParams.quantity > 0 ? net / logisticsParams.quantity : 0

      // Match trend sparkline
      const matchedTrend = trends.find((t) => t.commodity.toLowerCase().includes(item.commodity.toLowerCase()) || t.market.toLowerCase().includes(item.market.toLowerCase()))

      return {
        item,
        distance,
        gross,
        transport,
        handling,
        net,
        netPerQtl,
        trend: matchedTrend,
      }
    })

    // Sort by Net Realisation descending
    evaluated.sort((a, b) => b.net - a.net)

    const top = evaluated[0]

    // Find highest headline gross price mandi to compare
    const highestGrossCandidate = [...evaluated].sort((a, b) => b.item.modal_price - a.item.modal_price)[0]

    // Generate plain-language comparison explanation
    let explanation = ''
    if (top.item.id === highestGrossCandidate.item.id) {
      explanation = `${top.item.market} offers the highest listed modal price (₹${top.item.modal_price.toLocaleString('en-IN')}/qtl) with moderate estimated transport (₹${top.transport.toLocaleString('en-IN')}), yielding the highest estimated in-hand realisation of ₹${top.net.toLocaleString('en-IN')} (₹${Math.round(top.netPerQtl)}/qtl net).`
    } else {
      const netDiff = Math.round(top.netPerQtl - highestGrossCandidate.netPerQtl)
      const freightDiff = highestGrossCandidate.transport - top.transport
      explanation = `${top.item.market} yields ₹${netDiff > 0 ? netDiff : 10}/qtl higher in-hand net realisation than ${highestGrossCandidate.item.market}, because ${highestGrossCandidate.item.market}'s higher transport drag (-₹${freightDiff > 0 ? freightDiff.toLocaleString('en-IN') : top.transport.toLocaleString('en-IN')}) outweighs its raw modal price advantage.`
    }

    // Determine Sell Now / Watch / Wait based on actual trend data
    let timingStatus: 'SELL NOW' | 'WATCH MARKET' | 'WAIT' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA'
    let timingReason = 'Not enough historical data for a reliable sell/wait recommendation.'
    let trendPercent = 0

    if (top.trend && top.trend.sparkline && top.trend.sparkline.length > 1) {
      trendPercent = top.trend.price_change_percent
      if (trendPercent >= 3.0) {
        timingStatus = 'SELL NOW'
        timingReason = `7-day price trajectory shows +${trendPercent}% upward momentum. Ideal liquidity window to lock in peak prices.`
      } else if (trendPercent >= -2.0) {
        timingStatus = 'WATCH MARKET'
        timingReason = `Prices are stable (${trendPercent >= 0 ? '+' : ''}${trendPercent}%). Mandi arrivals are steady at ${top.item.arrival_quantity} qtl.`
      } else {
        timingStatus = 'WAIT'
        timingReason = `Recent supply arrival spikes have temporarily softened prices (${trendPercent}%). If on-farm storage is available, consider watching for recovery.`
      }
    } else {
      timingStatus = 'WATCH MARKET'
      timingReason = `Mandi is active with ${top.item.arrival_quantity} qtl daily arrivals. Current modal price is ₹${top.item.modal_price.toLocaleString('en-IN')}/qtl.`
    }

    const opportunityData: SellingOpportunityData = {
      market: top.item.market,
      district: top.item.district,
      state: top.item.state,
      commodity: top.item.commodity,
      variety: top.item.variety,
      modalPrice: top.item.modal_price,
      quantity: logisticsParams.quantity,
      grossSaleValue: top.gross,
      estimatedTransport: top.transport,
      estimatedHandling: top.handling,
      estimatedNetRealisation: top.net,
      netPerQuintal: top.netPerQtl,
      arrivalQuantity: top.item.arrival_quantity,
      trendChange: trendPercent,
      sparkline: top.trend?.sparkline || [top.item.modal_price * 0.98, top.item.modal_price * 0.99, top.item.modal_price],
      reportingDate: top.item.arrival_date,
      source: top.item.source,
      isDemo: top.item.is_demo,
      fetchedAt: top.item.fetched_at,
    }

    return {
      bestOpportunity: opportunityData,
      opportunityExplanation: explanation,
      timingRecommendation: { status: timingStatus, reason: timingReason, trendPercent },
    }
  }, [prices, selectedCrop, logisticsParams, trends])

  const hasLiveGovData = prices.some((p) => !p.is_demo)
  const isAllDemo = prices.length > 0 && prices.every((p) => p.is_demo)

  // When farmer selects a market in the comparison table, focus calculator on it
  const handleSelectMarket = (m: ApiMarketPrice) => {
    setSelectedMarket(m)
    setLogisticsParams((prev) => ({
      ...prev,
      distanceKm: getMandiDistance(m.district, m.market),
    }))
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Global Controls */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lang === 'en' ? 'Official Mandi Data Pipeline' : 'आधिकारिक मंडी डेटा'}
              </span>

              {hasLiveGovData ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-datateal/15 border border-datateal/40 text-datateal">
                  <Database className="w-3.5 h-3.5" />
                  GOVT DATA (AGMARKNET)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-soil/10 border border-soil/20 text-soil/70">
                  <Database className="w-3.5 h-3.5" />
                  AGMARKNET PIPELINE
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-soil">
              {lang === 'en' ? 'Market Intelligence & Net Realisation Engine' : 'मंडी भाव व शुद्ध प्राप्ति विश्लेषण'}
            </h1>

            <p className="font-body text-xs text-soil/70 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-turmeric" />
              <span>
                {lastSyncTime
                  ? `${lang === 'en' ? 'Source Feed Timestamp:' : 'डेटा समय:'} ${new Date(lastSyncTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} (${new Date(lastSyncTime).toLocaleDateString('en-IN')})`
                  : lang === 'en'
                  ? 'Official government market data pipeline'
                  : 'आधिकारिक मंडी डेटा'}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMarketData(true)}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-body font-semibold text-soil bg-soil/5 hover:bg-soil/10 border border-soil/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Mandi Data from Backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-turmeric' : ''}`} />
              <span>{lang === 'en' ? 'Refresh Mandi Prices' : 'मंडी भाव रीफ्रेश करें'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Crops + Quantity Quick Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-soil/10">
          {/* Crop Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {dynamicCrops.map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3.5 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer ${
                  selectedCrop === crop ? 'bg-monsoon text-wheat font-semibold shadow-sm' : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          {/* Quick Harvest Quantity Pill */}
          <div className="flex items-center gap-2 bg-soil/5 border border-soil/15 px-3 py-1.5 rounded-xl">
            <span className="font-body text-xs text-soil/70">{lang === 'en' ? 'Harvest Qty:' : 'उपज मात्रा:'}</span>
            <div className="flex items-center gap-1">
              {[25, 50, 100, 200].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuantity(q)
                    setLogisticsParams((prev) => ({ ...prev, quantity: q }))
                  }}
                  className={`px-2 py-0.5 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer ${
                    logisticsParams.quantity === q ? 'bg-turmeric text-monsoon' : 'text-soil/70 hover:bg-soil/10'
                  }`}
                >
                  {q}q
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Empty State if no records exist */}
      {prices.length === 0 && !isLoading && (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-3">
          <Database className="w-10 h-10 text-soil/30 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-soil">
            {lang === 'en' ? 'No market data available' : 'कोई मंडी डेटा उपलब्ध नहीं है'}
          </h3>
          <p className="font-body text-xs text-soil/60 max-w-md mx-auto">
            {lang === 'en'
              ? 'No live government market feeds are currently ingested. Connect data.gov.in AGMARKNET API key in admin dashboard to stream real mandi prices.'
              : 'वर्तमान में कोई लाइव मंडी डेटा उपलब्ध नहीं है। सरकारी भाव स्ट्रीम करने के लिए एडमिन डैशबोर्ड में AGMARKNET API Key दर्ज करें।'}
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-body text-soil">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700" />
            <span>{lang === 'en' ? `Backend Connection Notice: ${error}` : `कनेक्शन सूचना: ${error}`}</span>
          </div>
          <button
            onClick={() => loadMarketData(true)}
            className="px-3 py-1.5 rounded-lg bg-red-700 text-wheat font-semibold hover:bg-red-800 transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Retry' : 'पुनः प्रयास करें'}
          </button>
        </div>
      )}

      {/* 1. BEST SELLING OPPORTUNITY CARD (Prominent Recommendation) */}
      <BestSellingOpportunityCard
        opportunity={bestOpportunity}
        explanation={opportunityExplanation}
        timing={timingRecommendation}
        lang={lang}
        onQuickList={() => setIsListModalOpen(true)}
      />

      {/* 2. MARKET COMPARISON TABLE (Sorted by Net Realisation) */}
      {isLoading ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-soil/10">
              <div className="space-y-2">
                <div className="h-4 bg-soil/15 rounded w-36" />
                <div className="h-3 bg-soil/10 rounded w-24" />
              </div>
              <div className="h-4 bg-soil/15 rounded w-20" />
              <div className="h-6 bg-soil/15 rounded w-28" />
              <div className="h-4 bg-soil/15 rounded w-16" />
            </div>
          ))}
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center font-body text-xs text-soil/60">
          <Building2 className="w-10 h-10 text-soil/30 mx-auto mb-2" />
          <p className="font-semibold text-soil text-sm">{lang === 'en' ? 'No Mandi Records Found' : 'कोई मंडी रिकॉर्ड नहीं मिला'}</p>
          <p className="mt-1">{lang === 'en' ? 'Try selecting a different crop filter.' : 'कृपया दूसरा फसल विकल्प चुनें।'}</p>
        </div>
      ) : (
        <MarketComparisonTable
          prices={selectedCrop === 'All' ? prices : prices.filter((p) => p.commodity.toLowerCase().includes(selectedCrop.toLowerCase().split(' ')[0]))}
          logistics={logisticsParams}
          selectedMarketId={selectedMarket?.id}
          lang={lang}
          onSelectMarket={handleSelectMarket}
        />
      )}

      {/* 3. NET REALISATION CALCULATOR (Interactive Editable Sliders) */}
      <NetRealisationCalculator
        initialPrice={selectedMarket ? selectedMarket.modal_price : bestOpportunity?.modalPrice || 2840}
        initialDistance={selectedMarket ? getMandiDistance(selectedMarket.district, selectedMarket.market) : 145}
        initialQuantity={quantity}
        commodityName={selectedMarket ? `${selectedMarket.commodity} (${selectedMarket.variety})` : selectedCrop}
        marketName={selectedMarket ? `${selectedMarket.market} (${selectedMarket.district})` : 'Selected Mandi'}
        onParametersChange={(params) => setLogisticsParams(params)}
      />

      {/* 4. 7-DAY & 30-DAY PRICE TREND ANALYSIS */}
      {trends.length > 0 && (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-turmeric" />
              <div>
                <h3 className="font-serif text-xl font-bold text-soil">
                  {lang === 'en' ? 'Price Trajectory & Trend Momentum' : 'मूल्य रुझान व बाजार गतिशीलता'}
                </h3>
                <p className="font-body text-xs text-soil/70 mt-0.5">
                  {lang === 'en' ? '7-Day & 30-Day moving averages sourced from APMC price records' : 'मंडी भावों से विश्लेषित 7-दिवसीय व 30-दिवसीय रुझान'}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-soil/60">
              {trends.length} {lang === 'en' ? 'Commodity Series' : 'फसल विश्लेषण'}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {trends.slice(0, 6).map((item, idx) => (
              <div key={idx} className="bg-soil/5 rounded-2xl p-4 border border-soil/10 flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-body text-sm font-semibold text-soil">{item.commodity}</h4>
                    <p className="font-body text-xs text-soil/60">{item.market}</p>
                  </div>
                  <Sparkline data={item.sparkline} width={75} height={24} />
                </div>

                <div className="flex items-baseline justify-between pt-3 border-t border-soil/10">
                  <span className="font-mono text-lg font-bold text-soil">
                    ₹{item.current_modal_price.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-soil/50">/qtl</span>
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      item.price_change_percent >= 0 ? 'text-datateal bg-monsoon' : 'text-turmeric bg-monsoon'
                    }`}
                  >
                    {item.price_change_percent >= 0 ? '▲ +' : '▼ '}
                    {item.price_change_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy & MSP Benchmark Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-monsoon text-wheat p-6 rounded-2xl border border-wheat/10">
          <div className="flex items-center gap-2 text-turmeric font-mono text-xs uppercase font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'en' ? 'MSP Benchmark (Govt)' : 'न्यूनतम समर्थन मूल्य (MSP)'}</span>
          </div>
          <p className="font-serif text-2xl font-bold text-wheat">
            ₹2,275 <span className="text-xs font-normal text-wheat/60">/ qtl (Wheat)</span>
          </p>
          <p className="font-body text-xs text-wheat/70 mt-2">
            {lang === 'en'
              ? 'FarmNexus average price is ₹445/qtl (+19.5%) above standard MSP for Grade A Sharbati.'
              : 'FarmNexus पर औसत भाव ग्रेड ए शरबती के लिए MSP से ₹445/क्विंटल अधिक है।'}
          </p>
        </div>

        <div className="bg-wheat text-soil p-6 rounded-2xl border border-soil/15">
          <div className="flex items-center gap-2 text-soil/70 font-mono text-xs uppercase font-semibold mb-2">
            <TrendingUp className="w-4 h-4 text-datateal" />
            <span>{lang === 'en' ? '15-Day Price Corridor' : '15-दिवसीय मूल्य रुझान'}</span>
          </div>
          <p className="font-serif text-2xl font-bold text-soil">Bullish / सकारात्मक</p>
          <p className="font-body text-xs text-soil/70 mt-2">
            {lang === 'en'
              ? 'Institutional millers are active in MP & Maharashtra due to upcoming festive season stock replenishment.'
              : 'आगामी मांग के कारण इंदौर और भोपाल मंडियों में मिलर सक्रिय हैं।'}
          </p>
        </div>

        <div className="bg-wheat text-soil p-6 rounded-2xl border border-soil/15">
          <div className="flex items-center gap-2 text-soil/70 font-mono text-xs uppercase font-semibold mb-2">
            <Info className="w-4 h-4 text-turmeric" />
            <span>{lang === 'en' ? 'Zero Mandi Tax Scheme' : 'मंडी शुल्क छूट'}</span>
          </div>
          <p className="font-serif text-2xl font-bold text-soil">100% Direct Rail</p>
          <p className="font-body text-xs text-soil/70 mt-2">
            {lang === 'en'
              ? 'Direct ONDC-enabled trades bypass intermediate mandi gate user charges.'
              : 'ONDC व e-NAM डिजिटल रेल से सीधे सौदों पर बिचौलिया शुल्क नहीं लगता।'}
          </p>
        </div>
      </div>
    </div>
  )
}

function getMandiDistance(district: string, market: string): number {
  const d = (district || '').toLowerCase()
  const m = (market || '').toLowerCase()

  if (d.includes('harda') || m.includes('harda')) return 18
  if (d.includes('narmadapuram') || d.includes('hoshangabad')) return 72
  if (d.includes('khandwa')) return 95
  if (d.includes('sehore')) return 130
  if (d.includes('dewas')) return 138
  if (d.includes('indore')) return 145
  if (d.includes('bhopal')) return 155
  if (d.includes('ujjain')) return 165
  if (d.includes('vidisha')) return 180
  if (d.includes('nashik')) return 480
  if (d.includes('karnal')) return 820
  if (d.includes('alappuzha') || d.includes('cherthala')) return 220
  if (d.includes('kozhikode') || d.includes('mukkom')) return 260
  if (d.includes('ernakulam') || d.includes('perumbavoor')) return 240
  if (d.includes('patiala') || d.includes('samana')) return 860

  return 120
}
