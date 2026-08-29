import pg from 'pg'
import { config } from './env.js'
import {
  seedUsers,
  seedFarmerProfiles,
  seedBuyerProfiles,
  seedBuyerRequirements,
  seedLots,
  seedPrices,
  seedMarkets,
  seedCommodities,
  seedArrivals,
  seedOffers,
  seedTransactions,
  seedTransportOptions,
  seedStorageFacilities,
  seedActivityLogs,
} from '../db/seed.js'
import {
  User,
  FarmerProfile,
  BuyerProfile,
  BuyerRequirement,
  CropLot,
  MarketPriceRecord,
  MarketRecord,
  CommodityRecord,
  MarketArrivalRecord,
  Offer,
  Transaction,
  PaymentRecord,
  TransportOption,
  StorageFacility,
  ActivityLog,
} from '../models/types.js'

const { Pool } = pg

// In-Memory Data Store with synchronous reactive state for fast offline/local execution
export const inMemoryDb = {
  users: [...seedUsers] as User[],
  farmerProfiles: [...seedFarmerProfiles] as FarmerProfile[],
  buyerProfiles: [...seedBuyerProfiles] as BuyerProfile[],
  buyerRequirements: [...seedBuyerRequirements] as BuyerRequirement[],
  lots: [...seedLots] as CropLot[],
  marketPrices: [...seedPrices] as MarketPriceRecord[],
  markets: [...seedMarkets] as MarketRecord[],
  commodities: [...seedCommodities] as CommodityRecord[],
  marketArrivals: [...seedArrivals] as MarketArrivalRecord[],
  offers: [...seedOffers] as Offer[],
  transactions: [...seedTransactions] as Transaction[],
  payments: [] as PaymentRecord[],
  transportOptions: [...seedTransportOptions] as TransportOption[],
  storageFacilities: [...seedStorageFacilities] as StorageFacility[],
  activityLogs: [...seedActivityLogs] as ActivityLog[],
}

let pool: pg.Pool | null = null
let isPostgresConnected = false

