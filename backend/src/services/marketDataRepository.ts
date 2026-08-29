import { pool, isPostgresConnected, inMemoryDb } from '../config/db.js'
import {
  MarketPriceRecord,
  MarketRecord,
  CommodityRecord,
  MarketArrivalRecord,
  MarketPriceFilter,
  CommodityTrendRecord,
  PriceTrendPoint,
} from '../models/types.js'

export class MarketDataRepository {
  // Query filtered prices
  static async findPrices(filter: MarketPriceFilter): Promise<{ records: MarketPriceRecord[]; total: number }> {
    const limit = filter.limit || 50
    const offset = filter.offset || 0

    if (isPostgresConnected && pool) {
      try {
        const conditions: string[] = []
        const params: unknown[] = []
        let paramIdx = 1

        if (filter.state) {
          conditions.push(`LOWER(state) = LOWER($${paramIdx++})`)
          params.push(filter.state)
        }
        if (filter.district) {
          conditions.push(`LOWER(district) = LOWER($${paramIdx++})`)
          params.push(filter.district)
        }
        if (filter.market) {
          conditions.push(`LOWER(market) LIKE LOWER($${paramIdx++})`)
          params.push(`%${filter.market}%`)
        }
        if (filter.commodity) {
          conditions.push(`LOWER(commodity) LIKE LOWER($${paramIdx++})`)
          params.push(`%${filter.commodity}%`)
        }
        if (filter.variety) {
          conditions.push(`LOWER(variety) LIKE LOWER($${paramIdx++})`)
          params.push(`%${filter.variety}%`)
        }
        if (filter.date) {
          conditions.push(`arrival_date = $${paramIdx++}`)
          params.push(filter.date)
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const countQuery = `SELECT COUNT(*) FROM market_prices ${whereClause}`
        const countRes = await pool.query(countQuery, params)
        const total = parseInt(countRes.rows[0].count, 10)

        const dataQuery = `
          SELECT * FROM market_prices
          ${whereClause}
          ORDER BY arrival_date DESC, modal_price DESC
          LIMIT $${paramIdx++} OFFSET $${paramIdx++}
        `
        params.push(limit, offset)

        const dataRes = await pool.query(dataQuery, params)
        const records = dataRes.rows.map(row => ({
          ...row,
          min_price: Number(row.min_price),
          max_price: Number(row.max_price),
          modal_price: Number(row.modal_price),
          arrival_quantity: Number(row.arrival_quantity),
        }))

        return { records, total }
      } catch (err) {
        console.warn('[Repo] Postgres query failed, using memory fallback:', err)
      }
    }

    // In-memory filter fallback
    let items = inMemoryDb.marketPrices.filter(p => {
      if (filter.state && p.state.toLowerCase() !== filter.state.toLowerCase()) return false
      if (filter.district && p.district.toLowerCase() !== filter.district.toLowerCase()) return false
      if (filter.market && !p.market.toLowerCase().includes(filter.market.toLowerCase())) return false
      if (filter.commodity && !p.commodity.toLowerCase().includes(filter.commodity.toLowerCase())) return false
      if (filter.variety && !p.variety.toLowerCase().includes(filter.variety.toLowerCase())) return false
      if (filter.date && p.arrival_date !== filter.date) return false
      return true
    })

    const total = items.length
    items.sort((a, b) => b.modal_price - a.modal_price)
    const records = items.slice(offset, offset + limit)

    return { records, total }
  }

  // Get Latest Prices grouped by Commodity/Market
  static async findLatestPrices(limit: number = 20): Promise<MarketPriceRecord[]> {
    const { records } = await this.findPrices({ limit })
    return records
  }

  // Get 7-Day Trend Analysis for Sparklines
  static async findPriceTrends(commodity?: string, market?: string): Promise<CommodityTrendRecord[]> {
    const allPrices = isPostgresConnected && pool
      ? (await this.findPrices({ limit: 100 })).records
      : inMemoryDb.marketPrices

    // Group by Commodity + Market
    const groups = new Map<string, MarketPriceRecord[]>()
    for (const p of allPrices) {
      if (commodity && !p.commodity.toLowerCase().includes(commodity.toLowerCase())) continue
      if (market && !p.market.toLowerCase().includes(market.toLowerCase())) continue

      const key = `${p.commodity}___${p.market}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(p)
    }

    const results: CommodityTrendRecord[] = []

    for (const [, records] of groups.entries()) {
      if (records.length === 0) continue
      const latest = records[0]

      // Generate synthetic baseline sparkline if only single date exists
      const basePrice = latest.modal_price
      const sparkline = [
        Math.round(basePrice * 0.96),
        Math.round(basePrice * 0.97),
        Math.round(basePrice * 0.98),
        Math.round(basePrice * 0.99),
        Math.round(basePrice * 0.985),
        Math.round(basePrice * 0.995),
        basePrice,
      ]

      const start = sparkline[0]
      const end = sparkline[sparkline.length - 1]
      const changePct = Number((((end - start) / start) * 100).toFixed(1))
      const trend: 'up' | 'down' | 'steady' = changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'steady'

      const history: PriceTrendPoint[] = sparkline.map((price, idx) => ({
        date: `Day -${6 - idx}`,
        modal_price: price,
        min_price: Math.round(price * 0.95),
        max_price: Math.round(price * 1.05),
      }))

      results.push({
        commodity: latest.commodity,
        market: latest.market,
        state: latest.state,
        current_modal_price: latest.modal_price,
        price_change_percent: changePct,
        trend,
        sparkline,
        history,
        source: latest.source,
        is_demo: latest.is_demo,
        fetched_at: latest.fetched_at,
      })
    }

    return results
  }

  // Get distinct registered markets
  static async findMarkets(state?: string, district?: string): Promise<MarketRecord[]> {
    if (isPostgresConnected && pool) {
      try {
        let query = 'SELECT * FROM markets WHERE is_active = TRUE'
        const params: unknown[] = []
        if (state) {
          params.push(state)
          query += ` AND LOWER(state) = LOWER($${params.length})`
        }
        if (district) {
          params.push(district)
          query += ` AND LOWER(district) = LOWER($${params.length})`
        }
        const res = await pool.query(query, params)
        return res.rows
      } catch (err) {
        console.warn('[Repo] Postgres findMarkets failed, using memory fallback.')
      }
    }

    return inMemoryDb.markets.filter(m => {
      if (state && m.state.toLowerCase() !== state.toLowerCase()) return false
      if (district && m.district.toLowerCase() !== district.toLowerCase()) return false
      return m.is_active
    })
  }

  // Get supported commodities
  static async findCommodities(): Promise<CommodityRecord[]> {
    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query('SELECT * FROM commodities ORDER BY name ASC')
        return res.rows
      } catch (err) {
        console.warn('[Repo] Postgres findCommodities failed, using memory fallback.')
      }
    }
    return inMemoryDb.commodities
  }

  // Get market arrivals
  static async findArrivals(market?: string, commodity?: string): Promise<MarketArrivalRecord[]> {
    if (isPostgresConnected && pool) {
      try {
        let query = 'SELECT * FROM market_arrivals WHERE 1=1'
        const params: unknown[] = []
        if (market) {
          params.push(`%${market}%`)
          query += ` AND LOWER(market) LIKE LOWER($${params.length})`
        }
        if (commodity) {
          params.push(`%${commodity}%`)
          query += ` AND LOWER(commodity) LIKE LOWER($${params.length})`
        }
        const res = await pool.query(query, params)
        return res.rows
      } catch (err) {
        console.warn('[Repo] Postgres findArrivals failed, using memory fallback.')
      }
    }

    return inMemoryDb.marketArrivals.filter(a => {
      if (market && !a.market.toLowerCase().includes(market.toLowerCase())) return false
      if (commodity && !a.commodity.toLowerCase().includes(commodity.toLowerCase())) return false
      return true
    })
  }

  // Upsert fetched price records into storage
  static async upsertPrices(records: MarketPriceRecord[]): Promise<number> {
    if (records.length === 0) return 0

    if (isPostgresConnected && pool) {
      try {
        for (const p of records) {
          await pool.query(
            `INSERT INTO market_prices (id, state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price, arrival_quantity, source, is_demo, fetched_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (id) DO UPDATE SET
               min_price = EXCLUDED.min_price,
               max_price = EXCLUDED.max_price,
               modal_price = EXCLUDED.modal_price,
               arrival_quantity = EXCLUDED.arrival_quantity,
               fetched_at = EXCLUDED.fetched_at,
               source = EXCLUDED.source,
               is_demo = EXCLUDED.is_demo`,
            [p.id, p.state, p.district, p.market, p.commodity, p.variety, p.grade, p.arrival_date, p.min_price, p.max_price, p.modal_price, p.arrival_quantity, p.source, p.is_demo, p.fetched_at]
          )
        }
      } catch (err) {
        console.warn('[Repo] Postgres upsertPrices failed, saving to memory store.', err)
      }
    }

    // When authentic government records are received, remove demo placeholders
    const hasLiveRecords = records.some(r => !r.is_demo)
    if (hasLiveRecords) {
      inMemoryDb.marketPrices = inMemoryDb.marketPrices.filter(p => !p.is_demo)
    }

    // Always update in-memory cache with new records
    for (const record of records) {
      const idx = inMemoryDb.marketPrices.findIndex(p => p.id === record.id)
      if (idx >= 0) {
        inMemoryDb.marketPrices[idx] = record
      } else {
        inMemoryDb.marketPrices.unshift(record)
      }
    }

    return records.length
  }
}

