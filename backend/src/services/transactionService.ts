import { inMemoryDb, pool, isPostgresConnected } from '../config/db.js'
import { Offer, CropLot, Transaction, TransactionStatus, PaymentStatus } from '../models/types.js'

export class TransactionService {
  static async createTransactionFromOffer(offer: Offer, lot: CropLot): Promise<Transaction> {
    // Return existing transaction if one already exists for this offer (Idempotency)
    const existingTxn = inMemoryDb.transactions.find(t => t.offer_id === offer.id)
    if (existingTxn) {
      return existingTxn
    }

    const farmerUser = inMemoryDb.users.find(u => u.id === lot.farmer_id)
    const buyerUser = inMemoryDb.users.find(u => u.id === offer.buyer_id)
    const buyerProfile = inMemoryDb.buyerProfiles.find(p => p.user_id === offer.buyer_id)

    const transactionId = `TXN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    const produceValue = Math.round(offer.offered_price * offer.quantity_qtl)

    // Server-side calculated logistics & cess
    // Mandi Cess = 1.5% of produce value
    const mandiCess = Math.round(produceValue * 0.015)
    // Distance estimate
    const transportCost = 4500
    const finalAmount = produceValue + transportCost + mandiCess

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const formattedTimestamp = `${dateString}, ${timeString}`

    const newTransaction: Transaction = {
      id: transactionId,
      lot_id: lot.id,
      offer_id: offer.id,
      farmer_id: lot.farmer_id,
      farmer_name: farmerUser ? farmerUser.name : 'Verified Farmer',
      farmer_location: lot.location,
      farmer_phone: farmerUser?.phone,
      buyer_id: offer.buyer_id,
      buyer_name: buyerUser ? buyerUser.name : offer.buyer_name || 'Corporate Buyer',
      buyer_organization: buyerProfile?.company_name || buyerUser?.organization || offer.buyer_company || 'Procurement Corp',
      buyer_location: buyerProfile?.delivery_location || buyerUser?.location || 'Processing Hub',
      crop: lot.crop,
      crop_hi: lot.crop_hi,
      variety: lot.variety,
      quantity_qtl: offer.quantity_qtl,
      unit: lot.unit || 'Quintal',
      agreed_price_per_qtl: offer.offered_price,
      produce_value: produceValue,
      transport_cost: transportCost,
      mandi_cess: mandiCess,
      final_amount: finalAmount,
      mandi_or_delivery_location: offer.pickup_location || 'Designated APMC Hub',
      payment_status: 'Payment Pending',
      transaction_status: 'Payment Pending',
      timeline: [
        { stage: 'offer_accepted', label: 'Offer Accepted by Farmer', label_hi: 'किसान द्वारा प्रस्ताव स्वीकृत', timestamp: formattedTimestamp, completed: true, description: `Agreed price ₹${offer.offered_price.toLocaleString('en-IN')}/qtl for ${offer.quantity_qtl} qtl.` },
        { stage: 'transaction_created', label: 'Transaction Contract Binding', label_hi: 'अनुबंध बाध्यकारी', timestamp: formattedTimestamp, completed: true, description: 'Electronic trade contract generated.' },
        { stage: 'escrow_funded', label: 'Buyer Escrow Deposit', label_hi: 'एस्क्रो जमा', timestamp: 'Pending', completed: false, description: 'Awaiting buyer deposit into FarmNexus Escrow.' },
        { stage: 'in_transit', label: 'Produce Dispatched & In Transit', label_hi: 'पारगमन में', timestamp: 'Pending', completed: false, description: 'Carrier pickup and transit.' },
        { stage: 'delivered', label: 'Delivery & Gate Assay Check', label_hi: 'वितरण व जांच', timestamp: 'Pending', completed: false, description: 'Produce arrival at buyer processing terminal.' },
        { stage: 'completed', label: 'Escrow Settlement to Farmer', label_hi: 'अंतिम भुगतान', timestamp: 'Pending', completed: false, description: 'Auto-release of verified funds to farmer bank account.' },
      ],
      payment_details: {
        method: 'e-NWR Escrow Virtual Vault',
        payer_vpa: buyerProfile ? `${buyerProfile.company_name.toLowerCase().replace(/\s+/g, '')}@icici` : 'buyer@icici',
      },
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }

    inMemoryDb.transactions.unshift(newTransaction)
    return newTransaction
  }

  static async getTransactionsForUser(userId: string, userRole: string) {
    if (userRole === 'ADMIN') {
      return inMemoryDb.transactions
    }
    return inMemoryDb.transactions.filter(t => t.farmer_id === userId || t.buyer_id === userId)
  }

  static async getTransactionById(transactionId: string, userId: string, userRole: string) {
    const txn = inMemoryDb.transactions.find(t => t.id === transactionId)
    if (!txn) {
      throw new Error(`Transaction not found with ID: ${transactionId}`)
    }

    if (userRole !== 'ADMIN' && txn.farmer_id !== userId && txn.buyer_id !== userId) {
      throw new Error('Unauthorized: You are not a party to this trade transaction.')
    }

    return txn
  }

  static async advanceStage(transactionId: string, userId: string, userRole: string, nextStage: TransactionStatus) {
    const txn = await this.getTransactionById(transactionId, userId, userRole)
    const now = new Date()
    const timeString = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    if (nextStage === 'In Transit') {
      // 1. Validate Escrow is funded
      if (txn.payment_status !== 'Payment Successful') {
        throw new Error(`Cannot dispatch produce: Escrow capital is not funded yet (current payment status: ${txn.payment_status}).`)
      }

      // 2. Validate Caller is Seller/Farmer or Admin
      if (userRole !== 'ADMIN' && txn.farmer_id !== userId) {
        throw new Error('Unauthorized: Only the seller/farmer who owns this produce lot can dispatch the shipment.')
      }

      // 3. Prevent double dispatch
      if (txn.transaction_status === 'In Transit' || txn.transaction_status === 'Delivered' || txn.transaction_status === 'Completed') {
        throw new Error(`Produce has already been dispatched (current status: ${txn.transaction_status}).`)
      }

      txn.transaction_status = 'In Transit'
      txn.dispatched_at = now.toISOString()
      txn.updated_at = now.toISOString()

      const stageObj = txn.timeline.find(s => s.stage === 'in_transit')
      if (stageObj) {
        stageObj.completed = true
        stageObj.timestamp = timeString
        stageObj.description = `Produce dispatched from farm-gate by ${txn.farmer_name}. Carrier in transit to delivery terminal.`
      }

      return txn
    }

    if (nextStage === 'Delivered') {
      // 1. Validate current status is In Transit
      if (txn.transaction_status !== 'In Transit') {
        throw new Error(`Cannot record terminal delivery: Shipment must be 'In Transit' first (current status: ${txn.transaction_status}).`)
      }

      // 2. Validate Caller is Buyer or Admin
      if (userRole !== 'ADMIN' && txn.buyer_id !== userId) {
        throw new Error('Unauthorized: Only the buyer can verify terminal delivery and gate assay.')
      }

      txn.transaction_status = 'Delivered'
      txn.delivered_at = now.toISOString()
      txn.updated_at = now.toISOString()

      const stageObj = txn.timeline.find(s => s.stage === 'delivered')
      if (stageObj) {
        stageObj.completed = true
        stageObj.timestamp = timeString
        stageObj.description = `Produce arrived at ${txn.mandi_or_delivery_location}. Gate assay inspection verified.`
      }

      return txn
    }

    if (nextStage === 'Completed') {
      // 1. Validate current status is Delivered or In Transit
      if (txn.transaction_status !== 'Delivered' && txn.transaction_status !== 'In Transit') {
        throw new Error(`Cannot complete escrow settlement: Produce must be delivered and verified first (current status: ${txn.transaction_status}).`)
      }

      // 2. Validate Caller is Buyer, Farmer, or Admin
      if (userRole !== 'ADMIN' && txn.buyer_id !== userId && txn.farmer_id !== userId) {
        throw new Error('Unauthorized: Only the buyer, seller, or platform administrator can authorize escrow settlement release.')
      }

      txn.transaction_status = 'Completed'
      txn.settled_at = now.toISOString()
      txn.updated_at = now.toISOString()

      // Ensure all prior timeline events are completed
      txn.timeline.forEach(s => {
        if (!s.completed) {
          s.completed = true
          s.timestamp = timeString
        }
      })

      const completedStage = txn.timeline.find(s => s.stage === 'completed')
      if (completedStage) {
        completedStage.description = `₹${txn.produce_value.toLocaleString('en-IN')} escrow payout disbursed to ${txn.farmer_name} linked bank account.`
      }

      return txn
    }

    txn.transaction_status = nextStage
    txn.updated_at = now.toISOString()
    return txn
  }
}

