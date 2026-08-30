import { inMemoryDb, pool, isPostgresConnected } from '../config/db.js'
import { CropLot, LotQuality, LotStatus } from '../models/types.js'
import { isValidState, isValidDistrictForState } from '../data/indiaLocations.js'

export class LotService {
  static async getAllLots(filters?: { crop?: string; grade?: string; status?: string; search?: string }) {
    let lots = [...inMemoryDb.lots]

    if (filters?.crop && filters.crop !== 'All') {
      lots = lots.filter(l => l.crop.toLowerCase().includes(filters.crop!.toLowerCase()))
    }
    if (filters?.grade && filters.grade !== 'All') {
      lots = lots.filter(l => l.grade === filters.grade)
    }
    if (filters?.status && filters.status !== 'All') {
      lots = lots.filter(l => l.status === filters.status)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      lots = lots.filter(l =>
        l.id.toLowerCase().includes(q) ||
        l.crop.toLowerCase().includes(q) ||
        l.variety.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      )
    }

    // Attach active offers count and highest offer
    return lots.map(lot => {
      const lotOffers = inMemoryDb.offers.filter(o => o.lot_id === lot.id && o.status === 'Pending')
      const highestOffer = lotOffers.length > 0 ? Math.max(...lotOffers.map(o => o.offered_price)) : lot.expected_price
      return {
        ...lot,
        active_offers_count: lotOffers.length,
        highest_offer: highestOffer,
      }
    })
  }

  static async getFarmerLots(farmerId: string) {
    const lots = inMemoryDb.lots.filter(l => l.farmer_id === farmerId)
    return lots.map(lot => {
      const lotOffers = inMemoryDb.offers.filter(o => o.lot_id === lot.id && o.status === 'Pending')
      const highestOffer = lotOffers.length > 0 ? Math.max(...lotOffers.map(o => o.offered_price)) : lot.expected_price
      return {
        ...lot,
        active_offers_count: lotOffers.length,
        highest_offer: highestOffer,
      }
    })
  }

  static async getLotById(lotId: string) {
    const lot = inMemoryDb.lots.find(l => l.id === lotId)
    if (!lot) {
      throw new Error(`Lot not found with ID: ${lotId}`)
    }

    const lotOffers = inMemoryDb.offers.filter(o => o.lot_id === lot.id)
    const pendingOffers = lotOffers.filter(o => o.status === 'Pending')
    const highestOffer = pendingOffers.length > 0 ? Math.max(...pendingOffers.map(o => o.offered_price)) : lot.expected_price

    return {
      ...lot,
      active_offers_count: pendingOffers.length,
      highest_offer: highestOffer,
      offers: lotOffers,
    }
  }

  static async createLot(farmerId: string, data: Partial<CropLot> & { quality?: Partial<LotQuality> }) {
    const user = inMemoryDb.users.find(u => u.id === farmerId)
    const lotId = `LOT-AGN-${Date.now().toString().slice(-3)}`
    const now = new Date().toISOString()

    const targetState = data.state || (user ? user.state : 'Madhya Pradesh')
    const targetDistrict = data.district || (user ? user.district : 'Harda')

    if (data.state && !isValidState(data.state)) {
      throw new Error(`Invalid state: "${data.state}" is not a recognized Indian State or Union Territory.`)
    }
    if ((data.state || data.district) && !isValidDistrictForState(targetState, targetDistrict)) {
      throw new Error(`Invalid location: "${targetDistrict}" is not a recognized district of ${targetState}.`)
    }

    const newLot: CropLot = {
      id: lotId,
      farmer_id: farmerId,
      farmer_name: user ? user.name : 'Verified Farmer',
      crop: data.crop || 'Wheat (Sharbati)',
      crop_hi: data.crop_hi,
      category: data.category || 'Grains & Cereals',
      variety: data.variety || 'Standard FAQ',
      quantity_qtl: Number(data.quantity_qtl) || 100,
      initial_quantity_qtl: Number(data.initial_quantity_qtl) || Number(data.quantity_qtl) || 100,
      unit: data.unit || 'Quintal',
      grade: data.grade || 'Grade A',
      expected_price: Number(data.expected_price) || 2700,
      min_acceptable_price: Number(data.min_acceptable_price) || 2600,
      market_reference_price: Number(data.market_reference_price) || 2800,
      status: (data.status as LotStatus) || 'Active',
      location: data.location || (user ? user.location : `${targetDistrict}, ${targetState}`),
      district: targetDistrict,
      state: targetState,
      harvest_date: data.harvest_date || now.split('T')[0],
      available_from: data.available_from,
      available_until: data.available_until,
      description: data.description,
      image_url: data.image_url,
      certificate_url: data.certificate_url,
      pickup_location: data.pickup_location || 'Farm Godown Bay #1',
      is_demo: false,
      quality: {
        lot_id: lotId,
        grade: (data.quality?.grade || data.grade || 'Grade A') as any,
        visual_quality: data.quality?.visual_quality || 'Good',
        damage_level: data.quality?.damage_level || 'None',
        grain_size: data.quality?.grain_size || 'Uniform Bold',
        moisture_percent: data.quality?.moisture_percent ? Number(data.quality.moisture_percent) : 10.5,
        foreign_matter_percent: data.quality?.foreign_matter_percent ? Number(data.quality.foreign_matter_percent) : 0.8,
        notes: data.quality?.notes || 'Direct farm harvest. Checked and tested.',
        images: data.quality?.images || [],
      },
      created_at: now,
      updated_at: now,
    }

    inMemoryDb.lots.unshift(newLot)

    // Persist to PostgreSQL if connected
    if (isPostgresConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO lots (id, farmer_id, crop, category, variety, quantity_qtl, unit, grade, expected_price, min_acceptable_price, market_reference_price, status, location, district, state, pickup_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [newLot.id, newLot.farmer_id, newLot.crop, newLot.category, newLot.variety, newLot.quantity_qtl, newLot.unit, newLot.grade, newLot.expected_price, newLot.min_acceptable_price, newLot.market_reference_price, newLot.status, newLot.location, newLot.district, newLot.state, newLot.pickup_location]
        )
      } catch (e) {
        console.warn('[LotService] PostgreSQL insert failed, memory active', e)
      }
    }

