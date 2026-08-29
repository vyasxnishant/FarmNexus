import axios from 'axios'
import { config } from '../config/env.js'
import { normalizeGovPriceRecord } from '../utils/normalizer.js'
import { MarketDataRepository } from './marketDataRepository.js'
import { AgmarknetGovRecord } from '../models/types.js'

let lastSyncTimestamp: number | null = null
let isSyncing = false

export class AgmarknetService {
  /**
   * Check if cache is expired and trigger sync if API key is provided
   */
  static async ensureFreshData(): Promise<void> {
    const now = Date.now()
    const cacheTtlMs = config.cacheTtlMinutes * 60 * 1000

    if (lastSyncTimestamp && now - lastSyncTimestamp < cacheTtlMs) {
      // Data is fresh within TTL window
      return
    }

    if (!config.dataGovInApiKey) {
      // No API key configured; rely on baseline repository data
      return
    }

    if (isSyncing) return

    try {
      await this.syncAgmarknetData()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.warn(`[AgmarknetService] Sync failed (${errorMsg}). Serving local database cache.`)
    }
  }

  /**
   * Fetch daily mandi prices from data.gov.in AGMARKNET API
   */
  static async syncAgmarknetData(limit: number = 100): Promise<{ count: number; source: string; error?: string }> {
    const apiKey = config.dataGovInApiKey.trim()

    if (!apiKey) {
      console.info('[AgmarknetService] No DATA_GOV_IN_API_KEY detected. Serving baseline demo data.')
      return { count: 0, source: 'DEMO DATA (No API Key Configured)' }
    }

    isSyncing = true
    try {
      console.log(`[AgmarknetService] Querying data.gov.in AGMARKNET resource (${config.agmarknetEndpoint})...`)

      const response = await axios.get(config.agmarknetEndpoint, {
        params: {
          'api-key': apiKey,
          format: 'json',
          limit,
        },
        timeout: 25000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FarmNexus-AgriTech/1.0',
          'api-key': apiKey,
        },
      })

      const rawRecords: AgmarknetGovRecord[] = response.data?.records || []

      if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
        console.warn('[AgmarknetService] data.gov.in returned 0 records for current request.')
        return { count: 0, source: 'data.gov.in (Empty Response)' }
      }

      console.log(`[AgmarknetService] Received ${rawRecords.length} raw records from government feed. Normalizing...`)

      const normalizedRecords = rawRecords.map((r, i) => normalizeGovPriceRecord(r, i))
      const savedCount = await MarketDataRepository.upsertPrices(normalizedRecords)

      lastSyncTimestamp = Date.now()
      console.log(`[AgmarknetService] Successfully normalized and cached ${savedCount} government mandi price records.`)

      return { count: savedCount, source: 'data.gov.in (AGMARKNET Live Feed)' }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error(`[AgmarknetService] Government API connection error: ${errorMsg}`)
      return {
        count: 0,
        source: 'DEMO DATA (Government API Error / 403 Forbidden)',
        error: errorMsg.includes('403')
          ? 'Government API returned 403 (Key not authorised). Please verify your 56-character OGD API Key and dataset subscription at data.gov.in.'
          : errorMsg,
      }
    } finally {
      isSyncing = false
    }
  }

  static getLastSyncTime(): string | null {
    return lastSyncTimestamp ? new Date(lastSyncTimestamp).toISOString() : null
  }
}

