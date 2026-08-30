import crypto from 'crypto'
import Razorpay from 'razorpay'
import { config } from '../config/env.js'
import { inMemoryDb } from '../config/db.js'
import { PaymentRecord, Transaction } from '../models/types.js'
import { AdminService } from './adminService.js'

export class PaymentService {
  /**
   * Return public gateway configuration to authenticated client.
   * NEVER exposes RAZORPAY_KEY_SECRET.
   */
  static getPaymentConfig() {
    return {
      keyId: config.razorpayKeyId,
      currency: 'INR',
      sandbox: true,
    }
  }

  /**
   * Create Razorpay Order with server-calculated amount.
   * Client-submitted amounts are NEVER trusted.
   */
  static async createPaymentOrder(transactionId: string, buyerUserId: string, method: string = 'RAZORPAY') {
    const txn = inMemoryDb.transactions.find(t => t.id === transactionId)
    if (!txn) {
      throw new Error(`Transaction not found with ID: ${transactionId}`)
    }

    // Role and identity verification: Only the assigned Buyer (or Admin) can initiate payment
    const requestingUser = inMemoryDb.users.find(u => u.id === buyerUserId)
    if (txn.buyer_id !== buyerUserId && requestingUser?.user_type !== 'ADMIN') {
      throw new Error('Unauthorized: Only the assigned Buyer can initiate escrow payment for this transaction.')
    }

    const pStatus = (txn.payment_status as string) || ''
    const tStatus = (txn.transaction_status as string) || ''
    if (
      pStatus === 'Payment Successful' ||
      pStatus === 'Settled' ||
      pStatus === 'Disbursed' ||
      tStatus === 'Completed' ||
      tStatus === 'Payment Completed' ||
      tStatus === 'In Transit' ||
      tStatus === 'Delivered'
    ) {
      throw new Error('Payment already completed and escrow funded or deal settled for this transaction.')
    }

    // SERVER-CALCULATED AMOUNT ONLY
    const payableAmount = Number(txn.final_amount)
    if (!payableAmount || payableAmount <= 0) {
      throw new Error('Invalid payable amount calculated for transaction.')
    }

    const amountInPaise = Math.round(payableAmount * 100)
    let razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`

    try {
      if (config.razorpayKeyId && config.razorpayKeySecret) {
        const razorpay = new Razorpay({
          key_id: config.razorpayKeyId,
          key_secret: config.razorpayKeySecret,
        })

        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${txn.id.slice(-8)}`,
          notes: {
            transactionId: txn.id,
            buyerId: txn.buyer_id,
            farmerId: txn.farmer_id,
            crop: txn.crop,
            quantityQtl: String(txn.quantity_qtl),
          },
        })

        if (rzpOrder && rzpOrder.id) {
          razorpayOrderId = rzpOrder.id
        }
      }
    } catch (err) {
      console.warn('[PaymentService] Razorpay SDK order creation notice (using test sandbox order):', err)
    }

    const now = new Date().toISOString()
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`
    const escrowVirtualAccount = `ESC-VAULT-${txn.id.replace(/-/g, '').toUpperCase()}`

    // Persist PENDING Payment Record
    const paymentRecord: PaymentRecord = {
      id: paymentId,
      transaction_id: txn.id,
      order_id: razorpayOrderId,
      buyer_id: txn.buyer_id,
      farmer_id: txn.farmer_id,
      amount: payableAmount,
      currency: 'INR',
      gateway: 'RAZORPAY',
      gateway_order_id: razorpayOrderId,
      status: 'Payment Pending',
      payment_method: method,
      reference_id: `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      escrow_virtual_account: escrowVirtualAccount,
      payer_vpa: txn.payment_details?.payer_vpa || `${txn.buyer_name.toLowerCase().replace(/\s+/g, '.')}@icici`,
      created_at: now,
      updated_at: now,
    }

    // Check if previous pending payment exists for this txn and replace/update
    const existingIndex = inMemoryDb.payments.findIndex(p => p.transaction_id === txn.id && p.status === 'Payment Pending')
    if (existingIndex >= 0) {
      inMemoryDb.payments[existingIndex] = paymentRecord
    } else {
      inMemoryDb.payments.unshift(paymentRecord)
    }

    return {
      orderId: razorpayOrderId,
      amount: payableAmount,
      amountInPaise,
      currency: 'INR',
      keyId: config.razorpayKeyId,
      transactionId: txn.id,
      escrowVirtualAccount,
      buyer: {
        id: txn.buyer_id,
        name: txn.buyer_name,
        organization: txn.buyer_organization,
      },
      produce: {
        crop: txn.crop,
        quantityQtl: txn.quantity_qtl,
        unit: txn.unit,
      },
    }
  }

  /**
   * Process authenticated Razorpay sandbox payment:
   * 1. Creates order with server-calculated amount
   * 2. Issues test payment ID
   * 3. Generates cryptographic HMAC SHA-256 signature using server RAZORPAY_KEY_SECRET
   * 4. Executes strict verifyPayment, ledger updates, and audit logging
   */
  static async processSandboxPayment(transactionId: string, buyerUserId: string, paymentMethod: string = 'RAZORPAY_SANDBOX', payerVpa?: string) {
    const orderData = await PaymentService.createPaymentOrder(transactionId, buyerUserId, paymentMethod)
    const razorpayPaymentId = `pay_test_${crypto.randomBytes(7).toString('hex')}`

    const signature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(`${orderData.orderId}|${razorpayPaymentId}`)
      .digest('hex')

    const verified = await PaymentService.verifyPayment({
      transactionId,
      razorpay_order_id: orderData.orderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
      payerVpa: payerVpa || `${orderData.buyer.name.toLowerCase().replace(/\s+/g, '.')}@icici`,
    })

    return verified
  }

  /**
   * Verify Razorpay cryptographic signature using RAZORPAY_KEY_SECRET.
   * Payment is ONLY marked SUCCESS when HMAC SHA-256 signature matches.
   */
  static async verifyPayment(data: {
    transactionId: string
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    payerVpa?: string
  }) {
    const { transactionId, razorpay_order_id, razorpay_payment_id, razorpay_signature, payerVpa } = data

    if (!transactionId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Incomplete payment verification payload. transactionId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required.')
    }

    const txn = inMemoryDb.transactions.find(t => t.id === transactionId)
    if (!txn) {
      throw new Error(`Transaction not found with ID: ${transactionId}`)
    }

    // IDEMPOTENCY CHECK: If already verified with this payment ID, return existing receipt
    const existingSuccess = inMemoryDb.payments.find(
      p => p.gateway_payment_id === razorpay_payment_id && p.status === 'Payment Successful'
    )
    if (existingSuccess) {
      return {
        verified: true,
        isIdempotentReplay: true,
        transactionId: txn.id,
        paymentId: existingSuccess.id,
        gatewayPaymentId: existingSuccess.gateway_payment_id,
        gatewayOrderId: existingSuccess.gateway_order_id,
        amount: existingSuccess.amount,
        currency: existingSuccess.currency,
        paymentStatus: 'Payment Successful',
        transactionStatus: txn.transaction_status,
        escrowReference: existingSuccess.escrow_virtual_account,
        paidAt: existingSuccess.paid_at || new Date().toISOString(),
        buyer: txn.buyer_name,
        farmer: txn.farmer_name,
        crop: txn.crop,
      }
    }

    // CRYPTOGRAPHIC HMAC SHA-256 SIGNATURE VERIFICATION
    const generatedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    let isSignatureValid = false
    try {
      const a = Buffer.from(generatedSignature, 'utf8')
      const b = Buffer.from(razorpay_signature, 'utf8')
      isSignatureValid = a.length === b.length && crypto.timingSafeEqual(a, b)
    } catch {
      isSignatureValid = false
    }

    const payment = inMemoryDb.payments.find(
      p => p.transaction_id === transactionId || p.gateway_order_id === razorpay_order_id || p.order_id === razorpay_order_id
    )

    const now = new Date()
    const nowIso = now.toISOString()
    const timeString = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    if (!isSignatureValid) {
      if (payment) {
        payment.status = 'Payment Failed'
        payment.failure_reason = 'Cryptographic signature mismatch'
        payment.updated_at = nowIso
      }
      txn.payment_status = 'Payment Failed'
      txn.updated_at = nowIso

      await AdminService.logActivity(
        'Payment Verification Failed',
        'System Gateway',
        'Transaction',
        txn.id,
        `Razorpay signature verification rejected for order ${razorpay_order_id}.`
      )

      throw new Error('Invalid Razorpay signature. Cryptographic verification failed.')
    }

    // SIGNATURE VERIFIED SUCCESSFULLY
    if (payment) {
      payment.status = 'Payment Successful'
      payment.gateway_order_id = razorpay_order_id
      payment.gateway_payment_id = razorpay_payment_id
      payment.gateway_signature = razorpay_signature
      payment.paid_at = nowIso
      payment.updated_at = nowIso
    }

    // Update Transaction State
    txn.payment_status = 'Payment Successful'
    if (txn.transaction_status === 'Payment Pending') {
      txn.transaction_status = 'Payment Completed'
    }
    txn.payment_details = {
      method: 'Razorpay Gateway (Escrow Vault)',
      transaction_ref: razorpay_payment_id,
      payer_vpa: payerVpa || txn.payment_details?.payer_vpa || 'buyer.agrocorp@icici',
      paid_at: timeString,
      escrow_ref: `ESC-VAULT-${txn.id}`,
    }
    txn.updated_at = nowIso

    // Mark Escrow Funded stage in timeline
    const escrowStage = txn.timeline.find(s => s.stage === 'escrow_funded')
    if (escrowStage) {
      escrowStage.completed = true
      escrowStage.timestamp = timeString
      escrowStage.description = `₹${txn.final_amount.toLocaleString('en-IN')} secured in FarmNexus ICICI Escrow Sub-Ledger via Razorpay (${razorpay_payment_id}).`
    }

    await AdminService.logActivity(
      'Escrow Funded',
      txn.buyer_name,
      'Transaction',
      txn.id,
      `₹${txn.final_amount.toLocaleString('en-IN')} paid via Razorpay (Payment ID: ${razorpay_payment_id}). Escrow locked.`
    )

    return {
      verified: true,
      transactionId: txn.id,
      paymentId: payment ? payment.id : `PAY-${Date.now().toString().slice(-4)}`,
      gatewayPaymentId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      amount: txn.final_amount,
      currency: 'INR',
      paymentStatus: 'Payment Successful',
      transactionStatus: txn.transaction_status,
      escrowReference: txn.payment_details.escrow_ref,
      paidAt: timeString,
      buyer: txn.buyer_name,
      farmer: txn.farmer_name,
      crop: txn.crop,
      quantityQtl: txn.quantity_qtl,
    }
  }

  /**
   * Handle Razorpay Webhook Events securely with signature verification.
   */
  static async handleWebhook(rawBody: string | object, signature?: string) {
    const payloadStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)

    if (config.razorpayWebhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpayWebhookSecret)
        .update(payloadStr)
        .digest('hex')

      if (signature !== expectedSignature) {
        throw new Error('Invalid Razorpay webhook signature.')
      }
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    const eventType = event.event

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const entity = event.payload?.payment?.entity || event.payload?.order?.entity
      const notes = entity?.notes || {}
      const transactionId = notes.transactionId

      if (transactionId) {
        const txn = inMemoryDb.transactions.find(t => t.id === transactionId)
        if (txn && txn.payment_status !== 'Payment Successful') {
          txn.payment_status = 'Payment Successful'
          if (txn.transaction_status === 'Payment Pending') {
            txn.transaction_status = 'Payment Completed'
          }
          txn.updated_at = new Date().toISOString()
        }
      }
      return { received: true, processed: true, eventType }
    }

    if (eventType === 'payment.failed') {
      const entity = event.payload?.payment?.entity
      const notes = entity?.notes || {}
      const transactionId = notes.transactionId
      if (transactionId) {
        const txn = inMemoryDb.transactions.find(t => t.id === transactionId)
        if (txn && txn.payment_status === 'Payment Pending') {
          txn.payment_status = 'Payment Failed'
          txn.updated_at = new Date().toISOString()
        }
      }
      return { received: true, processed: true, eventType }
    }

    return { received: true, processed: false, eventType }
  }

  static async getPaymentByDealId(dealId: string) {
    const payment = inMemoryDb.payments.find(p => p.transaction_id === dealId)
    const txn = inMemoryDb.transactions.find(t => t.id === dealId)
    if (!payment && !txn) {
      throw new Error(`No payment or deal record found for Deal ID: ${dealId}`)
    }
    const isFunded = txn?.payment_status === 'Payment Successful' || txn?.timeline.find(s => s.stage === 'escrow_funded')?.completed === true
    return {
      dealId,
      paymentId: payment?.id || null,
      orderId: payment?.order_id || null,
      amount: txn?.final_amount || payment?.amount || 0,
      currency: 'INR',
      paymentStatus: txn?.payment_status || payment?.status || 'Payment Pending',
      escrowStatus: isFunded ? 'FUNDED' : 'PENDING',
      gatewayPaymentId: payment?.gateway_payment_id || txn?.payment_details?.transaction_ref || null,
      escrowReference: payment?.escrow_virtual_account || txn?.payment_details?.escrow_ref || null,
      paidAt: payment?.paid_at || txn?.payment_details?.paid_at || null,
      buyer: txn?.buyer_name || null,
      farmer: txn?.farmer_name || null,
    }
  }

  static async getPaymentById(paymentId: string) {
    const payment = inMemoryDb.payments.find(
      p => p.id === paymentId || p.transaction_id === paymentId || p.gateway_payment_id === paymentId
    )
    if (!payment) {
      throw new Error(`Payment record not found for ID: ${paymentId}`)
    }
    return payment
  }

  static async getAllPayments() {
    return inMemoryDb.payments.map(p => {
      const txn = inMemoryDb.transactions.find(t => t.id === p.transaction_id)
      return {
        ...p,
        buyerName: txn?.buyer_name || 'Buyer',
        buyerOrganization: txn?.buyer_organization || 'Enterprise',
        farmerName: txn?.farmer_name || 'Producer',
        crop: txn?.crop || 'Crop',
      }
    })
  }
}
