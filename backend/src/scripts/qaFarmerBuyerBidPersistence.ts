import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

interface TestResult {
  step: number
  category: string
  name: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function record(step: number, category: string, name: string, passed: boolean, details: string) {
  results.push({ step, category, name, passed, details })
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} [Step ${step}] [${category}] ${name}: ${details}`)
}

async function runFarmerBuyerPersistenceQA() {
  console.log('==================================================================')
  console.log('🌾 FARMNEXUS FARMER-BUYER BID OWNERSHIP & PERSISTENCE QA')
  console.log('==================================================================\n')

  let farmerToken = ''
  let farmerId = ''
  let farmerName = ''
  let buyerToken = ''
  let buyerId = ''
  let buyerName = ''

  // 1. Farmer Login
  try {
    const farmerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    farmerToken = farmerLoginRes.data.data.token
    farmerId = farmerLoginRes.data.data.user.id
    farmerName = farmerLoginRes.data.data.user.name
    record(1, 'Authentication', 'Farmer A Login', Boolean(farmerToken), `Farmer: ${farmerName} (${farmerId})`)
  } catch (err: any) {
    console.error('Farmer login failed:', err.message)
    return
  }

  // 2. Buyer Login
  try {
    const buyerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    buyerToken = buyerLoginRes.data.data.token
    buyerId = buyerLoginRes.data.data.user.id
    buyerName = buyerLoginRes.data.data.user.name
    record(2, 'Authentication', 'Buyer B Login', Boolean(buyerToken), `Buyer: ${buyerName} (${buyerId})`)
  } catch (err: any) {
    console.error('Buyer login failed:', err.message)
    return
  }

  // 3. Farmer A creates Lot A
  let createdLotId = ''
  const initialQuantity = 80
  const expectedPrice = 4900
  try {
    const lotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Soybean',
        variety: 'JS-9560 Yellow Bold',
        quantity_qtl: initialQuantity,
        unit: 'Quintal',
        grade: 'Grade A',
        expected_price: expectedPrice,
        min_acceptable_price: 4750,
        location: 'Sirali Farm Gate, Harda, MP',
        district: 'Harda',
        state: 'Madhya Pradesh',
        status: 'Active',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const lot = lotRes.data.data
    createdLotId = lot.id
    const isLotValid = lot.id && lot.farmer_id === farmerId && lot.quantity_qtl === initialQuantity
    record(
      3,
      'Lot Creation',
      'Farmer A creates and persists Lot A',
      isLotValid,
      `Lot ID: ${lot.id}, Owner: ${lot.farmer_name} (${lot.farmer_id}), Volume: ${lot.quantity_qtl} qtl @ ₹${lot.expected_price}/qtl`
    )
  } catch (err: any) {
    record(3, 'Lot Creation', 'Farmer Lot creation', false, err.message)
    return
  }

  // 4. Buyer B browses public marketplace and sees Lot A
  try {
    const marketplaceRes = await axios.get(`${API_BASE}/lots`)
    const allLots = marketplaceRes.data.data
    const foundLot = allLots.find((l: any) => l.id === createdLotId)
    const isVisibleToBuyer = foundLot && foundLot.farmer_id === farmerId
    record(
      4,
      'Marketplace Discovery',
      'Buyer B sees Lot A in Marketplace',
      Boolean(isVisibleToBuyer),
      `Marketplace contains ${allLots.length} lots. Found Lot A: ${foundLot?.crop} by ${foundLot?.farmer_name}`
    )
  } catch (err: any) {
    record(4, 'Marketplace Discovery', 'Marketplace browse', false, err.message)
    return
  }

  // 5. Buyer B submits purchase bid on Lot A
  let createdBidId = ''
  const bidQuantity = 30
  const bidPrice = 4950
  try {
    const bidRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: createdLotId,
        offered_price: bidPrice,
        quantity_qtl: bidQuantity,
        payment_terms: 'e-NWR Escrow auto-release on gate receipt',
        message: 'Direct procurement pickup scheduled within 48 hours.',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const bid = bidRes.data.data
    createdBidId = bid.id
    const isBidValid =
      bid.id &&
      bid.lot_id === createdLotId &&
      bid.farmer_id === farmerId &&
      bid.buyer_id === buyerId &&
      bid.status === 'Pending'
    record(
      5,
      'Bid Submission',
      'Buyer B submits binding purchase bid on Lot A',
      Boolean(isBidValid),
      `Bid ID: ${bid.id}, Farmer ID: ${bid.farmer_id}, Buyer ID: ${bid.buyer_id}, Value: ₹${bid.total_amount} (${bid.quantity_qtl} qtl @ ₹${bid.offered_price}/qtl)`
    )
  } catch (err: any) {
    record(5, 'Bid Submission', 'Buyer bid submission', false, err.message)
    return
  }

  // 6. Farmer A logs in and retrieves My Lots
  try {
    const farmerLotsRes = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const farmerLots = farmerLotsRes.data.data
    const hasMyLot = farmerLots.some((l: any) => l.id === createdLotId && l.farmer_id === farmerId)
    record(
      6,
      'Farmer Lot Ownership',
      'Farmer A sees Lot A under My Lots',
      hasMyLot,
      `Farmer A has ${farmerLots.length} owned lots. Found Lot ${createdLotId}: ${hasMyLot}`
    )
  } catch (err: any) {
    record(6, 'Farmer Lot Ownership', 'Farmer My Lots query', false, err.message)
  }

  // 7. Farmer A retrieves Offers Received and sees Buyer B's bid
  try {
    const farmerOffersRes = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const farmerOffers = farmerOffersRes.data.data
    const incomingBid = farmerOffers.find((o: any) => o.id === createdBidId)
    const hasBid = incomingBid && incomingBid.status === 'Pending' && incomingBid.buyer_id === buyerId
    record(
      7,
      'Farmer Offers Received',
      "Farmer A sees Buyer B's pending bid under Offers Received",
      Boolean(hasBid),
      `Farmer A received ${farmerOffers.length} offers. Found incoming bid ${createdBidId} from ${incomingBid?.buyer_name}: ${Boolean(hasBid)}`
    )
  } catch (err: any) {
    record(7, 'Farmer Offers Received', 'Farmer received offers query', false, err.message)
  }

  // 8. Farmer A accepts Buyer B's bid
  let createdDealId = ''
  try {
    const acceptRes = await axios.post(
      `${API_BASE}/offers/${createdBidId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const data = acceptRes.data.data
    createdDealId = data.transaction?.id
    const isAccepted = data.offer.status === 'Accepted'
    record(
      8,
      'Bid Acceptance',
      "Farmer A accepts Buyer B's bid",
      isAccepted && Boolean(createdDealId),
      `Offer Status: ${data.offer.status}, Deal Contract ID: ${createdDealId}`
    )
  } catch (err: any) {
    record(8, 'Bid Acceptance', 'Farmer bid acceptance', false, err.message)
    return
  }

