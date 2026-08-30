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

async function runFarmerCreateLotAndMyLotsAudit() {
  console.log('\n==================================================================')
  console.log('🌾 FARMNEXUS FARMER CREATE LOT + MY LOTS COMPLETE QA AUDIT')
  console.log('==================================================================\n')

  try {
    // -------------------------------------------------------------
    // STAGE 1: Authentication & Farmer Ownership Setup
    // -------------------------------------------------------------
    const farmerAuthRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const farmerToken = farmerAuthRes.data.data.token
    const farmerUser = farmerAuthRes.data.data.user
    const farmerId = farmerUser.id

    const buyerAuthRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    const buyerToken = buyerAuthRes.data.data.token
    const buyerUser = buyerAuthRes.data.data.user
    const buyerId = buyerUser.id

    record(
      'STAGE 1: Auth & Stable ID',
      'Farmer authenticated with stable unique ID',
      Boolean(farmerId && farmerId.startsWith('USR-')),
      `Farmer ID: ${farmerId} (${farmerUser.name})`
    )

    // -------------------------------------------------------------
    // STAGE 2: Farmer Creates New Lot
    // -------------------------------------------------------------
    const initialFarmerLotsRes = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const initialFarmerLotCount = initialFarmerLotsRes.data.count

    const createLotPayload = {
      crop: 'Soybean',
      crop_hi: 'सोयाबीन',
      category: 'Oilseeds',
      variety: 'JS-9560 High Oil Yield',
      quantity_qtl: 100,
      unit: 'Quintal',
      grade: 'Grade A',
      expected_price: 4950,
      min_acceptable_price: 4800,
      market_reference_price: 5020,
      harvest_date: '2026-05-20',
      location: 'Sirali Farm Godown #2, Harda, MP',
      state: 'Madhya Pradesh',
      district: 'Harda',
      pickup_location: 'Godown #2, Main Highway Gate',
      description: 'Machine harvested, triple cleaned, tested 10.2% moisture content.',
      quality: {
        grade: 'Grade A',
        visual_quality: 'Excellent',
        damage_level: 'None',
        grain_size: 'Uniform Bold',
        moisture_percent: 10.2,
        foreign_matter_percent: 0.5,
        damaged_grain_percent: 0.2,
        notes: 'High protein and oil grade certified.',
      },
    }

    const createRes = await axios.post(`${API_BASE}/lots`, createLotPayload, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const createdLot = createRes.data.data
    const lotId = createdLot.id

    record(
      'STAGE 2: Lot Creation & Unique ID',
      'Lot created with unique ID and exact submitted fields',
      Boolean(lotId && lotId.startsWith('LOT-AGN-') && createdLot.quantity_qtl === 100 && createdLot.initial_quantity_qtl === 100),
      `Lot ID: ${lotId}, Crop: ${createdLot.crop}, Qty: ${createdLot.quantity_qtl} qtl, Price: ₹${createdLot.expected_price}/qtl`
    )

    record(
      'STAGE 3: Farmer Ownership Enforcement',
      'Lot farmer_id strictly matches authenticated farmer user ID',
      createdLot.farmer_id === farmerId,
      `Owner ID: ${createdLot.farmer_id} (Expected: ${farmerId})`
    )

    // -------------------------------------------------------------
    // STAGE 3: My Lots Persistence & Count Validation
    // -------------------------------------------------------------
    const farmerLotsAfterCreate = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const myLotsList = farmerLotsAfterCreate.data.data
    const foundMyLot = myLotsList.find((l: any) => l.id === lotId)

    record(
      'STAGE 4: My Lots Verification',
      'Created lot appears in My Lots with 100 quintals available volume',
      Boolean(foundMyLot && foundMyLot.quantity_qtl === 100 && foundMyLot.farmer_id === farmerId),
      `My Lots Count: ${farmerLotsAfterCreate.data.count} (was ${initialFarmerLotCount}), Available: ${foundMyLot?.quantity_qtl} qtl`
    )

    // -------------------------------------------------------------
    // STAGE 4: Buyer Marketplace Visibility
    // -------------------------------------------------------------
    const buyerMarketplaceRes = await axios.get(`${API_BASE}/lots`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const marketplaceLot = buyerMarketplaceRes.data.data.find((l: any) => l.id === lotId)

    record(
      'STAGE 5: Buyer Marketplace Consistency',
      'Buyer retrieves identical lot with same lotId, crop, 100 qtl quantity, and price',
      Boolean(marketplaceLot && marketplaceLot.id === lotId && marketplaceLot.quantity_qtl === 100 && marketplaceLot.farmer_id === farmerId),
      `Buyer View: Lot ${marketplaceLot?.id}, Available: ${marketplaceLot?.quantity_qtl} qtl @ ₹${marketplaceLot?.expected_price}/qtl`
    )

    // -------------------------------------------------------------
    // STAGE 5: Buyer Places Bid & Quantity Remains Intact While Pending
    // -------------------------------------------------------------
    const bidRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: lotId,
        offered_price: 5000,
        quantity_qtl: 35,
        payment_terms: 'e-NWR Escrow auto-release on gate receipt',
        pickup_location: 'Sirali Farm Godown #2, Harda',
        message: 'Direct procurement for crushing plant.',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const bid = bidRes.data.data
    const bidId = bid.id

    // Verify quantity is NOT prematurely reduced while bid is Pending
    const lotWhileBidPending = await axios.get(`${API_BASE}/lots/${lotId}`)
    record(
      'STAGE 6: Quantity Integrity on Pending Bid',
      'Pending bid does not prematurely deduct available lot quantity (still 100 qtl)',
      lotWhileBidPending.data.data.quantity_qtl === 100 && lotWhileBidPending.data.data.status === 'Active',
      `Pending Bid: ${bid.quantity_qtl} qtl, Lot Available Qty: ${lotWhileBidPending.data.data.quantity_qtl} qtl`
    )

    // -------------------------------------------------------------
    // STAGE 6: Farmer Accepts Partial Bid (35 qtl of 100 qtl)
    // -------------------------------------------------------------
    const acceptRes = await axios.post(
      `${API_BASE}/offers/${bidId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const deal = acceptRes.data.data.transaction

    record(
      'STAGE 7: Bid Acceptance & Deal Generation',
      'Farmer accepts bid and deal references identical lotId and buyerId',
      deal.lot_id === lotId && deal.offer_id === bidId && deal.farmer_id === farmerId && deal.buyer_id === buyerId,
      `Deal ID: ${deal.id}, Lot ID: ${deal.lot_id}, Traded: ${deal.quantity_qtl} qtl`
    )

    // -------------------------------------------------------------
    // STAGE 7: Remaining Quantity Deduction (100 - 35 = 65 qtl)
    // -------------------------------------------------------------
    const lotAfterTradeRes = await axios.get(`${API_BASE}/lots/${lotId}`)
    const lotAfterTrade = lotAfterTradeRes.data.data

    record(
      'STAGE 8: Quantity Integrity Post-Trade',
      'Remaining quantity accurately updated to 65 quintals and initial quantity preserved at 100 quintals',
      lotAfterTrade.quantity_qtl === 65 && lotAfterTrade.initial_quantity_qtl === 100 && lotAfterTrade.status === 'Active',
      `Initial Qty: ${lotAfterTrade.initial_quantity_qtl} qtl, Remaining Qty: ${lotAfterTrade.quantity_qtl} qtl, Status: "${lotAfterTrade.status}"`
    )

    // -------------------------------------------------------------
    // STAGE 8: Edit / Update Lot Details
    // -------------------------------------------------------------
    const updateRes = await axios.put(
      `${API_BASE}/lots/${lotId}`,
      {
        description: 'Updated: Certified organic soybean, moisture tested 10.0%.',
        pickup_location: 'Godown #2, Bay #4 West Gate',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const updatedLot = updateRes.data.data

    record(
      'STAGE 9: Lot Edit Update',
      'Farmer updates lot details without creating duplicate lot ID',
      updatedLot.id === lotId && updatedLot.pickup_location === 'Godown #2, Bay #4 West Gate',
      `Updated Lot ID: ${updatedLot.id}, New Pickup: "${updatedLot.pickup_location}"`
    )

    // -------------------------------------------------------------
    // STAGE 9: Delete Guard for Traded Lots
    // -------------------------------------------------------------
    let deletePrevented = false
    try {
      await axios.delete(`${API_BASE}/lots/${lotId}`, {
        headers: { Authorization: `Bearer ${farmerToken}` },
      })
    } catch (err: any) {
      if (err.response?.status === 500 || err.response?.status === 400) {
        deletePrevented = true
      }
    }

    record(
      'STAGE 10: Historical Deal Protection on Delete',
      'Server blocks deletion of lot referenced in active deal contracts',
      deletePrevented,
      'Deletion guarded successfully'
    )

    // -------------------------------------------------------------
    // STAGE 10: Relogin & Multi-Session Persistence
    // -------------------------------------------------------------
    const reLoginFarmer = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const reFarmerToken = reLoginFarmer.data.data.token
    const reFarmerLots = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${reFarmerToken}` },
    })
    const persistedLotInMyLots = reFarmerLots.data.data.find((l: any) => l.id === lotId)

    record(
      'STAGE 11: Multi-Session Persistence',
      'After farmer logout and re-login, lot persists with exact remaining volume and owner ID',
      Boolean(persistedLotInMyLots && persistedLotInMyLots.quantity_qtl === 65 && persistedLotInMyLots.farmer_id === farmerId),
      `Persisted Lot ID: ${persistedLotInMyLots?.id}, Remaining: ${persistedLotInMyLots?.quantity_qtl} qtl, Owner: ${persistedLotInMyLots?.farmer_id}`
    )

    console.log('\n==================================================================')
    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length
    console.log(`🏁 FARMER CREATE LOT & MY LOTS QA: ${passedCount} PASSED, ${failedCount} FAILED`)
    console.log('==================================================================\n')

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('Audit QA Execution Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

runFarmerCreateLotAndMyLotsAudit()

