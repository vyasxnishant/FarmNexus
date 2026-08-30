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

async function runLiveBuyerOffersQA() {
  console.log('\n==================================================================')
  console.log('🌾 FARMNEXUS FARMER DASHBOARD LIVE BUYER OFFERS / HIGH OFFER QA')
  console.log('==================================================================\n')

  try {
    // 1. Authenticate Farmer (Ramesh Patel) and Buyer (Sunil Aggarwal)
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const farmerToken = farmerLogin.data.data.token
    const farmerUser = farmerLogin.data.data.user
    record('Auth', 'Farmer Login', Boolean(farmerToken), `Farmer: ${farmerUser.name} (${farmerUser.id})`)

    const buyerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'buyer@agrocorp.com',
      password: 'password123',
    })
    const buyerToken = buyerLogin.data.data.token
    const buyerUser = buyerLogin.data.data.user
    record('Auth', 'Buyer Login', Boolean(buyerToken), `Buyer: ${buyerUser.name} (${buyerUser.id})`)

    // 2. Fetch Farmer's initial Lots and Received Offers
    const farmerLotsRes = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const farmerLots = farmerLotsRes.data.data
    const farmerLotIds = new Set(farmerLots.map((l: any) => l.id))

    const initialOffersRes = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const initialOffers = initialOffersRes.data.data
    const initialPendingOffers = initialOffers.filter((o: any) => 
      o.status === 'Pending' && (o.farmer_id === farmerUser.id || farmerLotIds.has(o.lot_id))
    )

    // Calculate High Offers (offered_price >= expected_price)
    const initialHighOffers = initialPendingOffers.filter((o: any) => {
      const lot = farmerLots.find((l: any) => l.id === o.lot_id)
      const askingPrice = lot?.expected_price || o.lot_expected_price || 0
      return askingPrice > 0 ? o.offered_price >= askingPrice : false
    })

    record(
      'Initial State',
      'Initial pending offers and High Offer count for Farmer',
      initialPendingOffers.length === 0 && initialHighOffers.length === 0,
      `Pending Offers: ${initialPendingOffers.length}, High Offers: ${initialHighOffers.length} (Expected: 0 High Offers)`
    )

    // 3. Farmer creates a new Lot (e.g. asking price ₹2800)
    const newLotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Wheat (Sharbati)',
        variety: 'C-306 Sharbati Premium',
        quantity_qtl: 100,
        asking_price: 2800,
        expected_harvest_date: '2026-09-30',
        location: 'Sirali Farm Godown, Harda, MP',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const newLot = newLotRes.data.data
    farmerLotIds.add(newLot.id)
    record('Lot Creation', 'Farmer creates a fresh active produce lot', Boolean(newLot.id), `Lot ID: ${newLot.id}, Asking: ₹2800/qtl`)

    // 4. Buyer submits a High Offer (offered price ₹2850 >= ₹2800 asking price)
    const highOfferRes = await axios.post(
      `${API_BASE}/offers`,
      {
        lot_id: newLot.id,
        offered_price: 2850,
        quantity_qtl: 40,
        payment_terms: 'e-NWR Escrow Vault Deposit',
        message: 'High offer meeting your asking price for export batch.',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    )
    const highOffer = highOfferRes.data.data
    record('High Offer Submission', 'Buyer submits offer above asking price (₹2850 >= ₹2800)', Boolean(highOffer.id), `Offer ID: ${highOffer.id}`)

    // 5. Fetch Farmer's Received Offers and verify count is 1 Pending and 1 High Offer on this lot
    const step5OffersRes = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const step5Offers = step5OffersRes.data.data
    const step5Pending = step5Offers.filter((o: any) => 
      o.status === 'Pending' && o.lot_id === newLot.id
    )
    const step5High = step5Pending.filter((o: any) => {
      const askingPrice = newLot.expected_price || 2800
      return o.offered_price >= askingPrice
    })
    record(
      'Live Count Verification',
      'Dashboard calculates 1 Live Buyer Offer and 1 High Offer for the lot',
      step5Pending.length === 1 && step5High.length === 1,
      `Pending Offers: ${step5Pending.length}, High Offers: ${step5High.length} ("1 High Offer")`
    )

    // 6. Farmer accepts the offer -> Status becomes Accepted
    const acceptRes = await axios.post(
      `${API_BASE}/offers/${highOffer.id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    record('Farmer Acceptance', 'Farmer accepts high offer', acceptRes.data.success === true, `Offer ID: ${highOffer.id} Accepted`)

    // 7. Re-fetch Farmer's Received Offers -> Count drops to 0 Pending on this lot
    const step7OffersRes = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const step7Offers = step7OffersRes.data.data
    const step7Pending = step7Offers.filter((o: any) => 
      o.status === 'Pending' && o.lot_id === newLot.id
    )
    const step7High = step7Pending.filter((o: any) => {
      const askingPrice = newLot.expected_price || 2800
      return o.offered_price >= askingPrice
    })
    record(
      'Post-Acceptance Count',
      'Pending and High Offer counts drop immediately to 0 after acceptance',
      step7Pending.length === 0 && step7High.length === 0,
      `Pending: ${step7Pending.length}, High Offers: ${step7High.length} ("0 High Offers")`
    )

    // 8. Relogin Farmer -> Verify persisted counts on this lot remain 0
    const reloginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const reloginToken = reloginRes.data.data.token
    const reloginOffersRes = await axios.get(`${API_BASE}/offers/received`, {
      headers: { Authorization: `Bearer ${reloginToken}` },
    })
    const reloginOffers = reloginOffersRes.data.data
    const reloginPending = reloginOffers.filter((o: any) => 
      o.status === 'Pending' && o.lot_id === newLot.id
    )
    record(
      'Persistence on Relogin',
      'Persisted data on fresh login shows 0 Live Offers / 0 High Offers',
      reloginPending.length === 0,
      `Persisted Pending Offers on lot: ${reloginPending.length}`
    )

    console.log('\n==================================================================')
    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length
    console.log(`🏁 LIVE BUYER OFFERS QA: ${passedCount} PASSED, ${failedCount} FAILED`)
    console.log('==================================================================\n')

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('QA Execution Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

runLiveBuyerOffersQA()