    return newLot
  }

  static async updateLot(lotId: string, farmerId: string, data: Partial<CropLot>) {
    const lotIndex = inMemoryDb.lots.findIndex(l => l.id === lotId)
    if (lotIndex === -1) {
      throw new Error(`Lot not found with ID: ${lotId}`)
    }

    const existingLot = inMemoryDb.lots[lotIndex]
    // Authorize owner
    if (existingLot.farmer_id !== farmerId) {
      throw new Error('Unauthorized: You can only edit lots created by your account.')
    }

    const targetState = data.state || existingLot.state || 'Madhya Pradesh'
    const targetDistrict = data.district || existingLot.district || 'Harda'

    if (data.state && !isValidState(data.state)) {
      throw new Error(`Invalid state: "${data.state}" is not a recognized Indian State or Union Territory.`)
    }
    if ((data.state || data.district) && !isValidDistrictForState(targetState, targetDistrict)) {
      throw new Error(`Invalid location: "${targetDistrict}" is not a recognized district of ${targetState}.`)
    }

    const updatedLot: CropLot = {
      ...existingLot,
      ...data,
      quantity_qtl: data.quantity_qtl !== undefined ? Number(data.quantity_qtl) : existingLot.quantity_qtl,
      expected_price: data.expected_price !== undefined ? Number(data.expected_price) : existingLot.expected_price,
      min_acceptable_price: data.min_acceptable_price !== undefined ? Number(data.min_acceptable_price) : existingLot.min_acceptable_price,
      harvest_date: data.harvest_date || existingLot.harvest_date,
      available_from: data.available_from !== undefined ? data.available_from : existingLot.available_from,
      available_until: data.available_until !== undefined ? data.available_until : existingLot.available_until,
      description: data.description !== undefined ? data.description : existingLot.description,
      image_url: data.image_url !== undefined ? data.image_url : existingLot.image_url,
      certificate_url: data.certificate_url !== undefined ? data.certificate_url : existingLot.certificate_url,
      updated_at: new Date().toISOString(),
    }

    inMemoryDb.lots[lotIndex] = updatedLot
    return updatedLot
  }

  static async deleteLot(lotId: string, farmerId: string) {
    const lotIndex = inMemoryDb.lots.findIndex(l => l.id === lotId)
    if (lotIndex === -1) {
      throw new Error(`Lot not found with ID: ${lotId}`)
    }

    const existingLot = inMemoryDb.lots[lotIndex]
    if (existingLot.farmer_id !== farmerId) {
      throw new Error('Unauthorized: You can only delete lots created by your account.')
    }

    const hasTransactions = inMemoryDb.transactions.some(t => t.lot_id === lotId)
    if (hasTransactions) {
      throw new Error('Cannot delete lot: This lot is referenced in trade contracts/transactions. You can pause or mark it as Sold instead.')
    }

    inMemoryDb.lots.splice(lotIndex, 1)
    return { id: lotId, deleted: true }
  }

  static async updateLotQuality(lotId: string, farmerId: string, qualityData: Partial<LotQuality>) {
    const lot = inMemoryDb.lots.find(l => l.id === lotId)
    if (!lot) {
      throw new Error(`Lot not found with ID: ${lotId}`)
    }

    if (lot.farmer_id !== farmerId) {
      throw new Error('Unauthorized: You can only update quality assay for your own lots.')
    }

    lot.quality = {
      lot_id: lotId,
      grade: (qualityData.grade || lot.grade) as any,
      visual_quality: qualityData.visual_quality || lot.quality?.visual_quality || 'Good',
      damage_level: qualityData.damage_level || lot.quality?.damage_level || 'None',
      grain_size: qualityData.grain_size || lot.quality?.grain_size || 'Uniform Bold',
      moisture_percent: qualityData.moisture_percent ? Number(qualityData.moisture_percent) : lot.quality?.moisture_percent,
      foreign_matter_percent: qualityData.foreign_matter_percent ? Number(qualityData.foreign_matter_percent) : lot.quality?.foreign_matter_percent,
      notes: qualityData.notes || lot.quality?.notes,
      images: qualityData.images || lot.quality?.images || [],
      updated_at: new Date().toISOString(),
    }

    if (qualityData.grade) {
      lot.grade = qualityData.grade as any
    }

    lot.updated_at = new Date().toISOString()
    return lot
  }
}

