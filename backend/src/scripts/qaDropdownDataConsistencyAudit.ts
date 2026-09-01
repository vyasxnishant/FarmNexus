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

async function runDropdownAudit() {
  console.log('==================================================================')
  console.log('🌾 FARMNEXUS MANDI COMPARISON & TRANSIT LOGISTICS DROPDOWN AUDIT')
  console.log('==================================================================\n')

  const unique = Date.now().toString().slice(-4)

  let farmerToken = ''
  let farmerId = ''
  let buyerToken = ''
  let buyerId = ''
  let buyerBToken = ''
  let buyerBId = ''
  let createdLotId = ''
  let createdOfferId = ''
  let createdTxnId = ''

  // STAGE 1: FARMER REGISTRATION & LOGIN
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Kailash Patel',
      phone: '+91 98261 55667',
      email: `kailash.farmer.${unique}@farmnexus.in`,
      password: 'password123',
      user_type: 'FARMER',
      location: 'Sirali Godown Bay #2, Harda',
      state: 'Madhya Pradesh',
      district: 'Harda',
    })
    farmerToken = res.data.data.token
    farmerId = res.data.data.user.id
    record('Farmer Auth', 'Register Farmer', Boolean(farmerToken), `Farmer ID: ${farmerId}`)
  } catch (err: any) {
    record('Farmer Auth', 'Register Farmer', false, err.message)
  }

  // STAGE 2: BUYER A REGISTRATION & LOGIN
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Rohan Sharma',
      phone: '+91 94250 88990',
      email: `rohan.buyer.${unique}@agrocorp.in`,
      password: 'password123',
      user_type: 'BUYER',
      organization: 'Sharma Agro Mills Ltd',
      location: 'Indore APMC Processing Hub, Sector 4',
      state: 'Madhya Pradesh',
      district: 'Indore',
    })
    buyerToken = res.data.data.token
    buyerId = res.data.data.user.id
    record('Buyer A Auth', 'Register Buyer A', Boolean(buyerToken), `Buyer A ID: ${buyerId}`)
  } catch (err: any) {
    record('Buyer A Auth', 'Register Buyer A', false, err.message)
  }

  // STAGE 3: BUYER B (UNRELATED) REGISTRATION
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Vikram Mehta',
      phone: '+91 91110 33445',
      email: `vikram.buyer.${unique}@mehtagroup.in`,
      password: 'password123',
      user_type: 'BUYER',
      organization: 'Mehta Grain Logistics',
      location: 'Dewas Processing Facility',
      state: 'Madhya Pradesh',
      district: 'Dewas',
    })
    buyerBToken = res.data.data.token
    buyerBId = res.data.data.user.id
    record('Buyer B Auth', 'Register Buyer B (Unrelated)', Boolean(buyerBToken), `Buyer B ID: ${buyerBId}`)
  } catch (err: any) {
    record('Buyer B Auth', 'Register Buyer B', false, err.message)
  }

  // STAGE 4: FARMER CREATES A REAL PRODUCE LOT
  try {
    const res = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Soybean',
        crop_hi: 'सोयाबीन',
        category: 'Oilseeds',
        variety: 'JS-9560 Certified Seed',
        quantity_qtl: 100,
        initial_quantity_qtl: 100,
        unit: 'Quintal',
        grade: 'Grade A',
        expected_price: 5100,
        min_acceptable_price: 4950,
        market_reference_price: 5050,
        harvest_date: '2026-05-15',
        location: 'Sirali Godown Bay #2, Harda',
        district: 'Harda',
        state: 'Madhya Pradesh',
        pickup_location: 'Sirali Farm Warehouse Gate #1',
        description: 'Quality tested yellow soybean, moisture 10.5%, foreign matter 0.8%.',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    createdLotId = res.data.data.id
    record(
      'Farmer Lot Creation',
      'Farmer creates real produce lot (Soybean 100 Quintal)',
      Boolean(createdLotId && res.data.data.quantity_qtl === 100),
      `Lot ID: ${createdLotId}, Crop: ${res.data.data.crop}, Qty: ${res.data.data.quantity_qtl} qtl`
    )
  } catch (err: any) {
    record('Farmer Lot Creation', 'Farmer creates real produce lot', false, err.message)
  }

  // STAGE 5: MANDI COMPARISON DATA SOURCE INTEGRITY FOR FARMER
  try {
    const myLotsRes = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const farmerLots = myLotsRes.data.data
    const foundCreated = farmerLots.find((l: any) => l.id === createdLotId)

    record(
      'Mandi Comparison (Farmer)',
      'Farmer retrieves own lots for Mandi Comparison dropdown',
      Boolean(foundCreated && foundCreated.quantity_qtl === 100),
      `Found Lot: ${foundCreated?.id} — ${foundCreated?.crop} (${foundCreated?.quantity_qtl} qtl) at "${foundCreated?.location}"`
    )
  } catch (err: any) {
    record('Mandi Comparison (Farmer)', 'Farmer retrieves own lots', false, err.message)
  }

  // STAGE 6: MANDI COMPARISON DATA SOURCE INTEGRITY FOR BUYER
  try {
    const publicLotsRes = await axios.get(`${API_BASE}/lots`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const publicLots = publicLotsRes.data.data
    const foundInMarket = publicLots.find((l: any) => l.id === createdLotId)

    record(
      'Mandi Comparison (Buyer)',
      'Buyer retrieves active public lots for Mandi Comparison dropdown',
      Boolean(foundInMarket && foundInMarket.status === 'Active'),
      `Found Marketplace Lot: ${foundInMarket?.id} — ${foundInMarket?.crop} (${foundInMarket?.quantity_qtl} qtl) by ${foundInMarket?.farmer_name}`
    )
  } catch (err: any) {
    record('Mandi Comparison (Buyer)', 'Buyer retrieves public lots', false, err.message)
  }

  // STAGE 7: BUYER A TRANSIT LOGISTICS BEFORE BID ACCEPTANCE (Empty state)
  try {
    const txnsBeforeRes = await axios.get(`${API_BASE}/transactions/my`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const txnsBefore = txnsBeforeRes.data.data
    const hasNoDealsYet = txnsBefore.length === 0

    record(
      'Transit Logistics (Pre-Deal)',
      'Buyer A has 0 confirmed deals before bid acceptance (no fake records)',
      hasNoDealsYet,
      `Deals count for Buyer A: ${txnsBefore.length}`
    )
  } catch (err: any) {
    record('Transit Logistics (Pre-Deal)', 'Buyer A deals check before bid', false, err.message)
  }

  // STAGE 8: BUYER A PLACES BID FOR 40 QUINTALS
  try {
    const offerRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: createdLotId,
        offered_price: 5050,
        quantity_qtl: 40,
        payment_terms: 'e-NWR Escrow auto-release on gate receipt',
        pickup_location: 'Sharma Agro Mills Indore Plant Gate #2',
        message: 'Prompt payment via verified Escrow upon physical assay verification.',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    createdOfferId = offerRes.data.data.id
    record(
      'Buyer Bidding',
      'Buyer A submits commercial offer for 40 Quintals',
      Boolean(createdOfferId && offerRes.data.data.status === 'Pending'),
      `Offer ID: ${createdOfferId}, Amount: ₹${offerRes.data.data.total_amount}`
    )
  } catch (err: any) {
    record('Buyer Bidding', 'Buyer A submits offer', false, err.message)
  }

  // STAGE 9: FARMER ACCEPTS BID -> GENERATES TRADE CONTRACT (TXN)
  try {
    const acceptRes = await axios.post(
      `${API_BASE}/offers/${createdOfferId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const dealData = acceptRes.data.data
    createdTxnId = dealData.transaction?.id
    const remainingQty = dealData.lot?.quantity_qtl

    record(
      'Farmer Bid Acceptance',
      'Farmer accepts Buyer A bid and server generates binding trade contract',
      Boolean(createdTxnId && remainingQty === 60),
      `Deal ID: ${createdTxnId}, Traded: 40 qtl, Lot Remaining: ${remainingQty} qtl`
    )
  } catch (err: any) {
    record('Farmer Bid Acceptance', 'Farmer accepts bid', false, err.message)
  }

  // STAGE 10: BUYER A TRANSIT LOGISTICS DROPDOWN POPULATION
  try {
    const buyerTxnsRes = await axios.get(`${API_BASE}/transactions/my`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    })
    const buyerTxns = buyerTxnsRes.data.data
    const targetDeal = buyerTxns.find((t: any) => t.id === createdTxnId)

    const isDealValid = Boolean(
      targetDeal &&
      targetDeal.crop === 'Soybean' &&
      targetDeal.quantity_qtl === 40 &&
      targetDeal.buyer_id === buyerId &&
      targetDeal.farmer_id === farmerId
    )

    record(
      'Transit Logistics (Buyer A)',
      'Buyer A sees accepted trade contract in Transit Logistics dropdown',
      isDealValid,
      `Contract: ${targetDeal?.id} — ${targetDeal?.crop} (${targetDeal?.quantity_qtl} qtl) • Seller: ${targetDeal?.farmer_name} • Status: "${targetDeal?.transaction_status}"`
    )
  } catch (err: any) {
    record('Transit Logistics (Buyer A)', 'Buyer A sees accepted trade contract', false, err.message)
  }

  // STAGE 11: BUYER B (UNRELATED) ACCOUNT ISOLATION GUARD
  try {
    const buyerBTxnsRes = await axios.get(`${API_BASE}/transactions/my`, {
      headers: { Authorization: `Bearer ${buyerBToken}` },
    })
    const buyerBTxns = buyerBTxnsRes.data.data
    const leakedDeal = buyerBTxns.find((t: any) => t.id === createdTxnId)

    record(
      'Account Isolation',
      'Buyer B does NOT see Buyer A trade deal in Transit Logistics dropdown',
      !leakedDeal && buyerBTxns.length === 0,
      `Buyer B deals count: ${buyerBTxns.length} (0 leaks from Buyer A)`
    )
  } catch (err: any) {
    record('Account Isolation', 'Buyer B account isolation test', false, err.message)
  }

  // STAGE 12: LOT QUANTITY REFLECTION IN MANDI COMPARISON
  try {
    const updatedLotRes = await axios.get(`${API_BASE}/lots/${createdLotId}`)
    const lot = updatedLotRes.data.data
    const isUpdatedCorrectly = lot.quantity_qtl === 60 && lot.status === 'Active'

    record(
      'Dynamic Lot Update',
      'Mandi Comparison reflects updated available volume (60 quintal remaining)',
      isUpdatedCorrectly,
      `Lot ID: ${lot.id}, Available Qty: ${lot.quantity_qtl} qtl (Initial was 100 qtl)`
    )
  } catch (err: any) {
    record('Dynamic Lot Update', 'Lot quantity reflection in Mandi Comparison', false, err.message)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 DROPDOWN AUDIT QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runDropdownAudit()

