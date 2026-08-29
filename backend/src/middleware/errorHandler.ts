import { Request, Response, NextFunction } from 'express'
import { config } from '../config/env.js'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('[Error] Server exception:', err)

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    message,
    error: config.nodeEnv === 'development' ? err.stack || message : undefined,
  })
}
