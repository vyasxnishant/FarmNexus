import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { BankService } from '../services/bankService.js'

export class BankController {
  static async getBankDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user?.id
      if (!farmerId) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const details = await BankService.getFarmerBankDetails(farmerId)
      res.json({
        success: true,
        data: details,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch settlement bank details.',
      })
    }
  }

  static async updateBankDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user?.id
      if (!farmerId) {
        res.status(401).json({ success: false, message: 'Authentication required.' })
        return
      }

      const updated = await BankService.updateFarmerBankDetails(farmerId, req.body)
      res.json({
        success: true,
        message: 'Settlement bank details updated and verified successfully.',
        data: updated,
      })
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to update bank details.',
      })
    }
  }
}
