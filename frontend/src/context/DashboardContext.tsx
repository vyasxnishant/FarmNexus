import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, lotApi, marketPriceApi, offerApi, transactionApi, adminApi, matchingApi } from '../services/apiServices'

export type CropType = 'Wheat (Sharbati)' | 'Basmati Rice' | 'Soybean' | 'Chana (Gram)' | 'Mustard' | 'Maize' | string
export type QualityGrade = 'Grade A (Export)' | 'Grade A' | 'Grade B' | 'Grade C'
export type VisualQuality = 'Excellent' | 'Good' | 'Average' | 'Poor'
export type DamageLevel = 'None' | 'Low' | 'Medium' | 'High'
export type GrainSize = 'Uniform Bold' | 'Medium' | 'Small / Mixed'
export type LotStatus = 'Active' | 'Draft' | 'Under Offer' | 'Sold' | 'Expired' | 'Paused' | 'Under Review'
export type PaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Delayed'
export type QuantityUnit = 'Quintal' | 'Kg' | 'Tonne'

export interface CropLot {
  id: string
  farmerId?: string
  farmerName?: string
  crop: string
  cropHi?: string
  category?: string
  variety: string
  quantityQtl: number
  initialQuantityQtl?: number
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
  reliabilityScore: number
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
  farmerId?: string
  farmerName?: string
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
  message?: string
}

export interface PaymentTransaction {
  id: string
  offerId: string
  lotTitle: string
  buyerName: string
  amount: number
  status: 'Processing' | 'Paid' | 'Pending' | 'Delayed'
  dueDate: string
  paidDate?: string
  paymentMethod: 'UPI' | 'e-NWR Escrow' | 'NetBanking'
  referenceId: string
  timeline: {
    step: string
    completed: boolean
    date?: string
  }[]
}

export type TransactionPaymentStatus = 'Payment Pending' | 'Payment Processing' | 'Payment Successful' | 'Payment Failed' | 'Refunded'
export type TransactionLifecycleStatus = 'Payment Pending' | 'Payment Completed' | 'In Transit' | 'Delivered' | 'Completed' | 'Cancelled' | 'Under Dispute'

export interface TransactionStageEvent {
  stage: string
  label: string
  labelHi: string
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
  farmerPhone?: string
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
    method: string
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
  nameHi?: string
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

export interface UserRecord {
  id: string
  name: string
  email: string
  phone: string
  userType: 'Farmer' | 'Buyer' | 'Admin'
  location: string
  district: string
  state: string
  registeredDate: string
  status: 'Active' | 'Suspended' | 'Pending Verification'
  kycVerified: boolean
  organization?: string
  lotsCount?: number
  transactionsCount?: number
  totalVolumeRs?: number
}

export interface AuditLog {
  id: string
  action: string
  adminUser: string
  targetType: 'User' | 'Farmer' | 'Buyer' | 'Lot' | 'MarketPrice' | 'Transaction' | 'Offer' | 'Payment'
  targetId: string
  timestamp: string
  details: string
}

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  phone: string
  user_type: 'FARMER' | 'BUYER' | 'ADMIN'
  location: string
  district?: string
  state?: string
  status: 'Active' | 'Suspended' | 'Pending Verification'
  kyc_verified: boolean
  organization?: string
}

export type UserRole = 'farmer' | 'buyer' | 'admin'

