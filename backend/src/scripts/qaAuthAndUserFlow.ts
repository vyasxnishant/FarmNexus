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

async function runAuthQA() {
  console.log('==================================================================')
  console.log('🌾 FARMNEXUS AUTHENTICATION & USER-DATA ARCHITECTURE QA SUITE')
  console.log('==================================================================\n')

  const uniqueId = Date.now().toString().slice(-4)
  const newFarmerEmail = `rajesh.kumar.${uniqueId}@gmail.com`
  const newBuyerEmail = `procurement.godrej.${uniqueId}@godrej.in`

  let newFarmerToken = ''
  let newFarmerId = ''
  let newBuyerToken = ''
  let newBuyerId = ''
  let adminToken = ''
  let createdLotId = ''

  // 1. HEALTH CHECK
  try {
    const res = await axios.get(`${API_BASE}/health`)
    record('Health Check', 'GET /api/health', res.data.status === 'healthy', `Status: ${res.data.status}`)
  } catch (err: any) {
    record('Health Check', 'GET /api/health', false, err.message)
  }

  // 2. NEW FARMER REGISTRATION & VERIFICATION
  try {
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Rajesh Kumar Patel',
      phone: '+91 94250 99881',
      email: newFarmerEmail,
      password: 'securePassword123!',
      user_type: 'FARMER',
      location: 'Khirkiya, Harda',
      district: 'Harda',
      state: 'Madhya Pradesh',
      organization: 'Narmada Valley Kisan FPO',
      total_land_acres: 18,
    })

    newFarmerToken = regRes.data.data.token
    newFarmerId = regRes.data.data.user.id
    record(
      'Registration',
      'Register New Farmer',
      Boolean(newFarmerToken && newFarmerId),
      `User ID: ${newFarmerId}, Role: ${regRes.data.data.user.user_type}`
    )
  } catch (err: any) {
    record('Registration', 'Register New Farmer', false, err.message)
  }

  // 3. FARMER DATA ISOLATION (Empty state for new user)
  try {
    const lotsRes = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${newFarmerToken}` },
    })
    const isIsolated = Array.isArray(lotsRes.data.data) && lotsRes.data.data.length === 0
    record(
      'User Data Isolation',
      'New Farmer lots isolated (Empty initial list, not seeded demo)',
      isIsolated,
      `Lots count: ${lotsRes.data.data.length}`
    )
  } catch (err: any) {
    record('User Data Isolation', 'New Farmer lots isolated', false, err.message)
  }

  // 4. FARMER CREATES OWN LOT
  try {
    const lotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Wheat (Sharbati)',
        category: 'Grains',
        variety: 'C-306 Desi Sharbati',
        quantity_qtl: 120,
        unit: 'Quintal',
        grade: 'Grade A (Export)',
        expected_price: 2850,
        min_acceptable_price: 2750,
        location: 'Khirkiya, Harda (MP)',
        pickup_location: 'Farm Godown Bay #2',
        quality: {
          grade: 'Grade A (Export)',
          moisture_percent: 10.2,
          foreign_matter_percent: 0.3,
          visual_quality: 'Excellent Bold Grain',
        },
      },
      {
        headers: { Authorization: `Bearer ${newFarmerToken}` },
      }
    )

    createdLotId = lotRes.data.data.id
    const lotOwned = lotRes.data.data.farmer_id === newFarmerId
    record(
      'Farmer Lot Creation',
      'Lot Created with Strict Farmer Ownership',
      Boolean(createdLotId && lotOwned),
      `Lot ID: ${createdLotId}, Owner: ${lotRes.data.data.farmer_id}`
    )

    // Verify GET /lots/my now returns exactly 1 lot
    const myLotsRes = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${newFarmerToken}` },
    })
    record(
      'Farmer Lot Verification',
      'GET /api/lots/my returns authenticated user lot',
      myLotsRes.data.data.length === 1 && myLotsRes.data.data[0].id === createdLotId,
      `Returned lot: ${myLotsRes.data.data[0]?.id}`
    )
  } catch (err: any) {
    record('Farmer Lot Creation', 'Create own lot', false, err.message)
  }

  // 5. NEW BUYER REGISTRATION
  try {
    const buyerRegRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Anand Mahindra Agrico',
      phone: '+91 22 2490 1441',
      email: newBuyerEmail,
      password: 'buyerPassword456!',
      user_type: 'BUYER',
      company_name: 'Mahindra Agri Solutions Ltd.',
      organization: 'Mahindra Agri Solutions Ltd.',
      gst_number: '27AAACM0123P1Z5',
      location: 'Indore Food Processing Park, MP',
      district: 'Indore',
      state: 'Madhya Pradesh',
    })

    newBuyerToken = buyerRegRes.data.data.token
    newBuyerId = buyerRegRes.data.data.user.id
    record(
      'Registration',
      'Register New Buyer',
      Boolean(newBuyerToken && newBuyerId),
      `User ID: ${newBuyerId}, Role: ${buyerRegRes.data.data.user.user_type}`
    )
  } catch (err: any) {
    record('Registration', 'Register New Buyer', false, err.message)
  }

  // 6. BUYER SETS REQUIREMENTS & MAKES BINDING OFFER
  try {
    const reqRes = await axios.put(
      `${API_BASE}/matching/requirements`,
      {
        crop: 'Wheat (Sharbati)',
        quantity_qtl: 120,
        preferred_grade: 'Grade A (Export)',
        location: 'Indore / Harda',
        max_price: 2880,
      },
      {
        headers: { Authorization: `Bearer ${newBuyerToken}` },
      }
    )
    record(
      'Buyer Requirements',
      'Buyer updates procurement requirements',
      reqRes.data.success,
      `Crop: ${reqRes.data.data.crop}, Max Price: ₹${reqRes.data.data.max_price}`
    )

    // Buyer makes offer on Farmer's newly created lot
    const offerRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: createdLotId,
        offered_price: 2840,
        quantity_qtl: 120,
        payment_terms: '100% virtual escrow lock upon deal acceptance',
        pickup_location: 'Farm Godown Bay #2',
        message: 'Immediate bulk procurement for Mahindra processing unit.',
      },
      {
        headers: { Authorization: `Bearer ${newBuyerToken}` },
      }
    )
    record(
      'Buyer Offer',
      'Buyer places commercial bid on farmer lot',
      offerRes.data.success,
      `Offer ID: ${offerRes.data.data.id}, Total: ₹${offerRes.data.data.total_amount}`
    )
  } catch (err: any) {
    record('Buyer Flow', 'Requirements & Offer placement', false, err.message)
  }

  // 7. SECURITY & ROLE ISOLATION TESTS
  try {
    // 7.1 Farmer attempts to access Buyer requirements
    try {
      await axios.get(`${API_BASE}/matching/requirements`, {
        headers: { Authorization: `Bearer ${newFarmerToken}` },
      })
      record('Role Isolation', 'Farmer blocked from Buyer API', false, 'Expected 403 Forbidden')
    } catch (err: any) {
      record('Role Isolation', 'Farmer blocked from Buyer API', err.response?.status === 403, `HTTP ${err.response?.status}`)
    }

    // 7.2 Buyer attempts to create a produce lot (Farmer-only)
    try {
      await axios.post(`${API_BASE}/lots`, { crop: 'Soybean' }, {
        headers: { Authorization: `Bearer ${newBuyerToken}` },
      })
      record('Role Isolation', 'Buyer blocked from Farmer Lot creation', false, 'Expected 403 Forbidden')
    } catch (err: any) {
      record('Role Isolation', 'Buyer blocked from Farmer Lot creation', err.response?.status === 403, `HTTP ${err.response?.status}`)
    }

    // 7.3 Buyer attempts to delete Farmer's lot
    try {
      await axios.delete(`${API_BASE}/lots/${createdLotId}`, {
        headers: { Authorization: `Bearer ${newBuyerToken}` },
      })
      record('Ownership Security', 'Buyer blocked from deleting Farmer lot', false, 'Expected 403/Error')
    } catch (err: any) {
      record('Ownership Security', 'Buyer blocked from deleting Farmer lot', err.response?.status === 403, `HTTP ${err.response?.status}`)
    }

    // 7.4 Unauthenticated request to /api/auth/me
    try {
      await axios.get(`${API_BASE}/auth/me`)
      record('Auth Security', 'Unauthenticated request blocked', false, 'Expected 401 Unauthorized')
    } catch (err: any) {
      record('Auth Security', 'Unauthenticated request blocked', err.response?.status === 401, `HTTP ${err.response?.status}`)
    }
  } catch (err: any) {
    record('Security Suite', 'RBAC & Authorization checks', false, err.message)
  }

  // 8. ADMIN LOGIN & USER MANAGEMENT
  try {
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    adminToken = adminLoginRes.data.data.token
    record('Admin Authentication', 'Admin Login', Boolean(adminToken), `Role: ${adminLoginRes.data.data.user.user_type}`)

    // Admin fetches all users from backend
    const allUsersRes = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const foundFarmer = allUsersRes.data.data.find((u: any) => u.id === newFarmerId)
    const foundBuyer = allUsersRes.data.data.find((u: any) => u.id === newBuyerId)
    record(
      'Admin User Management',
      'Newly registered Farmer & Buyer visible in Admin Users list',
      Boolean(foundFarmer && foundBuyer),
      `Found Farmer: ${foundFarmer?.name}, Buyer: ${foundBuyer?.name}`
    )

    // Admin verifies Farmer KYC
    const verifyRes = await axios.post(
      `${API_BASE}/admin/users/${newFarmerId}/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    )
    record('Admin User Management', 'Admin verifies Farmer KYC', verifyRes.data.data.kyc_verified === true, 'KYC Verified: true')

    // Admin suspends Buyer account
    const suspendRes = await axios.post(
      `${API_BASE}/admin/users/${newBuyerId}/suspend`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    )
    record('Admin User Management', 'Admin suspends user account', suspendRes.data.data.status === 'Suspended', 'Status: Suspended')

    // Suspended Buyer tries to log in
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: newBuyerEmail,
        password: 'buyerPassword456!',
      })
      record('Account Status Enforcement', 'Suspended user blocked from logging in', false, 'Expected login failure')
    } catch (err: any) {
      record('Account Status Enforcement', 'Suspended user blocked from logging in', true, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // Admin reactivates Buyer account
    const activateRes = await axios.post(
      `${API_BASE}/admin/users/${newBuyerId}/activate`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    )
    record('Admin User Management', 'Admin reactivates user account', activateRes.data.data.status === 'Active', 'Status: Active')
  } catch (err: any) {
    record('Admin Suite', 'Admin operations', false, err.message)
  }

  // 9. PROFILE ENDPOINT SAFETY & CREDENTIAL ISOLATION
  try {
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${newFarmerToken}` },
    })

    const userObj = meRes.data.data.user
    const hasNoPassword = userObj.password === undefined && userObj.password_hash === undefined
    record(
      'Profile Endpoint Safety',
      'GET /api/auth/me returns safe profile without passwords/hashes',
      hasNoPassword,
      `User: ${userObj.name}, Keys returned: ${Object.keys(userObj).join(', ')}`
    )
  } catch (err: any) {
    record('Profile Endpoint Safety', 'GET /api/auth/me verification', false, err.message)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 AUTH & USER ARCHITECTURE QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runAuthQA()

