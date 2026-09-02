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

async function runEscrowDispatchWorkflowTest() {
  console.log('==================================================================')
  console.log('🌾 FARMNEXUS ESCROW → DISPATCH → SETTLEMENT WORKFLOW AUDIT')
  console.log('==================================================================\n')

  const unique = Date.now().toString().slice(-4)

  let farmerToken = ''
  let farmerId = ''
  let buyerToken = ''
  let buyerId = ''
  let lotId = ''
  let offerId = ''
  let txnId = ''

  // STAGE 1: AUTHENTICATION
  try {
    const farmerRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Devendra Patel',
      phone: '+91 98260 11223',
      email: `devendra.farmer.${unique}@farmnexus.in`,
      password: 'password123',
      user_type: 'FARMER',
      location: 'Harda Mandi Gate #1, Harda',
      state: 'Madhya Pradesh',
      district: 'Harda',
    })
    farmerToken = farmerRes.data.data.token
    farmerId = farmerRes.data.data.user.id
    record('Auth', 'Register Farmer', Boolean(farmerToken), `Farmer ID: ${farmerId}`)

    const buyerRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Sunil Aggarwal',
      phone: '+91 94250 33445',
      email: `sunil.buyer.${unique}@agrocorp.in`,
      password: 'password123',
      user_type: 'BUYER',
      organization: 'Aggarwal Agro Commodities Pvt Ltd',
      location: 'Indore APMC Processing Hub',
      state: 'Madhya Pradesh',
      district: 'Indore',
    })
    buyerToken = buyerRes.data.data.token
    buyerId = buyerRes.data.data.user.id
    record('Auth', 'Register Buyer', Boolean(buyerToken), `Buyer ID: ${buyerId}`)
  } catch (err: any) {
    record('Auth', 'Registration', false, err.message)
    return
  }

  // STAGE 2: LOT CREATION & BIDDING & ACCEPTANCE
  try {
    const lotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Soybean',
        crop_hi: 'सोयाबीन',
        category: 'Oilseeds',
        variety: 'JS-9560 Certified',
        quantity_qtl: 100,
        initial_quantity_qtl: 100,
        unit: 'Quintal',
        grade: 'Grade A',
        expected_price: 5200,
        min_acceptable_price: 5000,
        market_reference_price: 5150,
        harvest_date: '2026-06-01',
        location: 'Harda Mandi Gate #1, Harda',
        district: 'Harda',
        state: 'Madhya Pradesh',
        pickup_location: 'Harda Godown Bay #4',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    lotId = lotRes.data.data.id
    record('Deal Setup', 'Create Produce Lot', Boolean(lotId), `Lot: ${lotId}`)

    const offerRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: lotId,
        offered_price: 5150,
        quantity_qtl: 40,
        payment_terms: 'e-NWR Escrow auto-release on gate receipt',
        pickup_location: 'Aggarwal Agro Mills Indore Hub Gate #2',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    offerId = offerRes.data.data.id
    record('Deal Setup', 'Buyer Submits Offer (40 Qtl)', Boolean(offerId), `Offer: ${offerId}`)

    const acceptRes = await axios.post(
      `${API_BASE}/offers/${offerId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    txnId = acceptRes.data.data.transaction.id
    const txnStatus = acceptRes.data.data.transaction.transaction_status
    record(
      'Deal Setup',
      'Farmer Accepts Offer → Contract Binding',
      Boolean(txnId && txnStatus === 'Payment Pending'),
      `Txn ID: ${txnId}, Status: "${txnStatus}"`
    )
  } catch (err: any) {
    record('Deal Setup', 'Accept Offer', false, err.message)
    return
  }

  // STAGE 3: ESCROW CAPITAL DEPOSIT BY BUYER
  try {
    const payRes = await axios.post(
      `${API_BASE}/payments/sandbox-process`,
      {
        transactionId: txnId,
        paymentMethod: 'Razorpay Sandbox (e-NWR Escrow Vault)',
        payerVpa: 'sunil.aggarwal@icici',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )

    const isPaid = payRes.data.data.verified && payRes.data.data.paymentStatus === 'Payment Successful'
    record(
      'Escrow Deposit',
      'Buyer deposits full amount into Escrow Vault',
      isPaid,
      `Verified: ${payRes.data.data.verified}, Gateway ID: ${payRes.data.data.gatewayPaymentId}`
    )
  } catch (err: any) {
    record('Escrow Deposit', 'Buyer deposits into escrow', false, err.message)
    return
  }

  // STAGE 4: STATE CHECKS AFTER ESCROW DEPOSIT (Awaiting Farmer Dispatch)
  try {
    const txnAfterPay = (await axios.get(`${API_BASE}/transactions/${txnId}`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })).data.data

    const isEscrowLocked = txnAfterPay.payment_status === 'Payment Successful'
    const isAwaitingDispatch = txnAfterPay.transaction_status === 'Payment Completed'
    const isNotPrematurelySettled = txnAfterPay.transaction_status !== 'Completed' && txnAfterPay.transaction_status !== 'Delivered'

    record(
      'State Logic',
      'Escrow is FUNDED / LOCKED, Status is Awaiting Farmer Dispatch',
      isEscrowLocked && isAwaitingDispatch && isNotPrematurelySettled,
      `Payment: "${txnAfterPay.payment_status}", Lifecycle: "${txnAfterPay.transaction_status}" (NOT prematurely settled)`
    )

    // Verify timeline at Escrow Deposit
    const escrowStage = txnAfterPay.timeline.find((s: any) => s.stage === 'escrow_funded')
    const inTransitStage = txnAfterPay.timeline.find((s: any) => s.stage === 'in_transit')
    const deliveredStage = txnAfterPay.timeline.find((s: any) => s.stage === 'delivered')
    const completedStage = txnAfterPay.timeline.find((s: any) => s.stage === 'completed')

    const isTimelineAccurate = Boolean(
      escrowStage?.completed &&
      !inTransitStage?.completed &&
      !deliveredStage?.completed &&
      !completedStage?.completed
    )

    record(
      'Timeline Integrity',
      'Timeline reflects: Escrow Funded ✓, Produce Dispatched = Pending, Delivery = Pending, Settlement = Pending',
      isTimelineAccurate,
      `Escrow: ${escrowStage?.completed}, Transit: ${inTransitStage?.completed}, Delivered: ${deliveredStage?.completed}, Settled: ${completedStage?.completed}`
    )
  } catch (err: any) {
    record('State Logic', 'State check after deposit', false, err.message)
  }

  // STAGE 5: ROLE-BASED ACTION SECURITY: Buyer CANNOT Dispatch
  try {
    let buyerDispatchBlocked = false
    try {
      await axios.post(
        `${API_BASE}/transactions/${txnId}/advance-stage`,
        { nextStage: 'In Transit' },
        { headers: { Authorization: `Bearer ${buyerToken}` } }
      )
    } catch (err: any) {
      buyerDispatchBlocked = err.response?.status === 400 || err.response?.status === 403 || err.response?.data?.message?.includes('Unauthorized')
    }

    record(
      'Role Security',
      'Buyer cannot dispatch produce (Only Seller/Farmer authorized)',
      buyerDispatchBlocked,
      'Buyer unauthorized dispatch attempt safely rejected by server'
    )
  } catch (err: any) {
    record('Role Security', 'Buyer dispatch check', false, err.message)
  }

  // STAGE 6: FARMER DISPATCHES PRODUCE
  try {
    const dispatchRes = await axios.post(
      `${API_BASE}/transactions/${txnId}/advance-stage`,
      { nextStage: 'In Transit' },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )

    const dispatchedTxn = dispatchRes.data.data
    const isNowInTransit = dispatchedTxn.transaction_status === 'In Transit'
    const hasDispatchedTimestamp = Boolean(dispatchedTxn.dispatched_at)
    const inTransitStage = dispatchedTxn.timeline.find((s: any) => s.stage === 'in_transit')

    record(
      'Farmer Dispatch',
      'Farmer clicks [ Dispatch Produce ] → Moves to "In Transit / Dispatched"',
      Boolean(isNowInTransit && hasDispatchedTimestamp && inTransitStage?.completed),
      `Status: "${dispatchedTxn.transaction_status}", Dispatched At: ${dispatchedTxn.dispatched_at}`
    )
  } catch (err: any) {
    record('Farmer Dispatch', 'Farmer clicks [ Dispatch Produce ]', false, err.message)
  }

  // STAGE 7: IDEMPOTENCY GUARD: Farmer Cannot Dispatch Twice
  try {
    let doubleDispatchBlocked = false
    try {
      await axios.post(
        `${API_BASE}/transactions/${txnId}/advance-stage`,
        { nextStage: 'In Transit' },
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      )
    } catch (err: any) {
      doubleDispatchBlocked = err.response?.status === 400 || err.response?.data?.message?.includes('already been dispatched')
    }

    record(
      'Idempotency Guard',
      'Prevent duplicate produce dispatch on already dispatched deal',
      doubleDispatchBlocked,
      'Double dispatch attempt safely rejected'
    )
  } catch (err: any) {
    record('Idempotency Guard', 'Double dispatch check', false, err.message)
  }

  // STAGE 8: BUYER VIEW REFLECTION
  try {
    const buyerViewRes = await axios.get(`${API_BASE}/transactions/${txnId}`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const buyerTxn = buyerViewRes.data.data
    const buyerSeesInTransit = buyerTxn.transaction_status === 'In Transit'

    record(
      'Buyer View Sync',
      'Buyer sees "Produce Dispatched & In Transit" / Status: In Transit',
      buyerSeesInTransit,
      `Buyer observed status: "${buyerTxn.transaction_status}"`
    )
  } catch (err: any) {
    record('Buyer View Sync', 'Buyer view check', false, err.message)
  }

  // STAGE 9: DELIVERY & GATE ASSAY VERIFICATION
  try {
    const deliverRes = await axios.post(
      `${API_BASE}/transactions/${txnId}/advance-stage`,
      { nextStage: 'Delivered' },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )

    const deliveredTxn = deliverRes.data.data
    const isDelivered = deliveredTxn.transaction_status === 'Delivered'
    const hasDeliveredTimestamp = Boolean(deliveredTxn.delivered_at)
    const isStillNotSettled = deliveredTxn.transaction_status !== 'Completed'

    record(
      'Gate Assay Check',
      'Buyer verifies Gate Arrival & Assay → Moves to "Delivered" (Not yet settled)',
      Boolean(isDelivered && hasDeliveredTimestamp && isStillNotSettled),
      `Status: "${deliveredTxn.transaction_status}", Delivered At: ${deliveredTxn.delivered_at}`
    )
  } catch (err: any) {
    record('Gate Assay Check', 'Buyer verifies gate arrival', false, err.message)
  }

  // STAGE 10: ESCROW SETTLEMENT RELEASE TO FARMER
  try {
    const settleRes = await axios.post(
      `${API_BASE}/transactions/${txnId}/advance-stage`,
      { nextStage: 'Completed' },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )

    const settledTxn = settleRes.data.data
    const isCompleted = settledTxn.transaction_status === 'Completed'
    const allStagesComplete = settledTxn.timeline.every((s: any) => s.completed)

    record(
      'Escrow Settlement',
      'Escrow released to farmer → Deal Fully Settled & Completed',
      Boolean(isCompleted && allStagesComplete),
      `Final Status: "${settledTxn.transaction_status}", All 6 Timeline Stages Completed: ${allStagesComplete}`
    )
  } catch (err: any) {
    record('Escrow Settlement', 'Escrow settlement release', false, err.message)
  }

  // STAGE 11: MULTI-SESSION PERSISTENCE ACROSS RE-LOGIN
  try {
    // Re-login as Farmer
    const farmerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: `devendra.farmer.${unique}@farmnexus.in`,
      password: 'password123',
    })
    const newFarmerToken = farmerLoginRes.data.data.token

    const persistedTxn = (await axios.get(`${API_BASE}/transactions/${txnId}`, {
      headers: { Authorization: `Bearer ${newFarmerToken}` },
    })).data.data

    const isFullyPersisted = Boolean(
      persistedTxn.id === txnId &&
      persistedTxn.transaction_status === 'Completed' &&
      persistedTxn.dispatched_at &&
      persistedTxn.delivered_at &&
      persistedTxn.settled_at &&
      persistedTxn.timeline.every((s: any) => s.completed)
    )

    record(
      'Persistence Guard',
      'All states, timestamps, and timeline stages persist accurately after re-login',
      isFullyPersisted,
      `Persisted Deal: ${persistedTxn.id}, Status: "${persistedTxn.transaction_status}", Dispatched: ${Boolean(persistedTxn.dispatched_at)}, Delivered: ${Boolean(persistedTxn.delivered_at)}, Settled: ${Boolean(persistedTxn.settled_at)}`
    )
  } catch (err: any) {
    record('Persistence Guard', 'Multi-session persistence check', false, err.message)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 ESCROW → DISPATCH AUDIT QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runEscrowDispatchWorkflowTest()

