import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import { initDatabase } from './config/db.js'
import apiRoutes from './routes/api.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Middleware
app.use(cors({
  origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

  app.listen(config.port, () => {
    console.log(`=========================================`)
    console.log(`🌾 FarmNexus Backend Data Layer Active`)
    console.log(`🚀 API Server running on port ${config.port}`)
    console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`)
    console.log(`📊 Market Prices: http://localhost:${config.port}/api/market-prices`)
    console.log(`=========================================`)
  })
}

startServer()

