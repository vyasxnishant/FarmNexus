import type { FarmTransaction } from '../context/DashboardContext'

/**
 * Checks if an accepted transaction is genuinely waiting for the buyer's initial escrow deposit.
 * Returns FALSE for:
 * - payment_completed / Payment Completed
 * - escrow_funded / Escrow Funded
 * - payout_processing / Payout Processing
 * - payout_completed / Payout Completed / Payout Settled
 * - settled / Deal Settled
 * - fully_settled / Deal Fully Settled
 * - completed / Completed
 * - In Transit / Delivered
 */
export function isEscrowPayable(txn?: Partial<FarmTransaction> | null): boolean {
  if (!txn) return false

  const pStatus = (txn.paymentStatus || '').toLowerCase().trim()
  const tStatus = (txn.transactionStatus || '').toLowerCase().trim()

  // Terminal, completed, in-transit, or already funded states
  if (
    pStatus === 'payment successful' ||
    pStatus === 'paid' ||
    pStatus === 'settled' ||
    pStatus === 'disbursed' ||
    pStatus === 'completed' ||
    pStatus === 'escrow funded' ||
    pStatus === 'escrow_funded' ||
    pStatus === 'processing' ||
    pStatus === 'payout_completed' ||
    pStatus === 'payout_processing'
  ) {
    return false
  }

  if (
    tStatus.includes('completed') ||
    tStatus.includes('settled') ||
    tStatus.includes('transit') ||
    tStatus.includes('delivered') ||
    tStatus.includes('payout')
  ) {
    return false
  }

  // Only payable when payment is pending and transaction has not advanced past initial stage
  return (
    (pStatus === 'payment pending' || pStatus === 'pending' || !pStatus) &&
    (tStatus === 'payment pending' || tStatus === 'contract initiated' || tStatus === 'draft' || !tStatus)
  )
}

/**
 * Checks if a transaction has reached final settlement and payout.
 */
export function isDealSettled(txn?: Partial<FarmTransaction> | null): boolean {
  if (!txn) return false

  const pStatus = (txn.paymentStatus || '').toLowerCase().trim()
  const tStatus = (txn.transactionStatus || '').toLowerCase().trim()

  return (
    tStatus === 'completed' ||
    tStatus === 'settled' ||
    tStatus === 'fully_settled' ||
    tStatus === 'delivered' ||
    pStatus === 'settled' ||
    pStatus === 'disbursed' ||
    pStatus === 'payout_completed'
  )
}

/**
 * Checks if escrow funds are verified and locked.
 */
export function isEscrowFunded(txn?: Partial<FarmTransaction> | null): boolean {
  if (!txn) return false

  const pStatus = (txn.paymentStatus || '').toLowerCase().trim()
  const tStatus = (txn.transactionStatus || '').toLowerCase().trim()

  return (
    pStatus === 'payment successful' ||
    pStatus === 'escrow funded' ||
    pStatus === 'escrow_funded' ||
    tStatus === 'payment completed' ||
    tStatus === 'in transit' ||
    tStatus === 'delivered' ||
    tStatus === 'completed'
  )
}

/**
 * Checks if produce is currently in transit.
 */
export function isInTransit(txn?: Partial<FarmTransaction> | null): boolean {
  if (!txn) return false
  const tStatus = (txn.transactionStatus || '').toLowerCase().trim()
  return tStatus === 'in transit'
}

/**
 * Determines the role-specific dynamic Action Desk properties based on single source of truth.
 */
export function getTransactionActionDeskInfo(txn: FarmTransaction, isBuyerMode: boolean) {
  const settled = isDealSettled(txn)
  const payable = isEscrowPayable(txn)
  const inTransit = isInTransit(txn)
  const escrowLocked = isEscrowFunded(txn) && txn.transactionStatus === 'Payment Completed'

  let deskLabel = isBuyerMode ? 'Buyer Action Desk' : 'Farmer Action Desk'
  let headerSubtitle = ''

  if (settled) {
    deskLabel = isBuyerMode ? 'Buyer Desk — Deal Fully Settled' : 'Farmer Payout Desk — Payout Settled'
    headerSubtitle = isBuyerMode ? 'Contract Reconciliation Completed' : 'Bank Payout Disbursed & Settled'
  } else if (inTransit) {
    deskLabel = isBuyerMode ? 'Buyer Desk — Transit Tracking & Gate Assay' : 'Farmer Desk — Shipment En Route'
    headerSubtitle = isBuyerMode ? 'Consignment In Transit to Terminal' : 'Produce Dispatched from Godown'
  } else if (escrowLocked) {
    deskLabel = isBuyerMode ? 'Buyer Desk — Escrow Capital Locked' : 'Farmer Dispatch Desk — Escrow Funded'
    headerSubtitle = isBuyerMode ? 'Funds Secured in Escrow Vault' : 'Buyer Funds Verified & Locked'
  } else if (payable) {
    deskLabel = isBuyerMode ? 'Buyer Action Desk — Escrow Deposit Required' : 'Farmer Desk — Awaiting Escrow Deposit'
    headerSubtitle = isBuyerMode ? 'Lock Capital to Begin Fulfillment' : 'Awaiting Buyer Payment Confirmation'
  }

  return {
    deskLabel,
    headerSubtitle,
    isSettled: settled,
    isPayable: payable,
    isInTransit: inTransit,
    isEscrowLocked: escrowLocked,
    allowDeposit: isBuyerMode && payable,
    allowDispatch: !isBuyerMode && escrowLocked,
    allowGateVerification: isBuyerMode && inTransit,
  }
}