interface DashboardContextType {
  lang: 'en' | 'hi'
  setLang: (lang: 'en' | 'hi') => void
  toggleLang: () => void
  currentUser: AuthenticatedUser | null
  isAuthenticated: boolean
  isLoadingAuth: boolean
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  login: (email: string, password: string) => Promise<AuthenticatedUser>
  register: (payload: any) => Promise<AuthenticatedUser>
  logout: () => void
  refreshUserData: () => Promise<void>
  updateUserProfile: (data: any) => Promise<void>
  profile: FarmerProfile
  buyerProfile: BuyerProfile
  buyerRequirement: BuyerRequirement
  updateBuyerRequirement: (req: Partial<BuyerRequirement>) => void
  lots: CropLot[]
  addLot: (lot: Omit<CropLot, 'id' | 'createdAt' | 'matchedBuyersCount' | 'activeOffersCount'>) => Promise<string>
  updateLot: (lotId: string, data: Partial<CropLot>) => Promise<void>
  updateLotStatus: (lotId: string, status: LotStatus) => void
  deleteLot: (lotId: string) => Promise<void>
  publishDraftLot: (lotId: string) => void
  pauseLot: (lotId: string) => void
  flagLot: (lotId: string, reason: string) => void
  getLotById: (lotId: string) => CropLot | undefined
  offers: Offer[]
  acceptOffer: (offerId: string) => Promise<void>
  rejectOffer: (offerId: string) => Promise<void>
  counterOffer: (offerId: string, counterPrice: number) => Promise<void>
  makeBuyerOffer: (offerData: {
    lotId: string
    offeredPrice: number
    quantityQtl: number
    paymentTerms?: string
    message?: string
  }) => Promise<string>
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
  ) => Promise<void>
  users: UserRecord[]
  updateUserStatus: (userId: string, status: UserRecord['status']) => Promise<void>
  verifyUser: (userId: string) => Promise<void>
  auditLogs: AuditLog[]
  addAuditLog: (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => void
  notifications: NotificationItem[]
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  marketData: MarketPriceData[]
  addMarketPriceRecord: (record: Omit<MarketPriceData, 'sparkline'>) => void
  updateMarketPriceRecord: (mandi: string, crop: string, data: Partial<MarketPriceData>) => void
  deleteMarketPriceRecord: (mandi: string, crop: string) => void
  buyerMatches: BuyerMatch[]
  isListModalOpen: boolean
  setIsListModalOpen: (open: boolean) => void
  counterModalOffer: Offer | null
  setCounterModalOffer: (offer: Offer | null) => void
}

