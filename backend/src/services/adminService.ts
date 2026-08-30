import { inMemoryDb, getDbStatus } from '../config/db.js'
import { ActivityLog, MarketPriceRecord, UserStatus } from '../models/types.js'
import { AgmarknetService } from './agmarknetService.js'
import { EnamService } from './enamService.js'
import { WeatherService } from './weatherService.js'

export class AdminService {
  static async logActivity(action: string, adminUser: string, targetType: ActivityLog['target_type'], targetId: string, details: string) {
    const logId = `LOG-${Date.now().toString().slice(-4)}`
    const now = new Date()
    const timeString = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const log: ActivityLog = {
      id: logId,
      action,
      admin_user: adminUser,
      target_type: targetType,
      target_id: targetId,
      details,
      timestamp: timeString,
      created_at: now.toISOString(),
    }

    inMemoryDb.activityLogs.unshift(log)
    return log
  }

  static async getUsers() {
    return inMemoryDb.users.map(({ password_hash, ...u }) => {
      const farmerLots = inMemoryDb.lots.filter(l => l.farmer_id === u.id)
      const transactions = inMemoryDb.transactions.filter(t => t.farmer_id === u.id || t.buyer_id === u.id)
      return {
        ...u,
        lotsCount: farmerLots.length,
        transactionsCount: transactions.length,
      }
    })
  }

  static async getUserById(targetUserId: string) {
    const user = inMemoryDb.users.find(u => u.id === targetUserId)
    if (!user) {
      throw new Error(`User not found with ID: ${targetUserId}`)
    }

    const { password_hash, ...safeUser } = user
    const farmerProfile = inMemoryDb.farmerProfiles.find(p => p.user_id === targetUserId)
    const buyerProfile = inMemoryDb.buyerProfiles.find(p => p.user_id === targetUserId)
    const buyerRequirement = inMemoryDb.buyerRequirements.find(r => r.buyer_id === targetUserId)
    const userLots = inMemoryDb.lots.filter(l => l.farmer_id === targetUserId)
    const userOffers = inMemoryDb.offers.filter(o => o.buyer_id === targetUserId || userLots.some(l => l.id === o.lot_id))
    const userTransactions = inMemoryDb.transactions.filter(t => t.farmer_id === targetUserId || t.buyer_id === targetUserId)

    return {
      user: safeUser,
      farmerProfile: farmerProfile || null,
      buyerProfile: buyerProfile || null,
      buyerRequirement: buyerRequirement || null,
      lots: userLots,
      offers: userOffers,
      transactions: userTransactions,
    }
  }

