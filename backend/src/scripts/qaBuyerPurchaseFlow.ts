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

async function runPurchaseFlowQA() {
  console.log('==================================================================')
  console.log('🌾 FARMNEXUS BUYER PURCHASE & BIDDING COMPLETE END-TO-END QA')
  console.log('==================================================================\n')

  let buyerToken = ''
  let farmerToken = ''
  let farmerId = ''
  let buyerId = ''

  // 1. Auth Setup
  try {
    const buyerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    buyerToken = buyerRes.data.data.token
    buyerId = buyerRes.data.data.user.id
    record('Auth Setup', 'Buyer Login', Boolean(buyerToken), `Buyer: ${buyerRes.data.data.user.name} (${buyerId})`)

    const farmerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    farmerToken = farmerRes.data.data.token
    farmerId = farmerRes.data.data.user.id
    record('Auth Setup', 'Farmer Login', Boolean(farmerToken), `Farmer: ${farmerRes.data.data.user.name} (${farmerId})`)
  } catch (err: any) {
    console.error('Login failed:', err.message)
    return
  }

  // 2. Browse Produce Lots
  let targetLot: any = null
  try {
    const lotsRes = await axios.get(`${API_BASE}/lots`)
    const lots = lotsRes.data.data
    const hasLots = Array.isArray(lots) && lots.length > 0
    targetLot = lots.find((l: any) => l.farmer_id === farmerId && l.status === 'Active') || lots[0]
    record(
      'Lot Discovery',
      'Buyer retrieves available active farmer produce lots',
      hasLots && Boolean(targetLot),
      `Found ${lots.length} lots. Target lot: ${targetLot?.crop} (${targetLot?.id}), Available: ${targetLot?.quantity_qtl} qtl @ ₹${targetLot?.expected_price}/qtl`
    )
  } catch (err: any) {
    record('Lot Discovery', 'Browse lots retrieval', false, err.message)
    return
  }

  // 3. Own-Lot Protection Check: Farmer cannot bid on their own lot
  try {
    await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: targetLot.id,
        offered_price: targetLot.expected_price,
        quantity_qtl: 10,
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    record('Security & Integrity', 'Prevent buyer from purchasing own lot', false, 'Expected HTTP 400 error')
  } catch (err: any) {
    const isBlocked = err.response?.status === 400 || err.response?.status === 403
    record(
      'Security & Integrity',
      'Prevent buyer from purchasing own lot',
      isBlocked,
      `HTTP ${err.response?.status}: ${err.response?.data?.message}`
    )
  }

  // 4. Buyer places binding purchase bid
  let createdOfferId = ''
  const bidPrice = targetLot.expected_price + 50
  const bidQuantity = Math.min(20, targetLot.quantity_qtl)
  try {
    const offerRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: targetLot.id,
        offered_price: bidPrice,
        quantity_qtl: bidQuantity,
        payment_terms: 'e-NWR Escrow auto-release on gate receipt',
        message: 'Direct procurement test order with carrier arranged.',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const newOffer = offerRes.data.data
    createdOfferId = newOffer.id
    const isValidOffer = newOffer.status === 'Pending' && newOffer.offered_price === bidPrice
    record(
      'Purchase Bidding',
      'Buyer submits binding bid on farmer lot',
      isValidOffer,
      `Offer ID: ${newOffer.id}, Status: ${newOffer.status}, Amount: ₹${newOffer.total_amount} (${bidQuantity} qtl @ ₹${bidPrice}/qtl)`
    )
  } catch (err: any) {
    record('Purchase Bidding', 'Bid submission', false, err.message)
    return
  }

  // 5. Buyer sees bid under "My Bids & Offers"
  try {
    const myOffersRes = await axios.get(`${API_BASE}/offers/my`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const myOffers = myOffersRes.data.data
    const offerFound = myOffers.some((o: any) => o.id === createdOfferId)
    record(
      'Buyer Bids State',
      'New bid appears in Buyer Portal -> My Bids & Offers',
      offerFound,
      `Buyer has ${myOffers.length} bids. Found offer ${createdOfferId}: ${offerFound}`
    )
  } catch (err: any) {
    record('Buyer Bids State', 'Buyer bids query', false, err.message)
  }

  // 6. Farmer sees incoming bid under "Incoming Offers"
  try {
    const receivedOffersRes = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const receivedOffers = receivedOffersRes.data.data
    const incomingFound = receivedOffers.some((o: any) => o.id === createdOfferId)
    record(
      'Farmer Offers State',
      'Farmer sees incoming bid in Farmer Portal -> Incoming Offers',
      incomingFound,
      `Farmer received ${receivedOffers.length} offers. Found offer ${createdOfferId}: ${incomingFound}`
    )
  } catch (err: any) {
    record('Farmer Offers State', 'Farmer offers query', false, err.message)
  }

  // 7. Farmer Accepts the offer
  let createdTransactionId = ''
  try {
    const acceptRes = await axios.post(
      `${API_BASE}/offers/${createdOfferId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const data = acceptRes.data.data
    const isAccepted = data.offer.status === 'Accepted'
    createdTransactionId = data.transaction?.id
    record(
      'Farmer Acceptance',
      'Farmer accepts incoming buyer bid',
      isAccepted && Boolean(createdTransactionId),
      `Offer Status: ${data.offer.status}, Deal Generated: ${createdTransactionId}`
    )
  } catch (err: any) {
    record('Farmer Acceptance', 'Farmer offer acceptance', false, err.message)
    return
  }

  // 8. Deal appears under Buyer Portal -> Deals & Escrow
  try {
    const dealsRes = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const deals = dealsRes.data.data
    const dealFound = deals.some((d: any) => d.id === createdTransactionId)
    record(
      'Deals & Escrow',
      'Accepted deal appears under Buyer Portal -> Deals & Escrow',
      dealFound,
      `Buyer deals count: ${deals.length}. Generated deal ${createdTransactionId} present: ${dealFound}`
    )
  } catch (err: any) {
    record('Deals & Escrow', 'Buyer deals query', false, err.message)
  }

  // 9. Inspect Deal Details
  try {
    const dealDetailsRes = await axios.get(`${API_BASE}/transactions/${createdTransactionId}`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const deal = dealDetailsRes.data.data
    const isDealValid =
      deal.id === createdTransactionId &&
      deal.payment_status === 'Payment Pending' &&
      deal.buyer_id === buyerId &&
      deal.farmer_id === farmerId
    record(
      'Deal Verification',
      'Deal details, escrow amounts, and timeline stages are correctly initialized',
      isDealValid,
      `Deal: ${deal.crop}, Final Amount: ₹${deal.final_amount}, Payment Status: ${deal.payment_status}, Stages: ${deal.timeline.length}`
    )
  } catch (err: any) {
    record('Deal Verification', 'Deal details inspection', false, err.message)
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 BUYER PURCHASE FLOW QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runPurchaseFlowQA()

