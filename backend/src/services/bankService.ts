import { inMemoryDb, pool, isPostgresConnected } from '../config/db.js'
import {
  encryptBankAccount,
  maskAccountNumber,
  maskIfsc,
  maskUpi,
  validateBankDetails,
  type BankDetailsInput
} from '../utils/bankEncryption.js'
import { FarmerProfile } from '../models/types.js'

export class BankService {
  /**
   * Get safe masked bank details for a farmer
   */
  static async getFarmerBankDetails(farmerId: string) {
    const profile = inMemoryDb.farmerProfiles.find(p => p.user_id === farmerId)

    if (!profile || !profile.is_bank_configured) {
      return {
        is_configured: false,
        message: 'Payment settlement account not configured',
        bank_name: null,
        account_holder_name: null,
        bank_account_masked: null,
        ifsc_code_masked: null,
        upi_id_masked: null,
      }
    }

    return {
      is_configured: true,
      bank_name: profile.bank_name || 'State Bank of India',
      account_holder_name: profile.account_holder_name || 'Verified Farmer',
      bank_account_masked: profile.bank_account_masked || '•••• •••• 8842',
      ifsc_code_masked: profile.ifsc_code_masked || 'SBIN****0382',
      upi_id_masked: profile.upi_id_masked || (profile.upi_id ? maskUpi(profile.upi_id) : null),
      updated_at: profile.updated_at,
    }
  }

  /**
   * Update and securely store bank details for a farmer
   */
  static async updateFarmerBankDetails(farmerId: string, data: BankDetailsInput) {
    // 1. Validation
    const validation = validateBankDetails(data)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid bank details provided.')
    }

    let profile = inMemoryDb.farmerProfiles.find(p => p.user_id === farmerId)
    const now = new Date().toISOString()

    if (!profile) {
      profile = {
        id: `PRF-FRM-${Date.now().toString().slice(-4)}`,
        user_id: farmerId,
        total_land_acres: 10,
        kisan_credit_card_verified: false,
        created_at: now,
        updated_at: now,
      }
      inMemoryDb.farmerProfiles.push(profile)
    }

    // 2. Encryption and Masking
    const rawAccount = data.account_number.trim().replace(/\s+/g, '')
    const encryptedAccount = encryptBankAccount(rawAccount)
    const maskedAccount = maskAccountNumber(rawAccount)
    const cleanIfsc = data.ifsc_code.trim().toUpperCase()
    const maskedIfscCode = maskIfsc(cleanIfsc)
    const rawUpi = data.upi_id ? data.upi_id.trim() : undefined
    const maskedUpiId = rawUpi ? maskUpi(rawUpi) : undefined

    // 3. Update Profile Object
    profile.bank_name = data.bank_name.trim()
    profile.account_holder_name = data.account_holder_name.trim()
    profile.bank_account_encrypted = encryptedAccount
    profile.bank_account_masked = maskedAccount
    profile.ifsc_code = cleanIfsc
    profile.ifsc_code_masked = maskedIfscCode
    profile.upi_id = rawUpi
    profile.upi_id_masked = maskedUpiId
    profile.is_bank_configured = true
    profile.updated_at = now

    // 4. Persist to PostgreSQL if connected
    if (isPostgresConnected && pool) {
      try {
        await pool.query(
          `UPDATE farmer_profiles
           SET bank_account_masked = $1, upi_id = $2, updated_at = $3
           WHERE user_id = $4`,
          [maskedAccount, rawUpi, now, farmerId]
        )
      } catch (e) {
        console.warn('[BankService] PostgreSQL bank update fallback:', e)
      }
    }

    // 5. Return Safe Masked Output (NEVER raw account number)
    return {
      is_configured: true,
      bank_name: profile.bank_name,
      account_holder_name: profile.account_holder_name,
      bank_account_masked: profile.bank_account_masked,
      ifsc_code_masked: profile.ifsc_code_masked,
      upi_id_masked: profile.upi_id_masked,
      updated_at: profile.updated_at,
    }
  }
}
