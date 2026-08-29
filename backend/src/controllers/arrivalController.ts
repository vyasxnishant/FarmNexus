import { Request, Response, NextFunction } from 'express'
import { MarketDataRepository } from '../services/marketDataRepository.js'

export class ArrivalController {
  // GET /api/market-arrivals
  static async getMarketArrivals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const market = req.query.market as string | undefined
      const commodity = req.query.commodity as string | undefined

      const arrivals = await MarketDataRepository.findArrivals(market, commodity)

      res.json({
        success: true,
        count: arrivals.length,
        data: arrivals,
      })
    } catch (error) {
      next(error)
    }
  }
}