  // 9. Verify Lot A quantity is updated (80 - 30 = 50 qtl remaining)
  try {
    const updatedLotRes = await axios.get(`${API_BASE}/lots/${createdLotId}`)
    const updatedLot = updatedLotRes.data.data
    const expectedRemaining = initialQuantity - bidQuantity
    const isQuantityUpdated = updatedLot.quantity_qtl === expectedRemaining
    record(
      9,
      'Inventory Deduction',
      'Lot A remaining quantity correctly updated after partial sale',
      isQuantityUpdated,
      `Previous: ${initialQuantity} qtl, Sold: ${bidQuantity} qtl, Remaining: ${updatedLot.quantity_qtl} qtl (Expected: ${expectedRemaining} qtl)`
    )
  } catch (err: any) {
    record(9, 'Inventory Deduction', 'Lot quantity inspection', false, err.message)
  }

  // 10. Verify Deal appears in Farmer A's Deals & Escrow
  try {
    const farmerTxnsRes = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const farmerTxns = farmerTxnsRes.data.data
    const farmerHasDeal = farmerTxns.some((t: any) => t.id === createdDealId && t.farmer_id === farmerId)
    record(
      10,
      'Deal Visibility',
      'Farmer A sees Deal in Deals & Escrow',
      farmerHasDeal,
      `Farmer A has ${farmerTxns.length} deals. Found deal ${createdDealId}: ${farmerHasDeal}`
    )
  } catch (err: any) {
    record(10, 'Deal Visibility', 'Farmer deals inspection', false, err.message)
  }

  // 11. Verify Deal appears in Buyer B's Deals & Escrow
  try {
    const buyerTxnsRes = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const buyerTxns = buyerTxnsRes.data.data
    const buyerHasDeal = buyerTxns.some((t: any) => t.id === createdDealId && t.buyer_id === buyerId)
    record(
      11,
      'Deal Visibility',
      'Buyer B sees Deal in Deals & Escrow',
      buyerHasDeal,
      `Buyer B has ${buyerTxns.length} deals. Found deal ${createdDealId}: ${buyerHasDeal}`
    )
  } catch (err: any) {
    record(11, 'Deal Visibility', 'Buyer deals inspection', false, err.message)
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 PERSISTENCE & BID OWNERSHIP QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runFarmerBuyerPersistenceQA()

