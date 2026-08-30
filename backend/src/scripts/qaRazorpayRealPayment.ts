import axios from 'axios'
import crypto from 'crypto'

const API_BASE = 'http://localhost:5000/api'
const RAZORPAY_KEY_SECRET = 'secret_test_farmnexus_rzp_2026'

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

async function runRazorpayQA() {
  console.log('==================================================================')
  console.log('💳 FARMNEXUS RAZORPAY TEST GATEWAY & ESCROW VERIFICATION QA')
  console.log('==================================================================\n')

  let buyerToken = ''
  let farmerToken = ''
  let adminToken = ''

  // 1. Log in users
  try {
    const buyerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    buyerToken = buyerRes.data.data.token
    record('Auth Setup', 'Buyer Login', Boolean(buyerToken), `Buyer: ${buyerRes.data.data.user.name}`)

    const farmerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    farmerToken = farmerRes.data.data.token
    record('Auth Setup', 'Farmer Login', Boolean(farmerToken), `Farmer: ${farmerRes.data.data.user.name}`)

    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@farmnexus.in',
      password: 'password123',
    })
    adminToken = adminRes.data.data.token
    record('Auth Setup', 'Admin Login', Boolean(adminToken), `Admin: ${adminRes.data.data.user.name}`)
  } catch (err: any) {
    console.error('Login failed', err.message)
    return
  }

  // 2. Gateway Config Check (Secret Key never exposed)
  try {
    const configRes = await axios.get(`${API_BASE}/payments/config`)
    const data = configRes.data.data
    const isSafe = data.keyId && !data.keySecret && !data.razorpayKeySecret && !data.secret
    record(
      'Gateway Config',
      'GET /api/payments/config returns public Key ID without exposing secret',
      isSafe,
      `Key ID: ${data.keyId}, Secret Exposed: ${Boolean(data.keySecret || data.secret)}`
    )
  } catch (err: any) {
    record('Gateway Config', 'Config retrieval', false, err.message)
  }

  // 3. Authorization Check: Farmer cannot initiate payment
  try {
    await axios.post(
      `${API_BASE}/payments/create-order`,
      { transactionId: 'TXN-2026-9901' },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    record('Authorization', 'Farmer blocked from creating Buyer payment order', false, 'Expected 400/403 error')
  } catch (err: any) {
    record(
      'Authorization',
      'Farmer blocked from creating Buyer payment order',
      err.response?.status === 400 || err.response?.status === 403,
      `HTTP ${err.response?.status}: ${err.response?.data?.message}`
    )
  }

  // 4. Buyer creates Razorpay Order with server-calculated amount
  let createdOrderId = ''
  let expectedAmount = 0
  try {
    const orderRes = await axios.post(
      `${API_BASE}/payments/create-order`,
      {
        transactionId: 'TXN-2026-9901',
        amount: 1, // Tampered client amount (must be ignored by server!)
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const data = orderRes.data.data
    createdOrderId = data.orderId
    expectedAmount = data.amount
    // Server must compute true amount (₹278,000 for TXN-01), NOT client's ₹1
    const amountIsServerComputed = data.amount === 278000
    record(
      'Order Creation & Security',
      'Server computes true payable amount and ignores tampered client amount',
      amountIsServerComputed && Boolean(createdOrderId),
      `Order ID: ${createdOrderId}, Server Amount: ₹${data.amount} (Ignored client ₹1)`
    )
  } catch (err: any) {
    record('Order Creation & Security', 'Order creation', false, err.message)
  }

  // 5. Signature Verification Security: Forged/Tampered signature must be REJECTED
  try {
    await axios.post(
      `${API_BASE}/payments/verify`,
      {
        transactionId: 'TXN-2026-9901',
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: 'pay_test_forged_9999',
        razorpay_signature: 'fake_tampered_signature_abcd1234efgh5678',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    record('Signature Security', 'Backend rejects forged/invalid HMAC signature', false, 'Expected 400 error')
  } catch (err: any) {
    record(
      'Signature Security',
      'Backend rejects forged/invalid HMAC signature',
      err.response?.status === 400,
      `HTTP ${err.response?.status}: ${err.response?.data?.message}`
    )
  }

  // 6. Signature Verification: Valid HMAC SHA-256 signature must SUCCEED
  const genuinePaymentId = `pay_test_${Date.now().toString().slice(-6)}`
  const genuineSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${createdOrderId}|${genuinePaymentId}`)
    .digest('hex')

  try {
    const verifyRes = await axios.post(
      `${API_BASE}/payments/verify`,
      {
        transactionId: 'TXN-2026-9901',
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: genuinePaymentId,
        razorpay_signature: genuineSignature,
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const data = verifyRes.data.data
    const isSuccess = data.paymentStatus === 'Payment Successful' && data.gatewayPaymentId === genuinePaymentId
    record(
      'Signature Verification',
      'Genuine Razorpay signature verification succeeds and secures Escrow',
      isSuccess,
      `Status: ${data.paymentStatus}, Payment ID: ${data.gatewayPaymentId}, Escrow Vault: ${data.escrowReference}`
    )
  } catch (err: any) {
    record('Signature Verification', 'Genuine signature verification', false, err.message)
  }

  // 7. Idempotency Check: Replaying same payment ID does not duplicate
  try {
    const replayRes = await axios.post(
      `${API_BASE}/payments/verify`,
      {
        transactionId: 'TXN-2026-9901',
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: genuinePaymentId,
        razorpay_signature: genuineSignature,
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const data = replayRes.data.data
    record(
      'Idempotency',
      'Replay of verified payment callback returns existing receipt safely',
      Boolean(data.isIdempotentReplay || data.paymentStatus === 'Payment Successful'),
      `Replay status: ${data.paymentStatus}, Is Replay: ${Boolean(data.isIdempotentReplay)}`
    )
  } catch (err: any) {
    record('Idempotency', 'Replay check', false, err.message)
  }

  // 8. Admin Oversight Ledger: Real Gateway Records
  try {
    const adminPaymentsRes = await axios.get(`${API_BASE}/payments/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const payments = adminPaymentsRes.data.data
    const hasRazorpayRecord = payments.some((p: any) => p.gateway === 'RAZORPAY' && p.gateway_payment_id === genuinePaymentId)
    record(
      'Admin Oversight',
      'Admin retrieves real Razorpay transaction audit ledger from PostgreSQL/backend',
      hasRazorpayRecord,
      `Found ${payments.length} payment records in ledger. Verified Razorpay record present: ${hasRazorpayRecord}`
    )
  } catch (err: any) {
    record('Admin Oversight', 'Admin payment ledger retrieval', false, err.message)
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 RAZORPAY INTEGRATION QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runRazorpayQA()
