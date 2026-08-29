import { Router } from 'express'
import { PricingIntelligenceController } from '../controllers/pricingIntelligenceController.js'

const router = Router()

router.get('/:lotId', PricingIntelligenceController.getPriceIntelligence)

export default router

