import pg from 'pg'
import { config } from './env.js'
import { seedMarkets, seedCommodities, seedPrices, seedArrivals } from '../db/seed.js'
import { MarketPriceRecord, MarketRecord, CommodityRecord, MarketArrivalRecord } from '../models/types.js'

const { Pool } = pg

// In-Memory Data Store fallback when PostgreSQL instance is offline or unconfigured
export const inMemoryDb = {
  markets: [...seedMarkets],
  commodities: [...seedCommodities],
  marketPrices: [...seedPrices],
  marketArrivals: [...seedArrivals],
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
    console.log('[DB] Connected to PostgreSQL instance successfully.')
    isPostgresConnected = true

    // Initialize Schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS markets (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        distance_km_default INTEGER DEFAULT 25,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS commodities (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_hi VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        unit VARCHAR(50) DEFAULT '₹/qtl',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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
        min_price NUMERIC(10, 2) NOT NULL,
        max_price NUMERIC(10, 2) NOT NULL,
        modal_price NUMERIC(10, 2) NOT NULL,
        arrival_quantity NUMERIC(12, 2) DEFAULT 0,
        source VARCHAR(255) NOT NULL,
        is_demo BOOLEAN DEFAULT FALSE,
        fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS market_arrivals (
        id VARCHAR(64) PRIMARY KEY,
        market VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        commodity VARCHAR(255) NOT NULL,
        arrival_date VARCHAR(50) NOT NULL,
        quantity_tons NUMERIC(12, 2) NOT NULL,
        source VARCHAR(255) NOT NULL,
        is_demo BOOLEAN DEFAULT FALSE,
        fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Check if seed needed in Postgres
    const countCheck = await client.query('SELECT COUNT(*) FROM market_prices')
    if (parseInt(countCheck.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding baseline market records into PostgreSQL...')
      for (const m of seedMarkets) {
        await client.query(
          `INSERT INTO markets (id, name, district, state, distance_km_default, is_active)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
          [m.id, m.name, m.district, m.state, m.distance_km_default || 25, m.is_active]
        )
      }
      for (const c of seedCommodities) {
        await client.query(
          `INSERT INTO commodities (id, name, name_hi, category, unit)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.name_hi, c.category, c.unit]
        )
      }
      for (const p of seedPrices) {
        await client.query(
          `INSERT INTO market_prices (id, state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price, arrival_quantity, source, is_demo, fetched_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT (id) DO NOTHING`,
          [p.id, p.state, p.district, p.market, p.commodity, p.variety, p.grade, p.arrival_date, p.min_price, p.max_price, p.modal_price, p.arrival_quantity, p.source, p.is_demo, p.fetched_at]
        )
      }
    }

    client.release()
    return true
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.warn(`[DB] PostgreSQL connection not established (${errorMsg}).`)
    console.log('[DB] Switched smoothly to In-Memory High-Performance Store with baseline data.')
    isPostgresConnected = false
    return false
  }
}

export function getDbStatus(): { isPostgresConnected: boolean; totalRecords: number } {
  return {
    isPostgresConnected,
    totalRecords: inMemoryDb.marketPrices.length,
  }
}

export { pool, isPostgresConnected }

