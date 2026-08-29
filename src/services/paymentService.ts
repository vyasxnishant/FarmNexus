/**
 * FarmNexus Payment & Escrow Service
 * 
 * ARCHITECTURE NOTE:
 * - In production, this service communicates with the secure FarmNexus backend
 *   (POST /api/payments/create, POST /api/payments/verify, POST /api/payments/webhook).
 * - No API secret keys, gateway credentials, or private webhook signatures are ever
 *   stored or processed on the client side.
 * - This client service provides a robust, backend-ready interface with mock sandbox
 *   simulation for hackathon / demo environments without transferring real money.
 */

export type PaymentGatewayProvider = 'RAZORPAY_SANDBOX' | 'UPI_DIRECT' | 'E_NWR_ESCROW' | 'BANK_NEFT'

export type PaymentStatusType = 
  | 'Payment Pending' 
  | 'Payment Processing' 
  | 'Payment Successful' 
  | 'Payment Failed' 
  | 'Payment Refunded'

export type TransactionStatusType =
  | 'Payment Pending'
  | 'Payment Completed'
  | 'In Transit'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled'

export interface CreatePaymentOrderRequest {
  transactionId: string
  lotId: string
  amount: number
  currency: 'INR'
  buyerId: string
  buyerName: string
  buyerEmail?: string
  buyerPhone?: string
  paymentMethod: 'UPI' | 'NetBanking' | 'e-NWR Escrow' | 'RTGS/NEFT'
}

export interface CreatePaymentOrderResponse {
  orderId: string
  transactionId: string
  amount: number
  currency: 'INR'
  status: 'created' | 'failed'
  razorpayOrderId?: string
  escrowVirtualAccount?: string
  createdAt: string
  expiresAt: string
}

export interface VerifyPaymentRequest {
  transactionId: string
  orderId: string
  paymentId: string
  signature?: string
  paymentMethod: 'UPI' | 'NetBanking' | 'e-NWR Escrow' | 'RTGS/NEFT'
  payerVpa?: string
}

export interface VerifyPaymentResponse {
  success: boolean
  transactionId: string
  paymentId: string
  paymentStatus: PaymentStatusType
  transactionStatus: TransactionStatusType
  verifiedAt: string
  escrowReference: string
  message: string
}

export interface PaymentWebhookPayload {
  event: 'payment.authorized' | 'payment.captured' | 'payment.failed' | 'escrow.settled'
  paymentId: string
  orderId: string
  transactionId: string
  amount: number
  currency: 'INR'
  timestamp: number
  signature: string
}

/**
 * Initiates an escrow deposit order
 */
export async function createPaymentOrder(
  request: CreatePaymentOrderRequest
): Promise<CreatePaymentOrderResponse> {
  // Simulating backend call: POST /api/payments/create
  await new Promise(resolve => setTimeout(resolve, 600))

  if (request.amount <= 0) {
    throw new Error('Invalid payment amount. Produce value must be greater than zero.')
  }

  const orderId = `ORD-ESC-${Math.floor(Math.random() * 900000 + 100000)}`
  const now = new Date()
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return {
    orderId,
    transactionId: request.transactionId,
    amount: request.amount,
    currency: 'INR',
    status: 'created',
    escrowVirtualAccount: `FARMNEXUS.ESCROW.${request.transactionId.replace(/[^a-zA-Z0-9]/g, '')}@icici`,
    createdAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
  }
}

/**
 * Verifies the payment transaction via backend verification simulation
 */
export async function verifyPayment(
  request: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  // Simulating backend verification call: POST /api/payments/verify
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Simulate network check / signature verification
  const isDuplicate = false // backend duplicate prevention check
  if (isDuplicate) {
    throw new Error('Duplicate payment attempt detected for this transaction.')
  }

  const escrowRef = `ESC-TRX-${Math.floor(Math.random() * 8000000 + 1000000)}`

  return {
    success: true,
    transactionId: request.transactionId,
    paymentId: request.paymentId,
    paymentStatus: 'Payment Successful',
    transactionStatus: 'Payment Completed',
    verifiedAt: new Date().toISOString(),
    escrowReference: escrowRef,
    message: 'Payment verified and funds successfully secured in FarmNexus Escrow Account.',
  }
}
