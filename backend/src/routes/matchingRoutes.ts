import { Router } from 'express'
import { MatchingController } from '../controllers/matchingController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.get('/lots', authenticateToken, MatchingController.getMatchingLots)
router.get('/requirements', authenticateToken, MatchingController.getRequirements)
router.put('/requirements', authenticateToken, MatchingController.updateRequirements)

export default router

