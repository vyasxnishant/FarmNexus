import { Router } from 'express'
import { LogisticsController } from '../controllers/logisticsController.js'

const router = Router()

router.get('/lots/:lotId', LogisticsController.getLogisticsForLot)
router.get('/:lotId', LogisticsController.getLogisticsForLot)

export default router

