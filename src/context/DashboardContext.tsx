import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type CropType = 'Wheat (Sharbati)' | 'Basmati Rice' | 'Soybean' | 'Chana (Gram)' | 'Mustard' | 'Maize' | string
export type QualityGrade = 'Grade A (Export)' | 'Grade A' | 'Grade B' | 'Grade C'
export type VisualQuality = 'Excellent' | 'Good' | 'Average' | 'Poor'
export type DamageLevel = 'None' | 'Low' | 'Medium' | 'High'
export type GrainSize = 'Uniform Bold' | 'Medium' | 'Small / Mixed'
export type LotStatus = 'Active' | 'Draft' | 'Under Offer' | 'Sold' | 'Expired' | 'Paused'
export type PaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Delayed'
export type QuantityUnit = 'Quintal' | 'Kg' | 'Tonne'

export interface CropLot {
  id: string
  crop: string
  cropHi?: string
  category?: string
  variety: string
  quantityQtl: number
  unit: QuantityUnit
  grade: QualityGrade
  visualQuality?: VisualQuality
  damageLevel?: DamageLevel
  grainSize?: GrainSize
  moisturePercent?: number
  foreignMatterPercent?: number
  damagedGrainPercent?: number
  qualityNotes?: string
  description?: string
  imageUrl?: string
  images?: string[]
  certificateUrl?: string
  expectedPrice: number // ₹/qtl
  minAcceptablePrice?: number
  marketReferencePrice?: number
  harvestDate: string
  availableFrom?: string
  availableUntil?: string
  location: string
  state?: string
  district?: string
  village?: string
  pickupLocation?: string
  status: LotStatus
  createdAt: string
  matchedBuyersCount: number
  activeOffersCount: number
  highestOffer?: number
  isDemo?: boolean
  isLocalPrototype?: boolean
}

export interface MarketPriceData {
  crop: CropType
  mandi: string
  state: string
  distanceKm: number
  minPrice: number
  modalPrice: number
  maxPrice: number
  priceChange: number // %
  trend: 'up' | 'down' | 'steady'
  lastUpdated: string
  sparkline: number[]
}

export interface BuyerMatch {
  id: string
  buyerName: string
  company: string
  verified: boolean
  reliabilityScore: number // e.g. 4.9
  tradesCompleted: number
  crop: CropType
  requiredQuantityQtl: number
  offeredPrice: number // ₹/qtl
  requiredGrade: QualityGrade
  deliveryLocation: string
  matchPercentage: number
  tags: string[]
}

export interface Offer {
  id: string
  lotId: string
  lotTitle: string
  buyerId: string
  buyerName: string
  buyerCompany: string
  buyerReliability: number
  buyerVerified: boolean
  offeredPrice: number // ₹/qtl
  lotExpectedPrice: number
  quantityQtl: number
  totalAmount: number
  expiresInHours: number
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Countered'
  counterPrice?: number
  createdDate: string
  paymentTerms: string
  pickupLocation: string
}

export interface PaymentTransaction {
  id: string
  offerId: string
  lotTitle: string
  buyerName: string
  amount: number
  status: PaymentStatus
  dueDate: string
  paidDate?: string
  paymentMethod: 'UPI' | 'e-NWR Escrow' | 'Direct Bank'
  referenceId: string
  timeline: {
    step: string
    completed: boolean
    date: string
  }[]
}

export type TransactionPaymentStatus =
  | 'Payment Pending'
  | 'Payment Processing'
  | 'Payment Successful'
  | 'Payment Failed'
  | 'Payment Refunded'

export type TransactionLifecycleStatus =
  | 'Payment Pending'
  | 'Payment Completed'
  | 'In Transit'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled'

export interface TransactionStageEvent {
  stage: string
  label: string
  labelHi?: string
  timestamp: string
  completed: boolean
  description: string
}

export interface FarmTransaction {
  id: string
  lotId: string
  offerId: string
  farmerId: string
  farmerName: string
  farmerLocation: string
  farmerPhone: string
  buyerId: string
  buyerName: string
  buyerOrganization: string
  buyerLocation: string
  crop: string
  cropHi?: string
  variety: string
  quantityQtl: number
  unit: string
  agreedPricePerQtl: number
  produceValue: number
  transportCost: number
  mandiCess: number
  finalAmount: number
  mandiOrDeliveryLocation: string
  createdDate: string
  paymentStatus: TransactionPaymentStatus
  transactionStatus: TransactionLifecycleStatus
  timeline: TransactionStageEvent[]
  paymentDetails?: {
    method: 'UPI' | 'NetBanking' | 'e-NWR Escrow' | 'RTGS/NEFT'
    transactionRef?: string
    payerVpa?: string
    paidAt?: string
    escrowRef?: string
  }
}

export interface NotificationItem {
  id: string
  type: 'price' | 'match' | 'offer' | 'payment' | 'system'
  title: string
  titleHi: string
  message: string
  messageHi: string
  timeAgo: string
  read: boolean
  link?: string
}

export interface FarmerProfile {
  name: string
  nameHi: string
  phone: string
  village: string
  district: string
  state: string
  pincode: string
  fpoName: string
  fpoRole: string
  totalLandAcres: number
  kycVerified: boolean
  kisanCreditCardVerified: boolean
  bankAccountMasked: string
  upiId: string
  memberSince: string
}

export interface BuyerRequirement {
  requiredCrop: string
  requiredQuantityQtl: number
  preferredGrade: string
  preferredLocation: string
  maxPrice: number
}

export interface BuyerProfile {
  name: string
  company: string
  gstNumber: string
  deliveryLocation: string
  verified: boolean
  reliabilityScore: number
}

export interface MatchScoreResult {
  score: number
  matchReasons: string[]
  isHighMatch: boolean
}

interface DashboardContextType {
  lang: 'en' | 'hi'
  setLang: (lang: 'en' | 'hi') => void
  toggleLang: () => void
  profile: FarmerProfile
  buyerProfile: BuyerProfile
  buyerRequirement: BuyerRequirement
  updateBuyerRequirement: (req: Partial<BuyerRequirement>) => void
  lots: CropLot[]
  addLot: (lot: Omit<CropLot, 'id' | 'createdAt' | 'matchedBuyersCount' | 'activeOffersCount'>) => string
  updateLot: (lotId: string, data: Partial<CropLot>) => void
  updateLotStatus: (lotId: string, status: LotStatus) => void
  deleteLot: (lotId: string) => void
  publishDraftLot: (lotId: string) => void
  pauseLot: (lotId: string) => void
  getLotById: (lotId: string) => CropLot | undefined
  offers: Offer[]
  acceptOffer: (offerId: string) => void
  rejectOffer: (offerId: string) => void
  counterOffer: (offerId: string, counterPrice: number) => void
  makeBuyerOffer: (offerData: {
    lotId: string
    offeredPrice: number
    quantityQtl: number
    paymentTerms?: string
    message?: string
  }) => string
  cancelBuyerOffer: (offerId: string) => void
  calculateLotMatchScore: (lot: CropLot, req?: BuyerRequirement) => MatchScoreResult
  payments: PaymentTransaction[]
  transactions: FarmTransaction[]
  getTransactionById: (transactionId: string) => FarmTransaction | undefined
  updateTransactionPayment: (
    transactionId: string,
    paymentStatus: TransactionPaymentStatus,
    transactionStatus: TransactionLifecycleStatus,
    details?: FarmTransaction['paymentDetails']
  ) => void
  advanceTransactionLifecycle: (
    transactionId: string,
    newStatus: TransactionLifecycleStatus
  ) => void
  notifications: NotificationItem[]
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  marketData: MarketPriceData[]
  buyerMatches: BuyerMatch[]
  isListModalOpen: boolean
  setIsListModalOpen: (open: boolean) => void
  counterModalOffer: Offer | null
  setCounterModalOffer: (offer: Offer | null) => void
}

