import { useState } from 'react'
import { Scale, MapPin, Sparkles, Truck, PackageCheck, ArrowUpDown, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Sparkline } from '../../ui/Sparkline'
import { type ApiMarketPrice } from '../../../services/marketApiService'
import { type LogisticsParameters } from './NetRealisationCalculator'

interface MarketComparisonRow {
  raw: ApiMarketPrice
  market: string
  district: string
  state: string
  commodity: string
  variety: string
  modalPrice: number
  minPrice: number
  maxPrice: number
  arrivalQuantity: number
  distanceKm: number
  estimatedTransport: number
  estimatedHandling: number
  estimatedNetRealisation: number
  netPerQuintal: number
  isBestNet: boolean
  reportingDate: string
}

interface MarketComparisonTableProps {
  prices: ApiMarketPrice[]
  logistics: LogisticsParameters
  selectedMarketId?: string
  lang: 'en' | 'hi'
  onSelectMarket: (market: ApiMarketPrice) => void
}

export function MarketComparisonTable({
  prices,
  logistics,
  selectedMarketId,
  lang,
  onSelectMarket,
}: MarketComparisonTableProps) {
  const [sortBy, setSortBy] = useState<'net_realisation' | 'modal_price' | 'distance' | 'arrivals'>('net_realisation')

  if (!prices || prices.length === 0) {
    return (
      <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center text-soil/60 font-body text-xs space-y-2">
        <Scale className="w-8 h-8 mx-auto text-soil/30" />
        <p className="font-semibold text-soil text-sm">{lang === 'en' ? 'No market data available' : 'कोई मंडी डेटा उपलब्ध नहीं है'}</p>
        <p>{lang === 'en' ? 'Live government mandi price feeds will appear here once connected.' : 'लाइव सरकारी मंडी भाव यहां प्रदर्शित होंगे।'}</p>
      </div>
    )
  }

  // Calculate net realisation metrics for each market record
  const calculatedRows: MarketComparisonRow[] = prices.map((item) => {
    // Determine distance: approximate based on district or default
    const distanceKm = getEstimatedDistance(item.district, item.market)
    const gross = item.modal_price * logistics.quantity
    const transport = Math.round(distanceKm * logistics.transportPerKm * (logistics.quantity / 10))
    const handling = (logistics.loadingPerQtl * logistics.quantity) + logistics.storageCost + logistics.otherCharges
    const net = Math.max(0, gross - transport - handling)
    const netPerQtl = logistics.quantity > 0 ? net / logistics.quantity : 0

    return {
      raw: item,
      market: item.market,
      district: item.district,
      state: item.state,
      commodity: item.commodity,
      variety: item.variety,
      modalPrice: item.modal_price,
      minPrice: item.min_price,
      maxPrice: item.max_price,
      arrivalQuantity: item.arrival_quantity,
      distanceKm,
      estimatedTransport: transport,
      estimatedHandling: handling,
      estimatedNetRealisation: net,
      netPerQuintal: netPerQtl,
      isBestNet: false,
      reportingDate: item.arrival_date,
    }
  })

  // Find the top net realisation row
  let highestNet = -Infinity
  let bestIdx = -1
  calculatedRows.forEach((r, idx) => {
    if (r.estimatedNetRealisation > highestNet) {
      highestNet = r.estimatedNetRealisation
      bestIdx = idx
    }
  })
  if (bestIdx >= 0) {
    calculatedRows[bestIdx].isBestNet = true
  }

  // Sort rows based on user selection
  const sortedRows = [...calculatedRows].sort((a, b) => {
    if (sortBy === 'net_realisation') return b.estimatedNetRealisation - a.estimatedNetRealisation
    if (sortBy === 'modal_price') return b.modalPrice - a.modalPrice
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm
    if (sortBy === 'arrivals') return b.arrivalQuantity - a.arrivalQuantity
    return 0
  })

  return (
    <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
      {/* Table Header / Action Bar */}
      <div className="p-6 bg-soil/5 border-b border-soil/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-turmeric" />
            <h3 className="font-serif text-xl font-bold text-soil">
              {lang === 'en' ? 'Market Comparison — Sorted by In-Hand Net Realisation' : 'मंडी तुलना — शुद्ध कमाई के आधार पर क्रमबद्ध'}
            </h3>
          </div>
          <p className="font-body text-xs text-soil/70 mt-1">
            {lang === 'en'
              ? `Comparing ${prices.length} mandis factoring ₹${logistics.transportPerKm}/km/MT freight & handling for ${logistics.quantity} qtl harvest`
              : `${logistics.quantity} क्विंटल उपज के लिए भाड़ा व लोडिंग खर्च घटाकर सभी ${prices.length} मंडियों की तुलना`}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 font-body text-xs text-soil/80">
          <span className="text-soil/60">{lang === 'en' ? 'Sort by:' : 'क्रम:'}</span>
          <button
            onClick={() => setSortBy('net_realisation')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
              sortBy === 'net_realisation'
                ? 'bg-turmeric text-monsoon border-turmeric shadow-sm'
                : 'bg-soil/5 border-soil/15 hover:bg-soil/10'
            }`}
          >
            {lang === 'en' ? 'Highest Net Realisation' : 'सर्वोत्तम शुद्ध प्राप्ति'}
          </button>
          <button
            onClick={() => setSortBy('modal_price')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
              sortBy === 'modal_price'
                ? 'bg-turmeric text-monsoon border-turmeric shadow-sm'
                : 'bg-soil/5 border-soil/15 hover:bg-soil/10'
            }`}
          >
            {lang === 'en' ? 'Modal Price' : 'मॉडल भाव'}
          </button>
          <button
            onClick={() => setSortBy('distance')}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
              sortBy === 'distance'
                ? 'bg-turmeric text-monsoon border-turmeric shadow-sm'
                : 'bg-soil/5 border-soil/15 hover:bg-soil/10'
            }`}
          >
            {lang === 'en' ? 'Nearest Distance' : 'निकटतम'}
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-soil/10 font-body text-xs text-soil/60 bg-soil/5">
              <th className="py-4 px-6">{lang === 'en' ? 'Mandi / Location' : 'मंडी केंद्र'}</th>
              <th className="py-4 px-6">{lang === 'en' ? 'Listed Modal Price' : 'मॉडल भाव'}</th>
              <th className="py-4 px-6">{lang === 'en' ? 'Min - Max Spread' : 'दायरा'}</th>
              <th className="py-4 px-6">{lang === 'en' ? 'Distance & Freight' : 'दूरी व भाड़ा'}</th>
              <th className="py-4 px-6">{lang === 'en' ? 'Daily Arrivals' : 'दैनिक आवक'}</th>
              <th className="py-4 px-6 text-right">{lang === 'en' ? 'Estimated Net Realisation' : 'अनुमानित शुद्ध प्राप्ति'}</th>
              <th className="py-4 px-4 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soil/10 font-body text-xs">
            {sortedRows.map((row) => {
              const isSelected = selectedMarketId === row.raw.id

              return (
                <tr
                  key={row.raw.id}
                  onClick={() => onSelectMarket(row.raw)}
                  className={`transition-colors cursor-pointer ${
                    row.isBestNet
                      ? 'bg-turmeric/10 hover:bg-turmeric/15'
                      : isSelected
                      ? 'bg-soil/10'
                      : 'hover:bg-soil/5'
                  }`}
                >
                  {/* Mandi Name & District */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-turmeric flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-soil text-sm">{row.market}</span>
                          {row.isBestNet && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-monsoon bg-turmeric px-2 py-0.5 rounded-md shadow-xs">
                              <Sparkles className="w-3 h-3 fill-monsoon" />
                              BEST NET REALISATION
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-soil/60">
                          {row.district}, {row.state} &bull; <span className="font-mono text-[10px] text-soil/50">{row.reportingDate}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Modal Price */}
                  <td className="py-4 px-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-base font-bold text-soil">
                        ₹{row.modalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-soil/50">/qtl</span>
                    </div>
                  </td>

                  {/* Min - Max Spread */}
                  <td className="py-4 px-6 font-mono text-soil/70 text-xs">
                    ₹{row.minPrice} - ₹{row.maxPrice}
                  </td>

                  {/* Distance & Freight */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-soil font-medium font-mono">
                      <Truck className="w-3.5 h-3.5 text-turmeric" />
                      <span>{row.distanceKm} km</span>
                    </div>
                    <span className="font-mono text-[11px] text-turmeric block mt-0.5">
                      -₹{row.estimatedTransport.toLocaleString('en-IN')} freight
                    </span>
                  </td>

                  {/* Daily Arrivals */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 font-mono text-soil">
                      <PackageCheck className="w-3.5 h-3.5 text-turmeric" />
                      <span>{row.arrivalQuantity.toLocaleString('en-IN')} qtl</span>
                    </div>
                  </td>

                  {/* Estimated Net Realisation */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-base font-bold text-datateal bg-monsoon px-2.5 py-0.5 rounded-lg shadow-xs">
                        ₹{row.estimatedNetRealisation.toLocaleString('en-IN')}
                      </span>
                      <span className="font-mono text-[11px] text-soil font-semibold mt-1">
                        ₹{Math.round(row.netPerQuintal).toLocaleString('en-IN')}<span className="text-soil/50 font-normal">/qtl in-hand</span>
                      </span>
                    </div>
                  </td>

                  {/* Action Arrow */}
                  <td className="py-4 px-4 text-center text-soil/40">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Distance helper mapping districts or defaulting
function getEstimatedDistance(district: string, market: string): number {
  const d = district.toLowerCase()
  const m = market.toLowerCase()

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