// Initial Market Data (Clean empty state)
const initialMarketData: MarketPriceData[] = []

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
]

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true)
  const userRole: UserRole = currentUser ? (currentUser.user_type.toLowerCase() as UserRole) : 'farmer'
  const setUserRole = (_role: UserRole) => {
    // Role is strictly immutable and derived directly from server-authenticated session/JWT
  }

  // User-specific database records
  const [profile, setProfile] = useState<FarmerProfile>({
    name: 'Farmer User',
    nameHi: 'किसान',
    phone: '+91 98000 00000',
    village: 'District Center',
    district: 'Harda',
    state: 'Madhya Pradesh',
    pincode: '461331',
    fpoName: 'Kisan Producer Company',
    fpoRole: 'Member',
    totalLandAcres: 10,
    kycVerified: false,
    kisanCreditCardVerified: false,
    bankAccountMasked: 'Bank •••• 0000',
    upiId: 'farmer@upi',
    memberSince: '2026',
  })

  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    name: 'Buyer Representative',
    company: 'Procurement Corp',
    gstNumber: '23AAACA0000A1Z0',
    deliveryLocation: 'Processing Hub',
    verified: false,
    reliabilityScore: 4.8,
  })

  const [buyerRequirement, setBuyerRequirement] = useState<BuyerRequirement>({
    requiredCrop: 'Wheat (Sharbati)',
    requiredQuantityQtl: 100,
    preferredGrade: 'Grade A',
    preferredLocation: 'Harda, Madhya Pradesh',
    maxPrice: 2850,
  })

  const [lots, setLots] = useState<CropLot[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [transactions, setTransactions] = useState<FarmTransaction[]>([])
  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [marketData, setMarketData] = useState<MarketPriceData[]>(initialMarketData)
  const [buyerMatches] = useState<BuyerMatch[]>(initialBuyerMatches)

  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [counterModalOffer, setCounterModalOffer] = useState<Offer | null>(null)

  // Fetch Authenticated User's own data from PostgreSQL backend
  const loadUserData = async (user: AuthenticatedUser) => {
    try {

      // 1. Set Profile state
      if (user.user_type === 'FARMER') {
        setProfile({
          name: user.name,
          nameHi: user.name,
          phone: user.phone || '+91 98000 00000',
          village: user.location || 'Local Village',
          district: user.district || 'Harda',
          state: user.state || 'Madhya Pradesh',
          pincode: '461331',
          fpoName: user.organization || 'Kisan Producer Company',
          fpoRole: 'Lead Member',
          totalLandAcres: 12,
          kycVerified: user.kyc_verified,
          kisanCreditCardVerified: user.kyc_verified,
          bankAccountMasked: 'SBI •••• 8842',
          upiId: `${user.name.toLowerCase().replace(/\s+/g, '.')}@upi`,
          memberSince: '2026',
        })

        // Fetch Farmer's Lots
        const lotsRes = await lotApi.getMyLots()
        if (lotsRes.data && Array.isArray(lotsRes.data)) {
          setLots(lotsRes.data.map(mapBackendLot))
        }

        // Fetch Farmer's Received Offers
        const offersRes = await offerApi.getReceivedOffers()
        if (offersRes.data && Array.isArray(offersRes.data)) {
          setOffers(offersRes.data.map(mapBackendOffer))
        }
      } else if (user.user_type === 'BUYER') {
        setBuyerProfile({
          name: user.name,
          company: user.organization || `${user.name} Trading Co.`,
          gstNumber: '23AAACA1234F1Z8',
          deliveryLocation: user.location || 'Central Processing Hub',
          verified: user.kyc_verified,
          reliabilityScore: 4.9,
        })

        // Fetch Buyer's Requirements
        try {
          const reqRes = await matchingApi.getRequirements()
          if (reqRes.data) {
            setBuyerRequirement({
              requiredCrop: reqRes.data.crop || 'Wheat (Sharbati)',
              requiredQuantityQtl: Number(reqRes.data.quantity_qtl) || 100,
              preferredGrade: reqRes.data.preferred_grade || 'Grade A',
              preferredLocation: reqRes.data.location || user.location || 'Harda',
              maxPrice: Number(reqRes.data.max_price) || 2850,
            })
          }
        } catch {}

        // Fetch Buyer's Placed Offers
        const offersRes = await offerApi.getMyOffers()
        if (offersRes.data && Array.isArray(offersRes.data)) {
          setOffers(offersRes.data.map(mapBackendOffer))
        }

        // Fetch Public Lots for Buyer Marketplace
        const publicLotsRes = await lotApi.getAll()
        if (publicLotsRes.data && Array.isArray(publicLotsRes.data)) {
          setLots(publicLotsRes.data.map(mapBackendLot))
        }
      } else if (user.user_type === 'ADMIN') {
        // Fetch Admin Users & Logs
        const usersRes = await adminApi.getUsers()
        if (usersRes.data && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data.map(mapBackendUser))
        }

        const logsRes = await adminApi.getActivityLogs()
        if (logsRes.data && Array.isArray(logsRes.data)) {
          setAuditLogs(logsRes.data)
        }

        const lotsRes = await lotApi.getAll()
        if (lotsRes.data && Array.isArray(lotsRes.data)) {
          setLots(lotsRes.data.map(mapBackendLot))
        }
      }

      // Fetch User's Transactions
      const txnsRes = await transactionApi.getMyTransactions()
      if (txnsRes.data && Array.isArray(txnsRes.data)) {
        setTransactions(txnsRes.data.map(mapBackendTransaction))
      }
    } catch (err) {
      console.warn('[DashboardContext] User data sync warning:', err)
    }
  }

  // Initialize Session on App Mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoadingAuth(true)
      const token = localStorage.getItem('farmnexus_jwt_token')

      if (!token) {
        setCurrentUser(null)
        setIsLoadingAuth(false)
        return
      }

      try {
        const res = await authApi.getMe()
        if (res.data?.user) {
          const user: AuthenticatedUser = res.data.user
          setCurrentUser(user)
          await loadUserData(user)
        } else {
          localStorage.removeItem('farmnexus_jwt_token')
          setCurrentUser(null)
        }
      } catch (err) {
        console.warn('[DashboardContext] Stored token invalid/expired.')
        localStorage.removeItem('farmnexus_jwt_token')
        setCurrentUser(null)
      } finally {
        setIsLoadingAuth(false)
      }
    }

    initAuth()

    // Sync Live Market Prices from Backend
    marketPriceApi.getAll()
      .then((res: any) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setMarketData(res.data.map((p: any) => ({
            crop: p.commodity,
            mandi: p.market,
            state: p.state,
            distanceKm: 30,
            minPrice: Number(p.min_price) || 0,
            modalPrice: Number(p.modal_price) || 0,
            maxPrice: Number(p.max_price) || 0,
            priceChange: Number(p.price_change) || 0,
            trend: (p.trend as any) || 'steady',
            lastUpdated: p.arrival_date || 'Today',
            sparkline: [
              Number(p.min_price) || 0,
              Math.round(((Number(p.min_price) || 0) + (Number(p.modal_price) || 0)) / 2),
              Number(p.modal_price) || 0,
              Number(p.modal_price) || 0,
              Number(p.max_price) || 0,
            ],
          })))
        } else {
          setMarketData([])
        }
      })
      .catch(() => {
        setMarketData([])
      })
  }, [])

  // Login Method
  const login = async (email: string, password: string): Promise<AuthenticatedUser> => {
    const res = await authApi.login(email, password)
    if (!res.data?.token || !res.data?.user) {
      throw new Error(res.message || 'Login failed.')
    }

    const token = res.data.token
    const user: AuthenticatedUser = res.data.user

    localStorage.setItem('farmnexus_jwt_token', token)
    setCurrentUser(user)
    await loadUserData(user)
    return user
  }

  // Register Method
  const register = async (payload: any): Promise<AuthenticatedUser> => {
    const res = await authApi.register(payload)
    if (!res.data?.token || !res.data?.user) {
      throw new Error(res.message || 'Registration failed.')
    }

    const token = res.data.token
    const user: AuthenticatedUser = res.data.user

    localStorage.setItem('farmnexus_jwt_token', token)
    setCurrentUser(user)
    // Clear old data for brand new user
    setLots([])
    setOffers([])
    setTransactions([])
    await loadUserData(user)
    return user
  }

  // Logout Method
  const logout = () => {
    localStorage.removeItem('farmnexus_jwt_token')
    setCurrentUser(null)
    setLots([])
    setOffers([])
    setTransactions([])
    setUsers([])
  }

  // Refresh User Data Method
  const refreshUserData = async () => {
    if (currentUser) {
      await loadUserData(currentUser)
    }
  }

  // Update User Profile Method
  const updateUserProfile = async (data: any) => {
    const res = await authApi.updateProfile(data)
    if (res.data?.user) {
      setCurrentUser(res.data.user)
      if (currentUser?.user_type === 'FARMER') {
        setProfile(prev => ({
          ...prev,
          name: res.data.user.name,
          phone: res.data.user.phone,
          village: res.data.user.location,
          fpoName: res.data.user.organization || prev.fpoName,
        }))
      } else if (currentUser?.user_type === 'BUYER') {
        setBuyerProfile(prev => ({
          ...prev,
          name: res.data.user.name,
          company: res.data.user.organization || prev.company,
          deliveryLocation: res.data.user.location,
        }))
      }
    }
  }

  // Add Produce Lot
  const addLot = async (lotData: Omit<CropLot, 'id' | 'createdAt' | 'matchedBuyersCount' | 'activeOffersCount'>): Promise<string> => {
    const res = await lotApi.create({
      crop: lotData.crop,
      crop_hi: lotData.cropHi,
      category: lotData.category,
      variety: lotData.variety,
      quantity_qtl: lotData.quantityQtl,
      unit: lotData.unit,
      grade: lotData.grade,
      expected_price: lotData.expectedPrice,
      min_acceptable_price: lotData.minAcceptablePrice,
      market_reference_price: lotData.marketReferencePrice,
      location: lotData.location,
      pickup_location: lotData.pickupLocation,
      status: lotData.status,
      quality: {
        grade: lotData.grade,
        visual_quality: lotData.visualQuality,
        damage_level: lotData.damageLevel,
        grain_size: lotData.grainSize,
        moisture_percent: lotData.moisturePercent,
        foreign_matter_percent: lotData.foreignMatterPercent,
        notes: lotData.qualityNotes,
      },
    })

    const createdLot = res.data ? mapBackendLot(res.data) : {
      ...lotData,
      id: `LOT-AGN-${Date.now().toString().slice(-3)}`,
      createdAt: 'Just now',
      matchedBuyersCount: 3,
      activeOffersCount: 0,
    }

    setLots(prev => [createdLot, ...prev])
    return createdLot.id
  }

  const updateLot = async (lotId: string, data: Partial<CropLot>) => {
    setLots(prev => prev.map(lot => (lot.id === lotId ? { ...lot, ...data } : lot)))
    await lotApi.update(lotId, {
      crop: data.crop,
      variety: data.variety,
      quantity_qtl: data.quantityQtl,
      expected_price: data.expectedPrice,
      min_acceptable_price: data.minAcceptablePrice,
      location: data.location,
      pickup_location: data.pickupLocation,
      status: data.status,
    })
  }

  const deleteLot = async (lotId: string) => {
    setLots(prev => prev.filter(lot => lot.id !== lotId))
    await lotApi.delete(lotId)
  }

  const updateLotStatus = (lotId: string, status: LotStatus) => {
    updateLot(lotId, { status })
  }

  const publishDraftLot = (lotId: string) => {
    updateLot(lotId, { status: 'Active' })
  }

  const pauseLot = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId)
    const newStatus: LotStatus = lot?.status === 'Paused' ? 'Active' : 'Paused'
    updateLot(lotId, { status: newStatus })
  }

  const flagLot = async (lotId: string, reason: string) => {
    setLots(prev => prev.map(l => (l.id === lotId ? { ...l, status: 'Under Review' } : l)))
    await adminApi.flagLot(lotId, reason)
    addAuditLog('Lot Flagged for Review', 'Lot', lotId, reason)
  }

  const getLotById = (lotId: string): CropLot | undefined => {
    return lots.find(l => l.id === lotId)
  }

  // Accept Offer
  const acceptOffer = async (offerId: string) => {
    const res = await offerApi.accept(offerId)
    setOffers(prev =>
      prev.map(o => (o.id === offerId ? { ...o, status: 'Accepted' } : o.lotId === res.data?.offer?.lot_id && o.status === 'Pending' ? { ...o, status: 'Rejected' } : o))
    )
    if (res.data?.offer) {
      const acceptedOffer = res.data.offer
      setLots(prev =>
        prev.map(l => {
          if (l.id === acceptedOffer.lot_id) {
            const newQty = Math.max(0, l.quantityQtl - Number(acceptedOffer.quantity_qtl))
            return {
              ...l,
              quantityQtl: newQty,
              status: newQty === 0 ? 'Sold' : l.status,
            }
          }
          return l
        })
      )
    }
    if (res.data?.transaction) {
      setTransactions(prev => [mapBackendTransaction(res.data.transaction), ...prev])
    }
  }

  const rejectOffer = async (offerId: string) => {
    // Find the offer's lotId before updating status
    const rejectedOffer = offers.find(o => o.id === offerId)
    await offerApi.reject(offerId)
    setOffers(prev => prev.map(o => (o.id === offerId ? { ...o, status: 'Rejected' } : o)))

    // Decrement lot's activeOffersCount
    if (rejectedOffer) {
      setLots(prev => prev.map(lot => {
        if (lot.id === rejectedOffer.lotId) {
          const newCount = Math.max(0, lot.activeOffersCount - 1)
          // Recalculate highest offer from remaining pending offers
          const remainingPending = offers.filter(o => o.lotId === lot.id && o.id !== offerId && o.status === 'Pending')
          const newHighest = remainingPending.length > 0 ? Math.max(...remainingPending.map(o => o.offeredPrice)) : undefined
          return { ...lot, activeOffersCount: newCount, highestOffer: newHighest }
        }
        return lot
      }))
    }
  }

  const counterOffer = async (offerId: string, counterPrice: number) => {
    await offerApi.counter(offerId, counterPrice)
    setOffers(prev => prev.map(o => (o.id === offerId ? { ...o, status: 'Countered', counterPrice } : o)))
  }

  // Make Buyer Offer
  const makeBuyerOffer = async (offerData: {
    lotId: string
    offeredPrice: number
    quantityQtl: number
    paymentTerms?: string
    message?: string
  }): Promise<string> => {
    const res = await offerApi.create({
      lot_id: offerData.lotId,
      offered_price: offerData.offeredPrice,
      quantity_qtl: offerData.quantityQtl,
      payment_terms: offerData.paymentTerms,
      message: offerData.message,
    })

    const newOffer = res.data ? mapBackendOffer(res.data) : {
      id: `OFF-${Date.now().toString().slice(-4)}`,
      lotId: offerData.lotId,
      lotTitle: `Produce Lot ${offerData.lotId}`,
      buyerId: currentUser?.id || 'BUY-01',
      buyerName: currentUser?.name || buyerProfile.name,
      buyerCompany: buyerProfile.company,
      buyerReliability: buyerProfile.reliabilityScore,
      buyerVerified: buyerProfile.verified,
      offeredPrice: offerData.offeredPrice,
      lotExpectedPrice: offerData.offeredPrice,
      quantityQtl: offerData.quantityQtl,
      totalAmount: offerData.offeredPrice * offerData.quantityQtl,
      expiresInHours: 48,
      status: 'Pending' as const,
      createdDate: 'Just now',
      paymentTerms: offerData.paymentTerms || 'e-NWR Escrow auto-release on gate receipt',
      pickupLocation: 'Designated APMC Hub',
    }

    setOffers(prev => [newOffer, ...prev])

    // Update the corresponding lot's activeOffersCount and highestOffer
    setLots(prev => prev.map(lot => {
      if (lot.id === offerData.lotId) {
        const newCount = lot.activeOffersCount + 1
        const newHighest = Math.max(lot.highestOffer || 0, offerData.offeredPrice)
        return {
          ...lot,
          activeOffersCount: newCount,
          highestOffer: newHighest,
        }
      }
      return lot
    }))

    return newOffer.id
  }

  const cancelBuyerOffer = (offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId))
  }

  // Update Buyer Requirement
  const updateBuyerRequirement = async (req: Partial<BuyerRequirement>) => {
    setBuyerRequirement(prev => ({ ...prev, ...req }))
    try {
      await matchingApi.updateRequirements({
        crop: req.requiredCrop,
        quantity_qtl: req.requiredQuantityQtl,
        preferred_grade: req.preferredGrade,
        location: req.preferredLocation,
        max_price: req.maxPrice,
      })
    } catch {}
  }

  const getTransactionById = (transactionId: string): FarmTransaction | undefined => {
    return transactions.find(t => t.id === transactionId)
  }

  const advanceTransactionLifecycle = async (transactionId: string, newStatus: TransactionLifecycleStatus) => {
    const res = await transactionApi.advanceStage(transactionId, newStatus)
    if (res.data) {
      setTransactions(prev => prev.map(t => (t.id === transactionId ? mapBackendTransaction(res.data) : t)))
    }
  }

  const updateTransactionPayment = (
    transactionId: string,
    paymentStatus: TransactionPaymentStatus,
    transactionStatus: TransactionLifecycleStatus,
    details?: FarmTransaction['paymentDetails']
  ) => {
    setTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, paymentStatus, transactionStatus, paymentDetails: details || t.paymentDetails } : t))
    )
  }

  const updateUserStatus = async (userId: string, status: UserRecord['status']) => {
    if (status === 'Suspended') {
      await adminApi.suspendUser(userId)
    } else if (status === 'Active') {
      await adminApi.activateUser(userId)
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status } : u)))
  }

  const verifyUser = async (userId: string) => {
    await adminApi.verifyUser(userId)
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, kycVerified: true } : u)))
  }

  const addAuditLog = (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => {
    const log: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      action,
      adminUser: currentUser?.name || 'Admin Ops Desk',
      targetType,
      targetId,
      timestamp: 'Just now',
      details,
    }
    setAuditLogs(prev => [log, ...prev])
  }

  const addMarketPriceRecord = (record: Omit<MarketPriceData, 'sparkline'>) => {
    const sparkline = [record.minPrice, record.modalPrice - 20, record.modalPrice + 10, record.modalPrice, record.maxPrice]
    setMarketData(prev => [{ ...record, sparkline, lastUpdated: 'Just now' }, ...prev])
  }

  const updateMarketPriceRecord = (mandi: string, crop: string, data: Partial<MarketPriceData>) => {
    setMarketData(prev => prev.map(item => (item.mandi === mandi && item.crop === crop ? { ...item, ...data } : item)))
  }

  const deleteMarketPriceRecord = (mandi: string, crop: string) => {
    setMarketData(prev => prev.filter(item => !(item.mandi === mandi && item.crop === crop)))
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'hi' : 'en'))

  const calculateLotMatchScore = (lot: CropLot, req = buyerRequirement): MatchScoreResult => {
    let score = 0
    const matchReasons: string[] = []

    if (req.requiredCrop === 'All' || lot.crop.toLowerCase().includes(req.requiredCrop.toLowerCase())) {
      score += 40
      matchReasons.push(`Exact crop match (${lot.crop})`)
    } else {
      score += 10
    }

    if (lot.quantityQtl >= req.requiredQuantityQtl * 0.8) {
      score += 25
      matchReasons.push(`Target volume matches requirement`)
    } else {
      score += 10
    }

    if (req.preferredGrade === 'All' || lot.grade === req.preferredGrade || lot.grade === 'Grade A (Export)') {
      score += 20
      matchReasons.push(`Meets ${lot.grade} specification`)
    } else {
      score += 8
    }

    if (req.preferredLocation === 'All' || lot.location.toLowerCase().includes(req.preferredLocation.toLowerCase())) {
      score += 15
      matchReasons.push(`Location matches requirement`)
    } else {
      score += 5
    }

    const finalScore = Math.min(100, Math.max(20, score))
    return {
      score: finalScore,
      matchReasons,
      isHighMatch: finalScore >= 75,
    }
  }

  return (
    <DashboardContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isLoadingAuth,
        userRole,
        setUserRole,
        login,
        register,
        logout,
        refreshUserData,
        updateUserProfile,
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
        flagLot,
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
        users,
        updateUserStatus,
        verifyUser,
        auditLogs,
        addAuditLog,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        marketData,
        addMarketPriceRecord,
        updateMarketPriceRecord,
        deleteMarketPriceRecord,
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

// Helpers to map backend JSON to frontend models
function mapBackendLot(l: any): CropLot {
  return {
    id: l.id,
    farmerId: l.farmer_id || l.farmerId,
    farmerName: l.farmer_name || l.farmerName || 'Verified Regional Farmer',
    crop: l.crop,
    cropHi: l.crop_hi,
    category: l.category,
    variety: l.variety,
    quantityQtl: Number(l.quantity_qtl) || 0,
    initialQuantityQtl: Number(l.initial_quantity_qtl) || Number(l.quantity_qtl) || 100,
    unit: l.unit || 'Quintal',
    grade: l.grade || 'Grade A',
    visualQuality: l.quality?.visual_quality || 'Good',
    damageLevel: l.quality?.damage_level || 'None',
    grainSize: l.quality?.grain_size || 'Uniform Bold',
    moisturePercent: l.quality?.moisture_percent,
    foreignMatterPercent: l.quality?.foreign_matter_percent,
    qualityNotes: l.quality?.notes,
    expectedPrice: Number(l.expected_price) || 2700,
    minAcceptablePrice: Number(l.min_acceptable_price) || 2600,
    marketReferencePrice: Number(l.market_reference_price) || 2800,
    harvestDate: '2026',
    location: l.location || 'Madhya Pradesh',
    pickupLocation: l.pickup_location || 'Farm Godown',
    status: l.status || 'Active',
    createdAt: l.created_at || 'Just now',
    matchedBuyersCount: l.matched_buyers_count || 4,
    activeOffersCount: Number(l.active_offers_count) || 0,
    highestOffer: Number(l.highest_offer) || undefined,
  }
}

function mapBackendOffer(o: any): Offer {
  return {
    id: o.id,
    lotId: o.lot_id || o.lotId,
    farmerId: o.farmer_id || o.farmerId,
    farmerName: o.farmer_name || o.farmerName,
    lotTitle: o.lot_title || `Produce Lot ${o.lot_id || o.lotId}`,
    buyerId: o.buyer_id,
    buyerName: o.buyer_name || 'Verified Buyer',
    buyerCompany: o.buyer_company || 'Corporate Procurement',
    buyerReliability: o.buyer_reliability || 4.9,
    buyerVerified: o.buyer_verified ?? true,
    offeredPrice: Number(o.offered_price) || 0,
    lotExpectedPrice: Number(o.lot_expected_price) || Number(o.offered_price) || 0,
    quantityQtl: Number(o.quantity_qtl) || 0,
    totalAmount: Number(o.total_amount) || (Number(o.offered_price) * Number(o.quantity_qtl)),
    expiresInHours: 48,
    status: o.status || 'Pending',
    counterPrice: o.counter_price,
    createdDate: o.created_at || 'Recently',
    paymentTerms: o.payment_terms || 'e-NWR Escrow auto-release on gate receipt',
    pickupLocation: o.pickup_location || 'Designated Collection Center',
    message: o.message,
  }
}

function mapBackendTransaction(t: any): FarmTransaction {
  return {
    id: t.id,
    lotId: t.lot_id,
    offerId: t.offer_id,
    farmerId: t.farmer_id,
    farmerName: t.farmer_name,
    farmerLocation: t.farmer_location,
    farmerPhone: t.farmer_phone,
    buyerId: t.buyer_id,
    buyerName: t.buyer_name,
    buyerOrganization: t.buyer_organization,
    buyerLocation: t.buyer_location,
    crop: t.crop,
    cropHi: t.crop_hi,
    variety: t.variety,
    quantityQtl: Number(t.quantity_qtl),
    unit: t.unit || 'Quintal',
    agreedPricePerQtl: Number(t.agreed_price_per_qtl),
    produceValue: Number(t.produce_value),
    transportCost: Number(t.transport_cost),
    mandiCess: Number(t.mandi_cess),
    finalAmount: Number(t.final_amount),
    mandiOrDeliveryLocation: t.mandi_or_delivery_location,
    createdDate: t.created_at || 'Just now',
    paymentStatus: t.payment_status,
    transactionStatus: t.transaction_status,
    timeline: t.timeline || [],
    paymentDetails: t.payment_details,
  }
}

function mapBackendUser(u: any): UserRecord {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    userType: u.user_type === 'FARMER' ? 'Farmer' : u.user_type === 'BUYER' ? 'Buyer' : 'Admin',
    location: u.location || 'Madhya Pradesh',
    district: u.district || 'Harda',
    state: u.state || 'Madhya Pradesh',
    registeredDate: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026',
    status: u.status || 'Active',
    kycVerified: Boolean(u.kyc_verified),
    organization: u.organization,
    lotsCount: u.lotsCount || 0,
    transactionsCount: u.transactionsCount || 0,
  }
}
