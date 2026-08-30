import { Router } from 'express'
import { WeatherController } from '../controllers/weatherController.js'

const router = Router()

router.get('/', WeatherController.getWeather)
router.get('/status', WeatherController.getStatus)

export default router
