import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('[Error] Unhandled request error:', err)

  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: 500,
    },
  })
}

