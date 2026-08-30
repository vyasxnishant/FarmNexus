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

async function runBankDetailsQA() {
  console.log('==================================================================')
  console.log('🏦 FARMNEXUS SETTLEMENT BANK DETAILS & ENCRYPTION ARCHITECTURE QA')
  console.log('==================================================================\n')

  const uniqueA = Date.now().toString().slice(-4)
  const uniqueB = (Date.now() + 1).toString().slice(-4)

  let farmerAToken = ''
  let farmerAId = ''
  let farmerBToken = ''
  let farmerBId = ''
  let adminToken = ''

  // 1. REGISTER FARMER A
  try {
    const resA = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Rajesh Patel',
      phone: '+91 98260 11223',
      email: `rajesh.bank.${uniqueA}@farmnexus.in`,
      password: 'password123',
      user_type: 'FARMER',
      location: 'Sirali, Harda',
      state: 'Madhya Pradesh',
      district: 'Harda',
    })
    farmerAToken = resA.data.data.token
    farmerAId = resA.data.data.user.id
    record('Farmer Setup', 'Register Farmer A', Boolean(farmerAToken), `Farmer A ID: ${farmerAId}`)
  } catch (err: any) {
    record('Farmer Setup', 'Register Farmer A', false, err.message)
  }

  // 2. REGISTER FARMER B
  try {
    const resB = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Gopal Verma',
      phone: '+91 94251 44556',
      email: `gopal.bank.${uniqueB}@farmnexus.in`,
      password: 'password123',
      user_type: 'FARMER',
      location: 'Ashta, Sehore',
      state: 'Madhya Pradesh',
      district: 'Sehore',
    })
    farmerBToken = resB.data.data.token
    farmerBId = resB.data.data.user.id
    record('Farmer Setup', 'Register Farmer B', Boolean(farmerBToken), `Farmer B ID: ${farmerBId}`)
  } catch (err: any) {
    record('Farmer Setup', 'Register Farmer B', false, err.message)
  }

  // 3. ADMIN LOGIN
  try {
    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    adminToken = adminRes.data.data.token
    record('Admin Setup', 'Admin Login', Boolean(adminToken), 'Role: ADMIN')
  } catch (err: any) {
    record('Admin Setup', 'Admin Login', false, err.message)
  }

  // 4. NEW FARMER HAS NO HARDCODED BANK DATA
  try {
    const bankResA = await axios.get(`${API_BASE}/farmer/bank-details`, {
      headers: { Authorization: `Bearer ${farmerAToken}` },
    })
    const isUnconfigured = bankResA.data.data.is_configured === false
    record(
      'Fresh User State',
      'Newly registered Farmer A has unconfigured bank state (no fake data)',
      isUnconfigured,
      `Configured: ${bankResA.data.data.is_configured}, Message: "${bankResA.data.data.message}"`
    )
  } catch (err: any) {
    record('Fresh User State', 'Newly registered Farmer A has unconfigured bank state', false, err.message)
  }

  // 5. VALIDATION TESTS (Mismatched confirm, invalid IFSC, invalid UPI)
  try {
    // 5.1 Mismatched account numbers
    try {
      await axios.put(
        `${API_BASE}/farmer/bank-details`,
        {
          account_holder_name: 'Rajesh Patel',
          bank_name: 'State Bank of India',
          account_number: '123456789012',
          confirm_account_number: '123456789099', // MISMATCH
          ifsc_code: 'SBIN0000382',
        },
        { headers: { Authorization: `Bearer ${farmerAToken}` } }
      )
      record('Validation', 'Reject mismatched account numbers', false, 'Expected 400 error')
    } catch (err: any) {
      record('Validation', 'Reject mismatched account numbers', err.response?.status === 400, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // 5.2 Invalid IFSC code
    try {
      await axios.put(
        `${API_BASE}/farmer/bank-details`,
        {
          account_holder_name: 'Rajesh Patel',
          bank_name: 'State Bank of India',
          account_number: '123456789012',
          confirm_account_number: '123456789012',
          ifsc_code: 'INVALID_IFSC_123', // INVALID
        },
        { headers: { Authorization: `Bearer ${farmerAToken}` } }
      )
      record('Validation', 'Reject invalid IFSC code format', false, 'Expected 400 error')
    } catch (err: any) {
      record('Validation', 'Reject invalid IFSC code format', err.response?.status === 400, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }

    // 5.3 Invalid UPI ID
    try {
      await axios.put(
        `${API_BASE}/farmer/bank-details`,
        {
          account_holder_name: 'Rajesh Patel',
          bank_name: 'State Bank of India',
          account_number: '123456789012',
          confirm_account_number: '123456789012',
          ifsc_code: 'SBIN0000382',
          upi_id: 'not-a-valid-vpa', // INVALID
        },
        { headers: { Authorization: `Bearer ${farmerAToken}` } }
      )
      record('Validation', 'Reject invalid UPI ID format', false, 'Expected 400 error')
    } catch (err: any) {
      record('Validation', 'Reject invalid UPI ID format', err.response?.status === 400, `HTTP ${err.response?.status}: ${err.response?.data?.message}`)
    }
  } catch (err: any) {
    console.error('Validation test exception', err)
  }

  // 6. FARMER A CONFIGURES VALID BANK DETAILS
  try {
    const saveRes = await axios.put(
      `${API_BASE}/farmer/bank-details`,
      {
        account_holder_name: 'Rajesh Patel',
        bank_name: 'State Bank of India',
        account_number: '304918273645',
        confirm_account_number: '304918273645',
        ifsc_code: 'SBIN0000382',
        upi_id: 'rajesh.patel@sbi',
      },
      { headers: { Authorization: `Bearer ${farmerAToken}` } }
    )

    const data = saveRes.data.data
    const isMaskedAcc = data.bank_account_masked === '•••• •••• 3645'
    const isMaskedIfsc = data.ifsc_code_masked === 'SBIN****0382'
    const isMaskedUpi = data.upi_id_masked === 'ra****@sbi'
    const noRawAcc = data.account_number === undefined

    record(
      'Save & Masking',
      'Farmer A saves bank details with clean AES-256 masking',
      Boolean(isMaskedAcc && isMaskedIfsc && isMaskedUpi && noRawAcc),
      `Masked Acc: ${data.bank_account_masked}, Masked IFSC: ${data.ifsc_code_masked}, Masked UPI: ${data.upi_id_masked}`
    )
  } catch (err: any) {
    record('Save & Masking', 'Farmer A saves bank details', false, err.message)
  }

  // 7. FARMER A FETCHES OWN BANK DETAILS
  try {
    const fetchRes = await axios.get(`${API_BASE}/farmer/bank-details`, {
      headers: { Authorization: `Bearer ${farmerAToken}` },
    })
    const data = fetchRes.data.data
    record(
      'Persistence',
      'Farmer A reads own saved bank record',
      data.is_configured === true && data.bank_account_masked === '•••• •••• 3645',
      `Bank: ${data.bank_name}, Acc: ${data.bank_account_masked}`
    )
  } catch (err: any) {
    record('Persistence', 'Farmer A reads own saved bank record', false, err.message)
  }

  // 8. FARMER B ISOLATION TEST (Farmer B must NOT see Farmer A's bank details)
  try {
    const fetchResB = await axios.get(`${API_BASE}/farmer/bank-details`, {
      headers: { Authorization: `Bearer ${farmerBToken}` },
    })
    const dataB = fetchResB.data.data
    const isIsolated = dataB.is_configured === false
    record(
      'User Data Isolation',
      'Farmer B cannot access Farmer A bank details (Isolated per user account)',
      isIsolated,
      `Farmer B configured status: ${dataB.is_configured}`
    )
  } catch (err: any) {
    record('User Data Isolation', 'Farmer B isolation test', false, err.message)
  }

  // 9. FARMER A EDITS BANK DETAILS
  try {
    const updateRes = await axios.put(
      `${API_BASE}/farmer/bank-details`,
      {
        account_holder_name: 'Rajesh Patel',
        bank_name: 'Punjab National Bank',
        account_number: '987654321098',
        confirm_account_number: '987654321098',
        ifsc_code: 'PUNB0123400',
        upi_id: 'rajesh@pnb',
      },
      { headers: { Authorization: `Bearer ${farmerAToken}` } }
    )

    const updated = updateRes.data.data
    record(
      'Update Flow',
      'Farmer A updates bank details to PNB',
      updated.bank_name === 'Punjab National Bank' && updated.bank_account_masked === '•••• •••• 1098',
      `Updated Bank: ${updated.bank_name}, Acc: ${updated.bank_account_masked}, IFSC: ${updated.ifsc_code_masked}`
    )
  } catch (err: any) {
    record('Update Flow', 'Farmer A updates bank details to PNB', false, err.message)
  }

  // 10. UNAUTHENTICATED ACCESS BLOCKED
  try {
    await axios.get(`${API_BASE}/farmer/bank-details`)
    record('Security', 'Unauthenticated request blocked from bank details', false, 'Expected 401')
  } catch (err: any) {
    record('Security', 'Unauthenticated request blocked from bank details', err.response?.status === 401, `HTTP ${err.response?.status}`)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 BANK DETAILS ARCHITECTURE QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runBankDetailsQA()

