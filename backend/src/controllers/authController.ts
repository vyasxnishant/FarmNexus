import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/authService.js'
import { AuthRequest } from '../middleware/auth.js'

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, phone, user_type, location } = req.body
      if (!email || !password || !name || !user_type) {
        res.status(400).json({
          success: false,
          message: 'Missing required registration parameters (email, password, name, user_type).',
        })
        return
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must contain at least 6 characters.',
        })
        return
      }

      const result = await AuthService.register(req.body)
      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide both email and password.',
        })
        return
      }

      const result = await AuthService.login(email, password)
      res.json({
        success: true,
        message: 'Signed in successfully.',
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' })
        return
      }

      const result = await AuthService.getCurrentUser(req.user.id)
      res.json({
        success: true,
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }
}
