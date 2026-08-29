import { Response, NextFunction } from 'express'
import { LogisticsService } from '../services/logisticsService.js'
import { AuthRequest } from '../middleware/auth.js'

export class LogisticsController {
  static async getLogisticsForLot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const lotId = req.params.lotId as string
      const { destinationMandi } = req.query
      const result = await LogisticsService.getLogisticsForLot(lotId, destinationMandi as string)
      res.json({
        success: true,
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getStorageFacilities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { location, minCapacity, maxCost, wdraOnly } = req.query
      const facilities = await LogisticsService.getStorageFacilities({
        location: location as string,
        minAvailableMt: minCapacity ? Number(minCapacity) : undefined,
        maxCostPerBag: maxCost ? Number(maxCost) : undefined,
        wdraOnly: wdraOnly === 'true',
      })
      res.json({
        success: true,
        count: facilities.length,
        data: facilities,
      })
    } catch (err) {
      next(err)
    }
  }
}
