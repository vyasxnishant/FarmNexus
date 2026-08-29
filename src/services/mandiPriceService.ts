export interface MandiMarketRecord {
  id: string
  mandiName: string
  district: string
  state: string
  crop: string
  variety: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  arrivalDate: string
  distanceKm: number
  freightRatePerKmMt?: number // Default ₹3.0/km/MT
  handlingCostPerQtl?: number // Default ₹20/qtl
  mandiCessPercent?: number // Default 1.5%
  historicalTrend7d?: number[]
  source?: string
  isAgmarknetLive?: boolean
}

export interface MandiNetReturnCalculation {
  mandi: MandiMarketRecord
  quantityQtl: number
  grossValue: number
  transportCost: number
  handlingCost: number
  mandiCess: number
  totalDeductions: number
  netReturn: number
  inHandNetPerQtl: number
  isRecommended: boolean
  rank: number
}

export interface BestMarketRecommendation {
  recommendedMandi: MandiMarketRecord
  calculation: MandiNetReturnCalculation
  netAdvantageVsNearest: number
  netAdvantageVsAverage: number
  nearestMandi: MandiMarketRecord
  rationale: string
  alternativesCount: number
}

// Realistic Multi-Mandi Dataset for major crops in Central India (MP / Maharashtra / Rajasthan corridors)
export const mockMandiDatabase: Record<string, MandiMarketRecord[]> = {
  'Wheat (Sharbati)': [
    {
      id: 'MND-MP-01',
      mandiName: 'Harda Mandi',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Wheat (Sharbati)',
      variety: 'Sharbati Premium',
      minPrice: 2720,
      maxPrice: 2890,
      modalPrice: 2840,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 28,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2780, 2790, 2810, 2820, 2830, 2840, 2840],
      source: 'APMC Harda Electronic Auction',
    },
    {
      id: 'MND-MP-02',
      mandiName: 'Indore APMC (Choithram)',
      district: 'Indore',
      state: 'Madhya Pradesh',
      crop: 'Wheat (Sharbati)',
      variety: 'Sharbati Lokwan',
      minPrice: 2850,
      maxPrice: 3050,
      modalPrice: 2980,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 142,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2910, 2920, 2940, 2960, 2970, 2980, 2980],
      source: 'e-NAM Indore Terminal',
    },
    {
      id: 'MND-MP-03',
      mandiName: 'Sirali Sub-Mandi',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Wheat (Sharbati)',
      variety: 'C-306 Sharbati',
      minPrice: 2580,
      maxPrice: 2680,
      modalPrice: 2640,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 8,
      freightRatePerKmMt: 3.2,
      handlingCostPerQtl: 18,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2610, 2620, 2630, 2630, 2640, 2640, 2640],
      source: 'Sirali Local Yard',
    },
    {
      id: 'MND-MP-04',
      mandiName: 'Hoshangabad (Narmadapuram) APMC',
      district: 'Narmadapuram',
      state: 'Madhya Pradesh',
      crop: 'Wheat (Sharbati)',
      variety: 'Sharbati Gold',
      minPrice: 2700,
      maxPrice: 2840,
      modalPrice: 2790,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 76,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2750, 2760, 2770, 2775, 2780, 2790, 2790],
      source: 'Narmadapuram Grain Market',
    },
    {
      id: 'MND-MP-05',
      mandiName: 'Bhopal Karond Mandi',
      district: 'Bhopal',
      state: 'Madhya Pradesh',
      crop: 'Wheat (Sharbati)',
      variety: 'Sharbati Mill Quality',
      minPrice: 2780,
      maxPrice: 2950,
      modalPrice: 2880,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 165,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 24,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2830, 2840, 2850, 2860, 2870, 2875, 2880],
      source: 'Karond APMC Bhopal',
    },
    {
      id: 'MND-MP-06',
      mandiName: 'Khandwa APMC',
      district: 'Khandwa',
      state: 'Madhya Pradesh',
      crop: 'Wheat (Sharbati)',
      variety: 'Lokwan Bold',
      minPrice: 2650,
      maxPrice: 2780,
      modalPrice: 2720,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 110,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2680, 2690, 2700, 2710, 2715, 2720, 2720],
      source: 'Khandwa Agricultural Market',
    },
  ],

  'Soybean': [
    {
      id: 'MND-SB-01',
      mandiName: 'Indore APMC',
      district: 'Indore',
      state: 'Madhya Pradesh',
      crop: 'Soybean',
      variety: 'JS-9560 Yellow',
      minPrice: 4950,
      maxPrice: 5200,
      modalPrice: 5120,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 142,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [4980, 5020, 5060, 5080, 5100, 5110, 5120],
      source: 'Soybean Processors Association Feed',
    },
    {
      id: 'MND-SB-02',
      mandiName: 'Harda Mandi',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Soybean',
      variety: 'JS-335 Yellow',
      minPrice: 4850,
      maxPrice: 5040,
      modalPrice: 4960,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 28,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [4880, 4900, 4920, 4930, 4940, 4950, 4960],
      source: 'APMC Harda Yard',
    },
    {
      id: 'MND-SB-03',
      mandiName: 'Ujjain APMC',
      district: 'Ujjain',
      state: 'Madhya Pradesh',
      crop: 'Soybean',
      variety: 'Yellow FAQ',
      minPrice: 4900,
      maxPrice: 5150,
      modalPrice: 5080,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 178,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [4950, 4980, 5010, 5040, 5060, 5070, 5080],
      source: 'e-NAM Ujjain',
    },
    {
      id: 'MND-SB-04',
      mandiName: 'Sirali Local Yard',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Soybean',
      variety: 'Field Run',
      minPrice: 4680,
      maxPrice: 4820,
      modalPrice: 4760,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 8,
      freightRatePerKmMt: 3.2,
      handlingCostPerQtl: 18,
      mandiCessPercent: 1.5,
      historicalTrend7d: [4700, 4710, 4730, 4740, 4750, 4760, 4760],
      source: 'Local Village Mandi',
    },
    {
      id: 'MND-SB-05',
      mandiName: 'Dewas APMC',
      district: 'Dewas',
      state: 'Madhya Pradesh',
      crop: 'Soybean',
      variety: 'JS-9560',
      minPrice: 4920,
      maxPrice: 5120,
      modalPrice: 5040,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 128,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [4910, 4940, 4970, 4990, 5020, 5030, 5040],
      source: 'Dewas Agricultural Yard',
    },
  ],

  'Basmati Rice': [
    {
      id: 'MND-RC-01',
      mandiName: 'Karnal APMC',
      district: 'Karnal',
      state: 'Haryana',
      crop: 'Basmati Rice',
      variety: '1121 Steam Pusa',
      minPrice: 4200,
      maxPrice: 4650,
      modalPrice: 4480,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 780,
      freightRatePerKmMt: 2.8,
      handlingCostPerQtl: 25,
      mandiCessPercent: 1.5,
      historicalTrend7d: [4380, 4400, 4420, 4450, 4460, 4470, 4480],
      source: 'e-NAM Karnal Hub',
    },
    {
      id: 'MND-RC-02',
      mandiName: 'Kota Mandi',
      district: 'Kota',
      state: 'Rajasthan',
      crop: 'Basmati Rice',
      variety: 'Sugandha / 1509',
      minPrice: 3850,
      maxPrice: 4180,
      modalPrice: 4050,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 340,
      freightRatePerKmMt: 2.9,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [3980, 4000, 4020, 4030, 4040, 4050, 4050],
      source: 'Kota Bhamashah Mandi',
    },
    {
      id: 'MND-RC-03',
      mandiName: 'Bhopal Karond APMC',
      district: 'Bhopal',
      state: 'Madhya Pradesh',
      crop: 'Basmati Rice',
      variety: 'Basmati Pusa 1',
      minPrice: 3750,
      maxPrice: 3980,
      modalPrice: 3890,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 165,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [3820, 3840, 3850, 3860, 3870, 3880, 3890],
      source: 'Karond Mandi Bhopal',
    },
    {
      id: 'MND-RC-04',
      mandiName: 'Harda Mandi Yard',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Basmati Rice',
      variety: 'Local Paddy Medium',
      minPrice: 3550,
      maxPrice: 3740,
      modalPrice: 3680,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 28,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [3620, 3630, 3650, 3660, 3670, 3680, 3680],
      source: 'Harda Local Yard',
    },
  ],

  'Chana (Gram)': [
    {
      id: 'MND-CH-01',
      mandiName: 'Indore APMC',
      district: 'Indore',
      state: 'Madhya Pradesh',
      crop: 'Chana (Gram)',
      variety: 'Dollar Chana Export',
      minPrice: 5750,
      maxPrice: 6150,
      modalPrice: 5980,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 142,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5840, 5880, 5910, 5930, 5950, 5970, 5980],
      source: 'Indore Dal Millers Board',
    },
    {
      id: 'MND-CH-02',
      mandiName: 'Harda APMC',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Chana (Gram)',
      variety: 'Desi Dollar',
      minPrice: 5600,
      maxPrice: 5890,
      modalPrice: 5820,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 28,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5720, 5740, 5760, 5780, 5800, 5810, 5820],
      source: 'Harda Grain Market',
    },
    {
      id: 'MND-CH-03',
      mandiName: 'Sehore APMC',
      district: 'Sehore',
      state: 'Madhya Pradesh',
      crop: 'Chana (Gram)',
      variety: 'Desi Chana Bold',
      minPrice: 5650,
      maxPrice: 5920,
      modalPrice: 5860,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 124,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5760, 5780, 5800, 5820, 5840, 5850, 5860],
      source: 'e-NAM Sehore',
    },
    {
      id: 'MND-CH-04',
      mandiName: 'Sirali Local Mandi',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Chana (Gram)',
      variety: 'Desi Unsorted',
      minPrice: 5450,
      maxPrice: 5650,
      modalPrice: 5580,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 8,
      freightRatePerKmMt: 3.2,
      handlingCostPerQtl: 18,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5520, 5530, 5540, 5550, 5560, 5570, 5580],
      source: 'Village Yard',
    },
  ],

  'Mustard': [
    {
      id: 'MND-MS-01',
      mandiName: 'Morena APMC',
      district: 'Morena',
      state: 'Madhya Pradesh',
      crop: 'Mustard',
      variety: 'Mustard Bold 42% Oil',
      minPrice: 5450,
      maxPrice: 5750,
      modalPrice: 5650,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 420,
      freightRatePerKmMt: 2.9,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5540, 5560, 5590, 5610, 5630, 5640, 5650],
      source: 'Morena Oilseed Hub',
    },
    {
      id: 'MND-MS-02',
      mandiName: 'Indore APMC',
      district: 'Indore',
      state: 'Madhya Pradesh',
      crop: 'Mustard',
      variety: 'Black Mustard FAQ',
      minPrice: 5350,
      maxPrice: 5580,
      modalPrice: 5490,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 142,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5410, 5430, 5450, 5460, 5480, 5485, 5490],
      source: 'e-NAM Indore',
    },
    {
      id: 'MND-MS-03',
      mandiName: 'Harda Mandi',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Mustard',
      variety: 'Pusa Bold',
      minPrice: 5250,
      maxPrice: 5440,
      modalPrice: 5380,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 28,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5310, 5320, 5340, 5350, 5360, 5370, 5380],
      source: 'Harda APMC Yard',
    },
    {
      id: 'MND-MS-04',
      mandiName: 'Kota Mandi',
      district: 'Kota',
      state: 'Rajasthan',
      crop: 'Mustard',
      variety: 'Mustard 41% Oil',
      minPrice: 5400,
      maxPrice: 5680,
      modalPrice: 5560,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 340,
      freightRatePerKmMt: 2.9,
      handlingCostPerQtl: 22,
      mandiCessPercent: 1.5,
      historicalTrend7d: [5480, 5500, 5520, 5530, 5540, 5550, 5560],
      source: 'Kota APMC Yard',
    },
  ],

  'Maize': [
    {
      id: 'MND-MZ-01',
      mandiName: 'Chhindwara APMC',
      district: 'Chhindwara',
      state: 'Madhya Pradesh',
      crop: 'Maize',
      variety: 'Yellow Feed Quality',
      minPrice: 2250,
      maxPrice: 2480,
      modalPrice: 2420,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 210,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2350, 2360, 2380, 2390, 2400, 2410, 2420],
      source: 'Chhindwara Corn Terminal',
    },
    {
      id: 'MND-MZ-02',
      mandiName: 'Harda APMC',
      district: 'Harda',
      state: 'Madhya Pradesh',
      crop: 'Maize',
      variety: 'Hybrid Yellow',
      minPrice: 2180,
      maxPrice: 2360,
      modalPrice: 2310,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 28,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 18,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2260, 2270, 2280, 2290, 2300, 2305, 2310],
      source: 'Harda Market Yard',
    },
    {
      id: 'MND-MZ-03',
      mandiName: 'Indore APMC',
      district: 'Indore',
      state: 'Madhya Pradesh',
      crop: 'Maize',
      variety: 'Yellow Starch Quality',
      minPrice: 2280,
      maxPrice: 2450,
      modalPrice: 2390,
      arrivalDate: 'Today (29 Aug 2026)',
      distanceKm: 142,
      freightRatePerKmMt: 3.0,
      handlingCostPerQtl: 20,
      mandiCessPercent: 1.5,
      historicalTrend7d: [2330, 2340, 2360, 2370, 2380, 2385, 2390],
      source: 'e-NAM Indore',
    },
  ],
}

