import { Router } from 'express'
import { PaymentController } from '../controllers/paymentController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = Router()

// Public / Authenticated gateway config (Returns public Key ID only)
router.get('/config', PaymentController.getPaymentConfig)

// Order creation - requires Buyer authentication (or Admin)
router.post('/create-order', authenticateToken, PaymentController.createPaymentOrder)
router.post('/create', authenticateToken, PaymentController.createPaymentOrder)

// Cryptographic signature verification - requires authenticated Buyer
router.post('/verify', authenticateToken, PaymentController.verifyPayment)
router.post('/process-sandbox', authenticateToken, PaymentController.processSandboxPayment)
router.post('/sandbox', authenticateToken, PaymentController.processSandboxPayment)

// Razorpay Webhook endpoint (Signature verified inside controller)
router.post('/webhook', PaymentController.webhook)

// Admin payment oversight ledger
router.get('/all', authenticateToken, authorizeRole(['ADMIN']), PaymentController.getAllPayments)

// Single payment lookup
router.get('/:id', authenticateToken, PaymentController.getPaymentById)

export default router
