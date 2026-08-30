import { Request, Response, NextFunction } from 'express'
import { WeatherService } from '../services/weatherService.js'

export class WeatherController {
  static async getWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { location, lat, lon } = req.query
      const latNum = lat ? Number(lat) : undefined
      const lonNum = lon ? Number(lon) : undefined

      const weather = await WeatherService.getWeather(location as string, latNum, lonNum)
      res.json({
        success: true,
        data: weather,
      })
    } catch (err) {
      next(err)
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await WeatherService.checkStatus()
      res.json({
        success: true,
        data: status,
      })
    } catch (err) {
      next(err)
    }
  }
}
