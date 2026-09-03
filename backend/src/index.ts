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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Api-Version', 'X-CSRF-Token'],
}))
app.options('*', cors())

// Explicit CORS headers and preflight handler for Vercel Serverless
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Version, X-CSRF-Token')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

app.use(express.json())

// URL normalization for Vercel Serverless rewrites
app.use((req, res, next) => {
  const original = (req.originalUrl || req.url || '').split('?')[0]
  if ((req.url === '/' || req.url === '/api' || req.url === '/api/') && original && original !== '/' && original !== '/api') {
    req.url = req.originalUrl
  }
  next()
})

// Lazy DB initialization singleton for Vercel Serverless environments
let dbInitPromise: Promise<boolean> | null = null

export function ensureDatabaseInitialized(): Promise<boolean> {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase().catch((err) => {
      console.warn('[DB] Serverless database init warning:', err)
      return false
    })
  }
  return dbInitPromise
}

app.use(async (req, res, next) => {
  await ensureDatabaseInitialized()
  next()
})

// Root API info check
app.get(['/', '/api', '/api/info', '/info'], (req, res) => {
  res.json({
    name: 'FarmNexus Agri-Data API',
    version: '1.0.0',
    status: 'online',
    description: 'Government-sourced agricultural mandi prices and market intelligence backend',
    documentation: '/api/health',
  })
})

// API Routes (support both /api/* and direct routes)
app.use('/api', apiRoutes)
app.use('/', apiRoutes)

import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Static Frontend files from production build (when running in unified mode)
const frontendDist = path.resolve(__dirname, '../../frontend/dist')
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
}

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

// Start Server (Standalone / Local / Docker)
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

// Only start standalone server if NOT in a serverless environment (e.g. Vercel)
if (
  !process.env.VERCEL &&
  !process.env.NETLIFY &&
  !process.env.AWS_LAMBDA_FUNCTION_NAME
) {
  startServer()
}
export default app
export { app }


