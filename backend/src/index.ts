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

import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Static Frontend files from production build
const frontendDist = path.resolve(__dirname, '../../frontend/dist')
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
}

// Root API info check
app.get('/api/info', (req, res) => {
  res.json({
    name: 'FarmNexus Agri-Data API',
    version: '1.0.0',
    description: 'Government-sourced agricultural mandi prices and market intelligence backend',
    documentation: '/api/health',
  })
})

// SPA Fallback for client-side routing
if (fs.existsSync(frontendDist)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

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

