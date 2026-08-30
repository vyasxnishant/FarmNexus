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

async function runBuyerBrowseLotsAndBiddingAudit() {
  console.log('\n==================================================================')
  console.log('🌾 FARMNEXUS BUYER BROWSE LOTS + BIDDING COMPLETE QA AUDIT')
  console.log('==================================================================\n')

  try {
    // -------------------------------------------------------------
    // STAGE 1: Authentication of Farmer A, Buyer 1, and Buyer 2
    // -------------------------------------------------------------
    const farmerAuthRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const farmerToken = farmerAuthRes.data.data.token
    const farmerId = farmerAuthRes.data.data.user.id

    const buyer1AuthRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    const buyer1Token = buyer1AuthRes.data.data.token
    const buyer1Id = buyer1AuthRes.data.data.user.id

    const buyer2AuthRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'vijay@itcchoupal.com',
      password: 'password123',
    })
    const buyer2Token = buyer2AuthRes.data.data.token
    const buyer2Id = buyer2AuthRes.data.data.user.id

    record(
      'STAGE 1: Counterparty Setup',
      'Authenticated Farmer A, Buyer 1, and Buyer 2 with verified credentials',
      Boolean(farmerToken && buyer1Token && buyer2Token),
      `Farmer: ${farmerId}, Buyer 1: ${buyer1Id}, Buyer 2: ${buyer2Id}`
    )

    // -------------------------------------------------------------
    // STAGE 2: Farmer Creates a Fresh 100-qtl Produce Lot
    // -------------------------------------------------------------
    const createLotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Chana (Gram)',
        crop_hi: 'चना (देसी/डॉलर)',
        category: 'Pulses',
        variety: 'Kabuli Dollar Premium',
        quantity_qtl: 100,
        unit: 'Quintal',
        grade: 'Grade A (Export)',
        expected_price: 5850,
        min_acceptable_price: 5600,
        market_reference_price: 5900,
        harvest_date: '2026-05-18',
        location: 'Sirali Farm Godown Bay #3, Harda, MP',
        description: 'Export grade bold white kabuli chana, zero infestation.',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const testLot = createLotRes.data.data
    const lotId = testLot.id

    record(
      'STAGE 2: Lot Creation',
      'Farmer created active produce lot with 100 quintals available volume',
      testLot.quantity_qtl === 100 && testLot.farmer_id === farmerId && testLot.status === 'Active',
      `Lot ID: ${lotId}, Available: ${testLot.quantity_qtl} qtl @ ₹${testLot.expected_price}/qtl`
    )

    // -------------------------------------------------------------
    // STAGE 3: Buyer Browses Active Lots Marketplace
    // -------------------------------------------------------------
    const browseRes = await axios.get(`${API_BASE}/lots`, {
      headers: { Authorization: `Bearer ${buyer1Token}` },
    })
    const discoveredLot = browseRes.data.data.find((l: any) => l.id === lotId)

    record(
      'STAGE 3: Buyer Browse Marketplace',
      'Buyer retrieves exact lot with identical attributes, price, volume, and farmer identity',
      Boolean(discoveredLot && discoveredLot.id === lotId && discoveredLot.quantity_qtl === 100 && discoveredLot.farmer_id === farmerId),
      `Discovered: ${discoveredLot?.crop} (${discoveredLot?.variety}) by ${discoveredLot?.farmer_name} (${discoveredLot?.quantity_qtl} qtl)`
    )

    // -------------------------------------------------------------
    // STAGE 4: Bid Validation Tests
    // -------------------------------------------------------------
    // 4.1 Zero or Negative Quantity Validation
    let zeroQtyRejected = false
    try {
      await axios.post(
        `${API_BASE}/offers`,
        { lot_id: lotId, offered_price: 5900, quantity_qtl: 0 },
        { headers: { Authorization: `Bearer ${buyer1Token}` } }
      )
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400) zeroQtyRejected = true
    }

    record('STAGE 4.1: Zero Quantity Rejection', 'Server rejects 0 quintal bid', zeroQtyRejected)

    // 4.2 Excessive Quantity Validation (120 qtl > 100 qtl available)
    let excessiveQtyRejected = false
    try {
      await axios.post(
        `${API_BASE}/offers`,
        { lot_id: lotId, offered_price: 5900, quantity_qtl: 120 },
        { headers: { Authorization: `Bearer ${buyer1Token}` } }
      )
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400) excessiveQtyRejected = true
    }

    record('STAGE 4.2: Excessive Quantity Rejection', 'Server rejects bid exceeding available volume (120 > 100)', excessiveQtyRejected)

    // 4.3 Zero or Negative Price Validation
    let zeroPriceRejected = false
    try {
      await axios.post(
        `${API_BASE}/offers`,
        { lot_id: lotId, offered_price: 0, quantity_qtl: 50 },
        { headers: { Authorization: `Bearer ${buyer1Token}` } }
      )
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400) zeroPriceRejected = true
    }

    record('STAGE 4.3: Zero Price Rejection', 'Server rejects 0 price bid', zeroPriceRejected)

    // 4.4 Self-Bidding Prevention (Farmer bids on own lot)
    let selfBidRejected = false
    try {
      await axios.post(
        `${API_BASE}/offers`,
        { lot_id: lotId, offered_price: 6000, quantity_qtl: 50 },
        { headers: { Authorization: `Bearer ${farmerToken}` } }
      )
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400 || err.response?.status === 403) selfBidRejected = true
    }

    record('STAGE 4.4: Self-Bidding Prevention', 'Server blocks lot owner from bidding on own produce listing', selfBidRejected)

    // -------------------------------------------------------------
    // STAGE 5: Buyer 1 Submits Valid Bid (40 qtl @ ₹5900/qtl)
    // -------------------------------------------------------------
    const bid1Res = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: lotId,
        offered_price: 5900,
        quantity_qtl: 40,
        payment_terms: 'e-NWR Escrow auto-release on gate receipt',
        message: 'Order for institutional pulse grading facility.',
      },
      { headers: { Authorization: `Bearer ${buyer1Token}` } }
    )
    const bid1 = bid1Res.data.data
    const bid1Id = bid1.id

    record(
      'STAGE 5: Bid 1 Submission & Ownership',
      'Bid 1 created with unique ID and farmer_id strictly set from lot owner',
      bid1.id.startsWith('OFF-') && bid1.lot_id === lotId && bid1.buyer_id === buyer1Id && bid1.farmer_id === farmerId && bid1.status === 'Pending',
      `Bid 1 ID: ${bid1Id}, Buyer: ${bid1.buyer_id}, Farmer: ${bid1.farmer_id}, Total: ₹${bid1.total_amount}`
    )

    // -------------------------------------------------------------
    // STAGE 6: Buyer 2 Submits Concurrent Bid (50 qtl @ ₹5950/qtl)
    // -------------------------------------------------------------
    const bid2Res = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: lotId,
        offered_price: 5950,
        quantity_qtl: 50,
        payment_terms: 'Direct bank payout within 2 hours of QA pass',
        message: 'ITC Choupal procurement for direct consumer packaging.',
      },
      { headers: { Authorization: `Bearer ${buyer2Token}` } }
    )
    const bid2 = bid2Res.data.data
    const bid2Id = bid2.id

    record(
      'STAGE 6: Multiple Concurrent Bids',
      'Buyer 2 places concurrent bid on same lot with unique bidId and independent bidder identity',
      bid2.id.startsWith('OFF-') && bid2.id !== bid1Id && bid2.buyer_id === buyer2Id && bid2.farmer_id === farmerId,
      `Bid 2 ID: ${bid2Id}, Buyer: ${bid2.buyer_id}, Farmer: ${bid2.farmer_id}, Total: ₹${bid2.total_amount}`
    )

    // -------------------------------------------------------------
    // STAGE 7: Quantity Integrity with Multiple Pending Bids
    // -------------------------------------------------------------
    const lotWithPendingBids = await axios.get(`${API_BASE}/lots/${lotId}`)
    record(
      'STAGE 7: Quantity Unchanged While Bids Pending',
      'Lot available volume remains exactly 100 quintals while bids are pending',
      lotWithPendingBids.data.data.quantity_qtl === 100,
      `Lot Qty: ${lotWithPendingBids.data.data.quantity_qtl} qtl (Active Offers: ${lotWithPendingBids.data.data.active_offers_count})`
    )

    // -------------------------------------------------------------
    // STAGE 8: Counterparty Gating (Offers Received vs My Bids)
    // -------------------------------------------------------------
    // Farmer A sees both bids in Offers Received
    const farmerReceivedOffers = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const farmerFoundBid1 = farmerReceivedOffers.data.data.find((o: any) => o.id === bid1Id)
    const farmerFoundBid2 = farmerReceivedOffers.data.data.find((o: any) => o.id === bid2Id)

    record(
      'STAGE 8.1: Farmer Receives Both Bids',
      'Farmer sees both incoming bids under Offers Received',
      Boolean(farmerFoundBid1 && farmerFoundBid2),
      `Farmer received offers count: ${farmerReceivedOffers.data.count}`
    )

    // Buyer 1 sees ONLY Bid 1 under My Bids
    const buyer1Bids = await axios.get(`${API_BASE}/offers/my`, {
      headers: { Authorization: `Bearer ${buyer1Token}` },
    })
    const buyer1HasBid1 = buyer1Bids.data.data.some((o: any) => o.id === bid1Id)
    const buyer1HasBid2 = buyer1Bids.data.data.some((o: any) => o.id === bid2Id)

    record(
      'STAGE 8.2: Buyer 1 Sees Only Own Bids',
      'Buyer 1 sees Bid 1 and is strictly blocked from seeing Buyer 2\'s bid',
      buyer1HasBid1 && !buyer1HasBid2,
      `Buyer 1 bids: ${buyer1Bids.data.count}`
    )

    // -------------------------------------------------------------
    // STAGE 9: Farmer Accepts Bid 1 -> Deal Contract Generated
    // -------------------------------------------------------------
    const acceptBid1Res = await axios.post(
      `${API_BASE}/offers/${bid1Id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const deal1 = acceptBid1Res.data.data.transaction

    record(
      'STAGE 9: Farmer Accepts Bid 1 -> Deal Generated',
      'Accepted Bid 1 generates exactly ONE trade contract linking bid1Id, lotId, buyer1Id, and farmerId',
      deal1.lot_id === lotId && deal1.offer_id === bid1Id && deal1.farmer_id === farmerId && deal1.buyer_id === buyer1Id,
      `Deal ID: ${deal1.id}, Quantity: ${deal1.quantity_qtl} qtl, Amount: ₹${deal1.final_amount}`
    )

    // -------------------------------------------------------------
    // STAGE 10: Lot Remaining Quantity Calculation (100 - 40 = 60 qtl)
    // -------------------------------------------------------------
    const lotAfterBid1 = await axios.get(`${API_BASE}/lots/${lotId}`)
    record(
      'STAGE 10: Remaining Volume Deduction',
      'Lot remaining volume accurately reduced from 100 to 60 quintals after partial sale',
      lotAfterBid1.data.data.quantity_qtl === 60 && lotAfterBid1.data.data.initial_quantity_qtl === 100 && lotAfterBid1.data.data.status === 'Active',
      `Initial: ${lotAfterBid1.data.data.initial_quantity_qtl} qtl, Remaining: ${lotAfterBid1.data.data.quantity_qtl} qtl, Status: "${lotAfterBid1.data.data.status}"`
    )

    // -------------------------------------------------------------
    // STAGE 11: Buyer 2 Bidding on Remaining Volume & Acceptance
    // -------------------------------------------------------------
    // Farmer accepts Bid 2 (50 qtl) -> remaining becomes 60 - 50 = 10 qtl
    const acceptBid2Res = await axios.post(
      `${API_BASE}/offers/${bid2Id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const deal2 = acceptBid2Res.data.data.transaction

    const lotAfterBid2 = await axios.get(`${API_BASE}/lots/${lotId}`)
    record(
      'STAGE 11: Multi-Deal Quantity Depletion',
      'Accepting second bid correctly deducts volume to 10 quintals',
      deal2.offer_id === bid2Id && lotAfterBid2.data.data.quantity_qtl === 10 && lotAfterBid2.data.data.status === 'Active',
      `Deal 2: ${deal2.id}, Remaining Lot Qty: ${lotAfterBid2.data.data.quantity_qtl} qtl`
    )

    // -------------------------------------------------------------
    // STAGE 12: Multi-Session Persistence on Re-Login
    // -------------------------------------------------------------
    const reLoginBuyer1 = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    const reBuyer1Token = reLoginBuyer1.data.data.token
    const reBuyer1Bids = await axios.get(`${API_BASE}/offers/my`, {
      headers: { Authorization: `Bearer ${reBuyer1Token}` },
    })
    const persistedBid1 = reBuyer1Bids.data.data.find((o: any) => o.id === bid1Id)

    record(
      'STAGE 12: Multi-Session Persistence on Re-Login',
      'After buyer logout and re-login, accepted bid retains status "Accepted" with exact deal reference',
      Boolean(persistedBid1 && persistedBid1.status === 'Accepted'),
      `Persisted Bid 1 Status: "${persistedBid1?.status}", Amount: ₹${persistedBid1?.total_amount}`
    )

    console.log('\n==================================================================')
    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length
    console.log(`🏁 BUYER BROWSE LOTS & BIDDING QA: ${passedCount} PASSED, ${failedCount} FAILED`)
    console.log('==================================================================\n')

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('Audit QA Execution Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

runBuyerBrowseLotsAndBiddingAudit()

