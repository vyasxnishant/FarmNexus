import axios from 'axios'
import {
  ALL_INDIAN_STATES_AND_UTS,
  INDIA_STATES_AND_DISTRICTS,
  getDistrictsForState,
  isValidState,
  isValidDistrictForState,
} from '../data/indiaLocations.js'

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

async function runLocationQA() {
  console.log('==================================================================')
  console.log('🗺️ FARMNEXUS COMPLETE INDIA STATE & DISTRICT ARCHITECTURE QA')
  console.log('==================================================================\n')

  // 1. DATASET COMPLETENESS
  const totalEntries = ALL_INDIAN_STATES_AND_UTS.length
  const states28 = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]
  const ut8 = [
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ]

  const all28StatesPresent = states28.every(s => ALL_INDIAN_STATES_AND_UTS.includes(s))
  record('Dataset Completeness', 'All 28 States Present', all28StatesPresent, `Found ${states28.filter(s => ALL_INDIAN_STATES_AND_UTS.includes(s)).length}/28 States`)

  const all8UTsPresent = ut8.every(ut => ALL_INDIAN_STATES_AND_UTS.includes(ut))
  record('Dataset Completeness', 'All 8 Union Territories Present', all8UTsPresent, `Found ${ut8.filter(u => ALL_INDIAN_STATES_AND_UTS.includes(u)).length}/8 UTs`)

  record('Dataset Completeness', 'Total State/UT Entries is 36', totalEntries === 36, `Total: ${totalEntries} (Expected 36)`)

  // Check every state/UT has non-empty districts
  let totalDistrictCount = 0
  let allHaveDistricts = true
  for (const entry of ALL_INDIAN_STATES_AND_UTS) {
    const dList = getDistrictsForState(entry)
    totalDistrictCount += dList.length
    if (dList.length === 0) {
      allHaveDistricts = false
      console.error(`Missing districts for: ${entry}`)
    }
  }
  record('District Coverage', 'All 36 States/UTs have districts', allHaveDistricts, `Total Districts mapped across India: ${totalDistrictCount}`)

  // 2. REQUIRED SPECIFIC TESTS
  // 2.1 Madhya Pradesh -> Gwalior, Harda
  const mpDistricts = getDistrictsForState('Madhya Pradesh')
  const hasGwaliorAndHarda = mpDistricts.includes('Gwalior') && mpDistricts.includes('Harda')
  record('District Verification', 'Madhya Pradesh contains Gwalior & Harda', hasGwaliorAndHarda, `MP total districts: ${mpDistricts.length}`)

  // 2.2 Rajasthan -> Jaipur
  const rjDistricts = getDistrictsForState('Rajasthan')
  const hasJaipur = rjDistricts.includes('Jaipur')
  record('District Verification', 'Rajasthan contains Jaipur', hasJaipur, `Rajasthan total districts: ${rjDistricts.length}`)

  // 2.3 Maharashtra -> Mumbai City
  const mhDistricts = getDistrictsForState('Maharashtra')
  const hasMumbai = mhDistricts.includes('Mumbai City')
  record('District Verification', 'Maharashtra contains Mumbai City', hasMumbai, `Maharashtra total districts: ${mhDistricts.length}`)

  // 2.4 Uttar Pradesh -> Lucknow
  const upDistricts = getDistrictsForState('Uttar Pradesh')
  const hasLucknow = upDistricts.includes('Lucknow')
  record('District Verification', 'Uttar Pradesh contains Lucknow', hasLucknow, `UP total districts: ${upDistricts.length}`)

  // 2.5 Punjab -> Ludhiana
  const pbDistricts = getDistrictsForState('Punjab')
  const hasLudhiana = pbDistricts.includes('Ludhiana')
  record('District Verification', 'Punjab contains Ludhiana', hasLudhiana, `Punjab total districts: ${pbDistricts.length}`)

  // 3. STATE SWITCH RESET LOGIC TEST
  const mpHasGwalior = isValidDistrictForState('Madhya Pradesh', 'Gwalior')
  const rjHasGwalior = isValidDistrictForState('Rajasthan', 'Gwalior')
  const stateSwitchValid = mpHasGwalior === true && rjHasGwalior === false
  record('Dynamic State Switch', 'Gwalior valid in MP but strictly invalid in Rajasthan', stateSwitchValid, 'Gwalior correctly isolated to MP')

  // 4. BACKEND INTEGRATION & VALIDATION TESTS
  const uniqueId = Date.now().toString().slice(-4)

  // 4.1 Test Invalid State/District Registration Rejection (Rajasthan + Gwalior)
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      name: 'Invalid Test Farmer',
      phone: '+91 99999 88888',
      email: `invalid.loc.${uniqueId}@test.com`,
      password: 'password123',
      user_type: 'FARMER',
      location: 'Test Village',
      state: 'Rajasthan',
      district: 'Gwalior', // INVALID COMBINATION
    })
    record('Backend Validation', 'Reject Invalid State/District on Registration', false, 'Expected rejection for Rajasthan + Gwalior')
  } catch (err: any) {
    const isRejected = err.response?.status >= 400
    const msg = err.response?.data?.message || err.message
    record('Backend Validation', 'Reject Invalid State/District on Registration', isRejected, `HTTP ${err.response?.status}: ${msg}`)
  }

  // 4.2 Test Valid State/District Registration (Rajasthan + Jaipur)
  let validFarmerToken = ''
  let validFarmerId = ''
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Jaipur Farmer',
      phone: '+91 98290 12345',
      email: `jaipur.farmer.${uniqueId}@farmnexus.in`,
      password: 'password123',
      user_type: 'FARMER',
      location: 'Chomu Tehsil',
      state: 'Rajasthan',
      district: 'Jaipur',
      organization: 'Jaipur Kisan Producer Co.',
      total_land_acres: 15,
    })
    validFarmerToken = res.data.data.token
    validFarmerId = res.data.data.user.id
    record(
      'Backend Validation',
      'Accept Valid State/District on Registration (Rajasthan + Jaipur)',
      res.data.data.user.district === 'Jaipur' && res.data.data.user.state === 'Rajasthan',
      `Saved User: ${validFarmerId}, State: ${res.data.data.user.state}, District: ${res.data.data.user.district}`
    )
  } catch (err: any) {
    record('Backend Validation', 'Accept Valid State/District on Registration', false, err.message)
  }

  // 4.3 Test Lot Creation with Invalid Location (Punjab + Bhopal)
  try {
    await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Wheat (Sharbati)',
        state: 'Punjab',
        district: 'Bhopal', // INVALID
        expected_price: 2800,
        quantity_qtl: 100,
      },
      {
        headers: { Authorization: `Bearer ${validFarmerToken}` },
      }
    )
    record('Backend Lot Validation', 'Reject Invalid State/District on Lot Creation', false, 'Expected rejection for Punjab + Bhopal')
  } catch (err: any) {
    const isRejected = err.response?.status >= 400
    const msg = err.response?.data?.message || err.message
    record('Backend Lot Validation', 'Reject Invalid State/District on Lot Creation', isRejected, `HTTP ${err.response?.status}: ${msg}`)
  }

  // 4.4 Test Lot Creation with Valid Location (Punjab + Ludhiana)
  try {
    const lotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Wheat (Sharbati)',
        state: 'Punjab',
        district: 'Ludhiana',
        location: 'Khanna Mandi Road Godown #3',
        expected_price: 2800,
        quantity_qtl: 100,
      },
      {
        headers: { Authorization: `Bearer ${validFarmerToken}` },
      }
    )
    record(
      'Backend Lot Validation',
      'Accept Valid State/District on Lot Creation (Punjab + Ludhiana)',
      lotRes.data.data.state === 'Punjab' && lotRes.data.data.district === 'Ludhiana',
      `Lot ID: ${lotRes.data.data.id}, State: ${lotRes.data.data.state}, District: ${lotRes.data.data.district}`
    )
  } catch (err: any) {
    record('Backend Lot Validation', 'Accept Valid State/District on Lot Creation', false, err.message)
  }

  // 4.5 Test Profile Location Update Validation
  try {
    const updateRes = await axios.put(
      `${API_BASE}/auth/profile`,
      {
        state: 'Maharashtra',
        district: 'Mumbai City',
        location: 'APMC Market Vashi Terminal',
      },
      {
        headers: { Authorization: `Bearer ${validFarmerToken}` },
      }
    )
    record(
      'Profile Location Update',
      'Update Profile with Valid Location (Maharashtra + Mumbai City)',
      updateRes.data.data.user.state === 'Maharashtra' && updateRes.data.data.user.district === 'Mumbai City',
      `Updated State: ${updateRes.data.data.user.state}, District: ${updateRes.data.data.user.district}`
    )
  } catch (err: any) {
    record('Profile Location Update', 'Update Profile with Valid Location', false, err.message)
  }

  // SUMMARY
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n==================================================================')
  console.log(`🏁 LOCATION SYSTEM QA: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('==================================================================\n')
}

runLocationQA()

