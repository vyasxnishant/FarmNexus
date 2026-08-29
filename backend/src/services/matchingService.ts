import { inMemoryDb } from '../config/db.js'
import { CropLot, BuyerRequirement } from '../models/types.js'

export interface MatchedLotResult {
  lot: CropLot
  matchScore: number
  reasons: string[]
  estimatedCost: number
  isDirectMatch: boolean
}

export class MatchingService {
  static async getBuyerRequirements(buyerId: string): Promise<BuyerRequirement> {
    let req = inMemoryDb.buyerRequirements.find(r => r.buyer_id === buyerId)
    if (!req) {
      req = {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        buyer_id: buyerId,
        required_crop: 'Wheat (Sharbati)',
        required_quantity_qtl: 100,
        preferred_grade: 'Grade A',
        preferred_location: 'Madhya Pradesh',
        max_price: 2900,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      inMemoryDb.buyerRequirements.push(req)
    }
    return req
  }

  static async updateBuyerRequirements(buyerId: string, data: Partial<BuyerRequirement>): Promise<BuyerRequirement> {
    let req = inMemoryDb.buyerRequirements.find(r => r.buyer_id === buyerId)
    const now = new Date().toISOString()

    if (!req) {
      req = {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        buyer_id: buyerId,
        required_crop: data.required_crop || 'Wheat (Sharbati)',
        required_quantity_qtl: Number(data.required_quantity_qtl) || 100,
        preferred_grade: data.preferred_grade || 'Grade A',
        preferred_location: data.preferred_location || 'Madhya Pradesh',
        max_price: Number(data.max_price) || 2900,
        created_at: now,
        updated_at: now,
      }
      inMemoryDb.buyerRequirements.push(req)
    } else {
      if (data.required_crop) req.required_crop = data.required_crop
      if (data.required_quantity_qtl) req.required_quantity_qtl = Number(data.required_quantity_qtl)
      if (data.preferred_grade) req.preferred_grade = data.preferred_grade
      if (data.preferred_location) req.preferred_location = data.preferred_location
      if (data.max_price) req.max_price = Number(data.max_price)
      req.updated_at = now
    }

    return req
  }

  static async getMatchingLots(buyerId?: string, customFilters?: Partial<BuyerRequirement>): Promise<{
    requirements: BuyerRequirement
    matches: MatchedLotResult[]
  }> {
    let requirements: BuyerRequirement

    if (customFilters && customFilters.required_crop) {
      requirements = {
        id: 'REQ-TEMP',
        buyer_id: buyerId || 'ANONYMOUS',
        required_crop: customFilters.required_crop,
        required_quantity_qtl: Number(customFilters.required_quantity_qtl) || 100,
        preferred_grade: customFilters.preferred_grade || 'Grade A',
        preferred_location: customFilters.preferred_location || 'All',
        max_price: Number(customFilters.max_price) || 3000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    } else if (buyerId) {
      requirements = await this.getBuyerRequirements(buyerId)
    } else {
      requirements = inMemoryDb.buyerRequirements[0] || {
        id: 'REQ-DEFAULT',
        buyer_id: 'USR-BUY-01',
        required_crop: 'Wheat (Sharbati)',
        required_quantity_qtl: 100,
        preferred_grade: 'Grade A',
        preferred_location: 'Madhya Pradesh',
        max_price: 2900,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const activeLots = inMemoryDb.lots.filter(l => l.status === 'Active')

    const matches: MatchedLotResult[] = activeLots.map(lot => {
      let score = 50
      const reasons: string[] = []

      // 1. Crop Match (40 pts)
      const cropMatch = lot.crop.toLowerCase().includes(requirements.required_crop.toLowerCase()) ||
                         requirements.required_crop.toLowerCase().includes(lot.crop.toLowerCase())
      if (cropMatch) {
        score += 35
        reasons.push(`Exact commodity match: ${lot.crop}`)
      } else {
        score -= 20
      }

      // 2. Grade compatibility (20 pts)
      if (lot.grade.includes('Grade A') || lot.grade.includes(requirements.preferred_grade)) {
        score += 15
        reasons.push(`High quality certification: ${lot.grade}`)
      }

      // 3. Price compatibility (15 pts)
      if (lot.expected_price <= requirements.max_price) {
        score += 15
        reasons.push(`Within ceiling price (₹${lot.expected_price} <= ₹${requirements.max_price})`)
      } else {
        score -= 15
      }

      // 4. Quantity fulfillment
      if (lot.quantity_qtl >= requirements.required_quantity_qtl) {
        score += 10
        reasons.push(`Fulfills full volume demand (${lot.quantity_qtl} qtl >= ${requirements.required_quantity_qtl} qtl)`)
      } else {
        reasons.push(`Partial fulfillment (${lot.quantity_qtl} qtl available)`)
      }

      const finalScore = Math.max(20, Math.min(99, score))
      const estimatedCost = lot.quantity_qtl * lot.expected_price

      return {
        lot,
        matchScore: finalScore,
        reasons,
        estimatedCost,
        isDirectMatch: cropMatch && lot.expected_price <= requirements.max_price,
      }
    })

    // Sort by matchScore descending
    matches.sort((a, b) => b.matchScore - a.matchScore)

    return {
      requirements,
      matches,
    }
  }
}
