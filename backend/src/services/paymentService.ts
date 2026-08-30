import crypto from 'crypto'
import { config } from '../config/env.js'
import { inMemoryDb } from '../config/db.js'
import { PaymentRecord, Transaction } from '../models/types.js'

export class PaymentService {
  static async createPaymentOrder(transactionId: string, userId: string, method: string = 'e-NWR Escrow') {
    const txn = inMemoryDb.transactions.find(t => t.id === transactionId)
    if (!txn) {
      throw new Error(`Transaction not found with ID: ${transactionId}`)
    }

    if (txn.buyer_id !== userId && txn.farmer_id !== userId) {
      const user = inMemoryDb.users.find(u => u.id === userId)
      if (user?.user_type !== 'ADMIN') {
        throw new Error('Unauthorized to initiate payment on this transaction.')
      }
    }

    const orderId = `ORDER-FN-${Date.now().toString().slice(-6)}`
    const escrowVirtualAccount = `ESC-ICICI-VPA-${txn.id.replace(/-/g, '')}`
    const referenceId = `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    const now = new Date().toISOString()

    const paymentRecord: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      transaction_id: txn.id,
      order_id: orderId,
      amount: txn.final_amount,
      currency: 'INR',
      status: 'Payment Processing',
      payment_method: method,
      reference_id: referenceId,
      escrow_virtual_account: escrowVirtualAccount,
      payer_vpa: txn.payment_details?.payer_vpa,
      created_at: now,
      updated_at: now,
    }

    inMemoryDb.payments.unshift(paymentRecord)

    return {
      orderId,
      amount: txn.final_amount,
      currency: 'INR',
      transactionId: txn.id,
      escrowVirtualAccount,
      referenceId,
      method,
      beneficiary: {
        farmerName: txn.farmer_name,
        farmerLocation: txn.farmer_location,
      },
    }
  }

  static async verifyPayment(data: {
    transactionId: string
    orderId: string
    referenceId: string
    payerVpa?: string
  }) {
    const txn = inMemoryDb.transactions.find(t => t.id === data.transactionId)
    if (!txn) {
      throw new Error(`Transaction not found with ID: ${data.transactionId}`)
    }

    // Backend verification
    const payment = inMemoryDb.payments.find(p => p.order_id === data.orderId || p.transaction_id === data.transactionId)

    const now = new Date()
    const timeString = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    // Update payment record
    if (payment) {
      payment.status = 'Payment Successful'
      payment.paid_at = now.toISOString()
      payment.updated_at = now.toISOString()
    }

    // Update Transaction
    txn.payment_status = 'Payment Successful'
    txn.transaction_status = txn.transaction_status === 'Payment Pending' ? 'Payment Completed' : txn.transaction_status
    txn.payment_details = {
      method: payment ? payment.payment_method : 'e-NWR Escrow Virtual Vault',
      transaction_ref: data.referenceId || `ESC-REF-${Date.now().toString().slice(-5)}`,
      payer_vpa: data.payerVpa || txn.payment_details?.payer_vpa || 'buyer@icici',
      paid_at: timeString,
      escrow_ref: `ESC-VAULT-${txn.id}`,
    }
    txn.updated_at = now.toISOString()

    // Mark Escrow Funded stage in timeline
    const escrowStage = txn.timeline.find(s => s.stage === 'escrow_funded')
    if (escrowStage) {
      escrowStage.completed = true
      escrowStage.timestamp = timeString
      escrowStage.description = `₹${txn.final_amount.toLocaleString('en-IN')} secured in FarmNexus ICICI Escrow Sub-Ledger.`
    }

    return {
      verified: true,
      transactionId: txn.id,
      paymentStatus: txn.payment_status,
      transactionStatus: txn.transaction_status,
      finalAmount: txn.final_amount,
      escrowReference: txn.payment_details.escrow_ref,
      timestamp: timeString,
    }
  }

  static async handleWebhook(payload: any, signature?: string) {
    if (!payload || !payload.transactionId) {
      return { received: false, error: 'Invalid webhook payload structure.' }
    }

    // If webhook secret configured, verify HMAC signature
    if (config.paymentWebhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', config.paymentWebhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex')
      if (signature !== expectedSignature) {
        throw new Error('Invalid payment webhook signature.')
      }
    }

    const { transactionId, orderId, referenceId, status } = payload

    if (status === 'SUCCESS' || status === 'PAID') {
      const result = await this.verifyPayment({
        transactionId,
        orderId: orderId || 'WEBHOOK-ORDER',
        referenceId: referenceId || `WH-${Date.now().toString().slice(-4)}`,
      })
      return { received: true, processed: true, result }
    }

    // Failed or Cancelled Webhook
    const txn = inMemoryDb.transactions.find(t => t.id === transactionId)
    if (txn && status === 'FAILED') {
      txn.payment_status = 'Payment Failed'
      txn.updated_at = new Date().toISOString()
    }

    return { received: true, processed: false, status: status || 'FAILED' }
  }

  static async getPaymentById(paymentId: string) {
    const payment = inMemoryDb.payments.find(p => p.id === paymentId || p.transaction_id === paymentId)
    if (!payment) {
      throw new Error(`Payment record not found for ID: ${paymentId}`)
    }
    return payment
  }
}

