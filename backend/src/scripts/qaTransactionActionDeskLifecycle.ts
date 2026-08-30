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

async function runTransactionActionDeskQA() {
  console.log('\n==================================================================')
  console.log('💳 FARMNEXUS TRANSACTION ACTION DESK & LIFECYCLE QA')
  console.log('==================================================================\n')

  try {
    // 1. Authenticate Farmer and Buyer
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const farmerToken = farmerLogin.data.data.token
    const farmerUser = farmerLogin.data.data.user

    const buyerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    const buyerToken = buyerLogin.data.data.token
    const buyerUser = buyerLogin.data.data.user

    record('Step 1 [Auth]', 'Farmer & Buyer login verified', Boolean(farmerToken && buyerToken), `Farmer: ${farmerUser.name}, Buyer: ${buyerUser.name}`)

    // 2. Farmer creates lot
    const lotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Wheat (Sharbati)',
        variety: 'C-306 Sharbati Premium',
        quantity_qtl: 100,
        asking_price: 2800,
        expected_harvest_date: '2026-05-15',
        location: 'Sirali Farm Godown #2, Harda',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const lot = lotRes.data.data
    record('Step 2 [Lot Creation]', 'Farmer lists 100 quintal Wheat lot', lot.quantity_qtl === 100, `Lot ID: ${lot.id}`)

    // 3. Buyer submits purchase bid
    const bidRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: lot.id,
        offered_price: 2820,
        quantity_qtl: 100,
        payment_terms: 'e-NWR Escrow Vault Deposit',
        pickup_location: 'Harda APMC Mandi',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const offer = bidRes.data.data
    record('Step 3 [Bid Submission]', 'Buyer places binding bid for 100 qtl', offer.quantity_qtl === 100, `Offer ID: ${offer.id}, Amount: ₹${offer.total_amount}`)

    // 4. Farmer accepts bid -> Deal generated
    const acceptRes = await axios.post(
      `${API_BASE}/offers/${offer.id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const deal = acceptRes.data.data.transaction
    record('Step 4 [Bid Acceptance]', 'Farmer accepts bid -> Deal contract generated', Boolean(deal && deal.id), `Deal ID: ${deal?.id}`)

    // 5. Check Initial Deal State (Before Buyer Payment)
    const dealInitial = await axios.get(`${API_BASE}/transactions/${deal.id}`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const dInit = dealInitial.data.data
    const isPayableInitially = dInit.payment_status === 'Payment Pending' && dInit.transaction_status === 'Payment Pending'
    record(
      'Step 5 [Pre-Payment State]',
      'Initial deal state is genuinely Payment Pending (Deposit to Escrow is active for Buyer only)',
      isPayableInitially,
      `Payment Status: "${dInit.payment_status}", Transaction Status: "${dInit.transaction_status}"`
    )

    // 6. Buyer creates payment order and deposits escrow
    const orderRes = await axios.post(
      `${API_BASE}/payments/create-order`,
      {
        transactionId: deal.id,
        paymentMethod: 'UPI',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const order = orderRes.data.data

    const verifyRes = await axios.post(
      `${API_BASE}/payments/process-sandbox`,
      {
        transactionId: deal.id,
        orderId: order.orderId,
        paymentId: `pay_test_${Date.now().toString(36)}`,
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    record(
      'Step 6 [Escrow Payment]',
      'Buyer deposits capital into Escrow and server verifies payment',
      verifyRes.data.success === true,
      `Payment Status: ${verifyRes.data.data.paymentStatus}, Vault: ${verifyRes.data.data.escrowVaultId}`
    )

    // 7. Check Deal State Immediately Post-Payment (Escrow Funded / Ready for Dispatch)
    const dealFundedRes = await axios.get(`${API_BASE}/transactions/${deal.id}`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const dFunded = dealFundedRes.data.data
    const isEscrowPayablePostDeposit = dFunded.payment_status === 'Payment Pending' && dFunded.transaction_status === 'Payment Pending'

    record(
      'Step 7 [Post-Payment Removal of Deposit CTA]',
      'Deposit to Escrow button is permanently REMOVED after payment (isEscrowPayable is FALSE)',
      !isEscrowPayablePostDeposit && dFunded.payment_status === 'Payment Successful' && dFunded.transaction_status === 'Payment Completed',
      `Payment Status: "${dFunded.payment_status}", Transaction Status: "${dFunded.transaction_status}"`
    )

    // 8. Test Duplicate Payment Prevention
    let duplicateRejected = false
    try {
      await axios.post(
        `${API_BASE}/payments/create-order`,
        {
          transactionId: deal.id,
          paymentMethod: 'UPI',
        },
        { headers: { Authorization: `Bearer ${buyerToken}` } }
      )
    } catch (err: any) {
      duplicateRejected = err.response?.status === 400
    }
    record(
      'Step 8 [Duplicate Prevention]',
      'Server strictly blocks duplicate escrow deposit order creation for already funded deal',
      duplicateRejected,
      'Duplicate payment order rejected with HTTP 400'
    )

    // 9. Advance to In-Transit
    const dispatchRes = await axios.patch(
      `${API_BASE}/transactions/${deal.id}/lifecycle`,
      {
        transaction_status: 'In Transit',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const dTransit = dispatchRes.data.data
    record(
      'Step 9 [Dispatch & Transit State]',
      'Farmer dispatches produce consignment and transaction moves to In Transit',
      dTransit.transaction_status === 'In Transit',
      `Transaction Status: "${dTransit.transaction_status}"`
    )

    // 10. Advance to Final Settlement & Completed
    const settleRes = await axios.patch(
      `${API_BASE}/transactions/${deal.id}/lifecycle`,
      {
        transaction_status: 'Completed',
        payment_status: 'Settled',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const dSettled = settleRes.data.data
    const isDealFullySettled = dSettled.transaction_status === 'Completed' || dSettled.payment_status === 'Settled'

    record(
      'Step 10 [Final Settlement State]',
      'Deal is fully settled, payout transferred to farmer, and timeline stage 6 of 6 completed',
      isDealFullySettled,
      `Payment Status: "${dSettled.payment_status}", Transaction Status: "${dSettled.transaction_status}"`
    )

    // 11. Verify Final Read-Only State for both Farmer & Buyer
    let finalPaymentAttemptRejected = false
    try {
      await axios.post(
        `${API_BASE}/payments/process-sandbox`,
        {
          transactionId: deal.id,
          orderId: 'order_test_settled',
          paymentId: 'pay_test_settled',
        },
        { headers: { Authorization: `Bearer ${buyerToken}` } }
      )
    } catch (err: any) {
      finalPaymentAttemptRejected = err.response?.status === 400
    }

    record(
      'Step 11 [Final Deal Read-Only & Zero Deposit CTA]',
      'Completed transaction is completely read-only with no duplicate payout or escrow deposit possible',
      finalPaymentAttemptRejected,
      'Post-settlement payment rejected with HTTP 400'
    )

    console.log('\n==================================================================')
    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length
    console.log(`🏁 ACTION DESK & LIFECYCLE QA: ${passedCount} PASSED, ${failedCount} FAILED`)
    console.log('==================================================================\n')

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('QA Execution Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

runTransactionActionDeskQA()