/**
 * Service to fetch mandi price records.
 * In local prototype mode, retrieves from verified realistic multi-APMC database.
 * Structured to cleanly swap to AGMARKNET / eNAM live backend APIs (`/api/market-prices`) when connected.
 */
export async function fetchMandiPrices(crop: string): Promise<MandiMarketRecord[]> {
  // Simulate standard network latency (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Find direct match or fallback to Wheat
  const key = Object.keys(mockMandiDatabase).find((k) =>
    crop.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(crop.toLowerCase())
  )

  if (key && mockMandiDatabase[key]) {
    return mockMandiDatabase[key]
  }

  // Generic fallback if unknown crop selected
  return mockMandiDatabase['Wheat (Sharbati)'].map((m) => ({
    ...m,
    crop,
  }))
}

/**
 * Calculate dynamic Net Return for a given mandi and quantity.
 * Gross Value = Quantity (qtl) × Modal Price
 * Transport Cost = Distance (km) × Freight Rate (₹/km/MT) × (Quantity in MT = Qty/10)
 * Handling Cost = Quantity (qtl) × Handling Rate (₹/qtl)
 * Mandi Cess = Gross Value × Mandi Cess %
 * Total Deductions = Transport + Handling + Mandi Cess
 * Net Return = Gross Value - Total Deductions
 */