const initialProfile: FarmerProfile = {
  name: 'Ramesh Patel',
  nameHi: 'रमेश पटेल',
  phone: '+91 98261 44520',
  village: 'Sirali, Harda',
  district: 'Harda',
  state: 'Madhya Pradesh',
  pincode: '461331',
  fpoName: 'Narmada Valley Kisan Producer Co.',
  fpoRole: 'Active Shareholder & Lead Producer',
  totalLandAcres: 14.5,
  kycVerified: true,
  kisanCreditCardVerified: true,
  bankAccountMasked: 'SBI •••• 8842',
  upiId: 'ramesh.patel@sbi',
  memberSince: 'Oct 2024',
}

const initialLots: CropLot[] = [
  {
    id: 'LOT-AGN-081',
    crop: 'Wheat (Sharbati)',
    cropHi: 'गेहूं (शरबती)',
    category: 'Grains & Cereals',
    variety: 'C-306 Sharbati Premium',
    quantityQtl: 140,
    unit: 'Quintal',
    grade: 'Grade A (Export)',
    visualQuality: 'Excellent',
    damageLevel: 'None',
    grainSize: 'Uniform Bold',
    expectedPrice: 2750,
    minAcceptablePrice: 2650,
    marketReferencePrice: 2840,
    moisturePercent: 10.4,
    foreignMatterPercent: 0.8,
    damagedGrainPercent: 0.5,
    qualityNotes: 'Machine cleaned, sun dried on pucca floor, zero weevil infestation.',
    description: 'Golden luster Sharbati wheat, tested for 12.5% protein and low moisture. Ready for immediate container loading.',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    harvestDate: '2026-04-12',
    availableFrom: '2026-04-15',
    availableUntil: '2026-06-30',
    location: 'Sirali Farm Godown #2, Harda',
    state: 'Madhya Pradesh',
    district: 'Harda',
    village: 'Sirali',
    pickupLocation: 'Godown #2, Main Road',
    status: 'Active',
    createdAt: '2 days ago',
    matchedBuyersCount: 6,
    activeOffersCount: 3,
    highestOffer: 2780,
    isDemo: true,
  },
  {
    id: 'LOT-AGN-079',
    crop: 'Soybean',
    cropHi: 'सोयाबीन',
    category: 'Oilseeds',
    variety: 'JS-9560 Yellow',
    quantityQtl: 95,
    unit: 'Quintal',
    grade: 'Grade A',
    visualQuality: 'Good',
    damageLevel: 'Low',
    grainSize: 'Medium',
    expectedPrice: 4950,
    minAcceptablePrice: 4800,
    marketReferencePrice: 5080,
    moisturePercent: 11.2,
    foreignMatterPercent: 1.1,
    damagedGrainPercent: 0.9,
    qualityNotes: 'High oil content, graded through 4mm sieve.',
    description: 'Cleaned yellow seed soybean from certified organic transition field.',
    imageUrl: 'https://images.unsplash.com/photo-1599588673360-39908cfd0d5d?auto=format&fit=crop&w=800&q=80',
    harvestDate: '2026-05-02',
    availableFrom: '2026-05-05',
    availableUntil: '2026-07-15',
    location: 'Sirali Farm Godown #1, Harda',
    state: 'Madhya Pradesh',
    district: 'Harda',
    village: 'Sirali',
    pickupLocation: 'Godown #1 Gate B',
    status: 'Under Offer',
    createdAt: '4 days ago',
    matchedBuyersCount: 4,
    activeOffersCount: 2,
    highestOffer: 5020,
    isDemo: true,
  },
  {
    id: 'LOT-AGN-072',
    crop: 'Chana (Gram)',
    cropHi: 'चना (देसी)',
    category: 'Pulses & Legumes',
    variety: 'Desi Dollar Chana',
    quantityQtl: 60,
    unit: 'Quintal',
    grade: 'Grade A',
    visualQuality: 'Excellent',
    damageLevel: 'None',
    grainSize: 'Uniform Bold',
    expectedPrice: 5800,
    minAcceptablePrice: 5600,
    marketReferencePrice: 5850,
    moisturePercent: 9.8,
    foreignMatterPercent: 0.6,
    damagedGrainPercent: 0.4,
    qualityNotes: 'Uniform bold grain size, ideal for institutional processing.',
    description: 'Dry harvested desi gram stored in food-grade bags.',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',
    harvestDate: '2026-03-28',
    availableFrom: '2026-04-01',
    availableUntil: '2026-05-30',
    location: 'Harda Mandi Warehouse',
    state: 'Madhya Pradesh',
    district: 'Harda',
    village: 'Harda APMC',
    pickupLocation: 'Shed 4, Bay 12',
    status: 'Draft',
    createdAt: '1 week ago',
    matchedBuyersCount: 2,
    activeOffersCount: 0,
    isDemo: true,
  },
  {
    id: 'LOT-AGN-064',
    crop: 'Mustard',
    cropHi: 'सरसों',
    variety: 'Pusa Bold',
    quantityQtl: 80,
    unit: 'Quintal',
    grade: 'Grade B',
    visualQuality: 'Good',
    damageLevel: 'Low',
    grainSize: 'Medium',
    expectedPrice: 5350,
    minAcceptablePrice: 5200,
    marketReferencePrice: 5460,
    moisturePercent: 8.5,
    foreignMatterPercent: 1.5,
    damagedGrainPercent: 1.2,
    qualityNotes: '42% estimated oil recovery.',
    harvestDate: '2026-03-10',
    availableFrom: '2026-03-12',
    availableUntil: '2026-04-30',
    location: 'Sirali Godown #1, Harda',
    state: 'Madhya Pradesh',
    district: 'Harda',
    village: 'Sirali',
    pickupLocation: 'Godown #1 Gate A',
    status: 'Sold',
    createdAt: '3 weeks ago',
    matchedBuyersCount: 5,
    activeOffersCount: 0,
    highestOffer: 5400,
    isDemo: true,
  },
]

