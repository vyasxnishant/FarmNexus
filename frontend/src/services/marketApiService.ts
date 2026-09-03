import axios from 'axios'

const API_BASE_URL = 'https://farm-nexus-qwoz.vercel.app/api'
export interface ApiMarketPrice {
  id: string
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  grade: string
  arrival_date: string
  min_price: number
  max_price: number
  modal_price: number
  arrival_quantity: number
  source: string
  is_demo: boolean
  fetched_at: string
}

export interface ApiMarketPriceResponse {
  success: boolean
  count: number
  total: number
  last_sync: string | null
  data: ApiMarketPrice[]
}

export interface ApiCommodityTrend {
  commodity: string
  market: string
  state: string
  current_modal_price: number
  price_change_percent: number
  trend: 'up' | 'down' | 'steady'
  sparkline: number[]
  source: string
  is_demo: boolean
  fetched_at: string
}

export interface MarketPriceFilterParams {
  state?: string
  district?: string
  market?: string
  commodity?: string
  variety?: string
  date?: string
  limit?: number
  offset?: number
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const marketApiService = {
  async getPrices(params?: MarketPriceFilterParams): Promise<ApiMarketPriceResponse> {
    const res = await apiClient.get<ApiMarketPriceResponse>('/market-prices', { params })
    return res.data
  },

  async getLatestPrices(limit: number = 20): Promise<ApiMarketPrice[]> {
    const res = await apiClient.get<{ success: boolean; data: ApiMarketPrice[] }>('/market-prices/latest', {
      params: { limit },
    })
    return res.data.data
  },

  async getTrends(commodity?: string, market?: string): Promise<ApiCommodityTrend[]> {
    const res = await apiClient.get<{ success: boolean; data: ApiCommodityTrend[] }>('/market-prices/trends', {
      params: { commodity, market },
    })
    return res.data.data
  },

  async getMarkets(state?: string, district?: string) {
    const res = await apiClient.get('/markets', { params: { state, district } })
    return res.data.data
  },

  async getCommodities() {
    const res = await apiClient.get('/commodities')
    return res.data.data
  },

  async getArrivals(market?: string, commodity?: string) {
    const res = await apiClient.get('/market-arrivals', { params: { market, commodity } })
    return res.data.data
  },
}

