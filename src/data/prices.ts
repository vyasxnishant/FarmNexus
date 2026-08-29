export interface CropPrice {
  name: string
  nameHi: string
  unit: string
  price: number
  change: number // percentage
  sparkline: number[] // 7 data points for weekly sparkline
}

export const cropPrices: CropPrice[] = [
  {
    name: 'Wheat (Sharbati)',
    nameHi: 'गेहूं (शरबती)',
    unit: '₹/qtl',
    price: 2680,
    change: 2.4,
    sparkline: [2520, 2540, 2580, 2610, 2590, 2650, 2680],
  },
  {
    name: 'Basmati Rice',
    nameHi: 'बासमती चावल',
    unit: '₹/qtl',
    price: 4250,
    change: -1.1,
    sparkline: [4320, 4280, 4300, 4260, 4270, 4240, 4250],
  },
  {
    name: 'Soybean',
    nameHi: 'सोयाबीन',
    unit: '₹/qtl',
    price: 4890,
    change: 3.7,
    sparkline: [4620, 4650, 4700, 4750, 4800, 4850, 4890],
  },
]
