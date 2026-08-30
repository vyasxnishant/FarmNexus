import { inMemoryDb, pool, isPostgresConnected } from '../config/db.js'
import { Offer, Transaction, CropLot } from '../models/types.js'
import { TransactionService } from './transactionService.js'

export class OfferService {
  static async createOffer(buyerId: string, data: {
    lot_id: string
    offered_price: number
    quantity_qtl: number
    payment_terms?: string
    pickup_location?: string
    message?: string
  }) {
    const lot = inMemoryDb.lots.find(l => l.id === data.lot_id)
    if (!lot) {
      throw new Error(`Lot not found with ID: ${data.lot_id}`)
    }

    if (lot.farmer_id === buyerId) {
      throw new Error('Unauthorized: You cannot place a purchase bid on your own produce listing.')
    }

    if (lot.status !== 'Active') {
      throw new Error(`Cannot place offer: Lot status is '${lot.status}'. Offers are only accepted on active listings.`)
    }

    if (data.quantity_qtl <= 0 || data.quantity_qtl > lot.quantity_qtl) {
      throw new Error(`Invalid quantity. Requested: ${data.quantity_qtl} qtl, Available: ${lot.quantity_qtl} qtl.`)
    }

    if (data.offered_price <= 0) {
      throw new Error('Offered price must be greater than zero.')
    }

    const buyerUser = inMemoryDb.users.find(u => u.id === buyerId)
    const buyerProfile = inMemoryDb.buyerProfiles.find(p => p.user_id === buyerId)

    const offerId = `OFF-${Date.now().toString().slice(-4)}`
    const totalAmount = Math.round(Number(data.offered_price) * Number(data.quantity_qtl))
    const now = new Date().toISOString()

    const newOffer: Offer = {
      id: offerId,
      lot_id: lot.id,
      farmer_id: lot.farmer_id,
      farmer_name: lot.farmer_name,
      lot_title: `${lot.crop} (${lot.variety}) • ${data.quantity_qtl} qtl`,
      buyer_id: buyerId,
      buyer_name: buyerUser ? buyerUser.name : 'Authorized Buyer',
      buyer_company: buyerProfile ? buyerProfile.company_name : buyerUser?.organization || 'Institutional Buyer',
      buyer_reliability: buyerProfile ? buyerProfile.reliability_score : 4.90,
      buyer_verified: buyerProfile ? buyerProfile.verified : true,
      offered_price: Number(data.offered_price),
      lot_expected_price: lot.expected_price,
      quantity_qtl: Number(data.quantity_qtl),
      total_amount: totalAmount,
      payment_terms: data.payment_terms || 'e-NWR Escrow auto-release on gate receipt',
      pickup_location: data.pickup_location || lot.pickup_location || 'Designated Collection Center',
      status: 'Pending',
      message: data.message,
      created_at: now,
      updated_at: now,
    }

    inMemoryDb.offers.unshift(newOffer)
    return newOffer
  }

  static async getBuyerOffers(buyerId: string) {
    return inMemoryDb.offers.filter(o => o.buyer_id === buyerId)
  }

  static async getFarmerOffers(farmerId: string) {
    // Find all lots belonging to this farmer
    const farmerLotIds = inMemoryDb.lots.filter(l => l.farmer_id === farmerId).map(l => l.id)
    return inMemoryDb.offers.filter(o => o.farmer_id === farmerId || farmerLotIds.includes(o.lot_id))
  }

  static async getOfferById(offerId: string) {
    const offer = inMemoryDb.offers.find(o => o.id === offerId)
    if (!offer) {
      throw new Error(`Offer not found with ID: ${offerId}`)
    }
    return offer
  }

  static async acceptOffer(offerId: string, farmerId: string): Promise<{ offer: Offer; transaction: Transaction }> {
    const offer = inMemoryDb.offers.find(o => o.id === offerId)
    if (!offer) {
      throw new Error(`Offer not found with ID: ${offerId}`)
    }

    const lot = inMemoryDb.lots.find(l => l.id === offer.lot_id)
    if (!lot) {
      throw new Error(`Associated produce lot not found: ${offer.lot_id}`)
    }

    if (lot.farmer_id !== farmerId && offer.farmer_id !== farmerId) {
      throw new Error('Unauthorized: Only the farmer who owns this lot can accept this offer.')
    }

    if (offer.status === 'Accepted') {
      const existingTxn = inMemoryDb.transactions.find(t => t.offer_id === offer.id)
      if (existingTxn) {
        return { offer, transaction: existingTxn }
      }
      throw new Error('This offer has already been accepted.')
    }

    // 1. Mark offer as Accepted
    offer.status = 'Accepted'
    offer.updated_at = new Date().toISOString()

    // 2. Update lot remaining quantity & status
    if (!lot.initial_quantity_qtl) {
      lot.initial_quantity_qtl = lot.quantity_qtl
    }
    const remainingQty = Math.max(0, lot.quantity_qtl - offer.quantity_qtl)
    lot.quantity_qtl = remainingQty

    if (lot.quantity_qtl === 0) {
      lot.status = 'Sold'
    } else {
      lot.status = 'Active'
    }
    lot.updated_at = new Date().toISOString()

    // 3. Reject other conflicting pending offers if insufficient volume remains
    inMemoryDb.offers
      .filter(o => o.lot_id === lot.id && o.id !== offer.id && o.status === 'Pending')
      .forEach(o => {
        if (o.quantity_qtl > lot.quantity_qtl) {
          o.status = 'Rejected'
          o.updated_at = new Date().toISOString()
        }
      })

    // 4. Create Transaction automatically on backend
    const transaction = await TransactionService.createTransactionFromOffer(offer, lot)

    return { offer, transaction }
  }

  static async rejectOffer(offerId: string, farmerId: string): Promise<Offer> {
    const offer = inMemoryDb.offers.find(o => o.id === offerId)
    if (!offer) {
      throw new Error(`Offer not found with ID: ${offerId}`)
    }

    const lot = inMemoryDb.lots.find(l => l.id === offer.lot_id)
    if (lot && lot.farmer_id !== farmerId) {
      throw new Error('Unauthorized: Only the farmer who owns this lot can reject this offer.')
    }

    offer.status = 'Rejected'
    offer.updated_at = new Date().toISOString()
    return offer
  }

  static async counterOffer(offerId: string, farmerId: string, counterPrice: number): Promise<Offer> {
    const offer = inMemoryDb.offers.find(o => o.id === offerId)
    if (!offer) {
      throw new Error(`Offer not found with ID: ${offerId}`)
    }

    const lot = inMemoryDb.lots.find(l => l.id === offer.lot_id)
    if (lot && lot.farmer_id !== farmerId) {
      throw new Error('Unauthorized: Only the farmer who owns this lot can counter this offer.')
    }

    offer.status = 'Countered'
    offer.counter_price = counterPrice
    offer.updated_at = new Date().toISOString()
    return offer
  }
}

