import { inMemoryDb } from '../config/db.js'
import { geocodeLocation, calculateGeoDistanceKm } from './geocodingService.js'

export class LogisticsService {
  static async getLogisticsForLot(lotId: string, destinationMandi: string = 'Indore Central Mandi (Laxmibai Nagar)') {
    const lot = inMemoryDb.lots.find(l => l.id === lotId)
    if (!lot) {
      throw new Error(`Lot not found with ID: ${lotId}`)
    }

    const originGeo = geocodeLocation(lot.location) || geocodeLocation('Harda')
    const destGeo = geocodeLocation(destinationMandi) || geocodeLocation('Indore')

    let distanceKm = 45
    if (originGeo && destGeo) {
      distanceKm = calculateGeoDistanceKm(originGeo.coordinates, destGeo.coordinates)
    }

    const options = inMemoryDb.transportOptions.map(opt => {
      const estimatedCost = Math.round(opt.base_fare + distanceKm * opt.per_km_rate)
      const estimatedHours = Number((distanceKm / opt.avg_speed_kmh).toFixed(1))
      const isSuitable = lot.quantity_qtl <= opt.capacity_qtl

      return {
        id: opt.id,
        vehicleType: opt.vehicle_type,
        capacityQtl: opt.capacity_qtl,
        capacityTonnes: opt.capacity_qtl / 10,
        distanceKm,
        estimatedCost,
        estimatedTime: `${estimatedHours} hrs`,
        isSuitable,
        status: isSuitable ? 'Available' : 'Capacity Exceeded',
      }
    })

    return {
      lot: {
        id: lot.id,
        crop: lot.crop,
        quantityQtl: lot.quantity_qtl,
        sourceLocation: lot.location,
      },
      destinationMandi,
      distanceKm,
      options,
    }
  }

  static async getStorageFacilities(filters?: {
    location?: string
    minAvailableMt?: number
    maxCostPerBag?: number
    wdraOnly?: boolean
  }) {
    let facilities = [...inMemoryDb.storageFacilities]

    if (filters?.minAvailableMt) {
      facilities = facilities.filter(f => f.available_capacity_mt >= filters.minAvailableMt!)
    }
    if (filters?.maxCostPerBag) {
      facilities = facilities.filter(f => f.daily_rate_per_bag <= filters.maxCostPerBag!)
    }
    if (filters?.wdraOnly) {
      facilities = facilities.filter(f => f.is_wdra_registered)
    }

    return facilities
  }
}

