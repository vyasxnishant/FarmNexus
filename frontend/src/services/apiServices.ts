import { apiClient } from './apiClient'

// 1. Authentication APIs
export const authApi = {
  register: async (payload: any) => {
    const res = await apiClient.post('/auth/register', payload)
    return res.data
  },
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password })
    return res.data
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me')
    return res.data
  },
  updateProfile: async (payload: any) => {
    const res = await apiClient.put('/auth/profile', payload)
    return res.data
  },
}

// 1.1 Settlement Bank APIs
export const bankApi = {
  getBankDetails: async () => {
    const res = await apiClient.get('/farmer/bank-details')
    return res.data
  },
  updateBankDetails: async (payload: {
    account_holder_name: string
    bank_name: string
    account_number: string
    confirm_account_number: string
    ifsc_code: string
    upi_id?: string
  }) => {
    const res = await apiClient.put('/farmer/bank-details', payload)
    return res.data
  },
}

// 2. Lots & Quality APIs
export const lotApi = {
  getAll: async (params?: { crop?: string; grade?: string; status?: string; search?: string }) => {
    const res = await apiClient.get('/lots', { params })
    return res.data
  },
  getMyLots: async () => {
    const res = await apiClient.get('/lots/my')
    return res.data
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/lots/${id}`)
    return res.data
  },
  create: async (payload: any) => {
    const res = await apiClient.post('/lots', payload)
    return res.data
  },
  update: async (id: string, payload: any) => {
    const res = await apiClient.put(`/lots/${id}`, payload)
    return res.data
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/lots/${id}`)
    return res.data
  },
  updateQuality: async (id: string, qualityPayload: any) => {
    const res = await apiClient.put(`/lots/${id}/quality`, qualityPayload)
    return res.data
  },
}

// 3. Market Prices & Price Intelligence
export const marketPriceApi = {
  getAll: async (params?: any) => {
    const res = await apiClient.get('/market-prices', { params })
    return res.data
  },
  getTrends: async (params?: any) => {
    const res = await apiClient.get('/market-prices/trends', { params })
    return res.data
  },
  getPriceIntelligence: async (lotId: string) => {
    const res = await apiClient.get(`/price-intelligence/${lotId}`)
    return res.data
  },
}

// 4. External Data APIs (AGMARKNET & eNAM)
export const externalMarketApi = {
  getAgmarknetPrices: async (params?: { crop?: string; state?: string; district?: string; mandi?: string; date?: string }) => {
    const res = await apiClient.get('/external/market-prices', { params })
    return res.data
  },
  getEnamPrices: async (params?: { crop?: string; state?: string; district?: string; mandi?: string }) => {
    const res = await apiClient.get('/external/enam/market-prices', { params })
    return res.data
  },
}

// 5. Weather APIs
export const weatherApi = {
  getWeather: async (params?: { location?: string; lat?: number; lon?: number }) => {
    const res = await apiClient.get('/weather', { params })
    return res.data
  },
  getStatus: async () => {
    const res = await apiClient.get('/weather/status')
    return res.data
  },
}

// 6. Buyer Matching & Requirements
export const matchingApi = {
  getMatchingLots: async (params?: any) => {
    const res = await apiClient.get('/matching/lots', { params })
    return res.data
  },
  getRequirements: async () => {
    const res = await apiClient.get('/matching/requirements')
    return res.data
  },
  updateRequirements: async (payload: any) => {
    const res = await apiClient.put('/matching/requirements', payload)
    return res.data
  },
}

// 7. Commercial Offers
export const offerApi = {
  create: async (payload: { lot_id: string; offered_price: number; quantity_qtl: number; payment_terms?: string; pickup_location?: string; message?: string }) => {
    const res = await apiClient.post('/offers', payload)
    return res.data
  },
  getMyOffers: async () => {
    const res = await apiClient.get('/offers/my')
    return res.data
  },
  getReceivedOffers: async () => {
    const res = await apiClient.get('/offers/received')
    return res.data
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/offers/${id}`)
    return res.data
  },
  accept: async (id: string) => {
    const res = await apiClient.post(`/offers/${id}/accept`)
    return res.data
  },
  reject: async (id: string) => {
    const res = await apiClient.post(`/offers/${id}/reject`)
    return res.data
  },
  counter: async (id: string, counter_price: number) => {
    const res = await apiClient.post(`/offers/${id}/counter`, { counter_price })
    return res.data
  },
}

// 8. Trade Transactions
export const transactionApi = {
  getMyTransactions: async () => {
    const res = await apiClient.get('/transactions/my')
    return res.data
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/transactions/${id}`)
    return res.data
  },
  advanceStage: async (id: string, nextStage: string) => {
    const res = await apiClient.post(`/transactions/${id}/advance-stage`, { nextStage })
    return res.data
  },
}

// 9. Payments & Escrow
export const paymentApi = {
  createOrder: async (transactionId: string, method?: string) => {
    const res = await apiClient.post('/payments/create', { transactionId, method })
    return res.data
  },
  verify: async (payload: { transactionId: string; orderId: string; referenceId: string; payerVpa?: string }) => {
    const res = await apiClient.post('/payments/verify', payload)
    return res.data
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/payments/${id}`)
    return res.data
  },
}

// 10. Logistics & Storage
export const logisticsApi = {
  getForLot: async (lotId: string, destinationMandi?: string) => {
    const res = await apiClient.get(`/logistics/${lotId}`, { params: { destinationMandi } })
    return res.data
  },
  getStorage: async (params?: any) => {
    const res = await apiClient.get('/storage', { params })
    return res.data
  },
}

// 11. Admin Operations & System Status
export const adminApi = {
  getUsers: async () => {
    const res = await apiClient.get('/admin/users')
    return res.data
  },
  getUserById: async (userId: string) => {
    const res = await apiClient.get(`/admin/users/${userId}`)
    return res.data
  },
  verifyUser: async (id: string) => {
    const res = await apiClient.post(`/admin/users/${id}/verify`)
    return res.data
  },
  suspendUser: async (id: string) => {
    const res = await apiClient.post(`/admin/users/${id}/suspend`)
    return res.data
  },
  activateUser: async (id: string) => {
    const res = await apiClient.post(`/admin/users/${id}/activate`)
    return res.data
  },
  getLots: async () => {
    const res = await apiClient.get('/admin/lots')
    return res.data
  },
  flagLot: async (id: string, reason: string) => {
    const res = await apiClient.post(`/admin/lots/${id}/flag`, { reason })
    return res.data
  },
  getOffers: async () => {
    const res = await apiClient.get('/admin/offers')
    return res.data
  },
  getTransactions: async () => {
    const res = await apiClient.get('/admin/transactions')
    return res.data
  },
  getPayments: async () => {
    const res = await apiClient.get('/admin/payments')
    return res.data
  },
  getActivityLogs: async () => {
    const res = await apiClient.get('/admin/activity-logs')
    return res.data
  },
  getSystemStatus: async () => {
    const res = await apiClient.get('/admin/system-status')
    return res.data
  },
  addMarketPrice: async (payload: any) => {
    const res = await apiClient.post('/admin/market-prices', payload)
    return res.data
  },
  updateMarketPrice: async (id: string, payload: any) => {
    const res = await apiClient.put(`/admin/market-prices/${id}`, payload)
    return res.data
  },
  deleteMarketPrice: async (id: string) => {
    const res = await apiClient.delete(`/admin/market-prices/${id}`)
    return res.data
  },
}