const initialMarketData: MarketPriceData[] = [
  {
    crop: 'Wheat (Sharbati)',
    mandi: 'Harda APMC Mandi',
    state: 'Madhya Pradesh',
    distanceKm: 18,
    minPrice: 2590,
    modalPrice: 2720,
    maxPrice: 2850,
    priceChange: 2.8,
    trend: 'up',
    lastUpdated: '12 mins ago',
    sparkline: [2610, 2630, 2660, 2690, 2680, 2710, 2720],
  },
  {
    crop: 'Wheat (Sharbati)',
    mandi: 'Indore Central Mandi',
    state: 'Madhya Pradesh',
    distanceKm: 145,
    minPrice: 2680,
    modalPrice: 2840,
    maxPrice: 2950,
    priceChange: 3.4,
    trend: 'up',
    lastUpdated: '8 mins ago',
    sparkline: [2700, 2730, 2760, 2790, 2810, 2830, 2840],
  },
  {
    crop: 'Soybean',
    mandi: 'Harda APMC Mandi',
    state: 'Madhya Pradesh',
    distanceKm: 18,
    minPrice: 4720,
    modalPrice: 4940,
    maxPrice: 5120,
    priceChange: 1.6,
    trend: 'up',
    lastUpdated: '15 mins ago',
    sparkline: [4800, 4840, 4870, 4900, 4920, 4930, 4940],
  },
  {
    crop: 'Soybean',
    mandi: 'Ujjain Agro Mandi',
    state: 'Madhya Pradesh',
    distanceKm: 165,
    minPrice: 4850,
    modalPrice: 5080,
    maxPrice: 5240,
    priceChange: 4.1,
    trend: 'up',
    lastUpdated: '20 mins ago',
    sparkline: [4850, 4900, 4950, 4990, 5020, 5060, 5080],
  },
  {
    crop: 'Basmati Rice',
    mandi: 'Bhopal Krishi Mandi',
    state: 'Madhya Pradesh',
    distanceKm: 155,
    minPrice: 4100,
    modalPrice: 4320,
    maxPrice: 4500,
    priceChange: -0.8,
    trend: 'down',
    lastUpdated: '25 mins ago',
    sparkline: [4400, 4380, 4360, 4350, 4340, 4310, 4320],
  },
  {
    crop: 'Chana (Gram)',
    mandi: 'Harda APMC Mandi',
    state: 'Madhya Pradesh',
    distanceKm: 18,
    minPrice: 5600,
    modalPrice: 5850,
    maxPrice: 6020,
    priceChange: 2.2,
    trend: 'up',
    lastUpdated: '30 mins ago',
    sparkline: [5700, 5740, 5760, 5800, 5820, 5840, 5850],
  },
  {
    crop: 'Mustard',
    mandi: 'Hoshangabad Mandi',
    state: 'Madhya Pradesh',
    distanceKm: 72,
    minPrice: 5200,
    modalPrice: 5460,
    maxPrice: 5620,
    priceChange: 1.1,
    trend: 'up',
    lastUpdated: '18 mins ago',
    sparkline: [5380, 5400, 5420, 5410, 5440, 5450, 5460],
  },
]

const initialBuyerMatches: BuyerMatch[] = [
  {
    id: 'BUY-01',
    buyerName: 'AgroCorp Direct India',
    company: 'AgroCorp International Ltd.',
    verified: true,
    reliabilityScore: 4.9,
    tradesCompleted: 142,
    crop: 'Wheat (Sharbati)',
    requiredQuantityQtl: 200,
    offeredPrice: 2780,
    requiredGrade: 'Grade A (Export)',
    deliveryLocation: 'Indore Central Silo',
    matchPercentage: 98,
    tags: ['Verified Buyer', 'Instant UPI', 'Prompt Pickup'],
  },
  {
    id: 'BUY-02',
    buyerName: 'ITC Choupal Saagar Mandi',
    company: 'ITC Agri Business Division',
    verified: true,
    reliabilityScore: 4.95,
    tradesCompleted: 380,
    crop: 'Soybean',
    requiredQuantityQtl: 150,
    offeredPrice: 5020,
    requiredGrade: 'Grade A',
    deliveryLocation: 'Harda Processing Unit',
    matchPercentage: 96,
    tags: ['e-NAM Partner', 'e-NWR Warehouse', 'Zero Deduction'],
  },
  {
    id: 'BUY-03',
    buyerName: 'BigBasket Fresh Hub',
    company: 'Innovative Retail Concepts Pvt Ltd',
    verified: true,
    reliabilityScore: 4.8,
    tradesCompleted: 94,
    crop: 'Wheat (Sharbati)',
    requiredQuantityQtl: 100,
    offeredPrice: 2740,
    requiredGrade: 'Grade A',
    deliveryLocation: 'Bhopal DC',
    matchPercentage: 92,
    tags: ['ONDC Network', 'Farm-gate Pickup'],
  },
  {
    id: 'BUY-04',
    buyerName: 'Adani Agri Logistics Ltd.',
    company: 'Adani Wilmar Supply Group',
    verified: true,
    reliabilityScore: 4.85,
    tradesCompleted: 210,
    crop: 'Soybean',
    requiredQuantityQtl: 300,
    offeredPrice: 4980,
    requiredGrade: 'Grade A',
    deliveryLocation: 'Dewas Plant',
    matchPercentage: 89,
    tags: ['Bulk Buyer', 'Contract Assured'],
  },
]

const initialOffers: Offer[] = [
  {
    id: 'OFF-9041',
    lotId: 'LOT-2026-081',
    lotTitle: 'Wheat (Sharbati) • 140 qtl',
    buyerId: 'BUY-01',
    buyerName: 'Vikram Mehta (AgroCorp Direct)',
    buyerCompany: 'AgroCorp International Ltd.',
    buyerReliability: 4.9,
    buyerVerified: true,
    offeredPrice: 2780,
    lotExpectedPrice: 2750,
    quantityQtl: 140,
    totalAmount: 389200,
    expiresInHours: 14,
    status: 'Pending',
    createdDate: 'Today, 06:30 AM',
    paymentTerms: '100% UPI upon electronic weightment verification',
    pickupLocation: 'Farm-gate pickup arranged by buyer',
  },
  {
    id: 'OFF-9038',
    lotId: 'LOT-2026-079',
    lotTitle: 'Soybean • 95 qtl',
    buyerId: 'BUY-02',
    buyerName: 'Sanjay Sharma (ITC Choupal)',
    buyerCompany: 'ITC Agri Business Division',
    buyerReliability: 4.95,
    buyerVerified: true,
    offeredPrice: 5020,
    lotExpectedPrice: 4950,
    quantityQtl: 95,
    totalAmount: 476900,
    expiresInHours: 26,
    status: 'Pending',
    createdDate: 'Yesterday, 04:15 PM',
    paymentTerms: 'Direct bank payout within 2 hours of QA pass',
    pickupLocation: 'Harda Mandi Hub or Farm-gate (+₹30/qtl transport rebate)',
  },
  {
    id: 'OFF-9029',
    lotId: 'LOT-2026-081',
    lotTitle: 'Wheat (Sharbati) • 140 qtl',
    buyerId: 'BUY-03',
    buyerName: 'Pooja Verma (BigBasket Fresh)',
    buyerCompany: 'BigBasket Agro Hub',
    buyerReliability: 4.8,
    buyerVerified: true,
    offeredPrice: 2720,
    lotExpectedPrice: 2750,
    quantityQtl: 100,
    totalAmount: 272000,
    expiresInHours: 4,
    status: 'Pending',
    createdDate: 'Yesterday, 11:00 AM',
    paymentTerms: 'ONDC escrow auto-release on gate receipt',
    pickupLocation: 'Bhopal Distribution Center',
  },
]

