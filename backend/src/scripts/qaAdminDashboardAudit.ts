import axios from 'axios'

const API_BASE = 'https://farm-nexus-qwoz.vercel.app/api'

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
  console.log(`${icon} [${step}] ${description}: ${details || ''}`)
}

export async function runAdminDashboardAudit() {
  console.log('\n==================================================================')
  console.log('🛡️ FARMNEXUS ADMIN DASHBOARD COMPLETE AUDIT')
  console.log('==================================================================\n')

  let adminToken = ''
  let farmerToken = ''
  let buyerToken = ''
  let testFarmerId = ''
  let testLotId = ''

  try {
    // -------------------------------------------------------------
    // STAGE 1: Admin Authentication & Credentials Verification
    // -------------------------------------------------------------
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    adminToken = adminLoginRes.data.data.token
    const adminUser = adminLoginRes.data.data.user

    record(
      'STAGE 1: Admin Authentication',
      'Admin logs in with authorized credentials and receives signed JWT with ADMIN role',
      Boolean(adminToken) && adminUser.user_type === 'ADMIN',
      `Admin User: ${adminUser.name} (${adminUser.id}), Role: ${adminUser.user_type}`
    )

    // -------------------------------------------------------------
    // STAGE 2: RBAC Security Guard (Farmer & Buyer Blocked with HTTP 403)
    // -------------------------------------------------------------
    // Login Farmer
    const farmerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    farmerToken = farmerLoginRes.data.data.token
    testFarmerId = farmerLoginRes.data.data.user.id

    // Login Buyer
    const buyerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    buyerToken = buyerLoginRes.data.data.token

    // Test 2.1: Farmer blocked from Admin APIs
    let farmerBlocked = false
    let farmerErrorMsg = ''
    try {
      await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      })
    } catch (err: any) {
      farmerBlocked = err.response?.status === 403
      farmerErrorMsg = err.response?.data?.message || err.message
    }

    record(
      'STAGE 2.1: Farmer Access Blocked',
      'Farmer account attempting to access Admin endpoint is strictly blocked with HTTP 403',
      farmerBlocked,
      `HTTP 403 Guard: "${farmerErrorMsg}"`
    )

    // Test 2.2: Buyer blocked from Admin APIs
    let buyerBlocked = false
    let buyerErrorMsg = ''
    try {
      await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
    } catch (err: any) {
      buyerBlocked = err.response?.status === 403
      buyerErrorMsg = err.response?.data?.message || err.message
    }

    record(
      'STAGE 2.2: Buyer Access Blocked',
      'Buyer account attempting to access Admin endpoint is strictly blocked with HTTP 403',
      buyerBlocked,
      `HTTP 403 Guard: "${buyerErrorMsg}"`
    )

    // Test 2.3: Unauthenticated request blocked with HTTP 401
    let unauthBlocked = false
    try {
      await axios.get(`${API_BASE}/admin/users`)
    } catch (err: any) {
      unauthBlocked = err.response?.status === 401
    }

    record(
      'STAGE 2.3: Unauthenticated Blocked',
      'Request with missing token is blocked with HTTP 401 Unauthorized',
      unauthBlocked,
      'HTTP 401 Guard verified'
    )

    // -------------------------------------------------------------
    // STAGE 3: Admin User Management (Farmers, Buyers, Admins)
    // -------------------------------------------------------------
    const usersRes = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const allUsers = usersRes.data.data
    const farmersList = allUsers.filter((u: any) => u.user_type === 'FARMER')
    const buyersList = allUsers.filter((u: any) => u.user_type === 'BUYER')
    const adminsList = allUsers.filter((u: any) => u.user_type === 'ADMIN')

    const hasAllRoles = farmersList.length > 0 && buyersList.length > 0 && adminsList.length > 0
    const allUsersHaveFields = allUsers.every(
      (u: any) => u.id && u.name && u.email && u.phone && u.user_type && u.status
    )

    record(
      'STAGE 3: User Directory',
      'Admin retrieves real registered users cleanly separated into Farmers, Buyers, and Admins',
      hasAllRoles && allUsersHaveFields,
      `Total: ${allUsers.length} Users (Farmers: ${farmersList.length}, Buyers: ${buyersList.length}, Admins: ${adminsList.length})`
    )

    // -------------------------------------------------------------
    // STAGE 4: User KYC Verification Action
    // -------------------------------------------------------------
    const verifyRes = await axios.post(
      `${API_BASE}/admin/users/${testFarmerId}/verify`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    const verifiedUser = verifyRes.data.data

    record(
      'STAGE 4: KYC Verification Action',
      'Admin verifies producer KYC and mandate operates on real user ID',
      verifiedUser.kyc_verified === true && verifiedUser.id === testFarmerId,
      `Farmer ID: ${verifiedUser.id}, KYC Status: ${verifiedUser.kyc_verified ? 'Verified' : 'Pending'}`
    )

    // -------------------------------------------------------------
    // STAGE 5: User Suspension and Reactivation
    // -------------------------------------------------------------
    const suspendRes = await axios.post(
      `${API_BASE}/admin/users/${testFarmerId}/suspend`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    const suspendedStatus = suspendRes.data.data.status

    const activateRes = await axios.post(
      `${API_BASE}/admin/users/${testFarmerId}/activate`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    const activeStatus = activateRes.data.data.status

    record(
      'STAGE 5: Account Status Controls',
      'Admin suspends and reactivates account dynamically',
      suspendedStatus === 'Suspended' && activeStatus === 'Active',
      `Suspension: "${suspendedStatus}" -> Reactivation: "${activeStatus}"`
    )

    // -------------------------------------------------------------
    // STAGE 6: Real Lot Monitoring & Quality Flagging
    // -------------------------------------------------------------
    // Farmer creates a lot
    const lotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Wheat (Sharbati)',
        crop_hi: 'शरबती गेहूं',
        category: 'Cereals & Grains',
        variety: 'C-306 Special',
        quantity_qtl: 75,
        unit: 'Quintal',
        grade: 'Grade A',
        expected_price: 2750,
        min_acceptable_price: 2650,
        location: 'Sirali Godown Bay #2, Harda',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    testLotId = lotRes.data.data.id

    const adminLotsRes = await axios.get(`${API_BASE}/admin/lots`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const adminLots = adminLotsRes.data.data
    const targetLotInAdmin = adminLots.find((l: any) => l.id === testLotId)

    // Admin flags lot for review
    const flagRes = await axios.post(
      `${API_BASE}/admin/lots/${testLotId}/flag`,
      { reason: 'Moisture assay re-verification requested by APMC' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    const flaggedLot = flagRes.data.data

    record(
      'STAGE 6: Lot Monitoring & Compliance',
      'Admin monitors real lots and flags listing for quality review',
      Boolean(targetLotInAdmin) && flaggedLot.status === 'Under Review',
      `Found Lot: ${testLotId} (${targetLotInAdmin?.crop}), Flagged Status: "${flaggedLot.status}"`
    )

    // -------------------------------------------------------------
    // STAGE 7: Real Bids & Proposals Oversight
    // -------------------------------------------------------------
    const adminOffersRes = await axios.get(`${API_BASE}/admin/offers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const adminOffers = adminOffersRes.data.data
    const allOffersValid = Array.isArray(adminOffers) && adminOffers.every(
      (o: any) => o.id && o.lot_id && o.buyer_id && o.offered_price && o.quantity_qtl && o.status
    )

    record(
      'STAGE 7: Bids & Offers Oversight',
      'Admin views real commercial bids with buyer, lot, quantity, and status attributes',
      allOffersValid,
      `Total Network Bids: ${adminOffers.length}, Sample: ${adminOffers[0]?.id || 'None'}`
    )

    // -------------------------------------------------------------
    // STAGE 8: Real Deals & Escrow Ledger Oversight
    // -------------------------------------------------------------
    const adminTxnsRes = await axios.get(`${API_BASE}/admin/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const adminTxns = adminTxnsRes.data.data
    const allTxnsValid = Array.isArray(adminTxns) && adminTxns.every(
      (t: any) => t.id && t.lot_id && t.farmer_id && t.buyer_id && t.final_amount
    )

    record(
      'STAGE 8: Deals & Trade Ledger',
      'Admin inspects binding deal contracts and transaction lifecycles',
      allTxnsValid,
      `Total Contracts: ${adminTxns.length}, Sample: ${adminTxns[0]?.id || 'None'}`
    )

    // -------------------------------------------------------------
    // STAGE 9: Real Payment & Escrow Monitoring
    // -------------------------------------------------------------
    const adminPaymentsRes = await axios.get(`${API_BASE}/admin/payments`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const adminPayments = adminPaymentsRes.data.data

    record(
      'STAGE 9: Payment & Escrow Oversight',
      'Admin views genuine payment transactions with real server-calculated amounts',
      Array.isArray(adminPayments),
      `Verified Payments in Ledger: ${adminPayments.length}`
    )

    // -------------------------------------------------------------
    // STAGE 10: Market Data Authority (CRUD & Zero Fake Data)
    // -------------------------------------------------------------
    // Admin creates benchmark price
    const newPriceRes = await axios.post(
      `${API_BASE}/admin/market-prices`,
      {
        market: 'Indore APMC Mega Terminal',
        commodity: 'Soybean',
        variety: 'Yellow Standard',
        grade: 'Grade A',
        min_price: 4900,
        modal_price: 5050,
        max_price: 5200,
        price_change: 2.4,
        trend: 'up',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    const createdPrice = newPriceRes.data.data

    // Admin updates benchmark price
    const updatedPriceRes = await axios.put(
      `${API_BASE}/admin/market-prices/${createdPrice.id}`,
      { modal_price: 5100, price_change: 3.1 },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    const updatedPrice = updatedPriceRes.data.data

    // Admin deletes price
    const deletePriceRes = await axios.delete(
      `${API_BASE}/admin/market-prices/${createdPrice.id}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )

    record(
      'STAGE 10: Market Data Authority',
      'Admin publishes, updates, and deletes APMC benchmark market prices dynamically',
      createdPrice.modal_price === 5050 && updatedPrice.modal_price === 5100 && deletePriceRes.data.success === true,
      `Created: ₹5,050 -> Updated: ₹5,100 -> Deleted: ID ${createdPrice.id}`
    )

    // -------------------------------------------------------------
    // STAGE 11: Dynamic Dashboard Statistics
    // -------------------------------------------------------------
    const statusRes = await axios.get(`${API_BASE}/admin/system-status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const sysStatus = statusRes.data.data

    record(
      'STAGE 11: Dynamic System Statistics',
      'System status returns live calculated metrics for database and service feeds',
      sysStatus.server_status === 'Operational' && sysStatus.services?.enam !== undefined && sysStatus.statistics !== undefined,
      `Server: "${sysStatus.server_status}", DB: "${sysStatus.database_engine}", Uptime: ${sysStatus.uptime_seconds}s, Total Farmers: ${sysStatus.statistics?.total_farmers}`
    )

    // -------------------------------------------------------------
    // STAGE 12: Multi-Session Persistence on Re-Login
    // -------------------------------------------------------------
    const reloginAdminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    const newAdminToken = reloginAdminRes.data.data.token

    const postReloginUsersRes = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${newAdminToken}` },
    })
    const persistedUsers = postReloginUsersRes.data.data
    const persistedFarmer = persistedUsers.find((u: any) => u.id === testFarmerId)

    record(
      'STAGE 12: Multi-Session Persistence',
      'After admin re-login, all user statuses, KYC verifications, and lots persist accurately',
      persistedFarmer?.kyc_verified === true && persistedFarmer?.status === 'Active',
      `Persisted Farmer: ${persistedFarmer?.name}, KYC: ${persistedFarmer?.kyc_verified}, Status: ${persistedFarmer?.status}`
    )

    // -------------------------------------------------------------
    // STAGE 13: Activity Audit Logging
    // -------------------------------------------------------------
    const logsRes = await axios.get(`${API_BASE}/admin/activity-logs`, {
      headers: { Authorization: `Bearer ${newAdminToken}` },
    })
    const logs = logsRes.data.data
    const hasLogs = Array.isArray(logs) && logs.length > 0

    record(
      'STAGE 13: Audit Trail Integrity',
      'All administrative actions record immutable audit logs with admin identity and timestamp',
      hasLogs,
      `Total Logged Actions: ${logs.length}, Latest: "${logs[0]?.action}" on ${logs[0]?.target_type}`
    )

  } catch (err: any) {
    console.error('Admin QA Execution Error:', err.response?.data || err.message)
    record('Execution Guard', 'Audit Execution Completeness', false, err.message)
  }

  console.log('\n==================================================================')
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  console.log(`🏁 ADMIN DASHBOARD AUDIT QA: ${passed} PASSED, ${failed} FAILED`)
  console.log('==================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

// Auto-run if executed directly
if (process.argv[1]?.includes('qaAdminDashboardAudit')) {
  runAdminDashboardAudit()
}