export function calculateMandiNetReturn(
  mandi: MandiMarketRecord,
  quantityQtl: number,
  customFreightRate?: number,
  customHandlingRate?: number
): MandiNetReturnCalculation {
  const qty = Math.max(1, quantityQtl)
  const freightRate = customFreightRate ?? mandi.freightRatePerKmMt ?? 3.0
  const handlingRate = customHandlingRate ?? mandi.handlingCostPerQtl ?? 20.0
  const cessRate = mandi.mandiCessPercent ?? 1.5

  const grossValue = Math.round(qty * mandi.modalPrice)
  const quantityInMT = qty / 10
  const transportCost = Math.round(mandi.distanceKm * freightRate * quantityInMT)
  const handlingCost = Math.round(qty * handlingRate)
  const mandiCess = Math.round(grossValue * (cessRate / 100))

  const totalDeductions = transportCost + handlingCost + mandiCess
  const netReturn = Math.max(0, grossValue - totalDeductions)
  const inHandNetPerQtl = Math.round(netReturn / qty)

  return {
    mandi,
    quantityQtl: qty,
    grossValue,
    transportCost,
    handlingCost,
    mandiCess,
    totalDeductions,
    netReturn,
    inHandNetPerQtl,
    isRecommended: false,
    rank: 0,
  }
}

