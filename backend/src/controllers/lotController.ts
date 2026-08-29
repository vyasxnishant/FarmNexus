import { Response, NextFunction } from 'express'
import { LotService } from '../services/lotService.js'
import { AuthRequest } from '../middleware/auth.js'

export class LotController {
  static async getAllLots(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { crop, grade, status, search } = req.query
      const lots = await LotService.getAllLots({
        crop: crop as string,
        grade: grade as string,
        status: status as string,
        search: search as string,
      })
      res.json({
        success: true,
        count: lots.length,
        data: lots,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getMyLots(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const lots = await LotService.getFarmerLots(req.user.id)
      res.json({
        success: true,
        count: lots.length,
        data: lots,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getLotById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const lot = await LotService.getLotById(id)
      res.json({
        success: true,
        data: lot,
      })
    } catch (err) {
      next(err)
    }
  }

  static async createLot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const lot = await LotService.createLot(req.user.id, req.body)
      res.status(201).json({
        success: true,
        message: 'Produce lot listed successfully.',
        data: lot,
      })
    } catch (err) {
      next(err)
    }
  }

  static async updateLot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const lot = await LotService.updateLot(id, req.user.id, req.body)
      res.json({
        success: true,
        message: 'Lot updated successfully.',
        data: lot,
      })
    } catch (err) {
      next(err)
    }
  }

  static async deleteLot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const result = await LotService.deleteLot(id, req.user.id)
      res.json({
        success: true,
        message: 'Lot removed successfully.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async updateQuality(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const lot = await LotService.updateLotQuality(id, req.user.id, req.body)
      res.json({
        success: true,
        message: 'Quality assay updated successfully.',
        data: lot,
      })
    } catch (err) {
      next(err)
    }
  }
}

