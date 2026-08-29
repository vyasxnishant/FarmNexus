import { Response, NextFunction } from 'express'
import { OfferService } from '../services/offerService.js'
import { AuthRequest } from '../middleware/auth.js'

export class OfferController {
  static async createOffer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const offer = await OfferService.createOffer(req.user.id, req.body)
      res.status(201).json({
        success: true,
        message: 'Commercial offer submitted successfully.',
        data: offer,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getMyOffers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const offers = await OfferService.getBuyerOffers(req.user.id)
      res.json({
        success: true,
        count: offers.length,
        data: offers,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getReceivedOffers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const offers = await OfferService.getFarmerOffers(req.user.id)
      res.json({
        success: true,
        count: offers.length,
        data: offers,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getOfferById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string
      const offer = await OfferService.getOfferById(id)
      res.json({
        success: true,
        data: offer,
      })
    } catch (err) {
      next(err)
    }
  }

  static async acceptOffer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const result = await OfferService.acceptOffer(id, req.user.id)
      res.json({
        success: true,
        message: 'Offer accepted! Electronic transaction contract generated.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async rejectOffer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const result = await OfferService.rejectOffer(id, req.user.id)
      res.json({
        success: true,
        message: 'Offer rejected.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async counterOffer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const id = req.params.id as string
      const { counter_price } = req.body
      if (!counter_price) {
        res.status(400).json({ success: false, message: 'counter_price is required.' })
        return
      }

      const result = await OfferService.counterOffer(id, req.user.id, Number(counter_price))
      res.json({
        success: true,
        message: 'Counter offer proposed to buyer.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }
}