  static async updateUserStatus(userId: string, status: UserStatus, adminUser: string) {
    const user = inMemoryDb.users.find(u => u.id === userId)
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`)
    }

    user.status = status
    user.updated_at = new Date().toISOString()

    await this.logActivity(
      `User ${status}`,
      adminUser,
      'User',
      `${user.id} (${user.name})`,
      `User account status updated to ${status}.`
    )

    const { password_hash, ...safeUser } = user
    return safeUser
  }

  static async verifyUserKyc(userId: string, adminUser: string) {
    const user = inMemoryDb.users.find(u => u.id === userId)
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`)
    }

    user.kyc_verified = true
    user.updated_at = new Date().toISOString()

    await this.logActivity(
      'User KYC Verified',
      adminUser,
      'User',
      `${user.id} (${user.name})`,
      `KYC and bank mandate approved by operations authority.`
    )

    const { password_hash, ...safeUser } = user
    return safeUser
  }

  static async flagLot(lotId: string, reason: string, adminUser: string) {
    const lot = inMemoryDb.lots.find(l => l.id === lotId)
    if (!lot) {
      throw new Error(`Lot not found with ID: ${lotId}`)
    }

    lot.status = 'Under Review'
    lot.updated_at = new Date().toISOString()

    await this.logActivity(
      'Lot Flagged for Review',
      adminUser,
      'Lot',
      `${lot.id} (${lot.crop})`,
      reason || 'Quality specifications flagged for re-assay.'
    )

    return lot
  }

  static async addMarketPrice(data: Partial<MarketPriceRecord>, adminUser: string) {
    const id = `PRC-${Date.now().toString().slice(-4)}`
    const newPrice: MarketPriceRecord = {
      id,
      state: data.state || 'Madhya Pradesh',
      district: data.district || 'Harda',
      market: (data as any).market || (data as any).mandi || 'Harda Mandi',
      commodity: (data as any).commodity || (data as any).crop || 'Wheat (Sharbati)',
      variety: data.variety || 'Standard FAQ',
      grade: data.grade || 'Grade A',
      arrival_date: new Date().toISOString().split('T')[0],
      min_price: Number((data as any).min_price || (data as any).minPrice) || 2600,
      max_price: Number((data as any).max_price || (data as any).maxPrice) || 2950,
      modal_price: Number((data as any).modal_price || (data as any).modalPrice) || 2800,
      price_change: Number((data as any).price_change || (data as any).priceChange) || 1.5,
      trend: data.trend || 'up',
      arrival_quantity: Number((data as any).arrival_quantity || (data as any).arrivalQuantity) || 500,
      source: data.source || 'APMC Terminal (Admin Feed)',
      is_demo: false,
      fetched_at: new Date().toISOString(),
    }

    inMemoryDb.marketPrices.unshift(newPrice)

    await this.logActivity(
      'Market Price Added',
      adminUser,
      'MarketPrice',
      `${newPrice.market} - ${newPrice.commodity}`,
      `Published new modal price of ₹${newPrice.modal_price}/qtl.`
    )

    return newPrice
  }

  static async updateMarketPrice(id: string, data: Partial<MarketPriceRecord>, adminUser: string) {
    const index = inMemoryDb.marketPrices.findIndex(p => p.id === id || (p.market === data.market && p.commodity === data.commodity))
    if (index === -1) {
      throw new Error(`Market price record not found for ID: ${id}`)
    }

    const existing = inMemoryDb.marketPrices[index]
    const updated: MarketPriceRecord = {
      ...existing,
      ...data,
      min_price: data.min_price !== undefined ? Number(data.min_price) : existing.min_price,
      max_price: data.max_price !== undefined ? Number(data.max_price) : existing.max_price,
      modal_price: data.modal_price !== undefined ? Number(data.modal_price) : existing.modal_price,
      price_change: data.price_change !== undefined ? Number(data.price_change) : existing.price_change,
      fetched_at: new Date().toISOString(),
    }

    inMemoryDb.marketPrices[index] = updated

    await this.logActivity(
      'Market Price Updated',
      adminUser,
      'MarketPrice',
      `${updated.market} - ${updated.commodity}`,
      `Modal price updated to ₹${updated.modal_price}/qtl.`
    )

    return updated
  }

  static async deleteMarketPrice(id: string, adminUser: string) {
    const index = inMemoryDb.marketPrices.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error(`Market price record not found for ID: ${id}`)
    }

    const removed = inMemoryDb.marketPrices.splice(index, 1)[0]

    await this.logActivity(
      'Market Price Deleted',
      adminUser,
      'MarketPrice',
      `${removed.market} - ${removed.commodity}`,
      'Record removed from active price index.'
    )

    return { id, deleted: true }
  }

  static async getActivityLogs() {
    return inMemoryDb.activityLogs
  }

  /**
   * System and External Data Integrations Status + Real Metrics
   */
  static async getSystemStatus() {
    const agmarknetStatus = AgmarknetService.getStatus()
    const enamStatus = EnamService.getStatus()
    const weatherStatus = await WeatherService.checkStatus()
    const dbStatus = getDbStatus()

    const totalFarmers = inMemoryDb.users.filter(u => u.user_type === 'FARMER').length
    const totalBuyers = inMemoryDb.users.filter(u => u.user_type === 'BUYER').length
    const totalLots = inMemoryDb.lots.length
    const activeLots = inMemoryDb.lots.filter(l => l.status === 'Active').length
    const totalOffers = inMemoryDb.offers.length
    const acceptedOffers = inMemoryDb.offers.filter(o => o.status === 'Accepted').length
    const totalTransactions = inMemoryDb.transactions.length
    const completedTransactions = inMemoryDb.transactions.filter(t => t.transaction_status === 'Completed').length
    const totalTradedValue = inMemoryDb.transactions.reduce((acc, t) => acc + (t.final_amount || 0), 0)
    const successfulPayments = inMemoryDb.transactions.filter(t => t.payment_status === 'Payment Successful').length
    const pendingPayments = inMemoryDb.transactions.filter(t => t.payment_status === 'Payment Pending').length

    return {
      timestamp: new Date().toISOString(),
      server_status: 'Operational',
      uptime_seconds: Math.floor(process.uptime()),
      database_engine: dbStatus.isPostgresConnected ? 'PostgreSQL' : 'In-Memory Engine (Synchronous)',
      statistics: {
        total_farmers: totalFarmers,
        total_buyers: totalBuyers,
        total_lots: totalLots,
        active_lots: activeLots,
        total_offers: totalOffers,
        accepted_offers: acceptedOffers,
        total_deals: totalTransactions,
        completed_deals: completedTransactions,
        total_traded_value: totalTradedValue,
        successful_payments: successfulPayments,
        pending_payments: pendingPayments,
      },
      services: {
        agmarknet: {
          name: 'AGMARKNET (data.gov.in)',
          status: agmarknetStatus.status,
          hasApiKey: agmarknetStatus.hasApiKey,
          lastSync: agmarknetStatus.lastSync,
          type: 'Government APMC Mandi Feed',
        },
        enam: {
          name: 'eNAM (National Agriculture Market)',
          status: enamStatus.status,
          hasApiKey: enamStatus.hasApiKey,
          endpoint: enamStatus.endpoint,
          type: 'Electronic Trading Auction Gateway',
        },
        weather: {
          name: 'Open-Meteo Agricultural Weather API',
          status: weatherStatus.status,
          source: weatherStatus.source,
          latencyMs: weatherStatus.latencyMs,
          type: 'Live Global & India Meteorological Feed',
        },
        database: {
          name: 'PostgreSQL Relational DB',
          status: dbStatus.isPostgresConnected ? 'Connected (PostgreSQL)' : 'In-Memory Store (Consistent)',
          recordsCount: dbStatus.totalRecords,
        },
      },
    }
  }
}
