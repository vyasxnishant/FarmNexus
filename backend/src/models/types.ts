export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN'
export type UserStatus = 'Active' | 'Suspended' | 'Pending Verification'
export type LotStatus = 'Active' | 'Draft' | 'Under Offer' | 'Sold' | 'Expired' | 'Paused' | 'Under Review'
export type QualityGrade = 'Grade A (Export)' | 'Grade A' | 'Grade B' | 'Grade C'
export type VisualQuality = 'Excellent' | 'Good' | 'Average' | 'Poor'
export type DamageLevel = 'None' | 'Low' | 'Medium' | 'High'
export type GrainSize = 'Uniform Bold' | 'Medium' | 'Small / Mixed'
export type OfferStatus = 'Pending' | 'Accepted' | 'Countered' | 'Rejected'
export type PaymentStatus = 'Payment Pending' | 'Payment Processing' | 'Payment Successful' | 'Payment Failed' | 'Payment Refunded'
export type TransactionStatus = 'Payment Pending' | 'Payment Completed' | 'In Transit' | 'Delivered' | 'Completed' | 'Cancelled'

export interface User {
  id: string
  email: string
  password_hash?: string
  name: string
  phone: string
  user_type: UserRole
  location: string
  district: string
  state: string
  status: UserStatus
  kyc_verified: boolean
  organization?: string
  created_at: string
  updated_at: string
}

export interface FarmerProfile {
  id: string
  user_id: string
  fpo_name?: string
  fpo_role?: string
  total_land_acres?: number
  kisan_credit_card_verified?: boolean
  bank_name?: string
  account_holder_name?: string
  bank_account_encrypted?: string
  bank_account_masked?: string
  ifsc_code?: string
  ifsc_code_masked?: string
  upi_id?: string
  upi_id_masked?: string
  is_bank_configured?: boolean
  village?: string
  district?: string
  state?: string
  pincode?: string
  created_at: string
  updated_at: string
}

export interface BuyerProfile {
  id: string
  user_id: string
  company_name: string
  gst_number?: string
  delivery_location?: string
  verified: boolean
  reliability_score: number
  max_budget_inr?: number
  created_at: string
  updated_at: string
}

export interface BuyerRequirement {
  id: string
  buyer_id: string
  required_crop: string
  required_quantity_qtl: number
  preferred_grade: string
  preferred_location: string
  max_price: number
  created_at: string
  updated_at: string
}

export interface LotQuality {
  id?: string
  lot_id: string
  grade: QualityGrade
  visual_quality: VisualQuality
  damage_level: DamageLevel
  grain_size: GrainSize
  moisture_percent?: number
  foreign_matter_percent?: number
  damaged_grain_percent?: number
  notes?: string
  images?: string[]
  created_at?: string
  updated_at?: string
}

export interface CropLot {
  id: string
  farmer_id: string
  farmer_name?: string
  crop: string
  crop_hi?: string
  category: string
  variety: string
  quantity_qtl: number
  unit: string
  grade: QualityGrade
  expected_price: number
  min_acceptable_price: number
  market_reference_price: number
  status: LotStatus
  location: string
  district?: string
  state?: string
  pickup_location?: string
  is_demo?: boolean
  quality?: LotQuality
  active_offers_count?: number
  highest_offer?: number
  created_at: string
  updated_at: string
}

export interface MarketPriceRecord {
  id: string
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  grade: string
  arrival_date: string
  min_price: number
  max_price: number
  modal_price: number
  price_change?: number
  trend?: 'up' | 'down' | 'steady'
  arrival_quantity: number
  source: string
  is_demo: boolean
  fetched_at: string
}

export interface MarketRecord {
  id: string
  name: string
  district: string
  state: string
  distance_km_default?: number
  is_active: boolean
}

export interface CommodityRecord {
  id: string
  name: string
  name_hi: string
  category: string
  unit: string
}

export interface MarketArrivalRecord {
  id: string
  market: string
  district: string
  state: string
  commodity: string
  arrival_date: string
  quantity_tons: number
  source: string
  is_demo: boolean
  fetched_at: string
}

