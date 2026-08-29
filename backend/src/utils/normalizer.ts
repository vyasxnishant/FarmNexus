import { AgmarknetGovRecord, MarketPriceRecord } from '../models/types.js'

export function normalizeGovPriceRecord(raw: AgmarknetGovRecord, index: number = 0): MarketPriceRecord {
  const state = String(raw.state || raw.State || 'Madhya Pradesh').trim()
  const district = String(raw.district || raw.District || 'Harda').trim()
  const market = String(raw.market || raw.Market || 'APMC Mandi').trim()
  const commodity = String(raw.commodity || raw.Commodity || 'Wheat').trim()
  const variety = String(raw.variety || raw.Variety || 'Other').trim()
  const grade = String(raw.grade || raw.Grade || 'FAQ').trim()
  const arrivalDate = String(raw.arrival_date || raw.Arrival_Date || new Date().toISOString().split('T')[0]).trim()

  const minPrice = parseNumber(raw.min_price || raw.Min_Price, 2200)
  const maxPrice = parseNumber(raw.max_price || raw.Max_Price, minPrice * 1.1)
  const modalPrice = parseNumber(raw.modal_price || raw.Modal_Price, (minPrice + maxPrice) / 2)
  const arrivalQty = parseNumber(raw.arrival_quantity || raw.Arrival_Quantity, 150)

  // Generate deterministic ID
  const cleanKey = `${state}-${district}-${market}-${commodity}-${variety}-${arrivalDate}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
  const id = `GOV-${cleanKey.slice(0, 40)}-${index}`

  return {
    id,
    state,
    district,
    market,
    commodity,
    variety,
    grade,
    arrival_date: arrivalDate,
    min_price: minPrice,
    max_price: maxPrice,
    modal_price: modalPrice,
    arrival_quantity: arrivalQty,
    source: 'data.gov.in (AGMARKNET)',
    is_demo: false,
    fetched_at: new Date().toISOString(),
  }
}

function parseNumber(val: unknown, fallback: number): number {
  if (typeof val === 'number' && !isNaN(val)) return val
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '').trim()
    const num = parseFloat(cleaned)
    if (!isNaN(num) && num > 0) return num
  }
  return fallback
}

