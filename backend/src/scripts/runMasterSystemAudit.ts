import { execSync } from 'child_process'

const scripts = [
  { name: '1. Farmer Create Lot & My Lots Audit', file: 'qaFarmerCreateLotAndMyLotsAudit.ts' },
  { name: '2. Buyer Browse Lots & Bidding Audit', file: 'qaBuyerBrowseLotsAndBiddingAudit.ts' },
  { name: '3. Deal + e-Contract + Transaction Lifecycle Audit', file: 'qaDealEContractAndTransactionLifecycleAudit.ts' },
  { name: '4. Escrow + Payment Verification Audit', file: 'qaEscrowAndPaymentVerificationAudit.ts' },
  { name: '5. Transit & Logistics Audit', file: 'qaTransitAndLogisticsAudit.ts' },
  { name: '6. Market Data Cleanup Audit', file: 'qaMarketDataCleanupAudit.ts' },
  { name: '7. Admin Dashboard & RBAC Security Audit', file: 'qaAdminDashboardAudit.ts' },
]

console.log('========================================================================')
console.log('🚀 FARMNEXUS FULL PLATFORM MASTER AUDIT SUITE')
console.log('========================================================================\n')

let allPassed = true

for (const script of scripts) {
  console.log(`\n▶️ Executing [${script.name}]...`)
  try {
    execSync(`npx tsx backend/src/scripts/${script.file}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    console.log(`✅ [${script.name}] COMPLETED SUCCESSFULLY.`)
  } catch (err: any) {
    console.error(`❌ [${script.name}] FAILED.`)
    allPassed = false
    break
  }
}

console.log('\n========================================================================')
if (allPassed) {
  console.log('🎉 ALL 7 AUDIT PHASES COMPLETED WITH 100% SUCCESS!')
} else {
  console.log('❌ SOME AUDIT PHASES ENCOUNTERED FAILURES.')
  process.exit(1)
}
console.log('========================================================================\n')
