export interface CropPrice {
  name: string
  nameHi: string
  unit: string
  price: number
  change: number // percentage
  sparkline: number[] // 7 data points for weekly sparkline
}

export const cropPrices: CropPrice[] = []