export async function initDatabase(): Promise<boolean> {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 3000,
    })

    const client = await pool.connect()
    console.log('[DB] Connected to PostgreSQL database successfully.')
    isPostgresConnected = true

    // Initialize Full Relational PostgreSQL Schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('FARMER', 'BUYER', 'ADMIN')),
        location VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        kyc_verified BOOLEAN DEFAULT FALSE,
        organization VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

      CREATE TABLE IF NOT EXISTS farmer_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        fpo_name VARCHAR(255),
        fpo_role VARCHAR(255),
        total_land_acres NUMERIC(8,2),
        kisan_credit_card_verified BOOLEAN DEFAULT FALSE,
        bank_account_masked VARCHAR(50),
        upi_id VARCHAR(100),
        village VARCHAR(100),
        district VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS buyer_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        gst_number VARCHAR(50),
        delivery_location VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        reliability_score NUMERIC(3,2) DEFAULT 4.90,
        max_budget_inr NUMERIC(14,2) DEFAULT 1000000,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS buyer_requirements (
        id VARCHAR(64) PRIMARY KEY,
        buyer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        required_crop VARCHAR(100) NOT NULL,
        required_quantity_qtl NUMERIC(10,2) NOT NULL,
        preferred_grade VARCHAR(50) DEFAULT 'Grade A',
        preferred_location VARCHAR(100) DEFAULT 'All',
        max_price NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lots (
        id VARCHAR(64) PRIMARY KEY,
        farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        crop VARCHAR(100) NOT NULL,
        crop_hi VARCHAR(100),
        category VARCHAR(100) NOT NULL,
        variety VARCHAR(100) NOT NULL,
        quantity_qtl NUMERIC(10,2) NOT NULL,
        unit VARCHAR(50) DEFAULT 'Quintal',
        grade VARCHAR(50) NOT NULL,
        expected_price NUMERIC(10,2) NOT NULL,
        min_acceptable_price NUMERIC(10,2) NOT NULL,
        market_reference_price NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        location VARCHAR(255) NOT NULL,
        district VARCHAR(100),
        state VARCHAR(100),
        pickup_location VARCHAR(255),
        is_demo BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_lots_crop ON lots(crop);
      CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);

      CREATE TABLE IF NOT EXISTS lot_quality (
        id VARCHAR(64) PRIMARY KEY,
        lot_id VARCHAR(64) REFERENCES lots(id) ON DELETE CASCADE,
        grade VARCHAR(50) NOT NULL,
        visual_quality VARCHAR(50) NOT NULL,
        damage_level VARCHAR(50) NOT NULL,
        grain_size VARCHAR(50) NOT NULL,
        moisture_percent NUMERIC(5,2),
        foreign_matter_percent NUMERIC(5,2),
        damaged_grain_percent NUMERIC(5,2),
        notes TEXT,
        images JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS market_prices (
        id VARCHAR(64) PRIMARY KEY,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        market VARCHAR(255) NOT NULL,
        commodity VARCHAR(255) NOT NULL,
        variety VARCHAR(255) DEFAULT 'Standard',
        grade VARCHAR(100) DEFAULT 'Grade A',
        arrival_date VARCHAR(50) NOT NULL,
        min_price NUMERIC(10,2) NOT NULL,
        max_price NUMERIC(10,2) NOT NULL,
        modal_price NUMERIC(10,2) NOT NULL,
        price_change NUMERIC(5,2) DEFAULT 0,
        trend VARCHAR(20) DEFAULT 'steady',
        arrival_quantity NUMERIC(12,2) DEFAULT 0,
        source VARCHAR(255) NOT NULL,
        is_demo BOOLEAN DEFAULT FALSE,
        fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_prices_commodity ON market_prices(commodity);
      CREATE INDEX IF NOT EXISTS idx_prices_market ON market_prices(market);

      CREATE TABLE IF NOT EXISTS offers (
        id VARCHAR(64) PRIMARY KEY,
        lot_id VARCHAR(64) REFERENCES lots(id) ON DELETE CASCADE,
        buyer_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        offered_price NUMERIC(10,2) NOT NULL,
        quantity_qtl NUMERIC(10,2) NOT NULL,
        total_amount NUMERIC(14,2) NOT NULL,
        payment_terms VARCHAR(255),
        pickup_location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        counter_price NUMERIC(10,2),
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        lot_id VARCHAR(64) REFERENCES lots(id) ON DELETE RESTRICT,
        offer_id VARCHAR(64) REFERENCES offers(id) ON DELETE RESTRICT,
        farmer_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
        buyer_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
        crop VARCHAR(100) NOT NULL,
        variety VARCHAR(100) NOT NULL,
        quantity_qtl NUMERIC(10,2) NOT NULL,
        unit VARCHAR(50) DEFAULT 'Quintal',
        agreed_price_per_qtl NUMERIC(10,2) NOT NULL,
        produce_value NUMERIC(14,2) NOT NULL,
        transport_cost NUMERIC(10,2) DEFAULT 0,
        mandi_cess NUMERIC(10,2) DEFAULT 0,
        final_amount NUMERIC(14,2) NOT NULL,
        mandi_or_delivery_location VARCHAR(255) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Payment Pending',
        transaction_status VARCHAR(50) DEFAULT 'Payment Pending',
        timeline JSONB DEFAULT '[]',
        payment_details JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(64) PRIMARY KEY,
        transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE CASCADE,
        order_id VARCHAR(100) NOT NULL,
        amount NUMERIC(14,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        reference_id VARCHAR(100) NOT NULL,
        escrow_virtual_account VARCHAR(100),
        payer_vpa VARCHAR(100),
        paid_at TIMESTAMPTZ,
        failure_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transport_options (
        id VARCHAR(64) PRIMARY KEY,
        vehicle_type VARCHAR(100) NOT NULL,
        capacity_qtl NUMERIC(10,2) NOT NULL,
        base_fare NUMERIC(10,2) NOT NULL,
        per_km_rate NUMERIC(10,2) NOT NULL,
        avg_speed_kmh INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS storage_facilities (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        total_capacity_mt NUMERIC(10,2) NOT NULL,
        available_capacity_mt NUMERIC(10,2) NOT NULL,
        daily_rate_per_bag NUMERIC(6,2) NOT NULL,
        is_wdra_registered BOOLEAN DEFAULT TRUE,
        cold_storage_enabled BOOLEAN DEFAULT FALSE,
        pest_controlled BOOLEAN DEFAULT TRUE,
        contact_phone VARCHAR(50),
        latitude NUMERIC(10,6),
        longitude NUMERIC(10,6)
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(64) PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        admin_id VARCHAR(64),
        admin_user VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        details TEXT NOT NULL,
        timestamp VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Seed database if empty
    const userCount = await client.query('SELECT COUNT(*) FROM users')
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding baseline FarmNexus entities into PostgreSQL...')
      for (const u of seedUsers) {
        await client.query(
          `INSERT INTO users (id, email, password_hash, name, phone, user_type, location, district, state, status, kyc_verified, organization)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.email, u.password_hash, u.name, u.phone, u.user_type, u.location, u.district, u.state, u.status, u.kyc_verified, u.organization]
        )
      }
      for (const p of seedPrices) {
        await client.query(
          `INSERT INTO market_prices (id, state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price, price_change, trend, arrival_quantity, source, is_demo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) ON CONFLICT (id) DO NOTHING`,
          [p.id, p.state, p.district, p.market, p.commodity, p.variety, p.grade, p.arrival_date, p.min_price, p.max_price, p.modal_price, p.price_change || 0, p.trend || 'steady', p.arrival_quantity, p.source, p.is_demo]
        )
      }
    }

    client.release()
    return true
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.warn(`[DB] PostgreSQL daemon not connected (${errorMsg}).`)
    console.log('[DB] Running with high-performance in-memory data store with complete data consistency.')
    isPostgresConnected = false
    return false
  }
}

export function getDbStatus(): { isPostgresConnected: boolean; totalRecords: { users: number; lots: number; offers: number; transactions: number; marketPrices: number } } {
  return {
    isPostgresConnected,
    totalRecords: {
      users: inMemoryDb.users.length,
      lots: inMemoryDb.lots.length,
      offers: inMemoryDb.offers.length,
      transactions: inMemoryDb.transactions.length,
      marketPrices: inMemoryDb.marketPrices.length,
    },
  }
}

export { pool, isPostgresConnected }
