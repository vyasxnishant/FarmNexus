import { Request, Response, NextFunction } from 'express'
import { MarketDataRepository } from '../services/marketDataRepository.js'

export class MarketController {
  // GET /api/markets
  static async getMarkets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = req.query.state as string | undefined
      const district = req.query.district as string | undefined

      const markets = await MarketDataRepository.findMarkets(state, district)

      res.json({
        success: true,
        count: markets.length,
        data: markets,
      })
    } catch (error) {
      next(error)
    }
  }
}

