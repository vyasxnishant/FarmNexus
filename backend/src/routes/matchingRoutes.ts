import { Router } from 'express'
import { MatchingController } from '../controllers/matchingController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = Router()

// Buyer-only protected matching routes
router.use(authenticateToken, authorizeRole(['BUYER', 'ADMIN']))

router.get('/lots', MatchingController.getMatchingLots)
router.get('/requirements', MatchingController.getRequirements)
router.put('/requirements', MatchingController.updateRequirements)

export default router

