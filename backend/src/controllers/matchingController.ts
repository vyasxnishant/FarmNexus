import { Response, NextFunction } from 'express'
import { MatchingService } from '../services/matchingService.js'
import { AuthRequest } from '../middleware/auth.js'

export class MatchingController {
  static async getMatchingLots(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyerId = req.user?.id
      const { crop, quantity, grade, maxPrice, location } = req.query

      const customFilters = crop ? {
        required_crop: crop as string,
        required_quantity_qtl: quantity ? Number(quantity) : undefined,
        preferred_grade: grade as string,
        preferred_location: location as string,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      } : undefined

      const result = await MatchingService.getMatchingLots(buyerId, customFilters)
      res.json({
        success: true,
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getRequirements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const reqs = await MatchingService.getBuyerRequirements(req.user.id)
      res.json({
        success: true,
        data: reqs,
      })
    } catch (err) {
      next(err)
    }
  }

  static async updateRequirements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const reqs = await MatchingService.updateBuyerRequirements(req.user.id, req.body)
      res.json({
        success: true,
        message: 'Buyer sourcing requirements updated.',
        data: reqs,
      })
    } catch (err) {
      next(err)
    }
  }
}
