import { Router } from 'express'
import { TransactionController } from '../controllers/transactionController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticateToken, TransactionController.getMyTransactions)
router.get('/my', authenticateToken, TransactionController.getMyTransactions)
router.get('/:id', authenticateToken, TransactionController.getTransactionById)
router.post('/:id/advance-stage', authenticateToken, TransactionController.advanceStage)

export default router

