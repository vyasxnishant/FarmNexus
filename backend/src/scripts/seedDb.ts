import { initDatabase, inMemoryDb, isPostgresConnected } from '../config/db.js'

async function runSeed() {
  console.log('🌾 FarmNexus Database Migration & Seeding Script Starting...')
  const connected = await initDatabase()

  if (connected) {
    console.log('✅ PostgreSQL Schema initialized with tables, indexes, and seeded records.')
  } else {
    console.log('ℹ️ Running in memory-consistent fallback mode. In-memory tables seeded successfully.')
  }

  console.log(`📊 Total Seeded Entities:
   - Users: ${inMemoryDb.users.length}
   - Farmer Profiles: ${inMemoryDb.farmerProfiles.length}
   - Buyer Profiles: ${inMemoryDb.buyerProfiles.length}
   - Produce Lots: ${inMemoryDb.lots.length}
   - Market Prices: ${inMemoryDb.marketPrices.length}
   - Bids/Offers: ${inMemoryDb.offers.length}
   - Transactions: ${inMemoryDb.transactions.length}
   - Transport Options: ${inMemoryDb.transportOptions.length}
   - Storage Warehouses: ${inMemoryDb.storageFacilities.length}
   - Audit Trail Logs: ${inMemoryDb.activityLogs.length}
  `)

  process.exit(0)
}

runSeed().catch(err => {
  console.error('❌ Migration / Seed failed:', err)
  process.exit(1)
})
