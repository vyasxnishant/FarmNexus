export interface MarketPriceRecord {
  id: string
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  grade: string
  arrival_date: string // YYYY-MM-DD or DD/MM/YYYY
  min_price: number
  max_price: number
  modal_price: number
  arrival_quantity: number // Quintals / Tonnes
  source: string // e.g. 'data.gov.in (AGMARKNET)', 'DEMO DATA (Offline Baseline)'
  is_demo: boolean
  fetched_at: string // ISO Timestamp
}

export interface MarketRecord {
  id: string
  name: string
  district: string
  state: string
  distance_km_default?: number
  is_active: boolean
}

export interface CommodityRecord {
  id: string
  name: string
  name_hi: string
  category: string
  unit: string
}

export interface MarketArrivalRecord {
  id: string
  market: string
  district: string
  state: string
  commodity: string
  arrival_date: string
  quantity_tons: number
  source: string
  is_demo: boolean
  fetched_at: string
}

export interface MarketPriceFilter {
  state?: string
  district?: string
  market?: string
  commodity?: string
  variety?: string
  date?: string
  limit?: number
  offset?: number
}

export interface PriceTrendPoint {
  date: string
  modal_price: number
  min_price: number
  max_price: number
}

export interface CommodityTrendRecord {
  commodity: string
  market: string
  state: string
  current_modal_price: number
  price_change_percent: number
  trend: 'up' | 'down' | 'steady'
  sparkline: number[]
  history: PriceTrendPoint[]
  source: string
  is_demo: boolean
  fetched_at: string
}

// Raw Government AGMARKNET API (data.gov.in) JSON item structure
export interface AgmarknetGovRecord {
  state?: string
  State?: string
  district?: string
  District?: string
  market?: string
  Market?: string
  commodity?: string
  Commodity?: string
  variety?: string
  Variety?: string
  grade?: string
  Grade?: string
  arrival_date?: string
  Arrival_Date?: string
  min_price?: string | number
  Min_Price?: string | number
  max_price?: string | number
  Max_Price?: string | number
  modal_price?: string | number
  Modal_Price?: string | number
  [key: string]: unknown
}

