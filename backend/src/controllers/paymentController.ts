import { Request, Response, NextFunction } from 'express'
import { PaymentService } from '../services/paymentService.js'
import { AuthRequest } from '../middleware/auth.js'

export class PaymentController {
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
        message: 'Escrow payment order initiated.',
        data: order,
      })
    } catch (err) {
      next(err)
    }
  }

  static async verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transactionId, orderId, referenceId, payerVpa } = req.body
      if (!transactionId || !orderId || !referenceId) {
        res.status(400).json({
          success: false,
          message: 'transactionId, orderId, and referenceId are required for verification.',
        })
        return
      }

      const result = await PaymentService.verifyPayment({
        transactionId,
        orderId,
        referenceId,
        payerVpa,
      })

      res.json({
        success: true,
        message: 'Payment verified and secured in FarmNexus ICICI Escrow Sub-Ledger.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-farmnexus-signature'] as string
      const result = await PaymentService.handleWebhook(req.body, signature)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  static async getPaymentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const payment = await PaymentService.getPaymentById(id)
      res.json({
        success: true,
        data: payment,
      })
    } catch (err) {
      next(err)
    }
  }
}
