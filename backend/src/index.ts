import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import { initDatabase } from './config/db.js'
import apiRoutes from './routes/api.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

// API Routes
app.use('/api', apiRoutes)

// Root health check
app.get('/', (req, res) => {
  res.json({
    name: 'FarmNexus Agri-Data API',
    version: '1.0.0',
    description: 'Government-sourced agricultural mandi prices and market intelligence backend',
    documentation: '/api/health',
    endpoints: [
      'GET /api/market-prices',
      'GET /api/market-prices/latest',
      'GET /api/market-prices/trends',
      'GET /api/markets',
      'GET /api/commodities',
      'GET /api/market-arrivals',
    ],
  })
})

// Error Handling
app.use(errorHandler)

// Start Server
async function startServer() {
  await initDatabase()

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`=========================================`)
    console.log(`🌾 FarmNexus Backend Data Layer Active`)
    console.log(`🚀 API Server running on port ${config.port}`)
    console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`)
    console.log(`📊 Market Prices: http://localhost:${config.port}/api/market-prices`)
    console.log(`=========================================`)
  })
}

startServer()

