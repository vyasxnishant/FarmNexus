import { Request, Response, NextFunction } from 'express'
import { MarketDataRepository } from '../services/marketDataRepository.js'
import { AgmarknetService } from '../services/agmarknetService.js'
import { MarketPriceFilter } from '../models/types.js'

export class MarketPriceController {
  // GET /api/market-prices
  static async getMarketPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AgmarknetService.ensureFreshData()

      const filter: MarketPriceFilter = {
        state: req.query.state as string | undefined,
        district: req.query.district as string | undefined,
        market: req.query.market as string | undefined,
        commodity: req.query.commodity as string | undefined,
        variety: req.query.variety as string | undefined,
        date: req.query.date as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      }

      const { records, total } = await MarketDataRepository.findPrices(filter)

      res.json({
        success: true,
        count: records.length,
        total,
        limit: filter.limit,
        offset: filter.offset,
        last_sync: AgmarknetService.getLastSyncTime(),
        data: records,
      })
    } catch (error) {
      next(error)
    }
  }

  // GET /api/market-prices/latest
  static async getLatestPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AgmarknetService.ensureFreshData()
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      const records = await MarketDataRepository.findLatestPrices(limit)

      res.json({
        success: true,
        count: records.length,
        data: records,
      })
    } catch (error) {
      next(error)
    }
  }

  // GET /api/market-prices/trends
  static async getPriceTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AgmarknetService.ensureFreshData()
      const commodity = req.query.commodity as string | undefined
      const market = req.query.market as string | undefined

      const trends = await MarketDataRepository.findPriceTrends(commodity, market)

      res.json({
        success: true,
        count: trends.length,
        data: trends,
      })
    } catch (error) {
      next(error)
    }
  }

  // POST /api/market-prices/sync
  static async triggerSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100
      const result = await AgmarknetService.syncAgmarknetData(limit)

      res.json({
        success: true,
        message: 'Mandi price sync completed.',
        result,
      })
    } catch (error) {
      next(error)
    }
  }
}

