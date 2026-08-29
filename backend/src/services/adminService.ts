import { inMemoryDb } from '../config/db.js'
import { ActivityLog, MarketPriceRecord, UserStatus } from '../models/types.js'

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
      market: data.market || 'Harda Mandi',
      commodity: data.commodity || 'Wheat (Sharbati)',
      variety: data.variety || 'Standard FAQ',
      grade: data.grade || 'Grade A',
      arrival_date: new Date().toISOString().split('T')[0],
      min_price: Number(data.min_price) || 2600,
      max_price: Number(data.max_price) || 2950,
      modal_price: Number(data.modal_price) || 2800,
      price_change: Number(data.price_change) || 1.5,
      trend: data.trend || 'up',
      arrival_quantity: Number(data.arrival_quantity) || 500,
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
}
