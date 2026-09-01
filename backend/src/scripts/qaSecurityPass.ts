import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

interface TestResult {
  suite: string
  name: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function record(suite: string, name: string, passed: boolean, details: string) {
  results.push({ suite, name, passed, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} [${suite}] ${name}: ${details}`)
}

async function runQAPass() {
  console.log('====================================================')
  console.log('🌾 FARMNEXUS COMPREHENSIVE QA & SECURITY TEST SUITE')
  console.log('====================================================\n')

  let farmerToken = ''
  let buyerToken = ''
  let adminToken = ''
  let createdLotId = ''
  let createdOfferId = ''
  let createdTxnId = ''

  // 1. HEALTH CHECK TEST
  try {
    const res = await axios.get(`${API_BASE}/health`)
    record('Health Check', 'GET /api/health', res.data.status === 'healthy', `Status: ${res.data.status}`)
  } catch (err: any) {
    record('Health Check', 'GET /api/health', false, err.message)
  }

  // 2. AUTHENTICATION FLOW
  try {
    // Farmer Login
    const fRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    farmerToken = fRes.data.data.token
    record('Auth Flow', 'Farmer Login', Boolean(farmerToken), `Role: ${fRes.data.data.user.user_type}`)

    // Buyer Login
    const bRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    buyerToken = bRes.data.data.token
    record('Auth Flow', 'Buyer Login', Boolean(buyerToken), `Role: ${bRes.data.data.user.user_type}`)

    // Admin Login
    const aRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    adminToken = aRes.data.data.token
    record('Auth Flow', 'Admin Login', Boolean(adminToken), `Role: ${aRes.data.data.user.user_type}`)
  } catch (err: any) {
    record('Auth Flow', 'User Logins', false, err.message)
  }

  // 3. AUTHORIZATION & RBAC ENFORCEMENT
  try {
    // 3.1 Farmer trying to access Buyer-only requirements
    try {
      await axios.get(`${API_BASE}/matching/requirements`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      })
      record('Authorization', 'Farmer blocked from Buyer API', false, 'Expected 403 Forbidden but received 200 OK')
    } catch (err: any) {
      const is403 = err.response?.status === 403
      record('Authorization', 'Farmer blocked from Buyer API', is403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // 3.2 Buyer trying to create a produce lot (Farmer-only)
    try {
      await axios.post(`${API_BASE}/lots`, { crop: 'Wheat' }, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
      record('Authorization', 'Buyer blocked from Farmer Lot API', false, 'Expected 403 Forbidden but received 200 OK')
    } catch (err: any) {
      const is403 = err.response?.status === 403
      record('Authorization', 'Buyer blocked from Farmer Lot API', is403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // 3.3 Farmer trying to access Admin Users API
    try {
      await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      })
      record('Authorization', 'Farmer blocked from Admin API', false, 'Expected 403 Forbidden but received 200 OK')
    } catch (err: any) {
      const is403 = err.response?.status === 403
      record('Authorization', 'Farmer blocked from Admin API', is403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // 3.4 Buyer trying to access Admin Users API
    try {
      await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
      record('Authorization', 'Buyer blocked from Admin API', false, 'Expected 403 Forbidden but received 200 OK')
    } catch (err: any) {
      const is403 = err.response?.status === 403
      record('Authorization', 'Buyer blocked from Admin API', is403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // 3.5 Admin successfully accesses Admin Users API
    const adminRes = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    record('Authorization', 'Admin authorized for Admin API', adminRes.data.success, `Found ${adminRes.data.count} users`)
  } catch (err: any) {
    record('Authorization', 'RBAC Suite', false, err.message)
  }

  // 4. COMPLETE FARMER & BUYER TRANSACTION FLOW
  try {
    // 4.1 Farmer creates lot
    const lotRes = await axios.post(`${API_BASE}/lots`, {
      crop: 'Soybean',
      category: 'Oilseeds',
      variety: 'JS-9560 Yellow Seed',
      quantity_qtl: 80,
      unit: 'Quintal',
      grade: 'Grade A',
      expected_price: 4950,
      min_acceptable_price: 4800,
      location: 'Sirali, Harda (M.P.)',
      pickup_location: 'Godown Bay #4',
      quality: {
        grade: 'Grade A',
        moisture_percent: 9.8,
        foreign_matter_percent: 0.5,
        visual_quality: 'Excellent Yellow Lustre',
      },
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    createdLotId = lotRes.data.data.id
    record('Farmer Flow', 'Create Lot with Quality Assay', Boolean(createdLotId), `Lot ID: ${createdLotId}`)

    // 4.2 Buyer views matching lots and makes commercial offer
    const offerRes = await axios.post(`${API_BASE}/offers`, {
      lot_id: createdLotId,
      offered_price: 4920,
      quantity_qtl: 80,
      payment_terms: 'e-NWR Escrow auto-release on gate receipt',
      pickup_location: 'Farm Godown Bay #4',
      message: 'Spot procurement for ITC Choupal Processing Unit.',
    }, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    createdOfferId = offerRes.data.data.id
    record('Buyer Flow', 'Submit Commercial Bid / Offer', Boolean(createdOfferId), `Offer ID: ${createdOfferId} for ₹${offerRes.data.data.total_amount}`)

    // 4.3 Farmer accepts offer -> Automatic Transaction Creation
    const acceptRes = await axios.post(`${API_BASE}/offers/${createdOfferId}/accept`, {}, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    createdTxnId = acceptRes.data.data.transaction.id
    record('Farmer Flow', 'Accept Offer & Generate Transaction', Boolean(createdTxnId), `Transaction ID: ${createdTxnId}, Status: ${acceptRes.data.data.transaction.transaction_status}`)

    // 4.4 Buyer creates Escrow Payment Order
    const orderRes = await axios.post(`${API_BASE}/payments/create`, {
      transactionId: createdTxnId,
      method: 'e-NWR Escrow Virtual Vault',
    }, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const orderId = orderRes.data.data.orderId
    record('Payment Flow', 'Create Escrow Deposit Order', Boolean(orderId), `Order ID: ${orderId}, Amount: ₹${orderRes.data.data.amount}`)

    // 4.5 Verify Escrow Deposit (Secured in Escrow)
    const verifyRes = await axios.post(`${API_BASE}/payments/sandbox-pay`, {
      transactionId: createdTxnId,
      paymentMethod: 'Razorpay Sandbox (Auto-Verified)',
      payerVpa: 'itc.procurement@icici',
    }, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    record('Payment Flow', 'Verify Payment & Fund Escrow', verifyRes.data.data.verified, `Payment Status: ${verifyRes.data.data.paymentStatus}`)

    // 4.6 Advance Transaction Stages: In Transit -> Completed
    const transitRes = await axios.post(`${API_BASE}/transactions/${createdTxnId}/advance-stage`, {
      nextStage: 'In Transit',
    }, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    record('Logistics Flow', 'Advance to In Transit', transitRes.data.data.transaction_status === 'In Transit', `Status: ${transitRes.data.data.transaction_status}`)

    const completeRes = await axios.post(`${API_BASE}/transactions/${createdTxnId}/advance-stage`, {
      nextStage: 'Completed',
    }, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    record('Settlement Flow', 'Delivery & Escrow Settlement', completeRes.data.data.transaction_status === 'Completed', `Final Status: ${completeRes.data.data.transaction_status}`)
  } catch (err: any) {
    record('Flow Test', 'Transaction & Escrow Flow', false, err.message)
  }

  // 5. EXTERNAL DATA SERVICES & PRICE INTELLIGENCE
  try {
    // 5.1 AGMARKNET Feed
    const agRes = await axios.get(`${API_BASE}/external/market-prices`)
    record('External Services', 'AGMARKNET Government Price Feed', agRes.data.success, `Source: ${agRes.data.source}, Records: ${agRes.data.count}`)

    // 5.2 eNAM Feed
    const enamRes = await axios.get(`${API_BASE}/external/enam/market-prices?crop=Wheat`)
    record('External Services', 'eNAM Electronic Auction Feed', enamRes.data.success, `Source: ${enamRes.data.source}, Records: ${enamRes.data.count}`)

    // 5.3 Live Weather Feed (Open-Meteo)
    const weatherRes = await axios.get(`${API_BASE}/weather?location=Sirali, Harda`)
    record('External Services', 'Open-Meteo Live Agro-Weather API', weatherRes.data.success && weatherRes.data.data.isLive, `Temp: ${weatherRes.data.data?.temperature}°C, Condition: ${weatherRes.data.data?.condition}, Advisory: ${weatherRes.data.data?.agriculturalAdvice?.slice(0, 40)}...`)

    // 5.4 Price Intelligence Net Realisation Engine
    if (createdLotId) {
      const piRes = await axios.get(`${API_BASE}/price-intelligence/${createdLotId}`)
      record('Price Intelligence', 'Net Realisation & Mandi Ranking', piRes.data.success, `Best Mandi: ${piRes.data.data.bestMandi}, Max Net Gain: ₹${piRes.data.data.maxNetGain}`)
    }

    // 5.5 Admin System Integration Status
    const sysRes = await axios.get(`${API_BASE}/admin/system-status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    record('Admin Diagnostics', 'System Integrations Status Deck', sysRes.data.success, `Services: ${Object.keys(sysRes.data.data.services).join(', ')}`)
  } catch (err: any) {
    record('External Services', 'Data Integrations Suite', false, err.message)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n====================================================')
  console.log(`🏁 QA & SECURITY PASS COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('====================================================\n')
}

runQAPass()
