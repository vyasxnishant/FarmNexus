import { paymentApi } from './apiServices'

/**
 * FarmNexus Payment & Escrow Service
 * 
 * All payment orders and signature verifications are strictly performed by the backend server.
 * No client-side payment forgery or fake success status changes are permitted.
 */

export type PaymentGatewayProvider = 'RAZORPAY' | 'RAZORPAY_SANDBOX' | 'UPI_DIRECT' | 'E_NWR_ESCROW' | 'BANK_NEFT'

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
  lotId?: string
  amount?: number
  currency?: 'INR'
  buyerId?: string
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  paymentMethod?: string
}

export interface CreatePaymentOrderResponse {
  orderId: string
  transactionId: string
  amount: number
  amountInPaise: number
  currency: 'INR'
  keyId: string
  escrowVirtualAccount: string
  buyer: {
    id: string
    name: string
    organization?: string
  }
  produce: {
    crop: string
    quantityQtl: number
    unit: string
  }
}

export interface VerifyPaymentRequest {
  transactionId: string
  orderId: string
  paymentId: string
  signature: string
  payerVpa?: string
}

export interface VerifyPaymentResponse {
  verified: boolean
  transactionId: string
  paymentId: string
  gatewayPaymentId: string
  gatewayOrderId: string
  amount: number
  currency: string
  paymentStatus: PaymentStatusType
  transactionStatus: TransactionStatusType
  escrowReference: string
  paidAt: string
  buyer: string
  farmer: string
  crop: string
  quantityQtl?: number
}

/**
 * Initiates an escrow deposit order on the backend with server-computed amount
 */
export async function createPaymentOrder(
  request: CreatePaymentOrderRequest
): Promise<CreatePaymentOrderResponse> {
  const res = await paymentApi.createOrder(request.transactionId, request.paymentMethod || 'RAZORPAY')
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to create payment order on backend.')
  }
  return res.data
}

/**
 * Verifies the payment transaction via backend cryptographic HMAC SHA-256 signature verification
 */
export async function verifyPayment(
  request: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  const res = await paymentApi.verify({
    transactionId: request.transactionId,
    razorpay_order_id: request.orderId,
    razorpay_payment_id: request.paymentId,
    razorpay_signature: request.signature,
    payerVpa: request.payerVpa,
  })

  if (!res.success || !res.data || !res.data.verified) {
    throw new Error(res.message || 'Cryptographic payment verification failed on server.')
  }

  return res.data
}

/**
 * Executes server-signed sandbox test payment verification
 */
export async function processSandboxPayment(payload: {
  transactionId: string
  paymentMethod?: string
  payerVpa?: string
}): Promise<VerifyPaymentResponse> {
  const res = await paymentApi.processSandbox(payload)
  if (!res.success || !res.data || !res.data.verified) {
    throw new Error(res.message || 'Server sandbox payment verification failed.')
  }
  return res.data
}