export interface MarketPriceFilter {
  state?: string
  district?: string
  market?: string
  commodity?: string
  variety?: string
  date?: string
  limit?: number
  offset?: number
}

export interface PriceTrendPoint {
  date: string
  modal_price: number
  min_price: number
  max_price: number
}

export interface CommodityTrendRecord {
  commodity: string
  market: string
  state: string
  current_modal_price: number
  price_change_percent: number
  trend: 'up' | 'down' | 'steady'
  sparkline: number[]
  history: PriceTrendPoint[]
  source: string
  is_demo: boolean
  fetched_at: string
}

export interface AgmarknetGovRecord {
  state?: string
  State?: string
  district?: string
  District?: string
  market?: string
  Market?: string
  commodity?: string
  Commodity?: string
  variety?: string
  Variety?: string
  grade?: string
  Grade?: string
  arrival_date?: string
  Arrival_Date?: string
  min_price?: string | number
  Min_Price?: string | number
  max_price?: string | number
  Max_Price?: string | number
  modal_price?: string | number
  Modal_Price?: string | number
  [key: string]: unknown
}

export interface Offer {
  id: string
  lot_id: string
  farmer_id?: string
  farmer_name?: string
  lot_title?: string
  buyer_id: string
  buyer_name?: string
  buyer_company?: string
  buyer_reliability?: number
  buyer_verified?: boolean
  offered_price: number
  lot_expected_price?: number
  quantity_qtl: number
  total_amount: number
  payment_terms?: string
  pickup_location?: string
  status: OfferStatus
  counter_price?: number
  message?: string
  created_at: string
  updated_at: string
}

export interface TransactionStageEvent {
  stage: string
  label: string
  label_hi?: string
  timestamp: string
  completed: boolean
  description: string
}

export interface Transaction {
  id: string
  lot_id: string
  offer_id: string
  farmer_id: string
  farmer_name: string
  farmer_location: string
  farmer_phone?: string
  buyer_id: string
  buyer_name: string
  buyer_organization: string
  buyer_location: string
  crop: string
  crop_hi?: string
  variety: string
  quantity_qtl: number
  unit: string
  agreed_price_per_qtl: number
  produce_value: number
  transport_cost: number
  mandi_cess: number
  final_amount: number
  mandi_or_delivery_location: string
  payment_status: PaymentStatus
  transaction_status: TransactionStatus
  timeline: TransactionStageEvent[]
  payment_details?: {
    method?: string
    transaction_ref?: string
    payer_vpa?: string
    paid_at?: string
    escrow_ref?: string
  }
  created_at: string
  updated_at: string
}

export interface PaymentRecord {
  id: string
  transaction_id: string
  order_id: string
  buyer_id?: string
  farmer_id?: string
  amount: number
  currency: string
  gateway?: 'RAZORPAY' | 'MANUAL' | 'ESCROW'
  gateway_order_id?: string
  gateway_payment_id?: string
  gateway_signature?: string
  status: PaymentStatus
  payment_method: string
  reference_id: string
  escrow_virtual_account: string
  payer_vpa?: string
  paid_at?: string
  failure_reason?: string
  created_at: string
  updated_at: string
}

export interface TransportOption {
  id: string
  vehicle_type: string
  capacity_qtl: number
  base_fare: number
  per_km_rate: number
  avg_speed_kmh: number
  is_active: boolean
}

export interface StorageFacility {
  id: string
  name: string
  type: string
  location: string
  district: string
  state: string
  total_capacity_mt: number
  available_capacity_mt: number
  daily_rate_per_bag: number
  is_wdra_registered: boolean
  cold_storage_enabled: boolean
  pest_controlled: boolean
  contact_phone: string
  latitude: number
  longitude: number
}

export interface ActivityLog {
  id: string
  action: string
  admin_id?: string
  admin_user: string
  target_type: 'User' | 'Farmer' | 'Buyer' | 'Lot' | 'MarketPrice' | 'Transaction' | 'Offer' | 'Payment'
  target_id: string
  details: string
  timestamp: string
  created_at: string
}
