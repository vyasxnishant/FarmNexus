import { Router } from 'express'
import { LogisticsController } from '../controllers/logisticsController.js'

const router = Router()

router.get('/', LogisticsController.getStorageFacilities)

export default router

