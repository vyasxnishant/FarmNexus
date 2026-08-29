import { Router } from 'express'
import { LotController } from '../controllers/lotController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = Router()

// Public listing
router.get('/', LotController.getAllLots)
router.get('/my', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), LotController.getMyLots)
router.get('/:id', LotController.getLotById)

// Farmer mutations
router.post('/', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), LotController.createLot)
router.put('/:id', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), LotController.updateLot)
router.delete('/:id', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), LotController.deleteLot)

// Quality updates
router.post('/:id/quality', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), LotController.updateQuality)
router.put('/:id/quality', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), LotController.updateQuality)

export default router

