import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sprout,
  ShieldCheck,
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  Building2,
  CheckCircle2,
  Sparkles,
  Tag,
  Clock,
  Send,
  AlertCircle,
  FileText,
  Loader2,
  Check
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'

export function BuyerLotDetailsView() {
  const { lotId } = useParams<{ lotId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getLotById, buyerRequirement, calculateLotMatchScore, makeBuyerOffer, buyerProfile, lang } = useDashboard()

  const lot = lotId ? getLotById(lotId) : undefined
  const shouldOpenOffer = searchParams.get('action') === 'offer'

  // Offer Form State
  const [offeredPrice, setOfferedPrice] = useState<number>(lot?.expectedPrice || 2750)
  const [offeredQuantity, setOfferedQuantity] = useState<number>(lot?.quantityQtl || 100)
  const [paymentTerms, setPaymentTerms] = useState<string>('e-NWR Escrow auto-release on gate receipt')
  const [message, setMessage] = useState<string>('Ready for immediate dispatch to Indore terminal. Self-arranged transport.')
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  useEffect(() => {
    if (lot) {
      setOfferedPrice(lot.expectedPrice)
      setOfferedQuantity(lot.quantityQtl)
    }
  }, [lot])

  if (!lot) {
    return (
      <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-soil">Lot Not Found</h2>
        <p className="font-body text-xs text-soil/60">
          The requested produce lot may have been sold or removed.
        </p>
        <Link
          to="/buyer/lots"
          className="inline-flex items-center gap-2 px-4 py-2 bg-turmeric text-monsoon rounded-xl font-bold text-xs shadow-sm"
        >
          Back to Browse Lots
        </Link>
      </div>
    )
  }

  const match = calculateLotMatchScore(lot, buyerRequirement)
  const totalBidAmount = offeredPrice * offeredQuantity

  // Validation routine
  const validateOffer = (): boolean => {
    const errs: Record<string, string> = {}

    if (offeredPrice <= 0) errs.offeredPrice = 'Offered price must be greater than 0.'
    if (offeredQuantity <= 0) errs.offeredQuantity = 'Quantity must be greater than 0.'
    if (offeredQuantity > lot.quantityQtl) {
      errs.offeredQuantity = `Requested quantity cannot exceed available lot volume (${lot.quantityQtl} qtl).`
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateOffer()) return

    setIsSubmitting(true)

    setTimeout(() => {
      makeBuyerOffer({
        lotId: lot.id,
        offeredPrice,
        quantityQtl: offeredQuantity,
        paymentTerms,
        message,
      })

      setIsSubmitting(false)
      setShowSuccessToast(true)

      setTimeout(() => {
        navigate('/buyer/offers')
      }, 1200)
    }, 600)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/buyer/lots"
            className="p-2.5 rounded-2xl bg-wheat text-soil hover:bg-wheat/80 border border-soil/15 transition-colors cursor-pointer"
            aria-label="Back to Browse Lots"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lot.id}
              </span>
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                match.score >= 80
                  ? 'bg-datateal/20 text-soil border border-datateal/40'
                  : 'bg-turmeric/20 text-soil border border-turmeric/40'
              }`}>
                {match.score}% MATCH
              </span>
              <span className="font-mono text-xs text-soil/60 bg-soil/5 border border-soil/15 px-2 py-0.5 rounded-full">
                Status: {lot.status}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil mt-1">
              {lot.crop} — <span className="font-normal text-soil/70 text-2xl">{lot.variety}</span>
            </h1>
          </div>
        </div>

        <Link
          to="/buyer/dashboard"
          className="px-4 py-2.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/15 hover:bg-soil/10 transition-colors self-start sm:self-auto"
        >
          Buyer Portal
        </Link>
      </div>

      {/* Success Feedback Toast */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-datateal/20 border border-datateal/50 text-soil flex items-center gap-3 animate-fade-in shadow-md">
          <CheckCircle2 className="w-5 h-5 text-datateal flex-shrink-0" />
          <div>
            <p className="font-body text-xs font-bold text-soil">
              Offer of ₹{offeredPrice.toLocaleString('en-IN')}/qtl Submitted Successfully!
            </p>
            <p className="text-[11px] text-soil/70">Binding bid has been delivered to the farmer. Redirecting to My Offers...</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Specifications & Right Offer Submission Form */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Detailed Specifications & Quality Scorecard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Produce Specifications Card */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-soil/10">
              <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                <Sprout className="w-5 h-5 text-turmeric" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-soil">
                  Produce Specifications
                </h3>
                <p className="font-body text-xs text-soil/70 mt-0.5">
                  Available harvest volume, packaging, and dispatch details.
                </p>
              </div>
            </div>

            {lot.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-soil/15 max-h-64 shadow-xs">
                <img src={lot.imageUrl} alt={lot.crop} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
                <span className="font-body text-[11px] text-soil/60 block">HARVEST VOLUME</span>
                <p className="font-mono text-2xl font-bold text-soil mt-1">
                  {lot.quantityQtl} <span className="text-xs font-normal text-soil/60">{lot.unit || 'Quintals'}</span>
                </p>
                <span className="font-mono text-[11px] text-soil/50">({(lot.quantityQtl / 10).toFixed(1)} MT)</span>
              </div>

              <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
                <span className="font-body text-[11px] text-soil/60 block">HARVEST DATE</span>
                <p className="font-mono text-base font-bold text-soil mt-1">{lot.harvestDate}</p>
                <span className="font-body text-[11px] text-soil/50">Registered {lot.createdAt}</span>
              </div>

              <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
                <span className="font-body text-[11px] text-soil/60 block">DISPATCH WINDOW</span>
                <p className="font-mono text-xs font-bold text-soil mt-1">
                  {lot.availableFrom || lot.harvestDate}
                </p>
                <span className="font-mono text-[11px] text-soil/50">to {lot.availableUntil || 'Immediate'}</span>
              </div>
            </div>

            {lot.description && (
              <div className="p-4 bg-soil/5 rounded-2xl border border-soil/10">
                <span className="font-body text-xs font-bold text-soil block mb-1">
                  Produce Description & Lot Highlights:
                </span>
                <p className="font-body text-xs text-soil/80 leading-relaxed">{lot.description}</p>
              </div>
            )}

            <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-turmeric flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-body text-xs font-bold text-soil block">
                  Storage & Pickup Location
                </span>
                <p className="font-body text-xs text-soil/80 mt-0.5">{lot.location}</p>
                {lot.pickupLocation && (
                  <p className="font-body text-[11px] text-soil/60 mt-0.5 font-medium">
                    Gate / Bay: {lot.pickupLocation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quality Grading Scorecard */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-soil/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-turmeric" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-soil">
                    Quality Grading & Assay Scorecard
                  </h3>
                  <p className="font-body text-xs text-soil/70 mt-0.5">
                    Self-declared farmer quality information with moisture assay metrics.
                  </p>
                </div>
              </div>

              <span className="font-mono text-[10px] font-semibold text-soil/80 bg-turmeric/15 border border-turmeric/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
                Farmer Provided Quality Information
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-soil/5 rounded-2xl p-3.5 border border-soil/10">
                <span className="font-body text-[10px] text-soil/50 block uppercase">GRADE</span>
                <p className="font-mono text-base font-bold text-datateal mt-1">{lot.grade}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3.5 border border-soil/10">
                <span className="font-body text-[10px] text-soil/50 block uppercase">VISUAL QUALITY</span>
                <p className="font-mono text-base font-bold text-soil mt-1">{lot.visualQuality || 'Good'}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3.5 border border-soil/10">
                <span className="font-body text-[10px] text-soil/50 block uppercase">DAMAGE / DEFECTS</span>
                <p className="font-mono text-base font-bold text-turmeric mt-1">{lot.damageLevel || 'Low'}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3.5 border border-soil/10">
                <span className="font-body text-[10px] text-soil/50 block uppercase">GRAIN SIZE</span>
                <p className="font-mono text-base font-bold text-soil mt-1 truncate">{lot.grainSize || 'Medium'}</p>
              </div>
            </div>

            {/* Moisture & Assay Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/50 block uppercase">MOISTURE</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5">{lot.moisturePercent ? `${lot.moisturePercent}%` : 'Standard'}</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/50 block uppercase">FOREIGN MATTER</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5">{lot.foreignMatterPercent ?? 0.8}%</p>
              </div>

              <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
                <span className="font-body text-[10px] text-soil/50 block uppercase">DAMAGED GRAIN</span>
                <p className="font-mono text-base font-bold text-soil mt-0.5">{lot.damagedGrainPercent ?? 0.5}%</p>
              </div>
            </div>

            {lot.qualityNotes && (
              <div className="p-4 bg-soil/5 rounded-2xl border border-soil/10 text-xs font-body text-soil/80">
                <span className="font-bold text-soil block mb-1">Assay & Handling Notes:</span>
                <p className="leading-relaxed">{lot.qualityNotes}</p>
              </div>
            )}
          </div>

          {/* Match Analysis Breakdown */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-turmeric" />
              <h4 className="font-serif text-lg font-bold text-soil">
                Procurement Match Analysis
              </h4>
            </div>
            <p className="text-xs font-body text-soil/70">
              Evaluated against active buyer requirements ({buyerRequirement.requiredCrop}, {buyerRequirement.requiredQuantityQtl} qtl, {buyerRequirement.preferredGrade}).
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {match.matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-soil/5 border border-soil/15 text-xs font-body text-soil">
                  <Check className="w-3.5 h-3.5 text-datateal" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Make Offer Sticky Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 bg-monsoon text-wheat rounded-3xl p-6 border-2 border-turmeric/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-wheat/15">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-turmeric" />
                <span className="font-mono text-xs font-bold text-turmeric uppercase tracking-wider">
                  MAKE BINDING BID
                </span>
              </div>
              <span className="font-mono text-[11px] text-wheat/60">
                Direct Deal Desk
              </span>
            </div>

            {/* Expected Price Benchmark */}
            <div className="p-3.5 bg-wheat/5 border border-wheat/10 rounded-2xl flex items-center justify-between text-xs font-body">
              <span className="text-wheat/70">Farmer Expected Price:</span>
              <span className="font-mono font-bold text-wheat">
                ₹{lot.expectedPrice.toLocaleString('en-IN')}/qtl
              </span>
            </div>

            {/* Make Offer Form */}
            <form onSubmit={handleSubmitOffer} className="space-y-4">
              {/* Offer Price Input */}
              <div>
                <label className="block font-body text-xs font-semibold text-wheat mb-1.5">
                  Your Offered Price (₹ / Quintal) *
                </label>
                <input
                  type="number"
                  min="100"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-wheat/10 border border-wheat/20 font-mono text-lg font-bold text-wheat focus:outline-none focus:border-turmeric"
                />
                {errors.offeredPrice && (
                  <p className="text-red-400 font-body text-[11px] mt-1">{errors.offeredPrice}</p>
                )}
              </div>

              {/* Quantity Requested */}
              <div>
                <label className="block font-body text-xs font-semibold text-wheat mb-1.5">
                  Quantity Required (Quintals) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={lot.quantityQtl}
                  value={offeredQuantity}
                  onChange={(e) => setOfferedQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-wheat/10 border border-wheat/20 font-mono text-lg font-bold text-wheat focus:outline-none focus:border-turmeric"
                />
                <span className="font-mono text-[11px] text-wheat/50 mt-1 block">
                  Max available: {lot.quantityQtl} {lot.unit || 'qtl'}
                </span>
                {errors.offeredQuantity && (
                  <p className="text-red-400 font-body text-[11px] mt-1">{errors.offeredQuantity}</p>
                )}
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block font-body text-xs font-semibold text-wheat mb-1.5">
                  Escrow & Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wheat/10 border border-wheat/20 font-body text-xs text-wheat cursor-pointer focus:outline-none focus:border-turmeric"
                >
                  <option value="e-NWR Escrow auto-release on gate receipt" className="bg-monsoon text-wheat">
                    e-NWR Escrow auto-release on gate receipt
                  </option>
                  <option value="Direct bank payout within 2 hours of QA pass" className="bg-monsoon text-wheat">
                    Direct bank payout within 2 hours of QA pass
                  </option>
                  <option value="Instant UPI transfer upon digital weighment" className="bg-monsoon text-wheat">
                    Instant UPI transfer upon digital weighment
                  </option>
                </select>
              </div>

              {/* Optional Message / Notes */}
              <div>
                <label className="block font-body text-xs font-semibold text-wheat mb-1.5">
                  Procurement Message / Logistics Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify transit terms, dispatch timing, or container requirements..."
                  className="w-full px-3 py-2 rounded-xl bg-wheat/10 border border-wheat/20 font-body text-xs text-wheat focus:outline-none focus:border-turmeric"
                />
              </div>

              {/* Total Financial Summary Card */}
              <div className="p-4 bg-wheat/10 rounded-2xl border border-turmeric/30 space-y-1">
                <span className="text-[11px] font-body text-wheat/70 block">
                  TOTAL BINDING BID VALUE
                </span>
                <p className="font-mono text-3xl font-bold text-datateal">
                  ₹{totalBidAmount.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] font-mono text-wheat/50 block">
                  ({offeredQuantity} qtl @ ₹{offeredPrice.toLocaleString('en-IN')}/qtl)
                </span>
              </div>

              {/* Submit Offer Button */}
              <button
                type="submit"
                disabled={isSubmitting || lot.status !== 'Active'}
                className="w-full py-3.5 px-4 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {lot.status !== 'Active' ? `Lot is currently ${lot.status}` : 'Submit Binding Bid to Farmer'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

