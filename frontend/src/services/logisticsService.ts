export type VehicleType = 'small_truck' | 'medium_truck' | 'heavy_truck' | 'tractor_trolley'

export interface TransportVehicle {
  id: string
  name: string
  nameHi: string
  type: VehicleType
  capacityQtl: number
  capacityTon: number
  minFare: number
  ratePerKm: number
  avgSpeedKmh: number
  description: string
  availability: 'Available Now' | 'In 2 Hours' | 'Tomorrow'
  rating: number
  tripsCompleted: number
}

export interface TransportCostBreakdown {
  vehicle: TransportVehicle
  distanceKm: number
  quantityQtl: number
  baseFreight: number
  handlingCost: number
  tollAndTransitTax: number
  totalCost: number
  costPerQtl: number
  estimatedTimeMinutes: number
}

export type StorageType = 'Dry Warehouse' | 'Cold Storage' | 'Covered Shed Godown' | 'Silo Complex'

export interface StorageFacility {
  id: string
  name: string
  nameHi: string
  location: string
  district: string
  state: string
  distanceKm: number
  type: StorageType
  totalCapacityQtl: number
  availableCapacityQtl: number
  costPerQtlPerMonth: number
  status: 'Available' | 'Limited Space' | 'Full'
  coordinates: [number, number] // [lat, lng]
  contactPhone: string
  managerName: string
  features: string[]
  isWDRAApproved: boolean
  isNWRFinanceEligible: boolean
}

// Predefined Vehicle Fleet
export const transportVehicles: TransportVehicle[] = [
  {
    id: 'VEH-01',
    name: 'Small Commercial Vehicle (1.5 MT)',
    nameHi: 'छोटा वाणिज्यिक वाहन (1.5 टन - टाटा ऐस)',
    type: 'small_truck',
    capacityQtl: 15,
    capacityTon: 1.5,
    minFare: 800,
    ratePerKm: 22,
    avgSpeedKmh: 45,
    description: 'Ideal for local mandi runs, quick dispatch for small harvest lots up to 15 quintals.',
    availability: 'Available Now',
    rating: 4.8,
    tripsCompleted: 142,
  },
  {
    id: 'VEH-02',
    name: 'Regional Tractor-Trolley (4.0 MT)',
    nameHi: 'ट्रैक्टर ट्रॉली (4 टन)',
    type: 'tractor_trolley',
    capacityQtl: 40,
    capacityTon: 4.0,
    minFare: 1200,
    ratePerKm: 26,
    avgSpeedKmh: 30,
    description: 'Sturdy farm-gate pickup for unpaved rural roads and mandi deliveries within 40 km.',
    availability: 'Available Now',
    rating: 4.7,
    tripsCompleted: 310,
  },
  {
    id: 'VEH-03',
    name: 'Medium Multi-Axle Truck (7.5 MT)',
    nameHi: 'मध्यम 6-चक्का ट्रक (7.5 टन)',
    type: 'medium_truck',
    capacityQtl: 75,
    capacityTon: 7.5,
    minFare: 2200,
    ratePerKm: 34,
    avgSpeedKmh: 50,
    description: 'Standard agricultural carrier for inter-district mandi transit up to 75 quintals.',
    availability: 'In 2 Hours',
    rating: 4.9,
    tripsCompleted: 245,
  },
  {
    id: 'VEH-04',
    name: 'Heavy Commercial Carrier (16.0 MT)',
    nameHi: 'भारी 10-चक्का कैरियर्स (16 टन)',
    type: 'heavy_truck',
    capacityQtl: 160,
    capacityTon: 16.0,
    minFare: 4500,
    ratePerKm: 48,
    avgSpeedKmh: 55,
    description: 'Long-haul bulk transport for interstate miller delivery and export hubs.',
    availability: 'Available Now',
    rating: 4.95,
    tripsCompleted: 180,
  },
]

