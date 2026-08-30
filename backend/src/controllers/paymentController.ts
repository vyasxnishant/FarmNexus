import { Request, Response, NextFunction } from 'express'
import { PaymentService } from '../services/paymentService.js'
import { AuthRequest } from '../middleware/auth.js'

export class PaymentController {
  /**
   * Return public gateway config (Key ID only)
   */
  static getPaymentConfig(req: Request, res: Response): void {
    const configData = PaymentService.getPaymentConfig()
    res.json({
      success: true,
      data: configData,
    })
  }

  /**
   * Create Razorpay Order
   */
  static async createPaymentOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const { transactionId, method } = req.body
      if (!transactionId) {
        res.status(400).json({ success: false, message: 'transactionId is required.' })
        return
      }

      const order = await PaymentService.createPaymentOrder(transactionId, req.user.id, method)
      res.status(201).json({
        success: true,
        message: 'Razorpay payment order initiated.',
        data: order,
      })
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to create payment order.' })
    }
  }

  /**
   * Complete Razorpay Sandbox Test Payment with server-side signature verification
   */
  static async processSandboxPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const { transactionId, paymentMethod, payerVpa } = req.body
      if (!transactionId) {
        res.status(400).json({ success: false, message: 'transactionId is required.' })
        return
      }

      const result = await PaymentService.processSandboxPayment(
        transactionId,
        req.user.id,
        paymentMethod || 'RAZORPAY_SANDBOX',
        payerVpa
      )

      res.json({
        success: true,
        message: 'Razorpay test payment verified and funds secured in Escrow Vault.',
        data: result,
      })
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Payment processing failed.',
      })
    }
  }

  /**
   * Verify Razorpay payment cryptographic signature
   */
  static async verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        transactionId,
        orderId,
        razorpay_order_id,
        paymentId,
        razorpay_payment_id,
        signature,
        razorpay_signature,
        payerVpa,
      } = req.body

      const finalOrderId = razorpay_order_id || orderId
      const finalPaymentId = razorpay_payment_id || paymentId
      const finalSignature = razorpay_signature || signature

      if (!transactionId || !finalOrderId || !finalPaymentId || !finalSignature) {
        res.status(400).json({
          success: false,
          message: 'transactionId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required for cryptographic verification.',
        })
        return
      }

      const result = await PaymentService.verifyPayment({
        transactionId,
        razorpay_order_id: finalOrderId,
        razorpay_payment_id: finalPaymentId,
        razorpay_signature: finalSignature,
        payerVpa,
      })

      res.json({
        success: true,
        message: 'Payment verified and secured in Escrow Vault.',
        data: result,
      })
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Payment signature verification failed.',
      })
    }
  }

  /**
   * Webhook callback
   */
  static async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = (req.headers['x-razorpay-signature'] || req.headers['x-farmnexus-signature']) as string
      const result = await PaymentService.handleWebhook(req.body, signature)
      res.json(result)
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message })
    }
  }

  /**
   * Get single payment record
   */
  static async getPaymentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const payment = await PaymentService.getPaymentById(id)
      res.json({
        success: true,
        data: payment,
      })
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message })
    }
  }

  /**
   * Get all payments (Admin oversight)
   */
  static async getAllPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await PaymentService.getAllPayments()
      res.json({
        success: true,
        data: payments,
      })
    } catch (err: any) {
      next(err)
    }
  }
}