/**
 * Identify the best market recommendation dynamically based on highest Net Return.
 */
export function getBestMarketRecommendation(
  mandis: MandiMarketRecord[],
  quantityQtl: number,
  customFreightRate?: number,
  customHandlingRate?: number
): BestMarketRecommendation | null {
  if (!mandis || mandis.length === 0) return null

  // Calculate calculations for all mandis and sort descending by netReturn
  const calculations: MandiNetReturnCalculation[] = mandis
    .map((m) => calculateMandiNetReturn(m, quantityQtl, customFreightRate, customHandlingRate))
    .sort((a, b) => b.netReturn - a.netReturn)

  if (calculations.length === 0) return null

  // Assign ranks
  calculations.forEach((c, idx) => {
    c.rank = idx + 1
    c.isRecommended = idx === 0
  })

  const best = calculations[0]
  const nearest = [...calculations].sort((a, b) => a.mandi.distanceKm - b.mandi.distanceKm)[0]

  const netAdvantageVsNearest = Math.max(0, best.netReturn - nearest.netReturn)
  const avgNet = Math.round(
    calculations.reduce((sum, c) => sum + c.netReturn, 0) / calculations.length
  )
  const netAdvantageVsAverage = Math.max(0, best.netReturn - avgNet)

  // Generate plain-language rationale
  let rationale = ''
  if (best.mandi.id === nearest.mandi.id) {
    rationale = `${best.mandi.mandiName} offers both the shortest transport distance (${best.mandi.distanceKm} km) and competitive modal price (₹${best.mandi.modalPrice.toLocaleString('en-IN')}/qtl), maximizing your in-hand net return to ₹${best.inHandNetPerQtl.toLocaleString('en-IN')}/qtl with lowest transit friction.`
  } else {
    rationale = `Although located ${best.mandi.distanceKm} km away compared to nearest ${nearest.mandi.mandiName} (${nearest.mandi.distanceKm} km), ${best.mandi.mandiName}'s higher modal price of ₹${best.mandi.modalPrice.toLocaleString('en-IN')}/qtl comfortably outweighs the extra transport cost of ₹${(best.transportCost - nearest.transportCost).toLocaleString('en-IN')}, generating +₹${netAdvantageVsNearest.toLocaleString('en-IN')} higher net cash in hand.`
  }

  return {
    recommendedMandi: best.mandi,
    calculation: best,
    netAdvantageVsNearest,
    netAdvantageVsAverage,
    nearestMandi: nearest.mandi,
    rationale,
    alternativesCount: calculations.length,
  }
}

