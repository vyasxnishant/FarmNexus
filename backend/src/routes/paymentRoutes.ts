import { Router } from 'express'
import { PaymentController } from '../controllers/paymentController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.post('/create', authenticateToken, PaymentController.createPaymentOrder)
router.post('/verify', authenticateToken, PaymentController.verifyPayment)
router.post('/webhook', PaymentController.webhook)
router.get('/:id', authenticateToken, PaymentController.getPaymentById)

export default router
