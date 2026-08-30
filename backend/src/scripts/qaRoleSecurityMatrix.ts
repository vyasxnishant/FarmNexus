import axios from 'axios'
import jwt from 'jsonwebtoken'

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

async function runSecurityQA() {
  console.log('==================================================================')
  console.log('🛡️ FARMNEXUS STRICT RBAC & ROLE SECURITY TEST MATRIX')
  console.log('==================================================================\n')

  let farmerToken = ''
  let buyerToken = ''
  let adminToken = ''

  // 1. OBTAIN VALID TOKENS
  try {
    const farmerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    farmerToken = farmerRes.data.data.token
    record('Auth Setup', 'Login as FARMER', Boolean(farmerToken), `Role: ${farmerRes.data.data.user.user_type}`)

    const buyerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    buyerToken = buyerRes.data.data.token
    record('Auth Setup', 'Login as BUYER', Boolean(buyerToken), `Role: ${buyerRes.data.data.user.user_type}`)

    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    adminToken = adminRes.data.data.token
    record('Auth Setup', 'Login as ADMIN', Boolean(adminToken), `Role: ${adminRes.data.data.user.user_type}`)
  } catch (err: any) {
    console.error('Setup failed', err)
  }

  // 2. UNAUTHENTICATED -> ADMIN APIS
  try {
    await axios.get(`${API_BASE}/admin/users`)
    record('Unauthenticated -> Admin', 'GET /api/admin/users', false, 'Expected 401 Unauthorized')
  } catch (err: any) {
    record('Unauthenticated -> Admin', 'GET /api/admin/users blocked', err.response?.status === 401, `HTTP ${err.response?.status}`)
  }

  try {
    await axios.get(`${API_BASE}/admin/lots`)
    record('Unauthenticated -> Admin', 'GET /api/admin/lots blocked', false, 'Expected 401')
  } catch (err: any) {
    record('Unauthenticated -> Admin', 'GET /api/admin/lots blocked', err.response?.status === 401, `HTTP ${err.response?.status}`)
  }

  // 3. FARMER -> ADMIN APIS (EXPECT 403 FORBIDDEN)
  const adminEndpoints = [
    '/admin/users',
    '/admin/lots',
    '/admin/offers',
    '/admin/transactions',
    '/admin/payments',
    '/admin/activity-logs',
  ]

  for (const ep of adminEndpoints) {
    try {
      await axios.get(`${API_BASE}${ep}`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      })
      record('Farmer -> Admin', `FARMER accessing ${ep}`, false, 'Expected 403 Forbidden')
    } catch (err: any) {
      record('Farmer -> Admin', `FARMER blocked from ${ep}`, err.response?.status === 403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }
  }

  // 4. BUYER -> ADMIN APIS (EXPECT 403 FORBIDDEN)
  for (const ep of adminEndpoints) {
    try {
      await axios.get(`${API_BASE}${ep}`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
      record('Buyer -> Admin', `BUYER accessing ${ep}`, false, 'Expected 403 Forbidden')
    } catch (err: any) {
      record('Buyer -> Admin', `BUYER blocked from ${ep}`, err.response?.status === 403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }
  }

  // 5. ADMIN -> ADMIN APIS (EXPECT 200 OK)
  for (const ep of ['/admin/users', '/admin/lots', '/admin/activity-logs']) {
    try {
      const res = await axios.get(`${API_BASE}${ep}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      record('Admin -> Admin', `ADMIN allowed on ${ep}`, res.status === 200 && res.data.success === true, `HTTP 200 OK (${res.data.data?.length || 0} records)`)
    } catch (err: any) {
      record('Admin -> Admin', `ADMIN allowed on ${ep}`, false, err.message)
    }
  }

  // 6. FARMER -> BUYER APIS (EXPECT 403 FORBIDDEN)
  try {
    await axios.get(`${API_BASE}/matching/requirements`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    record('Farmer -> Buyer', 'FARMER accessing /matching/requirements', false, 'Expected 403')
  } catch (err: any) {
    record('Farmer -> Buyer', 'FARMER blocked from /matching/requirements', err.response?.status === 403, `HTTP ${err.response?.status}`)
  }

  try {
    await axios.get(`${API_BASE}/offers/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    record('Farmer -> Buyer', 'FARMER accessing /offers/my', false, 'Expected 403')
  } catch (err: any) {
    record('Farmer -> Buyer', 'FARMER blocked from /offers/my (Buyer bids)', err.response?.status === 403, `HTTP ${err.response?.status}`)
  }

  // 7. BUYER -> FARMER APIS (EXPECT 403 FORBIDDEN)
  try {
    await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    record('Buyer -> Farmer', 'BUYER accessing /lots/my', false, 'Expected 403')
  } catch (err: any) {
    record('Buyer -> Farmer', 'BUYER blocked from /lots/my (Farmer lot management)', err.response?.status === 403, `HTTP ${err.response?.status}`)
  }

  try {
    await axios.post(
      `${API_BASE}/lots`,
      { crop: 'Wheat' },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    record('Buyer -> Farmer', 'BUYER attempting to create lot', false, 'Expected 403')
  } catch (err: any) {
    record('Buyer -> Farmer', 'BUYER blocked from creating lot', err.response?.status === 403, `HTTP ${err.response?.status}`)
  }

  // 8. FARMER -> FARMER APIS (EXPECT 200 OK)
  try {
    const res = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    record('Farmer -> Farmer', 'FARMER accessing own lots /lots/my', res.status === 200, `HTTP 200 OK (${res.data.data.length} lots)`)
  } catch (err: any) {
    record('Farmer -> Farmer', 'FARMER accessing own lots', false, err.message)
  }

  // 9. BUYER -> BUYER APIS (EXPECT 200 OK)
  try {
    const res = await axios.get(`${API_BASE}/offers/my`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    record('Buyer -> Buyer', 'BUYER accessing own bids /offers/my', res.status === 200, `HTTP 200 OK (${res.data.data.length} offers)`)
  } catch (err: any) {
    record('Buyer -> Buyer', 'BUYER accessing own bids', false, err.message)
  }

  // 10. ROLE MANIPULATION & SPOOFING SECURITY
  // 10.1 Try registering directly with user_type: "ADMIN"
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      name: 'Hacker Admin',
      email: `fakeadmin.${Date.now()}@hacked.com`,
      password: 'password123',
      phone: '+91 99999 00000',
      user_type: 'ADMIN', // FORBIDDEN
      location: 'Harda, MP',
      state: 'Madhya Pradesh',
      district: 'Harda',
    })
    record('Role Manipulation', 'Public registration rejecting ADMIN user_type', false, 'Expected rejection for ADMIN registration')
  } catch (err: any) {
    record('Role Manipulation', 'Public registration rejecting ADMIN user_type', err.response?.status >= 400, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
  }

  // 10.2 Try changing role via profile update PUT /api/auth/profile
  try {
    await axios.put(
      `${API_BASE}/auth/profile`,
      {
        user_type: 'ADMIN',
        role: 'ADMIN',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )

    // Check /api/auth/me to verify user_type is still FARMER
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const isStillFarmer = meRes.data.data.user.user_type === 'FARMER'
    record('Role Manipulation', 'Profile update cannot escalate role to ADMIN', isStillFarmer, `User role remains: ${meRes.data.data.user.user_type}`)
  } catch (err: any) {
    record('Role Manipulation', 'Profile update cannot escalate role to ADMIN', false, err.message)
  }

  // 10.3 Try forged JWT token with user_type: "ADMIN" signed with a fake key
  try {
    const forgedToken = jwt.sign(
      { id: 'USR-FAR-001', email: 'ramesh@farmnexus.in', name: 'Ramesh Patel', user_type: 'ADMIN' },
      'fake-secret-key-attacker'
    )
    await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    })
    record('Token Security', 'Reject forged JWT token signed with fake key', false, 'Expected 403 token rejection')
  } catch (err: any) {
    record('Token Security', 'Reject forged JWT token signed with fake key', err.response?.status === 403, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 RBAC SECURITY TEST MATRIX: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runSecurityQA()
