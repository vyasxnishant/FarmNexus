import { Response, NextFunction } from 'express'
import { TransactionService } from '../services/transactionService.js'
import { AuthRequest } from '../middleware/auth.js'

export class TransactionController {
  static async getMyTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const txns = await TransactionService.getTransactionsForUser(req.user.id, req.user.user_type)
      res.json({
        success: true,
        count: txns.length,
        data: txns,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getTransactionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const txn = await TransactionService.getTransactionById(id, req.user.id, req.user.user_type)
      res.json({
        success: true,
        data: txn,
      })
    } catch (err) {
      next(err)
    }
  }

  static async advanceStage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const stage = req.body.nextStage || req.body.transaction_status || req.body.status
      if (!stage) {
        res.status(400).json({ success: false, message: 'nextStage or transaction_status parameter is required.' })
        return
      }

      const txn = await TransactionService.advanceStage(id, req.user.id, req.user.user_type, stage)
      res.json({
        success: true,
        message: `Transaction stage advanced to '${stage}'.`,
        data: txn,
      })
    } catch (err) {
      next(err)
    }
  }
}

