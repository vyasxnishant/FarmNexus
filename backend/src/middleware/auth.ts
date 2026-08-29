import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { inMemoryDb, pool, isPostgresConnected } from '../config/db.js'
import { UserRole } from '../models/types.js'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  user_type: UserRole
  organization?: string
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication token required. Please sign in.',
    })
    return
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser
    req.user = decoded
    next()
  } catch (err) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.',
    })
  }
}

export function authorizeRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    if (!allowedRoles.includes(req.user.user_type)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is ${req.user.user_type}.`,
      })
      return
    }

    next()
  }
}

