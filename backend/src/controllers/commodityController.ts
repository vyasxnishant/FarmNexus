import { Request, Response, NextFunction } from 'express'
import { MarketDataRepository } from '../services/marketDataRepository.js'

export class CommodityController {
  // GET /api/commodities
  static async getCommodities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commodities = await MarketDataRepository.findCommodities()

      res.json({
        success: true,
        count: commodities.length,
        data: commodities,
      })
    } catch (error) {
      next(error)
    }
  }
}

