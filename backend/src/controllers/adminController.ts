import { Response, NextFunction } from 'express'
import { AdminService } from '../services/adminService.js'
import { AuthRequest } from '../middleware/auth.js'
import { inMemoryDb } from '../config/db.js'

export class AdminController {
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await AdminService.getUsers()
      res.json({
        success: true,
        count: users.length,
        data: users,
      })
    } catch (err) {
      next(err)
    }
  }

  static async verifyUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const adminName = req.user?.name || 'State Operations Desk'
      const user = await AdminService.verifyUserKyc(id, adminName)
      res.json({
        success: true,
        message: 'User KYC verified successfully.',
        data: user,
      })
    } catch (err) {
      next(err)
    }
  }

  static async suspendUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const adminName = req.user?.name || 'State Operations Desk'
      const user = await AdminService.updateUserStatus(id, 'Suspended', adminName)
      res.json({
        success: true,
        message: 'User suspended.',
        data: user,
      })
    } catch (err) {
      next(err)
    }
  }

  static async activateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const adminName = req.user?.name || 'State Operations Desk'
      const user = await AdminService.updateUserStatus(id, 'Active', adminName)
      res.json({
        success: true,
        message: 'User activated.',
        data: user,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getLots(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        count: inMemoryDb.lots.length,
        data: inMemoryDb.lots,
      })
    } catch (err) {
      next(err)
    }
  }

  static async flagLot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const { reason } = req.body
      const adminName = req.user?.name || 'State Operations Desk'
      const lot = await AdminService.flagLot(id, reason, adminName)
      res.json({
        success: true,
        message: 'Lot flagged for review.',
        data: lot,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getOffers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        count: inMemoryDb.offers.length,
        data: inMemoryDb.offers,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        count: inMemoryDb.transactions.length,
        data: inMemoryDb.transactions,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        count: inMemoryDb.transactions.length,
        data: inMemoryDb.transactions.map(t => ({
          transactionId: t.id,
          farmerName: t.farmer_name,
          buyerOrganization: t.buyer_organization,
          finalAmount: t.final_amount,
          paymentStatus: t.payment_status,
          paymentDetails: t.payment_details,
          createdDate: t.created_at,
        })),
      })
    } catch (err) {
      next(err)
    }
  }

  static async getActivityLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AdminService.getActivityLogs()
      res.json({
        success: true,
        count: logs.length,
        data: logs,
      })
    } catch (err) {
      next(err)
    }
  }

  static async addMarketPrice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminName = req.user?.name || 'State Operations Desk'
      const price = await AdminService.addMarketPrice(req.body, adminName)
      res.status(201).json({
        success: true,
        message: 'Market price published.',
        data: price,
      })
    } catch (err) {
      next(err)
    }
  }

  static async updateMarketPrice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const adminName = req.user?.name || 'State Operations Desk'
      const price = await AdminService.updateMarketPrice(id, req.body, adminName)
      res.json({
        success: true,
        message: 'Market price updated.',
        data: price,
      })
    } catch (err) {
      next(err)
    }
  }

  static async deleteMarketPrice(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const adminName = req.user?.name || 'State Operations Desk'
      const result = await AdminService.deleteMarketPrice(id, adminName)
      res.json({
        success: true,
        message: 'Market price removed.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }
}
