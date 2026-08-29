import { useState, useEffect } from 'react'
import { Calculator, ArrowRight, Truck, Package, Warehouse, Receipt, Info, HelpCircle } from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'

export interface LogisticsParameters {
  quantity: number
  transportPerKm: number
  distanceKm: number
  loadingPerQtl: number
  storageCost: number
  otherCharges: number
}

interface NetRealisationCalculatorProps {
  initialPrice?: number
  initialDistance?: number
  initialQuantity?: number
  commodityName?: string
  marketName?: string
  onParametersChange?: (params: LogisticsParameters) => void
}

export function NetRealisationCalculator({
  initialPrice = 2840,
  initialDistance = 145,
  initialQuantity = 50,
  commodityName = 'Wheat (Sharbati)',
  marketName = 'Indore Central Mandi',
  onParametersChange,
}: NetRealisationCalculatorProps) {
  const { lang } = useDashboard()

  const [price, setPrice] = useState<number>(initialPrice)
  const [quantity, setQuantity] = useState<number>(initialQuantity)
  const [distance, setDistance] = useState<number>(initialDistance)
  const [transportRate, setTransportRate] = useState<number>(1.8) // ₹ per km per qtl
  const [loadingRate, setLoadingRate] = useState<number>(20) // ₹ per qtl
  const [storageCost, setStorageCost] = useState<number>(0) // ₹ total storage
  const [otherCharges, setOtherCharges] = useState<number>(150) // ₹ weighment/cess total

  // Sync props if initialPrice or initialDistance changes from parent selection
  useEffect(() => {
    if (initialPrice) setPrice(initialPrice)
  }, [initialPrice])

  useEffect(() => {
    if (initialDistance) setDistance(initialDistance)
  }, [initialDistance])

  useEffect(() => {
    if (initialQuantity) setQuantity(initialQuantity)
  }, [initialQuantity])

  // Calculations
  const grossValue = price * quantity
  const totalTransport = Math.round(distance * transportRate * (quantity / 10))
  const totalLoading = loadingRate * quantity
  const totalStorage = storageCost
  const totalOther = otherCharges

  const totalDeductions = totalTransport + totalLoading + totalStorage + totalOther
  const netRealisation = Math.max(0, grossValue - totalDeductions)
  const netPerQuintal = quantity > 0 ? netRealisation / quantity : 0
  const deductionPercent = grossValue > 0 ? ((totalDeductions / grossValue) * 100).toFixed(1) : '0'

  // Notify parent
  useEffect(() => {
    if (onParametersChange) {
      onParametersChange({
        quantity,
        transportPerKm: transportRate,
        distanceKm: distance,
        loadingPerQtl: loadingRate,
        storageCost,
        otherCharges,
      })
    }
  }, [quantity, transportRate, distance, loadingRate, storageCost, otherCharges])

  return (
    <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-soil/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-monsoon text-wheat rounded-2xl">
            <Calculator className="w-5 h-5 text-turmeric" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-soil">
              {lang === 'en' ? 'Net Realisation Calculator' : 'शुद्ध प्राप्ति कैलकुलेटर'}
            </h3>
            <p className="font-body text-xs text-soil/70 mt-0.5">
              {lang === 'en'
                ? `Calculate estimated in-hand earnings after freight, handling & mandi cess for ${commodityName}`
                : `${commodityName} के लिए माल भाड़ा, लोडिंग व अन्य खर्च घटाकर शुद्ध कमाई जानें`}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-turmeric/15 text-soil border border-turmeric/30 self-start md:self-auto">
          ESTIMATED NET REALISATION
        </span>
      </div>

      {/* Grid: Inputs (Left) & Output Waterfall (Right) */}
      <div className="grid lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Editable Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Row 1: Quantity & Price */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between font-body text-xs font-semibold text-soil mb-1.5">
                <span>{lang === 'en' ? 'Harvest Quantity (Quintals)' : 'उपज मात्रा (क्विंटल)'}</span>
                <span className="font-mono text-turmeric font-bold">{quantity} qtl ({(quantity / 10).toFixed(1)} MT)</span>
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-semibold focus:outline-none focus:border-turmeric"
                placeholder="50"
              />
            </div>

            <div>
              <label className="flex items-center justify-between font-body text-xs font-semibold text-soil mb-1.5">
                <span>{lang === 'en' ? 'Mandi Modal Price (₹/qtl)' : 'मंडी मॉडल भाव (₹/क्विंटल)'}</span>
                <span className="font-mono text-soil font-bold">₹{price.toLocaleString('en-IN')}</span>
              </label>
              <input
                type="number"
                min="100"
                max="100000"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-semibold focus:outline-none focus:border-turmeric"
                placeholder="2840"
              />
            </div>
          </div>

          {/* Row 2: Distance & Freight Rate */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between font-body text-xs font-semibold text-soil mb-1.5">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-turmeric" />
                  {lang === 'en' ? 'Mandi Distance (km)' : 'मंडी दूरी (किमी)'}
                </span>
                <span className="font-mono text-soil font-bold">{distance} km</span>
              </label>
              <input
                type="number"
                min="0"
                max="2000"
                value={distance}
                onChange={(e) => setDistance(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-semibold focus:outline-none focus:border-turmeric"
                placeholder="145"
              />
            </div>

            <div>
              <label className="flex items-center justify-between font-body text-xs font-semibold text-soil mb-1.5">
                <span>{lang === 'en' ? 'Freight Rate (₹/km/MT)' : 'भाड़ा दर (₹/किमी/MT)'}</span>
                <span className="font-mono text-soil font-bold">₹{transportRate}/km</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={transportRate}
                onChange={(e) => setTransportRate(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-semibold focus:outline-none focus:border-turmeric"
                placeholder="1.8"
              />
            </div>
          </div>

          {/* Row 3: Loading, Storage & Other Charges */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1 font-body text-[11px] font-semibold text-soil/80 mb-1">
                <Package className="w-3 h-3 text-turmeric" />
                <span>{lang === 'en' ? 'Loading (₹/qtl)' : 'पल्लेदारी (₹/qtl)'}</span>
              </label>
              <input
                type="number"
                min="0"
                value={loadingRate}
                onChange={(e) => setLoadingRate(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-mono text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                placeholder="20"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 font-body text-[11px] font-semibold text-soil/80 mb-1">
                <Warehouse className="w-3 h-3 text-turmeric" />
                <span>{lang === 'en' ? 'Storage (₹ total)' : 'भंडारण शुल्क (₹)'}</span>
              </label>
              <input
                type="number"
                min="0"
                value={storageCost}
                onChange={(e) => setStorageCost(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-mono text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                placeholder="0"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 font-body text-[11px] font-semibold text-soil/80 mb-1">
                <Receipt className="w-3 h-3 text-turmeric" />
                <span>{lang === 'en' ? 'Mandi Cess / Misc (₹)' : 'मंडी उपकर / अन्य (₹)'}</span>
              </label>
              <input
                type="number"
                min="0"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-soil/5 border border-soil/15 font-mono text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                placeholder="150"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Earnings Summary Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-monsoon text-wheat rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-turmeric block mb-1">
              {marketName}
            </span>
            <h4 className="font-serif text-xl font-bold text-wheat">
              {lang === 'en' ? 'Earnings Realisation' : 'कमाई का संपूर्ण विवरण'}
            </h4>

            {/* In-Hand Hero Number */}
            <div className="mt-4 p-4 bg-wheat/5 border border-wheat/10 rounded-2xl">
              <span className="font-body text-xs text-wheat/60 block">
                {lang === 'en' ? 'Estimated Net In-Hand Realisation' : 'अनुमानित शुद्ध इन-हैंड प्राप्ति'}
              </span>
              <p className="font-mono text-3xl md:text-4xl font-bold text-datateal mt-1">
                ₹{netRealisation.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-wheat/10 text-xs font-mono">
                <span className="text-wheat/70">{lang === 'en' ? 'Net Rate per Quintal:' : 'शुद्ध प्रति क्विंटल:'}</span>
                <span className="text-wheat font-bold text-sm">₹{Math.round(netPerQuintal).toLocaleString('en-IN')}/qtl</span>
              </div>
            </div>

            {/* Waterfall Breakdown Rows */}
            <div className="mt-4 space-y-2 font-body text-xs">
              <div className="flex items-center justify-between text-wheat/80">
                <span>{lang === 'en' ? 'Gross Sale Value (Modal × Qty)' : 'सकल बिक्री मूल्य'}</span>
                <span className="font-mono font-semibold text-wheat">₹{grossValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-turmeric">
                <span>- {lang === 'en' ? 'Transport Freight' : 'माल भाड़ा कटौती'}</span>
                <span className="font-mono font-semibold">-₹{totalTransport.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-turmeric/80">
                <span>- {lang === 'en' ? 'Loading & Handling' : 'लोडिंग / पल्लेदारी'}</span>
                <span className="font-mono font-semibold">-₹{totalLoading.toLocaleString('en-IN')}</span>
              </div>

              {(totalStorage > 0 || totalOther > 0) && (
                <div className="flex items-center justify-between text-turmeric/70">
                  <span>- {lang === 'en' ? 'Storage & Other Charges' : 'भंडारण व अन्य शुल्क'}</span>
                  <span className="font-mono font-semibold">-₹{(totalStorage + totalOther).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-wheat/10 text-wheat/60 text-[11px]">
                <span>{lang === 'en' ? 'Total Logistics Drag:' : 'कुल कटौती अनुपात:'}</span>
                <span className="font-mono font-semibold text-turmeric">{deductionPercent}% (₹{totalDeductions.toLocaleString('en-IN')})</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-wheat/5 rounded-xl border border-wheat/10 flex items-start gap-2 text-[11px] font-body text-wheat/70">
            <Info className="w-4 h-4 text-turmeric flex-shrink-0 mt-0.5" />
            <span>
              {lang === 'en'
                ? 'ONDC and FarmNexus escrow rails bypass intermediate mandi toll gates, saving ~2.2% in gate cess.'
                : 'FarmNexus डिजिटल एस्क्रो से सीधे सौदों पर अतिरिक्त मंडी गेट शुल्क की बचत होती है।'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
