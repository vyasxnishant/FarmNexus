import { Router } from 'express'
import { MarketPriceController } from '../controllers/marketPriceController.js'
import { MarketController } from '../controllers/marketController.js'
import { CommodityController } from '../controllers/commodityController.js'
import { ArrivalController } from '../controllers/arrivalController.js'
import { validatePriceQuery } from '../middleware/validateQuery.js'
import { getDbStatus } from '../config/db.js'

const router = Router()

// Health and Diagnostics
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'farmnexus-backend',
    timestamp: new Date().toISOString(),
    db: getDbStatus(),
  })
})

// Market Prices Endpoints
router.get('/market-prices', validatePriceQuery, MarketPriceController.getMarketPrices)
router.get('/market-prices/latest', MarketPriceController.getLatestPrices)
router.get('/market-prices/trends', MarketPriceController.getPriceTrends)
router.post('/market-prices/sync', MarketPriceController.triggerSync)

// Markets Endpoints
router.get('/markets', MarketController.getMarkets)

// Commodities Endpoints
router.get('/commodities', CommodityController.getCommodities)

// Market Arrivals Endpoints
router.get('/market-arrivals', ArrivalController.getMarketArrivals)

export default router

