import { Router } from 'express'
import { ExternalDataController } from '../controllers/externalDataController.js'

const router = Router()

// AGMARKNET Endpoints
router.get('/market-prices', ExternalDataController.getAgmarknetPrices)
router.get('/agmarknet/market-prices', ExternalDataController.getAgmarknetPrices)

// eNAM Endpoints
router.get('/enam/market-prices', ExternalDataController.getEnamPrices)

export default router
