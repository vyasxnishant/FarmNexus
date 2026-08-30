export interface IndianCrop {
  id: string
  name: string
  nameHi: string
  category: string
  categoryHi: string
  searchTerms?: string[]
}

export interface CropCategoryGroup {
  category: string
  categoryHi: string
  crops: IndianCrop[]
}

export const indianCropCategories: CropCategoryGroup[] = [
  {
    category: 'Grains & Cereals',
    categoryHi: 'अनाज और खाद्यान्न',
    crops: [
      { id: 'crop-wheat-sharbati', name: 'Wheat (Sharbati)', nameHi: 'शरबती गेहूं', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['wheat', 'sharbati', 'gehu', 'गेहूं', 'शरबती'] },
      { id: 'crop-wheat', name: 'Wheat', nameHi: 'गेहूं', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['wheat', 'gehu', 'गेहूं'] },
      { id: 'crop-basmati-rice', name: 'Basmati Rice', nameHi: 'बासमती धान', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['basmati', 'rice', 'paddy', 'dhan', 'चावल', 'बासमती', 'धान'] },
      { id: 'crop-paddy', name: 'Paddy', nameHi: 'धान', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['paddy', 'dhan', 'rice', 'धान', 'चावल'] },
      { id: 'crop-maize', name: 'Maize', nameHi: 'मक्का', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['maize', 'corn', 'makka', 'मक्का', 'भुट्टा'] },
      { id: 'crop-barley', name: 'Barley', nameHi: 'जौ', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['barley', 'jau', 'जौ'] },
      { id: 'crop-sorghum', name: 'Sorghum (Jowar)', nameHi: 'ज्वार', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['sorghum', 'jowar', 'ज्वार'] },
      { id: 'crop-bajra', name: 'Pearl Millet (Bajra)', nameHi: 'बाजरा', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['pearl millet', 'bajra', 'बाजरा'] },
      { id: 'crop-ragi', name: 'Finger Millet (Ragi)', nameHi: 'रागी', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['finger millet', 'ragi', 'madua', 'रागी', 'मंडुआ'] },
      { id: 'crop-oats', name: 'Oats', nameHi: 'जई', category: 'Grains & Cereals', categoryHi: 'अनाज', searchTerms: ['oats', 'jai', 'जई'] },
    ],
  },
  {
    category: 'Pulses & Legumes',
    categoryHi: 'दलहन और दालें',
    crops: [
      { id: 'crop-chana', name: 'Chana (Gram)', nameHi: 'चना (देसी/डॉलर)', category: 'Pulses & Legumes', categoryHi: 'दलहन', searchTerms: ['chana', 'gram', 'chickpea', 'चना', 'छोला'] },
      { id: 'crop-moong', name: 'Moong', nameHi: 'मूंग', category: 'Pulses & Legumes', categoryHi: 'दलहन', searchTerms: ['moong', 'mung', 'green gram', 'मूंग'] },
      { id: 'crop-urad', name: 'Urad', nameHi: 'उड़द', category: 'Pulses & Legumes', categoryHi: 'दलहन', searchTerms: ['urad', 'black gram', 'उड़द'] },
      { id: 'crop-arhar', name: 'Arhar (Tur)', nameHi: 'अरहर (तुअर)', category: 'Pulses & Legumes', categoryHi: 'दलहन', searchTerms: ['arhar', 'tur', 'pigeon pea', 'अरहर', 'तुअर', 'तुवर'] },
      { id: 'crop-masoor', name: 'Masoor', nameHi: 'मसूर', category: 'Pulses & Legumes', categoryHi: 'दलहन', searchTerms: ['masoor', 'lentil', 'मसूर'] },
      { id: 'crop-peas-dry', name: 'Peas (Dry)', nameHi: 'मटर (सूखा)', category: 'Pulses & Legumes', categoryHi: 'दलहन', searchTerms: ['peas', 'dry peas', 'matar', 'मटर', 'सफेद मटर'] },
      { id: 'crop-lentils', name: 'Lentils', nameHi: 'दाल', category: 'Pulses & Legumes', categoryHi: 'दलहन', searchTerms: ['lentils', 'dal', 'daal', 'दाल'] },
    ],
  },
  {
    category: 'Oilseeds',
    categoryHi: 'तिलहन फसलें',
    crops: [
      { id: 'crop-soybean', name: 'Soybean', nameHi: 'सोयाबीन', category: 'Oilseeds', categoryHi: 'तिलहन', searchTerms: ['soybean', 'soya', 'सोयाबीन'] },
      { id: 'crop-mustard', name: 'Mustard', nameHi: 'सरसों', category: 'Oilseeds', categoryHi: 'तिलहन', searchTerms: ['mustard', 'sarson', 'rai', 'सरसों', 'राई'] },
      { id: 'crop-groundnut', name: 'Groundnut', nameHi: 'मूंगफली', category: 'Oilseeds', categoryHi: 'तिलहन', searchTerms: ['groundnut', 'peanut', 'mungfali', 'मूंगफली'] },
      { id: 'crop-sesame', name: 'Sesame', nameHi: 'तिल', category: 'Oilseeds', categoryHi: 'तिलहन', searchTerms: ['sesame', 'til', 'तिल'] },
      { id: 'crop-sunflower', name: 'Sunflower', nameHi: 'सूरजमुखी', category: 'Oilseeds', categoryHi: 'तिलहन', searchTerms: ['sunflower', 'surajmukhi', 'सूरजमुखी'] },
      { id: 'crop-safflower', name: 'Safflower', nameHi: 'कुसुम', category: 'Oilseeds', categoryHi: 'तिलहन', searchTerms: ['safflower', 'kusum', 'kardi', 'कुसुम'] },
      { id: 'crop-linseed', name: 'Linseed', nameHi: 'अलसी', category: 'Oilseeds', categoryHi: 'तिलहन', searchTerms: ['linseed', 'flaxseed', 'alsi', 'अलसी'] },
    ],
  },
  {
    category: 'Fibers & Cash Crops',
    categoryHi: 'नकदी और रेशेदार फसलें',
    crops: [
      { id: 'crop-cotton', name: 'Cotton (Kapas)', nameHi: 'कपास', category: 'Fibers & Cash Crops', categoryHi: 'नकदी फसलें', searchTerms: ['cotton', 'kapas', 'rui', 'कपास', 'रूई'] },
      { id: 'crop-sugarcane', name: 'Sugarcane', nameHi: 'गन्ना', category: 'Fibers & Cash Crops', categoryHi: 'नकदी फसलें', searchTerms: ['sugarcane', 'ganna', 'गन्ना'] },
      { id: 'crop-tobacco', name: 'Tobacco', nameHi: 'तंबाकू', category: 'Fibers & Cash Crops', categoryHi: 'नकदी फसलें', searchTerms: ['tobacco', 'tambaku', 'तंबाकू'] },
      { id: 'crop-jute', name: 'Jute', nameHi: 'जूट', category: 'Fibers & Cash Crops', categoryHi: 'नकदी फसलें', searchTerms: ['jute', 'patson', 'जूट', 'पटसन'] },
    ],
  },
  {
    category: 'Vegetables',
    categoryHi: 'सब्जियां',
    crops: [
      { id: 'crop-potato', name: 'Potato', nameHi: 'आलू', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['potato', 'aaloo', 'aalu', 'आलू'] },
      { id: 'crop-onion', name: 'Onion', nameHi: 'प्याज', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['onion', 'pyaj', 'kanda', 'प्याज', 'कांदा'] },
      { id: 'crop-tomato', name: 'Tomato', nameHi: 'टमाटर', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['tomato', 'tamatar', 'टमाटर'] },
      { id: 'crop-garlic', name: 'Garlic', nameHi: 'लहसुन', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['garlic', 'lahsun', 'लहसुन'] },
      { id: 'crop-ginger', name: 'Ginger', nameHi: 'अदरक', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['ginger', 'adrak', 'अदरक'] },
      { id: 'crop-green-chilli', name: 'Green Chilli', nameHi: 'हरी मिर्च', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['green chilli', 'chilli', 'mirch', 'हरी मिर्च', 'मिर्च'] },
      { id: 'crop-cauliflower', name: 'Cauliflower', nameHi: 'फूलगोभी', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['cauliflower', 'gobhi', 'phool gobhi', 'फूलगोभी', 'गोभी'] },
      { id: 'crop-cabbage', name: 'Cabbage', nameHi: 'पत्तागोभी', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['cabbage', 'patta gobhi', 'band gobhi', 'पत्तागोभी', 'बंदगोभी'] },
      { id: 'crop-carrot', name: 'Carrot', nameHi: 'गाजर', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['carrot', 'gajar', 'गाजर'] },
      { id: 'crop-radish', name: 'Radish', nameHi: 'मूली', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['radish', 'mooli', 'मूली'] },
      { id: 'crop-okra', name: 'Okra (Bhindi)', nameHi: 'भिंडी', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['okra', 'bhindi', 'lady finger', 'भिंडी'] },
      { id: 'crop-brinjal', name: 'Brinjal (Baingan)', nameHi: 'बैंगन', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['brinjal', 'eggplant', 'baingan', 'बैंगन', 'भटा'] },
      { id: 'crop-green-peas', name: 'Green Peas', nameHi: 'हरी मटर', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['green peas', 'peas', 'matar', 'हरी मटर', 'मटर'] },
      { id: 'crop-spinach', name: 'Spinach', nameHi: 'पालक', category: 'Vegetables', categoryHi: 'सब्जियां', searchTerms: ['spinach', 'palak', 'पालक'] },
    ],
  },
  {
    category: 'Fruits',
    categoryHi: 'फल व बागवानी',
    crops: [
      { id: 'crop-mango', name: 'Mango', nameHi: 'आम', category: 'Fruits', categoryHi: 'फल', searchTerms: ['mango', 'aam', 'आम'] },
      { id: 'crop-banana', name: 'Banana', nameHi: 'केला', category: 'Fruits', categoryHi: 'फल', searchTerms: ['banana', 'kela', 'केला'] },
      { id: 'crop-orange', name: 'Orange', nameHi: 'संतरा', category: 'Fruits', categoryHi: 'फल', searchTerms: ['orange', 'santra', 'nagpur orange', 'संतरा'] },
      { id: 'crop-guava', name: 'Guava', nameHi: 'अमरूद', category: 'Fruits', categoryHi: 'फल', searchTerms: ['guava', 'amrood', 'amrud', 'अमरूद'] },
      { id: 'crop-pomegranate', name: 'Pomegranate', nameHi: 'अनार', category: 'Fruits', categoryHi: 'फल', searchTerms: ['pomegranate', 'anaar', 'anar', 'अनार'] },
      { id: 'crop-papaya', name: 'Papaya', nameHi: 'पपीता', category: 'Fruits', categoryHi: 'फल', searchTerms: ['papaya', 'papita', 'पपीता'] },
      { id: 'crop-grapes', name: 'Grapes', nameHi: 'अंगूर', category: 'Fruits', categoryHi: 'फल', searchTerms: ['grapes', 'angoor', 'अंगूर'] },
      { id: 'crop-watermelon', name: 'Watermelon', nameHi: 'तरबूज', category: 'Fruits', categoryHi: 'फल', searchTerms: ['watermelon', 'tarbooj', 'तरबूज'] },
      { id: 'crop-muskmelon', name: 'Muskmelon', nameHi: 'खरबूजा', category: 'Fruits', categoryHi: 'फल', searchTerms: ['muskmelon', 'kharbooja', 'खरबूजा'] },
      { id: 'crop-apple', name: 'Apple', nameHi: 'सेब', category: 'Fruits', categoryHi: 'फल', searchTerms: ['apple', 'seb', 'सेब'] },
    ],
  },
  {
    category: 'Spices & Condiments',
    categoryHi: 'मसाले व औषधीय फसलें',
    crops: [
      { id: 'crop-coriander', name: 'Coriander', nameHi: 'धनिया', category: 'Spices & Condiments', categoryHi: 'मसाले', searchTerms: ['coriander', 'dhaniya', 'धनिया'] },
      { id: 'crop-cumin', name: 'Cumin', nameHi: 'जीरा', category: 'Spices & Condiments', categoryHi: 'मसाले', searchTerms: ['cumin', 'jeera', 'जीरा'] },
      { id: 'crop-turmeric', name: 'Turmeric', nameHi: 'हल्दी', category: 'Spices & Condiments', categoryHi: 'मसाले', searchTerms: ['turmeric', 'haldi', 'हल्दी'] },
      { id: 'crop-fennel', name: 'Fennel', nameHi: 'सौंफ', category: 'Spices & Condiments', categoryHi: 'मसाले', searchTerms: ['fennel', 'saunf', 'सौंफ'] },
      { id: 'crop-fenugreek', name: 'Fenugreek', nameHi: 'मेथी', category: 'Spices & Condiments', categoryHi: 'मसाले', searchTerms: ['fenugreek', 'methi', 'मेथी'] },
      { id: 'crop-black-pepper', name: 'Black Pepper', nameHi: 'काली मिर्च', category: 'Spices & Condiments', categoryHi: 'मसाले', searchTerms: ['black pepper', 'kali mirch', 'काली मिर्च'] },
      { id: 'crop-red-chilli', name: 'Red Chilli', nameHi: 'लाल मिर्च', category: 'Spices & Condiments', categoryHi: 'मसाले', searchTerms: ['red chilli', 'lal mirch', 'लाल मिर्च'] },
    ],
  },
  {
    category: 'Other',
    categoryHi: 'अन्य फसलें',
    crops: [
      { id: 'crop-other', name: 'Other', nameHi: 'अन्य', category: 'Other', categoryHi: 'अन्य', searchTerms: ['other', 'anya', 'misc', 'अन्य'] },
    ],
  },
]

// Flattened list of all Indian crops
export const allIndianCrops: IndianCrop[] = indianCropCategories.flatMap(g => g.crops)

// Helper to find crop by name
export function findIndianCrop(cropName: string): IndianCrop | undefined {
  if (!cropName) return undefined
  const lower = cropName.trim().toLowerCase()
  return allIndianCrops.find(
    c => c.name.toLowerCase() === lower || c.nameHi.toLowerCase() === lower || c.name.toLowerCase().includes(lower)
  )
}

