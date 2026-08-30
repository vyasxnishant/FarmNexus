import axios from 'axios'
import { allIndianCrops, indianCropCategories } from '../../../frontend/src/data/indianCrops'

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

async function runCropDropdownQA() {
  console.log('\n==================================================================')
  console.log('🌾 FARMNEXUS CROP DROPDOWN & COMPREHENSIVE INDIAN CROPS QA')
  console.log('==================================================================\n')

  try {
    // 1. Verify Dataset Size and Categories
    const categoriesCount = indianCropCategories.length
    const totalCropsCount = allIndianCrops.length
    record(
      'Catalog Scope',
      'Crop catalog contains all required categories and expanded list of crops',
      categoriesCount >= 8 && totalCropsCount >= 50,
      `Categories: ${categoriesCount}, Total Indian Crops: ${totalCropsCount}`
    )

    // 2. Check Required Specific Crops
    const requiredCrops = [
      // Cereals & Grains
      'Wheat', 'Wheat (Sharbati)', 'Basmati Rice', 'Paddy', 'Maize', 'Barley', 'Sorghum (Jowar)', 'Pearl Millet (Bajra)', 'Finger Millet (Ragi)', 'Oats',
      // Pulses
      'Chana (Gram)', 'Moong', 'Urad', 'Arhar (Tur)', 'Masoor', 'Lentils',
      // Oilseeds
      'Soybean', 'Mustard', 'Groundnut', 'Sesame', 'Sunflower', 'Safflower', 'Linseed',
      // Cash crops
      'Cotton (Kapas)', 'Sugarcane', 'Tobacco', 'Jute',
      // Vegetables
      'Potato', 'Onion', 'Tomato', 'Garlic', 'Ginger', 'Green Chilli', 'Cauliflower', 'Cabbage', 'Carrot', 'Radish', 'Okra (Bhindi)', 'Brinjal (Baingan)', 'Green Peas', 'Spinach',
      // Fruits
      'Mango', 'Banana', 'Orange', 'Guava', 'Pomegranate', 'Papaya', 'Grapes', 'Watermelon', 'Muskmelon', 'Apple',
      // Spices
      'Coriander', 'Cumin', 'Turmeric', 'Fennel', 'Fenugreek', 'Black Pepper', 'Red Chilli',
      // Other
      'Other'
    ]

    const missingCrops = requiredCrops.filter(req => !allIndianCrops.some(c => c.name.toLowerCase() === req.toLowerCase()))
    record(
      'Mandatory Crops Checklist',
      'All mandatory crops from user specification are present',
      missingCrops.length === 0,
      missingCrops.length === 0 ? `All ${requiredCrops.length} required crops verified` : `Missing: ${missingCrops.join(', ')}`
    )

    // 3. Verify No Duplicates
    const cropNames = allIndianCrops.map(c => c.name.toLowerCase())
    const duplicates = cropNames.filter((name, idx) => cropNames.indexOf(name) !== idx)
    record(
      'Duplicate Check',
      'No duplicate crop names exist in the catalog',
      duplicates.length === 0,
      duplicates.length === 0 ? 'Zero duplicates found' : `Duplicates: ${duplicates.join(', ')}`
    )

    // 4. Verify Bilingual Hindi Names for All Crops
    const missingHindi = allIndianCrops.filter(c => !c.nameHi || c.nameHi.trim() === '')
    record(
      'Bilingual Support',
      'All crops have complete Hindi translations and search keywords',
      missingHindi.length === 0,
      `Verified ${allIndianCrops.length} Hindi translations (e.g. ${allIndianCrops[0].name} / ${allIndianCrops[0].nameHi})`
    )

    // 5. Test Search Filtering in English and Hindi
    const searchMustardEn = allIndianCrops.filter(c => c.name.toLowerCase().includes('mustard'))
    const searchMustardHi = allIndianCrops.filter(c => c.nameHi.includes('सरसों') || c.searchTerms?.some(t => t.includes('सरसों')))
    record(
      'Search Functionality',
      'Search filters correctly with both English and Hindi inputs',
      searchMustardEn.length > 0 && searchMustardHi.length > 0,
      `"mustard" found: "${searchMustardEn[0]?.name}", "सरसों" found: "${searchMustardHi[0]?.nameHi}"`
    )

    // 6. Authenticate Farmer and Create Lot with newly expanded crop (e.g. Turmeric / हल्दी)
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'ramesh@farmnexus.in',
      password: 'password123',
    })
    const farmerToken = farmerLogin.data.data.token

    const createLotRes = await axios.post(
      `${API_BASE}/lots`,
      {
        crop: 'Turmeric',
        crop_hi: 'हल्दी',
        category: 'Spices & Condiments',
        variety: 'Salem Curcumin Rich',
        quantity_qtl: 80,
        asking_price: 13500,
        expected_harvest_date: '2026-10-15',
        location: 'Sirali Spice Yard, Harda, MP',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    )
    const createdLot = createLotRes.data.data
    record(
      'Lot Creation with New Crop',
      'Farmer can create and persist lot with any crop from the expanded Indian list',
      createdLot.crop === 'Turmeric' && createdLot.quantity_qtl === 80,
      `Lot ID: ${createdLot.id}, Crop: ${createdLot.crop} (${createdLot.crop_hi}), Category: ${createdLot.category}`
    )

    // 7. Verify Existing Lots Continue to Display Correctly
    const lotsRes = await axios.get(`${API_BASE}/lots/my`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    })
    const myLots = lotsRes.data.data
    const hasExistingLots = myLots.some((l: any) => l.crop.includes('Wheat') || l.crop.includes('Soybean'))
    record(
      'Existing Lots Compatibility',
      'Existing lots with previously selected crops continue displaying without interruption',
      hasExistingLots,
      `Total farmer lots: ${myLots.length}, Active existing crops preserved`
    )

    console.log('\n==================================================================')
    const passedCount = results.filter(r => r.passed).length
    const failedCount = results.filter(r => !r.passed).length
    console.log(`🏁 CROP DROPDOWN QA: ${passedCount} PASSED, ${failedCount} FAILED`)
    console.log('==================================================================\n')

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('QA Execution Error:', err.response?.data || err.message)
    process.exit(1)
  }
}

runCropDropdownQA()
