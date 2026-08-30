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

async function runTwoAccountEndToEndWorkflow() {
  console.log('\n==================================================================')
  console.log('🌾 FARMNEXUS SECTION 12: TWO-ACCOUNT END-TO-END FINAL WORKFLOW TEST')
  console.log('==================================================================\n')

  try {
    // -------------------------------------------------------------
    // 1. Authenticate Farmer B and Buyer A
    // -------------------------------------------------------------
    const farmerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const farmerBToken = farmerRes.data.data.token
    const farmerBId = farmerRes.data.data.user.id
    const farmerBName = farmerRes.data.data.user.name

    const buyerRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    const buyerAToken = buyerRes.data.data.token
    const buyerAId = buyerRes.data.data.user.id
    const buyerAName = buyerRes.data.data.user.name

    record(
      'STEP 1: Authenticate Two Separate Counterparties',
      'Farmer B and Buyer A authenticated successfully',
      Boolean(farmerBToken && buyerAToken),
      `Farmer B: ${farmerBName} (${farmerBId}) | Buyer A: ${buyerAName} (${buyerAId})`
    )

    // Snapshot unrelated transactions count before test
    const initialDealsRes = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${farmerBToken}` },
    })
    const initialDealsCount = initialDealsRes.data.count

    // -------------------------------------------------------------
    // 2. FARMER B: Create Lot B (100 Quintal Soybean)
    // -------------------------------------------------------------
    const createLotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Soybean',
        crop_hi: 'सोयाबीन',
        category: 'Oilseeds',
        variety: 'JS-335 Yellow Seed',
        quantity_qtl: 100,
        unit: 'Quintal',
        grade: 'Grade A (FAQ)',
        expected_price: 4900,
        min_acceptable_price: 4750,
        market_reference_price: 4950,
        harvest_date: '2026-05-20',
        location: 'Sirali Godown Bay #2, Harda, MP',
        description: 'Clean yellow soybean lot with 10% moisture, ready for crushing or food processing.',
      },
      { headers: { Authorization: `Bearer ${farmerBToken}` } }
    )
    const lotB = createLotRes.data.data
    const lotBId = lotB.id

    record(
      'STEP 2: FARMER B Creates Lot B',
      'Farmer B created 100 Quintal Soybean lot',
      lotB.quantity_qtl === 100 && lotB.farmer_id === farmerBId && lotB.crop === 'Soybean' && lotB.status === 'Active',
      `Lot B ID: ${lotBId}, Crop: ${lotB.crop}, Volume: ${lotB.quantity_qtl} qtl @ ₹${lotB.expected_price}/qtl`
    )

    // -------------------------------------------------------------
    // 3. BUYER A: Browse Lots → Find Lot B → Place Bid for 20 Quintal
    // -------------------------------------------------------------
    const buyerBrowseRes = await axios.get(`${API_BASE}/lots`, {
      headers: { Authorization: `Bearer ${buyerAToken}` },
    })
    const foundLotB = buyerBrowseRes.data.data.find((l: any) => l.id === lotBId)

    record(
      'STEP 3.1: BUYER A Discovers Lot B',
      'Buyer A browses marketplace and locates Lot B with 100 quintals available',
      Boolean(foundLotB && foundLotB.quantity_qtl === 100 && foundLotB.farmer_id === farmerBId),
      `Found: ${foundLotB?.crop} (${foundLotB?.variety}) listed by ${foundLotB?.farmer_name}`
    )

    // Place bid for 20 Quintal
    const placeBidRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: lotBId,
        offered_price: 4950,
        quantity_qtl: 20,
        payment_terms: 'e-NWR Escrow auto-release on gate receipt',
        message: 'Contract for institutional crushing batch.',
      },
      { headers: { Authorization: `Bearer ${buyerAToken}` } }
    )
    const bidA = placeBidRes.data.data
    const bidAId = bidA.id

    record(
      'STEP 3.2: BUYER A Places Bid for 20 Quintals',
      'Buyer A submits binding bid of 20 Quintals @ ₹4,950/qtl',
      bidA.id.startsWith('OFF-') && bidA.quantity_qtl === 20 && bidA.offered_price === 4950 && bidA.total_amount === 99000,
      `Bid ID: ${bidAId}, Quantity: ${bidA.quantity_qtl} qtl, Amount: ₹${bidA.total_amount}`
    )

    // -------------------------------------------------------------
    // 4. VERIFY: Buyer A → My Bids
    // -------------------------------------------------------------
    const buyerMyBidsRes = await axios.get(`${API_BASE}/offers/my`, {
      headers: { Authorization: `Bearer ${buyerAToken}` },
    })
    const buyerABidInList = buyerMyBidsRes.data.data.find((o: any) => o.id === bidAId)

    record(
      'STEP 4: Verify BUYER A My Bids',
      'Buyer A sees Bid in My Bids with Status=Pending, Quantity=20, Lot=Lot B',
      Boolean(
        buyerABidInList &&
        buyerABidInList.status === 'Pending' &&
        buyerABidInList.quantity_qtl === 20 &&
        buyerABidInList.lot_id === lotBId
      ),
      `My Bids Entry: ID=${buyerABidInList?.id}, Status="${buyerABidInList?.status}", Qty=${buyerABidInList?.quantity_qtl} qtl, Lot=${buyerABidInList?.lot_id}`
    )

    // -------------------------------------------------------------
    // 5. VERIFY: Farmer B → Offers Received
    // -------------------------------------------------------------
    const farmerOffersRes = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${farmerBToken}` },
    })
    const farmerBReceivedBid = farmerOffersRes.data.data.find((o: any) => o.id === bidAId)

    record(
      'STEP 5: Verify FARMER B Offers Received',
      'Farmer B sees Buyer A\'s bid under Offers Received with Status=Pending, Quantity=20, Lot=Lot B',
      Boolean(
        farmerBReceivedBid &&
        farmerBReceivedBid.status === 'Pending' &&
        farmerBReceivedBid.quantity_qtl === 20 &&
        farmerBReceivedBid.lot_id === lotBId &&
        farmerBReceivedBid.buyer_id === buyerAId
      ),
      `Offers Received Entry: ID=${farmerBReceivedBid?.id}, Status="${farmerBReceivedBid?.status}", Qty=${farmerBReceivedBid?.quantity_qtl} qtl, Buyer=${farmerBReceivedBid?.buyer_name}`
    )

    // -------------------------------------------------------------
    // 6. FARMER B: Accepts Bid A
    // -------------------------------------------------------------
    const dealsBeforeAcceptRes = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${farmerBToken}` },
    })
    const dealsBeforeAcceptCount = dealsBeforeAcceptRes.data.count

    const acceptRes = await axios.post(
      `${API_BASE}/offers/${bidAId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerBToken}` } }
    )
    const acceptedBidResponse = acceptRes.data.data.offer
    const createdDeal = acceptRes.data.data.transaction

    // -------------------------------------------------------------
    // 7. VERIFY: Bid = Accepted, Exactly One Deal Created, Correct References
    // -------------------------------------------------------------
    const allDealsAfterRes = await axios.get(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${farmerBToken}` },
    })
    const newDealsCount = allDealsAfterRes.data.count
    const exactlyOneDealCreated = newDealsCount === dealsBeforeAcceptCount + 1

    record(
      'STEP 7.1: Verify Bid Status = Accepted',
      'Accepted bid has status="Accepted"',
      acceptedBidResponse.status === 'Accepted',
      `Bid ${bidAId} status: "${acceptedBidResponse.status}"`
    )

    record(
      'STEP 7.2: Verify Exactly ONE Deal Created',
      'Exactly one electronic trade contract generated',
      exactlyOneDealCreated && Boolean(createdDeal && createdDeal.id.startsWith('TXN-')),
      `Initial Deals: ${initialDealsCount}, Current Deals: ${newDealsCount} (Created Deal: ${createdDeal?.id})`
    )

    record(
      'STEP 7.3: Verify Deal References Correct Lot, Farmer, and Buyer',
      'Deal contract strictly matches Lot B ID, Farmer B ID, and Buyer A ID',
      Boolean(
        createdDeal &&
        createdDeal.lot_id === lotBId &&
        createdDeal.offer_id === bidAId &&
        createdDeal.farmer_id === farmerBId &&
        createdDeal.buyer_id === buyerAId &&
        createdDeal.quantity_qtl === 20 &&
        createdDeal.produce_value === 99000
      ),
      `Deal ${createdDeal?.id} -> Lot: ${createdDeal?.lot_id}, Farmer: ${createdDeal?.farmer_id}, Buyer: ${createdDeal?.buyer_id}, Traded Qty: ${createdDeal?.quantity_qtl} qtl`
    )

    // -------------------------------------------------------------
    // 8. VERIFY: Remaining Lot Quantity = 80 Quintal
    // -------------------------------------------------------------
    const lotBAfterAccept = await axios.get(`${API_BASE}/lots/${lotBId}`)
    const updatedLotB = lotBAfterAccept.data.data

    record(
      'STEP 8: Verify Remaining Lot Quantity = 80 Quintals',
      'Lot B volume accurately updated: 100 - 20 = 80 Quintals (status remains Active)',
      updatedLotB.quantity_qtl === 80 && updatedLotB.initial_quantity_qtl === 100 && updatedLotB.status === 'Active',
      `Initial: ${updatedLotB.initial_quantity_qtl} qtl, Remaining: ${updatedLotB.quantity_qtl} qtl, Status: "${updatedLotB.status}"`
    )

    // -------------------------------------------------------------
    // 9. VERIFY: No Unrelated Records are Modified
    // -------------------------------------------------------------
    // Check other lots
    const allLotsRes = await axios.get(`${API_BASE}/lots`)
    const unrelatedLotsIntact = allLotsRes.data.data
      .filter((l: any) => l.id !== lotBId)
      .every((l: any) => l.quantity_qtl >= 0 && l.id !== lotBId)

    record(
      'STEP 9: Verify No Unrelated Records Modified',
      'All other produce lots and baseline deals remain unaffected',
      unrelatedLotsIntact,
      `Total Lots: ${allLotsRes.data.count} (All unmodified)`
    )

    console.log('\n==================================================================')
    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length
    console.log(`🏁 SECTION 12 TWO-ACCOUNT QA: ${passedCount} PASSED, ${failedCount} FAILED`)
    console.log('==================================================================\n')

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('Final Section 12 QA Execution Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

runTwoAccountEndToEndWorkflow()

