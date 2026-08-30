import { Router } from 'express'
import { MarketPriceController } from '../controllers/marketPriceController.js'
import { MarketController } from '../controllers/marketController.js'
import { CommodityController } from '../controllers/commodityController.js'
import { ArrivalController } from '../controllers/arrivalController.js'
import { validatePriceQuery } from '../middleware/validateQuery.js'
import { getDbStatus } from '../config/db.js'

// Sub-routers
import authRoutes from './authRoutes.js'
import lotRoutes from './lotRoutes.js'
import matchingRoutes from './matchingRoutes.js'
import offerRoutes from './offerRoutes.js'
import transactionRoutes from './transactionRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import logisticsRoutes from './logisticsRoutes.js'
import storageRoutes from './storageRoutes.js'
import pricingIntelligenceRoutes from './pricingIntelligenceRoutes.js'
import adminRoutes from './adminRoutes.js'
import weatherRoutes from './weatherRoutes.js'
import externalDataRoutes from './externalDataRoutes.js'
import bankRoutes from './bankRoutes.js'

const router = Router()

// Health and Diagnostics
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'farmnexus-backend',
    timestamp: new Date().toISOString(),
    db: getDbStatus(),
    integrations: {
      agmarknet: '/api/external/market-prices',
      enam: '/api/external/enam/market-prices',
      weather: '/api/weather',
      priceIntelligence: '/api/price-intelligence/:lotId',
    },
  })
})

// Core Sub-Routers
router.use('/auth', authRoutes)
router.use('/lots', lotRoutes)
router.use('/matching', matchingRoutes)
router.use('/offers', offerRoutes)
router.use('/transactions', transactionRoutes)
router.use('/payments', paymentRoutes)
router.use('/logistics', logisticsRoutes)
router.use('/storage', storageRoutes)
router.use('/price-intelligence', pricingIntelligenceRoutes)
router.use('/admin', adminRoutes)
router.use('/weather', weatherRoutes)
router.use('/external', externalDataRoutes)
router.use('/farmer/bank-details', bankRoutes)

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
