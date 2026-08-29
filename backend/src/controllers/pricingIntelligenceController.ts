import { Request, Response, NextFunction } from 'express'
import { PricingIntelligenceService } from '../services/pricingIntelligenceService.js'

export class PricingIntelligenceController {
  static async getPriceIntelligence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lotId = req.params.lotId as string
      const result = await PricingIntelligenceService.calculatePriceIntelligence(lotId)
      res.json({
        success: true,
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }
}

