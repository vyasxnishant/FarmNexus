import { Router } from 'express'
import { AdminController } from '../controllers/adminController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = Router()

// All admin routes require ADMIN role authorization
router.use(authenticateToken, authorizeRole(['ADMIN']))

// User actions
router.get('/users', AdminController.getUsers)
router.get('/users/:userId', AdminController.getUserById)
router.post('/users/:id/verify', AdminController.verifyUser)
router.post('/users/:id/suspend', AdminController.suspendUser)
router.post('/users/:id/activate', AdminController.activateUser)

// Lot actions
router.get('/lots', AdminController.getLots)
router.post('/lots/:id/flag', AdminController.flagLot)

// Oversight
router.get('/offers', AdminController.getOffers)
router.get('/transactions', AdminController.getTransactions)
router.get('/payments', AdminController.getPayments)
router.get('/activity-logs', AdminController.getActivityLogs)

// Market price admin CRUD
router.post('/market-prices', AdminController.addMarketPrice)
router.put('/market-prices/:id', AdminController.updateMarketPrice)
router.delete('/market-prices/:id', AdminController.deleteMarketPrice)

// System & Integrations Status
router.get('/system-status', AdminController.getSystemStatus)

export default router

