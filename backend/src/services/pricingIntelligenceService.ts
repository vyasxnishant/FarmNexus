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
    const matchingPrices = inMemoryDb.marketPrices.filter(
      p => p.commodity.toLowerCase().includes(lot.crop.toLowerCase()) ||
           lot.crop.toLowerCase().includes(p.commodity.toLowerCase())
    )

    const pricesToUse = matchingPrices.length > 0 ? matchingPrices : inMemoryDb.marketPrices.slice(0, 5)

    // Standard transport calculation per distance
    // Rate: ₹24/km with standard 4.0 MT tractor/truck baseline
    const calculations: MarketNetReturnCalculation[] = pricesToUse.map(p => {
      let distanceKm = 30
      if (p.market.includes('Harda')) distanceKm = 18
      else if (p.market.includes('Indore')) distanceKm = 145
      else if (p.market.includes('Ujjain')) distanceKm = 165
      else if (p.market.includes('Bhopal')) distanceKm = 155
      else if (p.market.includes('Hoshangabad')) distanceKm = 72
      else if (p.market.includes('Khandwa')) distanceKm = 95
      else if (p.market.includes('Dewas')) distanceKm = 138

      const grossValue = lot.quantity_qtl * p.modal_price

      // Calculate transport cost based on quantity and distance
      // Small loads (<40 qtl): ₹18/km, Medium (<75 qtl): ₹34/km, Large: ₹52/km
      let ratePerKm = 24
      if (lot.quantity_qtl <= 15) ratePerKm = 18
      else if (lot.quantity_qtl <= 40) ratePerKm = 24
      else if (lot.quantity_qtl <= 75) ratePerKm = 34
      else ratePerKm = 52

      const transportCost = Math.round(distanceKm * ratePerKm + 500)
      const netReturn = grossValue - transportCost
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
      }
    })

    // Sort by netReturn descending
    calculations.sort((a, b) => b.netReturn - a.netReturn)

    const localMandiCalc = calculations.find(c => c.distanceKm <= 25) || calculations[calculations.length - 1]
    const localNetReturn = localMandiCalc ? localMandiCalc.netReturn : calculations[0].netReturn

    calculations.forEach((c, idx) => {
      c.rank = idx + 1
      c.recommendation = idx === 0
      c.gainOverLocal = Math.max(0, c.netReturn - localNetReturn)
    })

    return {
      lot: {
        id: lot.id,
        crop: lot.crop,
        variety: lot.variety,
        quantityQtl: lot.quantity_qtl,
        location: lot.location,
      },
      localMandi: localMandiCalc ? localMandiCalc.mandi : 'Harda APMC Mandi',
      bestMandi: calculations[0].mandi,
      maxNetGain: calculations[0].gainOverLocal,
      markets: calculations,
    }
  }
}
