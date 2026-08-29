import { Router } from 'express'
import { OfferController } from '../controllers/offerController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticateToken, authorizeRole(['BUYER', 'ADMIN']), OfferController.createOffer)
router.get('/my', authenticateToken, authorizeRole(['BUYER', 'ADMIN']), OfferController.getMyOffers)
router.get('/received', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), OfferController.getReceivedOffers)
router.get('/:id', authenticateToken, OfferController.getOfferById)

router.post('/:id/accept', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), OfferController.acceptOffer)
router.post('/:id/reject', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), OfferController.rejectOffer)
router.post('/:id/counter', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), OfferController.counterOffer)

export default router
