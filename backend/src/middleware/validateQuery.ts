import { Request, Response, NextFunction } from 'express'

export function validatePriceQuery(req: Request, res: Response, next: NextFunction): void {
  const { limit, offset } = req.query

  if (limit !== undefined) {
    const numLimit = parseInt(limit as string, 10)
    if (isNaN(numLimit) || numLimit <= 0 || numLimit > 500) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameter "limit": Must be an integer between 1 and 500' },
      })
      return
    }
  }

  if (offset !== undefined) {
    const numOffset = parseInt(offset as string, 10)
    if (isNaN(numOffset) || numOffset < 0) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid query parameter "offset": Must be a non-negative integer' },
      })
      return
    }
  }

  next()
}