// Nearby Demo Storage Facilities (Central MP corridor)
export const demoStorageFacilities: StorageFacility[] = [
  {
    id: 'STR-HARDA-01',
    name: 'Central Warehouse Corp (CWC) — Harda Hub',
    nameHi: 'केंद्रीय भंडारण निगम (CWC) — हरदा हब',
    location: 'Plot 14, APMC Yard Road, Harda',
    district: 'Harda',
    state: 'Madhya Pradesh',
    distanceKm: 18,
    type: 'Dry Warehouse',
    totalCapacityQtl: 50000,
    availableCapacityQtl: 12400,
    costPerQtlPerMonth: 12,
    status: 'Available',
    coordinates: [22.3395, 77.0945],
    contactPhone: '+91 7577 224810',
    managerName: 'Devendra Joshi',
    features: [
      'WDRA Certified Godown',
      'Electronic e-NWR Receipt Generation',
      'Bank Pledge Loan against Produce',
      'Scientific Fumigation & Aeration',
      '24/7 CCTV & Security',
    ],
    isWDRAApproved: true,
    isNWRFinanceEligible: true,
  },
  {
    id: 'STR-SIRALI-02',
    name: 'Narmada Kisan FPO Rural Grain Silo',
    nameHi: 'नर्मदा किसान FPO ग्रामीण अनाज साइलो',
    location: 'Sirali Main Road, Harda',
    district: 'Harda',
    state: 'Madhya Pradesh',
    distanceKm: 6,
    type: 'Silo Complex',
    totalCapacityQtl: 20000,
    availableCapacityQtl: 4200,
    costPerQtlPerMonth: 9,
    status: 'Available',
    coordinates: [22.285, 77.012],
    contactPhone: '+91 98261 55901',
    managerName: 'Kailash Patel',
    features: [
      'Temperature Controlled Silo',
      'Direct Farm-gate Bagging & Loading',
      'Moisture Preservation Seal',
      'On-site NABL Testing Lab',
    ],
    isWDRAApproved: true,
    isNWRFinanceEligible: true,
  },
  {
    id: 'STR-TIMARNI-03',
    name: 'MP State Warehousing Corp (MPWLC) — Timarni',
    nameHi: 'म.प्र. राज्य भंडारण निगम — टिमरनी',
    location: 'SH-15 Bypass, Timarni',
    district: 'Harda',
    state: 'Madhya Pradesh',
    distanceKm: 34,
    type: 'Dry Warehouse',
    totalCapacityQtl: 35000,
    availableCapacityQtl: 2100,
    costPerQtlPerMonth: 11,
    status: 'Limited Space',
    coordinates: [22.368, 77.234],
    contactPhone: '+91 7577 232140',
    managerName: 'Anil Sharma',
    features: [
      'Government Subsidized Rates',
      'Covered Plinth & Pucca Flooring',
      'Fire Safety & Pest Management',
    ],
    isWDRAApproved: true,
    isNWRFinanceEligible: false,
  },
  {
    id: 'STR-HOSHANGABAD-04',
    name: 'Malwa Agro Agri-Logistics & Cold Storage',
    nameHi: 'मालवा एग्रो कोल्ड स्टोरेज व लॉजिस्टिक्स',
    location: 'Itarsi-Bhopal Highway Hub, Narmadapuram',
    district: 'Narmadapuram',
    state: 'Madhya Pradesh',
    distanceKm: 78,
    type: 'Cold Storage',
    totalCapacityQtl: 15000,
    availableCapacityQtl: 5600,
    costPerQtlPerMonth: 28,
    status: 'Available',
    coordinates: [22.751, 77.729],
    contactPhone: '+91 7574 255102',
    managerName: 'Rajesh Mehra',
    features: [
      'Multi-Chamber Climate Controlled (0°C to 15°C)',
      'Ideal for Pulses, Spices & Horticulture',
      'Humidity Controlled Atmosphere',
      'Backup Power Generator',
    ],
    isWDRAApproved: true,
    isNWRFinanceEligible: true,
  },
  {
    id: 'STR-INDORE-05',
    name: 'Indore Mega Agro Logistics Park',
    nameHi: 'इंदौर मेगा एग्रो लॉजिस्टिक्स पार्क',
    location: 'Dewas Naka, AB Road, Indore',
    district: 'Indore',
    state: 'Madhya Pradesh',
    distanceKm: 145,
    type: 'Dry Warehouse',
    totalCapacityQtl: 120000,
    availableCapacityQtl: 34000,
    costPerQtlPerMonth: 15,
    status: 'Available',
    coordinates: [22.768, 75.894],
    contactPhone: '+91 731 448900',
    managerName: 'Vikram Rajput',
    features: [
      'Automated Dock Levelers',
      'Container Terminal Integration',
      'Direct Railway Siding Access',
      'Instant e-NWR Warehouse Receipts',
    ],
    isWDRAApproved: true,
    isNWRFinanceEligible: true,
  },
]

/**
 * Reusable Transport Cost Calculator
 */
export function calculateTransportCost(
  distanceKm: number,
  vehicle: TransportVehicle,
  quantityQtl: number
): TransportCostBreakdown {
  // Distance road freight
  const baseFreight = Math.max(vehicle.minFare, distanceKm * vehicle.ratePerKm)
  
  // Handling & Loading at farm-gate (approx ₹6 / quintal)
  const handlingCost = Math.round(quantityQtl * 6)

  // Toll and statutory transit overhead for long trips
  const tollAndTransitTax = distanceKm > 50 ? Math.round(distanceKm * 2.5) : 0

  const totalCost = baseFreight + handlingCost + tollAndTransitTax
  const costPerQtl = quantityQtl > 0 ? Math.round(totalCost / quantityQtl) : 0

  // Estimated transit time (hours -> minutes) + 30 mins loading buffer
  const transitHours = distanceKm / vehicle.avgSpeedKmh
  const estimatedTimeMinutes = Math.round(transitHours * 60 + 35)

  return {
    vehicle,
    distanceKm,
    quantityQtl,
    baseFreight,
    handlingCost,
    tollAndTransitTax,
    totalCost,
    costPerQtl,
    estimatedTimeMinutes,
  }
}

/**
 * Get all transport options for a given distance and quantity
 */
export function getTransportOptions(
  distanceKm: number,
  quantityQtl: number
): TransportCostBreakdown[] {
  return transportVehicles.map(vehicle =>
    calculateTransportCost(distanceKm, vehicle, quantityQtl)
  )
}

/**
 * Calculate total estimated storage cost for a facility
 */
export function calculateStorageCost(
  facility: StorageFacility,
  quantityQtl: number,
  durationDays: number
): {
  monthlyRate: number
  totalCost: number
  costPerDay: number
  ratePerQtl: number
} {
  const months = durationDays / 30
  const totalCost = Math.round(facility.costPerQtlPerMonth * quantityQtl * months)
  const costPerDay = Math.round(totalCost / durationDays)
  const ratePerQtl = quantityQtl > 0 ? Math.round(totalCost / quantityQtl) : 0

  return {
    monthlyRate: facility.costPerQtlPerMonth * quantityQtl,
    totalCost,
    costPerDay,
    ratePerQtl,
  }
}

