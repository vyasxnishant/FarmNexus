import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

interface TestResult {
  category: string
  name: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function record(category: string, name: string, passed: boolean, details: string) {
  results.push({ category, name, passed, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} [${category}] ${name}: ${details}`)
}

async function runSeparationQA() {
  console.log('==================================================================')
  console.log('🛡️ FARMNEXUS ADMIN AUTH IDENTITY & TARGET USER SEPARATION QA')
  console.log('==================================================================\n')

  let adminToken = ''
  let farmerToken = ''
  let buyerToken = ''

  // 1. ADMIN LOGIN
  try {
    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    adminToken = adminRes.data.data.token
    record('Admin Auth', 'Admin Login', Boolean(adminToken), `Admin ID: ${adminRes.data.data.user.id}`)

    const meRes1 = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    record('Admin Auth', 'Initial /api/auth/me check', meRes1.data.data.user.user_type === 'ADMIN', `Active Role: ${meRes1.data.data.user.user_type}`)
  } catch (err: any) {
    record('Admin Auth', 'Admin Login', false, err.message)
  }

  // 2. ADMIN OPENS FARMER DETAILS (USR-FRM-01)
  try {
    const targetFarmerRes = await axios.get(`${API_BASE}/admin/users/USR-FRM-01`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = targetFarmerRes.data.data
    const isTargetFarmer = data.user.id === 'USR-FRM-01' && data.user.user_type === 'FARMER'
    record(
      'Target User Inspection',
      'Admin retrieves Farmer target details (/api/admin/users/USR-FRM-01)',
      isTargetFarmer,
      `Target: ${data.user.name} (${data.user.id}), Lots: ${data.lots.length}, Txns: ${data.transactions.length}`
    )
  } catch (err: any) {
    record('Target User Inspection', 'Admin retrieves Farmer target details', false, err.message)
  }

  // 3. CRITICAL INVARIANT: ADMIN SESSION MUST REMAIN ADMIN
  try {
    const meRes2 = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const isStillAdmin = meRes2.data.data.user.user_type === 'ADMIN' && meRes2.data.data.user.id === 'USR-ADM-01'
    record(
      'Session Invariant',
      'Admin identity remains strictly ADMIN after inspecting Farmer (No impersonation)',
      isStillAdmin,
      `Authenticated User ID: ${meRes2.data.data.user.id}, Role: ${meRes2.data.data.user.user_type}`
    )
  } catch (err: any) {
    record('Session Invariant', 'Admin identity check after inspecting Farmer', false, err.message)
  }

  // 4. ADMIN OPENS BUYER DETAILS (USR-BUY-01)
  try {
    const targetBuyerRes = await axios.get(`${API_BASE}/admin/users/USR-BUY-01`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const data = targetBuyerRes.data.data
    const isTargetBuyer = data.user.id === 'USR-BUY-01' && data.user.user_type === 'BUYER'
    record(
      'Target User Inspection',
      'Admin retrieves Buyer target details (/api/admin/users/USR-BUY-01)',
      isTargetBuyer,
      `Target: ${data.user.name} (${data.user.id}), Org: ${data.user.organization}`
    )

    // Verify Admin is still Admin
    const meRes3 = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    record(
      'Session Invariant',
      'Admin identity remains strictly ADMIN after inspecting Buyer',
      meRes3.data.data.user.user_type === 'ADMIN',
      `Authenticated User ID: ${meRes3.data.data.user.id}, Role: ${meRes3.data.data.user.user_type}`
    )
  } catch (err: any) {
    record('Target User Inspection', 'Admin retrieves Buyer target details', false, err.message)
  }

  // 5. FARMER LOGIN & SECURITY CHECK
  try {
    const farmerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    farmerToken = farmerRes.data.data.token

    // Farmer attempts to call /api/admin/users/USR-FRM-02 (Must be 403 Forbidden)
    try {
      await axios.get(`${API_BASE}/admin/users/USR-FRM-02`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      })
      record('Authorization Safety', 'Farmer blocked from Admin user inspection endpoint', false, 'Expected 403 Forbidden')
    } catch (err: any) {
      record('Authorization Safety', 'Farmer blocked from Admin user inspection endpoint', err.response?.status === 403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // Farmer session remains Farmer
    const meFarmer = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    record('Authorization Safety', 'Farmer /api/auth/me remains FARMER', meFarmer.data.data.user.user_type === 'FARMER', `Role: ${meFarmer.data.data.user.user_type}`)
  } catch (err: any) {
    console.error('Farmer test exception', err)
  }

  // 6. BUYER LOGIN & SECURITY CHECK
  try {
    const buyerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    buyerToken = buyerRes.data.data.token

    // Buyer attempts to call /api/admin/users/USR-FRM-01 (Must be 403 Forbidden)
    try {
      await axios.get(`${API_BASE}/admin/users/USR-FRM-01`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
      record('Authorization Safety', 'Buyer blocked from Admin user inspection endpoint', false, 'Expected 403 Forbidden')
    } catch (err: any) {
      record('Authorization Safety', 'Buyer blocked from Admin user inspection endpoint', err.response?.status === 403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // Buyer session remains Buyer
    const meBuyer = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    record('Authorization Safety', 'Buyer /api/auth/me remains BUYER', meBuyer.data.data.user.user_type === 'BUYER', `Role: ${meBuyer.data.data.user.user_type}`)
  } catch (err: any) {
    console.error('Buyer test exception', err)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 SEPARATION QA MATRIX: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runSeparationQA()
