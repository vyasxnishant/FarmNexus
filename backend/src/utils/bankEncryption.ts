import crypto from 'crypto'
import { config } from '../config/env.js'

// Derive a consistent 32-byte key from the environment secret
const ENCRYPTION_KEY = crypto.createHash('sha256').update(config.jwtSecret || 'farmnexus-secure-banking-key-2026').digest()
const IV_LENGTH = 16

/**
 * Encrypt a sensitive bank account string using AES-256-CBC
 */
export function encryptBankAccount(accountNumber: string): string {
  if (!accountNumber) return ''
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(accountNumber.trim(), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an encrypted bank account string
 */
export function decryptBankAccount(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return ''
  try {
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (err) {
    console.error('[bankEncryption] Decryption error:', err)
    return ''
  }
}

/**
 * Mask an account number (e.g. 123456789012 -> •••• •••• 9012)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return ''
  const clean = accountNumber.trim().replace(/\s+/g, '')
  if (clean.length <= 4) return clean
  const last4 = clean.slice(-4)
  return `•••• •••• ${last4}`
}

/**
 * Mask an IFSC code (e.g. SBIN0000382 -> SBIN****0382)
 */
export function maskIfsc(ifsc: string): string {
  if (!ifsc) return ''
  const clean = ifsc.trim().toUpperCase()
  if (clean.length < 8) return clean
  return `${clean.slice(0, 4)}****${clean.slice(-4)}`
}

/**
 * Mask a UPI ID (e.g. ramesh.patel@okhdfcbank -> ra****@okhdfcbank)
 */
export function maskUpi(upi: string): string {
  if (!upi) return ''
  const clean = upi.trim()
  const parts = clean.split('@')
  if (parts.length !== 2) return clean
  const [handle, provider] = parts
  const maskedHandle = handle.length <= 2 ? `${handle}****` : `${handle.slice(0, 2)}****`
  return `${maskedHandle}@${provider}`
}

export interface BankDetailsInput {
  account_holder_name: string
  bank_name: string
  account_number: string
  confirm_account_number: string
  ifsc_code: string
  upi_id?: string
}

/**
 * Strict validation for Indian Banking details
 */
export function validateBankDetails(data: BankDetailsInput): { isValid: boolean; error?: string } {
  if (!data.account_holder_name || data.account_holder_name.trim().length < 2) {
    return { isValid: false, error: 'Account Holder Name is required (minimum 2 characters).' }
  }

  if (!/^[a-zA-Z\s.']{2,100}$/.test(data.account_holder_name.trim())) {
    return { isValid: false, error: 'Account Holder Name should contain only letters, dots, and spaces.' }
  }

  if (!data.bank_name || data.bank_name.trim().length < 2) {
    return { isValid: false, error: 'Bank Name is required.' }
  }

  const cleanAcc = data.account_number ? data.account_number.trim().replace(/\s+/g, '') : ''
  const cleanConfirmAcc = data.confirm_account_number ? data.confirm_account_number.trim().replace(/\s+/g, '') : ''

  if (!cleanAcc) {
    return { isValid: false, error: 'Account Number is required.' }
  }

  if (!/^\d{9,18}$/.test(cleanAcc)) {
    return { isValid: false, error: 'Account Number must be between 9 and 18 numeric digits.' }
  }

  if (cleanAcc !== cleanConfirmAcc) {
    return { isValid: false, error: 'Account Number and Confirm Account Number do not match.' }
  }

  const cleanIfsc = data.ifsc_code ? data.ifsc_code.trim().toUpperCase() : ''
  if (!cleanIfsc) {
    return { isValid: false, error: 'IFSC Code is required.' }
  }

  // Standard Indian IFSC code regex: 4 letters + '0' + 6 alphanumeric characters
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  if (!ifscRegex.test(cleanIfsc)) {
    return { isValid: false, error: 'Invalid IFSC Code format (e.g. SBIN0000382, HDFC0001234).' }
  }

  if (data.upi_id && data.upi_id.trim()) {
    const cleanUpi = data.upi_id.trim()
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
    if (!upiRegex.test(cleanUpi)) {
      return { isValid: false, error: 'Invalid UPI ID format (e.g. farmer@sbi, name@okhdfcbank).' }
    }
  }

  return { isValid: true }
}

