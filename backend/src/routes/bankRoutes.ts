import { Router } from 'express'
import { BankController } from '../controllers/bankController.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = Router()

// Only authenticated FARMER accounts may read and update their settlement bank details
router.get('/', authenticateToken, authorizeRole(['FARMER', 'ADMIN']), BankController.getBankDetails)
router.put('/', authenticateToken, authorizeRole(['FARMER']), BankController.updateBankDetails)

export default router

