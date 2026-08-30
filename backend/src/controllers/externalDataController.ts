import { Request, Response, NextFunction } from 'express'
import { AgmarknetService } from '../services/agmarknetService.js'
import { EnamService } from '../services/enamService.js'

export class ExternalDataController {
  /**
   * GET /api/external/market-prices (AGMARKNET Government Data)
   */
  static async getAgmarknetPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { crop, commodity, state, district, mandi, date, limit } = req.query
      const result = await AgmarknetService.getAgmarknetPrices({
        crop: (crop || commodity) as string,
        state: state as string,
        district: district as string,
        mandi: mandi as string,
        date: date as string,
        limit: limit ? Number(limit) : 50,
      })

      res.json({
        success: true,
        source: result.source,
        isLive: result.isLive,
        count: result.records.length,
        total: result.total,
        data: result.records,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/external/enam/market-prices (eNAM Electronic Auction Feed)
   */
  static async getEnamPrices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { crop, commodity, state, district, mandi } = req.query
      const result = await EnamService.getEnamPrices({
        commodity: (crop || commodity) as string,
        state: state as string,
        district: district as string,
        mandi: mandi as string,
      })

      res.json({
        success: true,
        source: result.source,
        isLive: result.isLive,
        count: result.records.length,
        data: result.records,
      })
    } catch (err) {
      next(err)
    }
  }
}