const initialPayments: PaymentTransaction[] = [
  {
    id: 'PAY-2026-104',
    offerId: 'OFF-8891',
    lotTitle: 'Mustard (Pusa Bold) • 80 qtl',
    buyerName: 'Shri Ram Edible Oils Ltd.',
    amount: 432000,
    status: 'Paid',
    dueDate: '2026-05-14',
    paidDate: '2026-05-14 (11:42 AM)',
    paymentMethod: 'UPI',
    referenceId: 'UPI-RR-9948124021',
    timeline: [
      { step: 'Deal Accepted', completed: true, date: 'May 12, 2026' },
      { step: 'Produce Weighed & Tested', completed: true, date: 'May 13, 2026' },
      { step: 'e-NWR Escrow Funded', completed: true, date: 'May 13, 2026' },
      { step: 'Funds Credited to SBI A/c', completed: true, date: 'May 14, 2026' },
    ],
  },
  {
    id: 'PAY-2026-108',
    offerId: 'OFF-8950',
    lotTitle: 'Wheat (Sharbati) • 60 qtl',
    buyerName: 'Narmada Flour Mills Pvt Ltd',
    amount: 162000,
    status: 'Processing',
    dueDate: 'Today, by 05:00 PM',
    paymentMethod: 'e-NWR Escrow',
    referenceId: 'ESCROW-MP-84021',
    timeline: [
      { step: 'Deal Accepted', completed: true, date: 'Yesterday' },
      { step: 'Produce Dispatched', completed: true, date: 'Today 08:00 AM' },
      { step: 'Quality Verification at Gate', completed: true, date: 'Today 11:30 AM' },
      { step: 'UPI Payout Trigger', completed: false, date: 'Expected 05:00 PM' },
    ],
  },
]

const initialFarmTransactions: FarmTransaction[] = [
  {
    id: 'TXN-2026-9041',
    lotId: 'LOT-AGN-081',
    offerId: 'OFF-8950',
    farmerId: 'FRM-MP-091',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Sirali Farm Godown #2, Harda, MP',
    farmerPhone: '+91 98261 44520',
    buyerId: 'BUY-ME-01',
    buyerName: 'Sunil Aggarwal',
    buyerOrganization: 'AgroCorp Direct Procurement Ltd.',
    buyerLocation: 'Indore Processing Terminal, MP',
    crop: 'Wheat (Sharbati)',
    cropHi: 'गेहूं (शरबती)',
    variety: 'C-306 Sharbati Premium',
    quantityQtl: 60,
    unit: 'Quintal',
    agreedPricePerQtl: 2780,
    produceValue: 166800,
    transportCost: 4930,
    mandiCess: 2502,
    finalAmount: 171730,
    mandiOrDeliveryLocation: 'Indore APMC Processing Bay #4',
    createdDate: 'May 14, 2026, 09:30 AM',
    paymentStatus: 'Payment Successful',
    transactionStatus: 'In Transit',
    timeline: [
      { stage: 'offer_accepted', label: 'Offer Accepted by Farmer', labelHi: 'ऑफ़र स्वीकार किया गया', timestamp: 'May 14, 09:30 AM', completed: true, description: 'Agreed price ₹2,780/qtl for 60 quintals.' },
      { stage: 'transaction_created', label: 'Transaction Contract Binding', labelHi: 'अनुबंध तैयार', timestamp: 'May 14, 09:32 AM', completed: true, description: 'Electronic trade contract generated.' },
      { stage: 'escrow_funded', label: 'Buyer Escrow Funded', labelHi: 'एस्क्रो में राशि जमा', timestamp: 'May 14, 10:15 AM', completed: true, description: '₹1,71,730 verified in FarmNexus ICICI Escrow Account.' },
      { stage: 'in_transit', label: 'Produce Dispatched & In Transit', labelHi: 'उपज रास्ते में है', timestamp: 'May 14, 02:00 PM', completed: true, description: 'Carrier Vehicle MP-09-GH-4120 dispatched from Sirali.' },
      { stage: 'delivered', label: 'Delivery & Gate Assay Check', labelHi: 'डिलिवरी व गुणवत्ता जांच', timestamp: 'Pending', completed: false, description: 'Produce arrival at Indore processing dock.' },
      { stage: 'completed', label: 'Escrow Settlement to Farmer SBI', labelHi: 'किसान खाते में भुगतान', timestamp: 'Pending', completed: false, description: 'Auto-release upon digital delivery receipt.' },
    ],
    paymentDetails: {
      method: 'e-NWR Escrow',
      transactionRef: 'ESC-ICICI-8492019',
      payerVpa: 'agrocorp.procure@icici',
      paidAt: 'May 14, 2026, 10:15 AM',
      escrowRef: 'ESC-TRX-948201',
    },
  },
  {
    id: 'TXN-2026-8812',
    lotId: 'LOT-AGN-092',
    offerId: 'OFF-8951',
    farmerId: 'FRM-MP-091',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Sirali Farm Godown #2, Harda, MP',
    farmerPhone: '+91 98261 44520',
    buyerId: 'BUY-ITC-02',
    buyerName: 'Vijay Deshmukh',
    buyerOrganization: 'ITC Choupal Saagar Rural Hub',
    buyerLocation: 'Timarni Collection Center, Harda',
    crop: 'Soybean (Yellow)',
    cropHi: 'सोयाबीन',
    variety: 'JS-335 Certified Seed',
    quantityQtl: 95,
    unit: 'Quintal',
    agreedPricePerQtl: 4920,
    produceValue: 467400,
    transportCost: 0, // Farm-gate buyer pickup
    mandiCess: 7011,
    finalAmount: 467400,
    mandiOrDeliveryLocation: 'Farm-gate pickup Sirali',
    createdDate: 'May 12, 2026, 11:00 AM',
    paymentStatus: 'Payment Successful',
    transactionStatus: 'Completed',
    timeline: [
      { stage: 'offer_accepted', label: 'Offer Accepted by Farmer', timestamp: 'May 12, 11:00 AM', completed: true, description: 'Agreed price ₹4,920/qtl for 95 quintals.' },
      { stage: 'transaction_created', label: 'Transaction Contract Binding', timestamp: 'May 12, 11:05 AM', completed: true, description: 'Electronic trade contract generated.' },
      { stage: 'escrow_funded', label: 'Buyer Escrow Funded', timestamp: 'May 12, 11:30 AM', completed: true, description: '₹4,67,400 secured in escrow.' },
      { stage: 'in_transit', label: 'Farm-gate Weighing & Loading', timestamp: 'May 12, 03:00 PM', completed: true, description: 'Loaded into ITC collection truck.' },
      { stage: 'delivered', label: 'Delivered at Collection Center', timestamp: 'May 12, 05:30 PM', completed: true, description: 'Moisture 10.1% verified.' },
      { stage: 'completed', label: 'Funds Disbursed to Farmer SBI', timestamp: 'May 12, 06:15 PM', completed: true, description: 'Direct transfer to SBI •••• 8842.' },
    ],
    paymentDetails: {
      method: 'UPI',
      transactionRef: 'UPI-SBI-9948201',
      payerVpa: 'itc.choupal@hdfcbank',
      paidAt: 'May 12, 2026, 06:15 PM',
      escrowRef: 'ESC-TRX-224810',
    },
  },
  {
    id: 'TXN-2026-7734',
    lotId: 'LOT-AGN-074',
    offerId: 'OFF-8952',
    farmerId: 'FRM-MP-091',
    farmerName: 'Ramesh Patel',
    farmerLocation: 'Sirali Farm Godown #2, Harda, MP',
    farmerPhone: '+91 98261 44520',
    buyerId: 'BUY-MK-03',
    buyerName: 'Rajesh Mehra',
    buyerOrganization: 'Mahakosh Agri Exports Ltd.',
    buyerLocation: 'Hoshangabad Mandi Yard, MP',
    crop: 'Basmati Rice (Pusa 1121)',
    cropHi: 'बासमती चावल',
    variety: 'Pusa 1121 Export Grade',
    quantityQtl: 50,
    unit: 'Quintal',
    agreedPricePerQtl: 4300,
    produceValue: 215000,
    transportCost: 3200,
    mandiCess: 3225,
    finalAmount: 218200,
    mandiOrDeliveryLocation: 'Hoshangabad APMC Export Terminal',
    createdDate: 'May 14, 2026, 08:45 AM',
    paymentStatus: 'Payment Pending',
    transactionStatus: 'Payment Pending',
    timeline: [
      { stage: 'offer_accepted', label: 'Offer Accepted by Farmer', timestamp: 'May 14, 08:45 AM', completed: true, description: 'Agreed price ₹4,300/qtl for 50 quintals.' },
      { stage: 'transaction_created', label: 'Transaction Contract Binding', timestamp: 'May 14, 08:46 AM', completed: true, description: 'Electronic trade contract generated.' },
      { stage: 'escrow_funded', label: 'Buyer Escrow Deposit', timestamp: 'Awaiting Buyer Action', completed: false, description: 'Buyer must deposit ₹2,18,200 to secure deal.' },
      { stage: 'in_transit', label: 'Carrier Dispatch & Transit', timestamp: 'Pending Escrow', completed: false, description: 'Carrier vehicle will be scheduled.' },
      { stage: 'delivered', label: 'Delivery & Gate Inspection', timestamp: 'Pending', completed: false, description: 'Delivery to Hoshangabad APMC.' },
      { stage: 'completed', label: 'Settlement to Farmer Account', timestamp: 'Pending', completed: false, description: 'Direct payout to farmer.' },
    ],
  },
]

const initialNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    type: 'offer',
    title: 'New High Offer Received!',
    titleHi: 'नया उच्च ऑफ़र प्राप्त हुआ!',
    message: 'AgroCorp Direct offered ₹2,780/qtl for your Wheat Lot (LOT-2026-081) — ₹30 above your expected price.',
    messageHi: 'AgroCorp Direct ने आपके गेहूं लॉट (LOT-2026-081) के लिए ₹2,780/क्विंटल की पेशकश की है।',
    timeAgo: '15 mins ago',
    read: false,
    link: '/farmer/offers',
  },
  {
    id: 'NOTIF-02',
    type: 'price',
    title: 'Indore Mandi Price Surge',
    titleHi: 'इंदौर मंडी में भाव उछाल',
    message: 'Wheat (Sharbati) prices climbed +3.4% in Indore Mandi today. Modal price is now ₹2,840/qtl.',
    messageHi: 'इंदौर मंडी में आज गेहूं (शरबती) के भाव +3.4% चढ़े। मॉडल भाव अब ₹2,840/क्विंटल है।',
    timeAgo: '1 hour ago',
    read: false,
    link: '/farmer/market-intelligence',
  },
  {
    id: 'NOTIF-03',
    type: 'match',
    title: 'New Verified Buyer Match',
    titleHi: 'नया सत्यापित खरीदार मिलान',
    message: 'ITC Choupal Saagar matched 96% with your 95 qtl Soybean lot with zero deduction guarantee.',
    messageHi: 'ITC चौपाल सागर ने आपके 95 क्विंटल सोयाबीन लॉट से 96% मिलान किया है।',
    timeAgo: '3 hours ago',
    read: false,
    link: '/farmer/buyers',
  },
  {
    id: 'NOTIF-04',
    type: 'payment',
    title: 'Payout Processing Notice',
    titleHi: 'भुगतान प्रोसेसिंग सूचना',
    message: '₹1,62,000 for Wheat lot (OFF-8950) is in Escrow processing. Expected credit by 5:00 PM today.',
    messageHi: 'गेहूं लॉट (OFF-8950) के लिए ₹1,62,000 एस्क्रो में है। आज शाम 5:00 बजे तक खाते में पहुंचने की उम्मीद।',
    timeAgo: '4 hours ago',
    read: true,
    link: '/farmer/payments',
  },
]

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [profile] = useState<FarmerProfile>(initialProfile)
  
  // Persistent Lots state
  const [lots, setLots] = useState<CropLot[]>(() => {
    try {
      const saved = localStorage.getItem('farmnexus_farmer_lots')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('[DashboardContext] Failed to load lots from localStorage', e)
    }
    return initialLots
  })

  // Save lots to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('farmnexus_farmer_lots', JSON.stringify(lots))
    } catch (e) {
      console.warn('[DashboardContext] Failed to save lots to localStorage', e)
    }
  }, [lots])

  // Persistent Transactions state
  const [transactions, setTransactions] = useState<FarmTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('farmnexus_transactions')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('[DashboardContext] Failed to load transactions from localStorage', e)
    }
    return initialFarmTransactions
  })

  useEffect(() => {
    try {
      localStorage.setItem('farmnexus_transactions', JSON.stringify(transactions))
    } catch (e) {
      console.warn('[DashboardContext] Failed to save transactions to localStorage', e)
    }
  }, [transactions])

  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [payments, setPayments] = useState<PaymentTransaction[]>(initialPayments)
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [marketData] = useState<MarketPriceData[]>(initialMarketData)
  const [buyerMatches] = useState<BuyerMatch[]>(initialBuyerMatches)

  // Buyer Requirement & Profile State
  const [buyerProfile] = useState<BuyerProfile>({
    name: 'Sunil Aggarwal',
    company: 'AgroCorp Direct Procurement Ltd.',
    gstNumber: '23AAACA1234F1Z8',
    deliveryLocation: 'Indore Processing Terminal, MP',
    verified: true,
    reliabilityScore: 4.95,
  })

  const [buyerRequirement, setBuyerRequirement] = useState<BuyerRequirement>({
    requiredCrop: 'Wheat (Sharbati)',
    requiredQuantityQtl: 100,
    preferredGrade: 'Grade A',
    preferredLocation: 'Madhya Pradesh',
    maxPrice: 2900,
  })

  const updateBuyerRequirement = (req: Partial<BuyerRequirement>) => {
    setBuyerRequirement(prev => ({ ...prev, ...req }))
  }

  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [counterModalOffer, setCounterModalOffer] = useState<Offer | null>(null)

  const getTransactionById = (transactionId: string): FarmTransaction | undefined => {
    return transactions.find(t => t.id === transactionId)
  }

  const updateTransactionPayment = (
    transactionId: string,
    paymentStatus: TransactionPaymentStatus,
    transactionStatus: TransactionLifecycleStatus,
    details?: FarmTransaction['paymentDetails']
  ) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          const updatedTimeline = t.timeline.map(tl => {
            if (tl.stage === 'escrow_funded' && (paymentStatus === 'Payment Successful' || transactionStatus === 'Payment Completed')) {
              return { ...tl, completed: true, timestamp: 'Just now' }
            }
            return tl
          })

          return {
            ...t,
            paymentStatus,
            transactionStatus,
            paymentDetails: details || t.paymentDetails,
            timeline: updatedTimeline,
          }
        }
        return t
      })
    )

    // Notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'payment',
      title: paymentStatus === 'Payment Successful' ? 'Escrow Deposit Verified!' : 'Payment Update',
      titleHi: paymentStatus === 'Payment Successful' ? 'एस्क्रो में भुगतान प्राप्त!' : 'भुगतान अपडेट',
      message: `Transaction ${transactionId} payment status updated to ${paymentStatus}.`,
      messageHi: `लेनदेन ${transactionId} की भुगतान स्थिति अब ${paymentStatus} है।`,
      timeAgo: 'Just now',
      read: false,
      link: `/farmer/transactions`,
    }
    setNotifications(prev => [notif, ...prev])
  }

  const advanceTransactionLifecycle = (
    transactionId: string,
    newStatus: TransactionLifecycleStatus
  ) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          const updatedTimeline = t.timeline.map(tl => {
            if (newStatus === 'In Transit' && tl.stage === 'in_transit') {
              return { ...tl, completed: true, timestamp: 'Just now' }
            }
            if (newStatus === 'Delivered' && (tl.stage === 'in_transit' || tl.stage === 'delivered')) {
              return { ...tl, completed: true, timestamp: 'Just now' }
            }
            if (newStatus === 'Completed') {
              return { ...tl, completed: true, timestamp: 'Just now' }
            }
            return tl
          })

          return {
            ...t,
            transactionStatus: newStatus,
            timeline: updatedTimeline,
          }
        }
        return t
      })
    )
  }

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'hi' : 'en'))

  const calculateLotMatchScore = (lot: CropLot, req = buyerRequirement): MatchScoreResult => {
    let score = 0
    const matchReasons: string[] = []

    // 1. Crop Match (40 pts)
    if (req.requiredCrop === 'All') {
      score += 40
      matchReasons.push('General commodity match')
    } else if (
      lot.crop.toLowerCase().includes(req.requiredCrop.toLowerCase()) ||
      req.requiredCrop.toLowerCase().includes(lot.crop.toLowerCase())
    ) {
      score += 40
      matchReasons.push(`Exact crop match (${lot.crop})`)
    } else if (lot.category && lot.category.toLowerCase().includes('grain') && req.requiredCrop.toLowerCase().includes('wheat')) {
      score += 25
      matchReasons.push('Related grain group')
    } else {
      score += 10
    }

    // 2. Quantity Suitability (25 pts)
    if (lot.quantityQtl >= req.requiredQuantityQtl * 0.8 && lot.quantityQtl <= req.requiredQuantityQtl * 1.5) {
      score += 25
      matchReasons.push(`Target volume (${lot.quantityQtl} qtl suitable for ${req.requiredQuantityQtl} qtl demand)`)
    } else if (lot.quantityQtl >= req.requiredQuantityQtl * 0.5) {
      score += 15
      matchReasons.push(`Volume matches partial procurement (${lot.quantityQtl} qtl)`)
    } else {
      score += 5
    }

    // 3. Quality Grade & Attributes Match (20 pts + bonus/penalties)
    if (req.preferredGrade === 'All') {
      if (lot.grade === 'Grade A (Export)' || lot.grade === 'Grade A') {
        score += 20
        matchReasons.push(`Certified ${lot.grade} quality`)
      } else if (lot.grade === 'Grade B') {
        score += 16
        matchReasons.push('Commercial Grade B quality')
      } else {
        score += 12
        matchReasons.push('Standard Grade C produce')
      }
    } else if (req.preferredGrade === 'Grade A' || req.preferredGrade === 'Grade A (Export)') {
      if (lot.grade === 'Grade A (Export)' || lot.grade === 'Grade A') {
        score += 20
        matchReasons.push(`Meets preferred ${lot.grade} specification`)
      } else if (lot.grade === 'Grade B') {
        score += 10
        matchReasons.push(`Grade B (below preferred ${req.preferredGrade})`)
      } else {
        score += 4
        matchReasons.push('Grade C (below specification)')
      }
    } else if (req.preferredGrade === 'Grade B') {
      if (lot.grade === 'Grade A (Export)' || lot.grade === 'Grade A') {
        score += 20
        matchReasons.push('Exceeds target with Grade A quality')
      } else if (lot.grade === 'Grade B') {
        score += 20
        matchReasons.push('Matches Grade B specification')
      } else {
        score += 8
      }
    } else {
      score += 15
    }

    // Visual quality & damage scoring
    if (lot.visualQuality === 'Excellent') {
      score += 3
      matchReasons.push('Excellent visual appearance & luster')
    } else if (lot.visualQuality === 'Good') {
      score += 1
    }

    if (lot.damageLevel === 'None') {
      score += 2
      matchReasons.push('Zero detected grain damage')
    } else if (lot.damageLevel === 'High') {
      score -= 10
      matchReasons.push('High defect/damage level penalty')
    }

    // 4. Location Proximity (15 pts)
    if (
      req.preferredLocation === 'All' ||
      lot.location.toLowerCase().includes(req.preferredLocation.toLowerCase()) ||
      (lot.state && lot.state.toLowerCase().includes(req.preferredLocation.toLowerCase()))
    ) {
      score += 15
      matchReasons.push(`Region match (${lot.state || lot.location})`)
    } else {
      score += 5
    }

    // Budget alignment reason
    if (lot.expectedPrice <= req.maxPrice) {
      matchReasons.push(`Within price budget (₹${lot.expectedPrice.toLocaleString('en-IN')} <= max ₹${req.maxPrice.toLocaleString('en-IN')})`)
    }

    const finalScore = Math.min(100, Math.max(15, score))
    return {
      score: finalScore,
      matchReasons,
      isHighMatch: finalScore >= 75,
    }
  }

  const makeBuyerOffer = (offerData: {
    lotId: string
    offeredPrice: number
    quantityQtl: number
    paymentTerms?: string
    message?: string
  }): string => {
    const lot = lots.find(l => l.id === offerData.lotId)
    const newOfferId = `OFF-${Math.floor(Math.random() * 9000 + 1000)}`
    const totalAmount = offerData.offeredPrice * offerData.quantityQtl

    const newOffer: Offer = {
      id: newOfferId,
      lotId: offerData.lotId,
      lotTitle: lot ? `${lot.crop} • ${offerData.quantityQtl} qtl` : `Produce Lot ${offerData.lotId}`,
      buyerId: 'BUY-ME-01',
      buyerName: buyerProfile.name,
      buyerCompany: buyerProfile.company,
      buyerReliability: buyerProfile.reliabilityScore,
      buyerVerified: buyerProfile.verified,
      offeredPrice: offerData.offeredPrice,
      lotExpectedPrice: lot ? lot.expectedPrice : offerData.offeredPrice,
      quantityQtl: offerData.quantityQtl,
      totalAmount,
      expiresInHours: 48,
      status: 'Pending',
      createdDate: 'Just now',
      paymentTerms: offerData.paymentTerms || 'e-NWR Escrow auto-release on gate receipt',
      pickupLocation: lot ? lot.location : 'Farm-gate Pickup',
    }

    setOffers(prev => [newOffer, ...prev])

    // Update lot activeOffersCount and highestOffer
    setLots(prev =>
      prev.map(l => {
        if (l.id === offerData.lotId) {
          const currentHighest = l.highestOffer || 0
          return {
            ...l,
            activeOffersCount: (l.activeOffersCount || 0) + 1,
            highestOffer: Math.max(currentHighest, offerData.offeredPrice),
          }
        }
        return l
      })
    )

    // Farmer notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'offer',
      title: 'New Bid Received for Your Lot!',
      titleHi: 'आपके लॉट के लिए नया ऑफ़र प्राप्त हुआ!',
      message: `${buyerProfile.company} offered ₹${offerData.offeredPrice.toLocaleString('en-IN')}/qtl for ${lot ? lot.crop : offerData.lotId} (${offerData.quantityQtl} qtl).`,
      messageHi: `${buyerProfile.company} ने ${offerData.quantityQtl} क्विंटल के लिए ₹${offerData.offeredPrice}/क्विंटल की बोली लगाई है।`,
      timeAgo: 'Just now',
      read: false,
      link: '/farmer/offers',
    }
    setNotifications(prev => [notif, ...prev])

    return newOfferId
  }

  const cancelBuyerOffer = (offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId))
  }

  const addLot = (lotData: Omit<CropLot, 'id' | 'createdAt' | 'matchedBuyersCount' | 'activeOffersCount'>): string => {
    const lotNum = Math.floor(Math.random() * 900 + 100)
    const newLotId = `LOT-AGN-${lotNum}`
    const newLot: CropLot = {
      ...lotData,
      id: newLotId,
      createdAt: 'Just now',
      matchedBuyersCount: lotData.status === 'Active' ? Math.floor(Math.random() * 4 + 2) : 0,
      activeOffersCount: 0,
      isLocalPrototype: true,
    }
    setLots(prev => [newLot, ...prev])
    
    // Add notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'system',
      title: lotData.status === 'Draft' ? 'Draft Saved Successfully' : 'Lot Published Successfully!',
      titleHi: lotData.status === 'Draft' ? 'ड्राफ्ट सहेजा गया' : 'लॉट सफलतापूर्वक प्रकाशित!',
      message: `${newLot.crop} (${newLot.quantityQtl} ${newLot.unit || 'qtl'}) is ${lotData.status === 'Draft' ? 'saved in your drafts' : 'now active and broadcasting to verified buyers'}.`,
      messageHi: `${newLot.cropHi || newLot.crop} (${newLot.quantityQtl} क्विंटल) ${lotData.status === 'Draft' ? 'ड्राफ्ट में सहेजा गया' : 'अब सक्रिय है और खरीदारों को दिख रहा है'}।`,
      timeAgo: 'Just now',
      read: false,
      link: '/farmer/lots',
    }
    setNotifications(prev => [notif, ...prev])

    return newLotId
  }

  const updateLot = (lotId: string, data: Partial<CropLot>) => {
    setLots(prev =>
      prev.map(lot => (lot.id === lotId ? { ...lot, ...data } : lot))
    )
  }

  const publishDraftLot = (lotId: string) => {
    setLots(prev =>
      prev.map(lot =>
        lot.id === lotId
          ? {
              ...lot,
              status: 'Active',
              matchedBuyersCount: Math.floor(Math.random() * 4 + 2),
            }
          : lot
      )
    )
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'system',
      title: 'Draft Lot Published!',
      titleHi: 'ड्राफ्ट लॉट प्रकाशित!',
      message: `Lot ${lotId} is now active and live on the network.`,
      messageHi: `लॉट ${lotId} अब नेटवर्क पर सक्रिय है।`,
      timeAgo: 'Just now',
      read: false,
      link: '/farmer/lots',
    }
    setNotifications(prev => [notif, ...prev])
  }

  const pauseLot = (lotId: string) => {
    setLots(prev =>
      prev.map(lot =>
        lot.id === lotId
          ? { ...lot, status: lot.status === 'Paused' ? 'Active' : 'Paused' }
          : lot
      )
    )
  }

  const getLotById = (lotId: string): CropLot | undefined => {
    return lots.find(l => l.id === lotId)
  }

  const updateLotStatus = (lotId: string, status: LotStatus) => {
    setLots(prev => prev.map(lot => (lot.id === lotId ? { ...lot, status } : lot)))
  }

  const deleteLot = (lotId: string) => {
    setLots(prev => prev.filter(lot => lot.id !== lotId))
  }

  const acceptOffer = (offerId: string) => {
    const targetOffer = offers.find(o => o.id === offerId)
    if (!targetOffer) return

    // Update target offer to Accepted and reject competing offers for same lot
    setOffers(prev =>
      prev.map(o => {
        if (o.id === offerId) return { ...o, status: 'Accepted' }
        if (o.lotId === targetOffer.lotId && o.status === 'Pending') {
          return { ...o, status: 'Rejected' }
        }
        return o
      })
    )

    // Update corresponding lot to 'Under Offer'
    if (targetOffer.lotId) {
      setLots(prev =>
        prev.map(l => (l.id === targetOffer.lotId ? { ...l, status: 'Under Offer' } : l))
      )
    }

    // Create a new binding FarmTransaction
    const associatedLot = lots.find(l => l.id === targetOffer.lotId)
    const newTxnId = `TXN-2026-${Math.floor(Math.random() * 9000 + 1000)}`
    const produceValue = targetOffer.offeredPrice * targetOffer.quantityQtl
    const transportCost = 4930 // Estimated multi-axle freight
    const mandiCess = Math.round(produceValue * 0.015)
    const finalAmount = produceValue + transportCost

    const newFarmTransaction: FarmTransaction = {
      id: newTxnId,
      lotId: targetOffer.lotId,
      offerId: targetOffer.id,
      farmerId: 'FRM-MP-091',
      farmerName: profile.name,
      farmerLocation: associatedLot ? associatedLot.location : 'Sirali Farm Godown #2, Harda, MP',
      farmerPhone: profile.phone,
      buyerId: targetOffer.buyerId,
      buyerName: targetOffer.buyerName,
      buyerOrganization: targetOffer.buyerCompany,
      buyerLocation: targetOffer.pickupLocation || 'Buyer Regional Terminal',
      crop: associatedLot ? associatedLot.crop : targetOffer.lotTitle,
      cropHi: associatedLot?.cropHi,
      variety: associatedLot ? associatedLot.variety : 'Standard FAQ Grade',
      quantityQtl: targetOffer.quantityQtl,
      unit: associatedLot?.unit || 'Quintal',
      agreedPricePerQtl: targetOffer.offeredPrice,
      produceValue,
      transportCost,
      mandiCess,
      finalAmount,
      mandiOrDeliveryLocation: targetOffer.pickupLocation || 'Farm-gate pickup',
      createdDate: 'Just now',
      paymentStatus: 'Payment Pending',
      transactionStatus: 'Payment Pending',
      timeline: [
        { stage: 'offer_accepted', label: 'Offer Accepted by Farmer', labelHi: 'ऑफ़र स्वीकार किया गया', timestamp: 'Just now', completed: true, description: `Agreed at ₹${targetOffer.offeredPrice.toLocaleString('en-IN')}/qtl for ${targetOffer.quantityQtl} qtl.` },
        { stage: 'transaction_created', label: 'Binding Contract Generated', labelHi: 'अनुबंध तैयार', timestamp: 'Just now', completed: true, description: 'Trade contract signed electronically.' },
        { stage: 'escrow_funded', label: 'Buyer Escrow Deposit', labelHi: 'एस्क्रो जमा', timestamp: 'Pending Buyer Deposit', completed: false, description: `Buyer must deposit ₹${finalAmount.toLocaleString('en-IN')} into Escrow.` },
        { stage: 'in_transit', label: 'Carrier Dispatch & In Transit', labelHi: 'रास्ते में', timestamp: 'Pending Escrow', completed: false, description: 'Carrier pickup will be scheduled.' },
        { stage: 'delivered', label: 'Delivery & Gate Inspection', labelHi: 'डिलिवरी व जांच', timestamp: 'Pending', completed: false, description: 'Moisture and quality assay confirmation.' },
        { stage: 'completed', label: 'Escrow Settlement to Farmer SBI', labelHi: 'खाते में भुगतान', timestamp: 'Pending', completed: false, description: 'Auto-release to farmer linked bank account.' },
      ],
    }

    setTransactions(prev => [newFarmTransaction, ...prev])

    // Notification for Farmer
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'payment',
      title: 'Offer Accepted — Transaction Created!',
      titleHi: 'ऑफ़र स्वीकार — अनुबंध तैयार!',
      message: `You accepted offer for ${targetOffer.lotTitle} at ₹${targetOffer.offeredPrice}/qtl. Transaction ${newTxnId} is now created and awaiting buyer escrow deposit.`,
      messageHi: `आपने ₹${targetOffer.offeredPrice}/क्विंटल पर ${targetOffer.lotTitle} का ऑफ़र स्वीकार कर लिया है। लेनदेन ${newTxnId} तैयार है।`,
      timeAgo: 'Just now',
      read: false,
      link: `/farmer/transactions/${newTxnId}`,
    }
    setNotifications(prev => [notif, ...prev])
  }

  const rejectOffer = (offerId: string) => {
    setOffers(prev => prev.map(o => (o.id === offerId ? { ...o, status: 'Rejected' } : o)))
  }

  const counterOffer = (offerId: string, counterPrice: number) => {
    setOffers(prev =>
      prev.map(o => (o.id === offerId ? { ...o, status: 'Countered', counterPrice } : o))
    )

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      type: 'offer',
      title: 'Counter Offer Submitted',
      titleHi: 'काउंटर ऑफ़र प्रस्तुत किया गया',
      message: `Counter offer of ₹${counterPrice}/qtl sent to buyer. Awaiting confirmation.`,
      messageHi: `खरीदार को ₹${counterPrice}/क्विंटल का काउंटर ऑफ़र भेजा गया। पुष्टि की प्रतीक्षा है।`,
      timeAgo: 'Just now',
      read: false,
      link: '/farmer/offers',
    }
    setNotifications(prev => [notif, ...prev])
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <DashboardContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        profile,
        buyerProfile,
        buyerRequirement,
        updateBuyerRequirement,
        lots,
        addLot,
        updateLot,
        updateLotStatus,
        deleteLot,
        publishDraftLot,
        pauseLot,
        getLotById,
        offers,
        acceptOffer,
        rejectOffer,
        counterOffer,
        makeBuyerOffer,
        cancelBuyerOffer,
        calculateLotMatchScore,
        payments,
        transactions,
        getTransactionById,
        updateTransactionPayment,
        advanceTransactionLifecycle,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        marketData,
        buyerMatches,
        isListModalOpen,
        setIsListModalOpen,
        counterModalOffer,
        setCounterModalOffer,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

