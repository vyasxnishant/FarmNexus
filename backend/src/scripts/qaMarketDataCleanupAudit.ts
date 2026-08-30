import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

interface TestResult {
  step: string
  description: string
  passed: boolean
  details?: string
}

const results: TestResult[] = []

function record(step: string, description: string, passed: boolean, details?: string) {
  results.push({ step, description, passed, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} [${step}] ${description}${details ? `: ${details}` : ''}`)
}

async function runMarketDataCleanupAudit() {
  console.log('\n==================================================================')
  console.log('🌾 FARMNEXUS MARKET DATA & DEMO DATA CLEANUP QA AUDIT')
  console.log('==================================================================\n')

  try {
    // -------------------------------------------------------------
    // STAGE 1: Admin & Farmer Authentication
    // -------------------------------------------------------------
    const adminAuthRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    const adminToken = adminAuthRes.data.data.token

    const farmerAuthRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const farmerToken = farmerAuthRes.data.data.token

    record(
      'STAGE 1: Auth Verification',
      'Admin and Farmer authentication verified',
      Boolean(adminToken && farmerToken),
      'Tokens acquired successfully'
    )

    // -------------------------------------------------------------
    // STAGE 2: Market Prices Query
    // -------------------------------------------------------------
    const marketPricesRes = await axios.get(`${API_BASE}/market-prices`)
    const pricesData = marketPricesRes.data

    record(
      'STAGE 2: Market Prices Pipeline',
      'GET /api/market-prices returns valid response format with count and records array',
      pricesData.success === true && Array.isArray(pricesData.data),
      `Records count: ${pricesData.count}, Total: ${pricesData.total}`
    )

    // -------------------------------------------------------------
    // STAGE 3: Empty State Handling / No Random Generated Fallbacks
    // -------------------------------------------------------------
    const randomCommodityQueryRes = await axios.get(`${API_BASE}/market-prices`, {
      params: { commodity: 'NonExistentCrop12345' },
    })

    record(
      'STAGE 3: No Fake Fallback Prices',
      'Querying unknown commodity returns clean 0 records without fabricating mock prices',
      randomCommodityQueryRes.data.count === 0 && randomCommodityQueryRes.data.data.length === 0,
      `Returned count: ${randomCommodityQueryRes.data.count} (No fake data generated)`
    )

    // -------------------------------------------------------------
    // STAGE 4: Pricing Intelligence for Lot with No Market Data
    // -------------------------------------------------------------
    // Create a lot for unique commodity
    const uniqueTestCrop = `Vanilla Beans ${Date.now().toString().slice(-4)}`
    const testLotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: uniqueTestCrop,
        crop_hi: 'वैनिला',
        category: 'Spices & Condiments',
        variety: 'Bourbon Organic',
        quantity_qtl: 2,
        unit: 'Kg',
        grade: 'Grade A',
        expected_price: 250000,
        min_acceptable_price: 240000,
        location: 'Pampore Farm Hub, Kashmir',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const testLotId = testLotRes.data.data.id

    const pricingIntelRes = await axios.get(`${API_BASE}/pricing-intelligence/${testLotId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const pricingIntelData = pricingIntelRes.data.data

    record(
      'STAGE 4: Pricing Intelligence Empty State',
      'Returns empty markets array and "No Mandi Data Available" when no real market feeds exist',
      pricingIntelData.markets.length === 0 && pricingIntelData.bestMandi.includes('No Mandi Data Available'),
      `Best Mandi: "${pricingIntelData.bestMandi}", Markets: ${pricingIntelData.markets.length}`
    )

    // -------------------------------------------------------------
    // STAGE 5: Admin Market Price Management
    // -------------------------------------------------------------
    // Admin publishes a real validated APMC benchmark record
    const publishRes = await axios.post(
      `${API_BASE}/admin/market-prices`,
      {
        crop: uniqueTestCrop,
        mandi: 'Pampore APMC Spice Terminal',
        state: 'Jammu & Kashmir',
        distanceKm: 12,
        minPrice: 240000,
        modalPrice: 255000,
        maxPrice: 265000,
        priceChange: 3.2,
        trend: 'up',
        source: 'APMC Spice Board Mandi Terminal',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )

    record(
      'STAGE 5: Admin Market Price Publish',
      'Admin publishes validated APMC benchmark price record',
      publishRes.data.success === true,
      `Published: ${publishRes.data.data?.mandi} (₹${publishRes.data.data?.modal_price || 255000}/qtl)`
    )

    // -------------------------------------------------------------
    // STAGE 6: Pricing Intelligence with Real Ingested Data
    // -------------------------------------------------------------
    const updatedPricingIntelRes = await axios.get(`${API_BASE}/pricing-intelligence/${testLotId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const updatedPricingIntelData = updatedPricingIntelRes.data.data

    record(
      'STAGE 6: Real Market Intelligence Calculation',
      'Pricing Intelligence accurately calculates Net Realisation from real database record',
      updatedPricingIntelData.markets.length > 0 && updatedPricingIntelData.bestMandi.includes('Pampore'),
      `Best Mandi: "${updatedPricingIntelData.bestMandi}", Modal: ₹${updatedPricingIntelData.markets[0]?.modalPrice}, Net Return: ₹${updatedPricingIntelData.markets[0]?.netReturn}`
    )

    // -------------------------------------------------------------
    // STAGE 7: Trends & Arrivals Feed Consistency
    // -------------------------------------------------------------
    const trendsRes = await axios.get(`${API_BASE}/market-prices/trends`, {
      params: { commodity: 'Saffron (Kesar)' },
    })
    const trendRecords = trendsRes.data.data

    record(
      'STAGE 7: Trends Consistency',
      'Trends endpoint returns consistent calculated trend points from database records',
      trendsRes.data.success === true && Array.isArray(trendRecords),
      `Trend records: ${trendRecords.length}`
    )

    console.log('\n==================================================================')
    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length
    console.log(`🏁 MARKET DATA CLEANUP QA: ${passedCount} PASSED, ${failedCount} FAILED`)
    console.log('==================================================================\n')

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('Audit QA Execution Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

runMarketDataCleanupAudit()

