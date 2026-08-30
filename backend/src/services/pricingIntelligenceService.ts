import { inMemoryDb } from '../config/db.js'

export interface MarketNetReturnCalculation {
  mandi: string
  district: string
  state: string
  distanceKm: number
  modalPrice: number
  minPrice: number
  maxPrice: number
  trend: 'up' | 'down' | 'steady'
  priceChange: number
  transportCost: number
  grossValue: number
  netReturn: number
  netPricePerQtl: number
  rank: number
  recommendation: boolean
  gainOverLocal: number
  source: string
  isLive: boolean
  rationale: string
}

export class PricingIntelligenceService {
  static async calculatePriceIntelligence(lotId: string): Promise<{
    lot: { id: string; crop: string; variety: string; quantityQtl: number; location: string }
    localMandi: string
    bestMandi: string
    maxNetGain: number
    markets: MarketNetReturnCalculation[]
  }> {
    const lot = inMemoryDb.lots.find(l => l.id === lotId)
    if (!lot) {
      throw new Error(`Lot not found with ID: ${lotId}`)
    }

    // Match market prices for this crop
    const lotCropClean = lot.crop.toLowerCase().trim()
    const matchingPrices = inMemoryDb.marketPrices.filter(p => {
      const comm = p.commodity.toLowerCase().trim()
      return comm === lotCropClean || comm.includes(lotCropClean) || (comm.length > 4 && lotCropClean.startsWith(comm))
    })

    if (matchingPrices.length === 0) {
      return {
        lot: {
          id: lot.id,
          crop: lot.crop,
          variety: lot.variety,
          quantityQtl: lot.quantity_qtl,
          location: lot.location,
        },
        localMandi: 'No Mandi Data Available',
        bestMandi: 'No Mandi Data Available',
        maxNetGain: 0,
        markets: [],
      }
    }

    const pricesToUse = matchingPrices

    // Standard transport calculation per distance
    const calculations: MarketNetReturnCalculation[] = pricesToUse.map(p => {
      let distanceKm = 30
      if (p.market.includes('Harda')) distanceKm = 18
      else if (p.market.includes('Indore')) distanceKm = 145
      else if (p.market.includes('Ujjain')) distanceKm = 165
      else if (p.market.includes('Bhopal')) distanceKm = 155
      else if (p.market.includes('Hoshangabad')) distanceKm = 72
      else if (p.market.includes('Khandwa')) distanceKm = 95
      else if (p.market.includes('Dewas')) distanceKm = 138

      const grossValue = Math.round(lot.quantity_qtl * p.modal_price)
      const quantityInMT = lot.quantity_qtl / 10

      // Multi-axle freight model: ₹3.0/km/MT + standard handling base
      const freightRatePerKmMt = 3.0
      const transportCost = Math.round(distanceKm * freightRatePerKmMt * quantityInMT + 400)
      const netReturn = Math.max(0, grossValue - transportCost)
      const netPricePerQtl = Math.round(netReturn / lot.quantity_qtl)

      return {
        mandi: p.market,
        district: p.district,
        state: p.state,
        distanceKm,
        modalPrice: p.modal_price,
        minPrice: p.min_price,
        maxPrice: p.max_price,
        trend: p.trend || 'steady',
        priceChange: p.price_change || 0,
        transportCost,
        grossValue,
        netReturn,
        netPricePerQtl,
        rank: 1,
        recommendation: false,
        gainOverLocal: 0,
        source: p.source || 'APMC Mandi Feed',
        isLive: !p.is_demo,
        rationale: '',
      }
    })

    // Sort by netReturn descending
    calculations.sort((a, b) => b.netReturn - a.netReturn)

    const nearestMandiCalc = [...calculations].sort((a, b) => a.distanceKm - b.distanceKm)[0]
    const localNetReturn = nearestMandiCalc ? nearestMandiCalc.netReturn : calculations[0].netReturn

    calculations.forEach((c, idx) => {
      c.rank = idx + 1
      c.recommendation = idx === 0
      c.gainOverLocal = Math.max(0, c.netReturn - localNetReturn)

      if (idx === 0) {
        if (c.mandi === nearestMandiCalc?.mandi) {
          c.rationale = `${c.mandi} offers both closest transit distance (${c.distanceKm} km) and solid modal price (₹${c.modalPrice.toLocaleString('en-IN')}/qtl), maximizing net cash return with lowest travel risk.`
        } else {
          c.rationale = `Higher modal price of ₹${c.modalPrice.toLocaleString('en-IN')}/qtl at ${c.mandi} outweighs extra transport cost (${c.distanceKm} km), yielding +₹${c.gainOverLocal.toLocaleString('en-IN')} additional net earnings over local mandi.`
        }
      } else {
        c.rationale = `Net return ₹${c.netReturn.toLocaleString('en-IN')} (₹${c.netPricePerQtl}/qtl in-hand).`
      }
    })

    return {
      lot: {
        id: lot.id,
        crop: lot.crop,
        variety: lot.variety,
        quantityQtl: lot.quantity_qtl,
        location: lot.location,
      },
      localMandi: nearestMandiCalc ? nearestMandiCalc.mandi : 'Harda APMC Mandi',
      bestMandi: calculations[0].mandi,
      maxNetGain: calculations[0].gainOverLocal,
      markets: calculations,
    }
  }
}
