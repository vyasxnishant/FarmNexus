import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ShieldCheck,
  Award,
  Sprout,
  Search,
  Tag,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Receipt,
  Users,
  Layers,
  ChevronRight,
  Clock
} from 'lucide-react'
import { useDashboard, type CropLot } from '../../../context/DashboardContext'

export function BuyerDashboardView() {
  const {
    buyerProfile,
    buyerRequirement,
    updateBuyerRequirement,
    lots,
    offers,
    calculateLotMatchScore,
    lang
  } = useDashboard()

  const [isEditingReq, setIsEditingReq] = useState(false)
  const [reqCrop, setReqCrop] = useState(buyerRequirement.requiredCrop)
  const [reqQty, setReqQty] = useState(buyerRequirement.requiredQuantityQtl)
  const [reqGrade, setReqGrade] = useState(buyerRequirement.preferredGrade)
  const [reqLocation, setReqLocation] = useState(buyerRequirement.preferredLocation)
  const [reqMaxPrice, setReqMaxPrice] = useState(buyerRequirement.maxPrice)

  // Active lots available for purchase
  const availableLots = lots.filter(l => l.status === 'Active')

  // Calculate matching lots
  const matchedLots = availableLots.map(lot => {
    const match = calculateLotMatchScore(lot, buyerRequirement)
    return {
      lot,
      match,
    }
  }).sort((a, b) => b.match.score - a.match.score)

  const highMatchLots = matchedLots.filter(m => m.match.isHighMatch)

  // Buyer's offers
  const myOffers = offers.filter(o => o.buyerId === 'BUY-ME-01' || o.buyerCompany.includes('AgroCorp') || o.status === 'Pending')
  const pendingOffers = myOffers.filter(o => o.status === 'Pending')
  const acceptedOffers = myOffers.filter(o => o.status === 'Accepted')

  const handleSaveRequirements = (e: React.FormEvent) => {
    e.preventDefault()
    updateBuyerRequirement({
      requiredCrop: reqCrop,
      requiredQuantityQtl: reqQty,
      preferredGrade: reqGrade,
      preferredLocation: reqLocation,
      maxPrice: reqMaxPrice,
    })
    setIsEditingReq(false)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Buyer Corporate Identity */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-turmeric" />
                Institutional Buyer Portal
              </span>
              <span className="font-mono text-xs text-soil/70 bg-soil/5 border border-soil/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-datateal" />
                GST Verified
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              {buyerProfile.company}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1">
              Procurement Lead: <span className="font-semibold text-soil">{buyerProfile.name}</span> &bull; Delivery Terminal: <span className="font-semibold text-soil">{buyerProfile.deliveryLocation}</span> &bull; Reliability Score: <span className="font-mono font-bold text-datateal">{buyerProfile.reliabilityScore} / 5.0</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              to="/buyer/lots"
              className="px-4 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Browse All Lots</span>
            </Link>

            <Link
              to="/farmer"
              className="px-3.5 py-2.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold border border-soil/15 hover:bg-soil/10 transition-colors"
              title="Switch to Farmer View"
            >
              Farmer View
            </Link>
          </div>
        </div>

        {/* 4 Summary KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-soil/10">
          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">ACTIVE FARMER LOTS</span>
            <p className="font-mono text-2xl font-bold text-soil mt-1">{availableLots.length}</p>
            <span className="text-[11px] text-soil/50">Across central APMC godowns</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">HIGH-MATCH LOTS (&ge;75%)</span>
            <p className="font-mono text-2xl font-bold text-datateal mt-1">{highMatchLots.length}</p>
            <span className="text-[11px] text-datateal/80">Matching your target specs</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">ACTIVE BIDS & OFFERS</span>
            <p className="font-mono text-2xl font-bold text-turmeric mt-1">{pendingOffers.length}</p>
            <span className="text-[11px] text-turmeric/80">Awaiting farmer acceptance</span>
          </div>

          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">ACCEPTED DEALS</span>
            <p className="font-mono text-2xl font-bold text-soil mt-1">{acceptedOffers.length}</p>
            <span className="text-[11px] text-soil/50">Ready for escrow funding</span>
          </div>
        </div>
      </div>

      {/* BUYER PROCUREMENT SPECIFICATION CRITERIA */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-soil/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-monsoon text-wheat rounded-xl">
              <Sliders className="w-4 h-4 text-turmeric" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-soil">
                Active Procurement Criteria
              </h3>
              <p className="font-body text-xs text-soil/60">
                The matching algorithm ranks farm-gate lots against these requirements.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingReq(prev => !prev)}
            className="px-3.5 py-1.5 rounded-xl bg-soil/5 text-soil font-body text-xs font-semibold hover:bg-soil/10 border border-soil/15 transition-colors cursor-pointer self-start sm:self-auto"
          >
            {isEditingReq ? 'Cancel Editing' : 'Edit Requirements'}
          </button>
        </div>

        {isEditingReq ? (
          <form onSubmit={handleSaveRequirements} className="p-4 bg-soil/5 rounded-2xl border border-soil/10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-body text-soil animate-fade-in">
            <div>
              <label className="block font-semibold mb-1">Target Crop</label>
              <select
                value={reqCrop}
                onChange={(e) => setReqCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-semibold cursor-pointer"
              >
                <option value="All">All Crops / Any</option>
                <option value="Wheat (Sharbati)">Wheat (Sharbati)</option>
                <option value="Soybean">Soybean</option>
                <option value="Basmati Rice">Basmati Rice</option>
                <option value="Chana (Gram)">Chana (Gram)</option>
                <option value="Mustard">Mustard</option>
                <option value="Maize">Maize</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Target Volume (qtl)</label>
              <input
                type="number"
                min="10"
                value={reqQty}
                onChange={(e) => setReqQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Preferred Grade</label>
              <select
                value={reqGrade}
                onChange={(e) => setReqGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-semibold cursor-pointer"
              >
                <option value="All">Any Grade</option>
                <option value="Grade A (Export)">Grade A (Export)</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Preferred Region</label>
              <select
                value={reqLocation}
                onChange={(e) => setReqLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-semibold cursor-pointer"
              >
                <option value="All">All India</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block font-semibold mb-1">Max Ceiling Price (₹/qtl)</label>
                <input
                  type="number"
                  min="500"
                  value={reqMaxPrice}
                  onChange={(e) => setReqMaxPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full py-2 bg-turmeric text-monsoon rounded-xl font-bold hover:bg-turmeric/90 transition-all cursor-pointer shadow-sm"
              >
                Apply Criteria
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
              <span className="text-[10px] text-soil/50 block">COMMODITY</span>
              <span className="font-serif font-bold text-sm text-soil">{buyerRequirement.requiredCrop}</span>
            </div>

            <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
              <span className="text-[10px] text-soil/50 block">REQUIRED QUANTITY</span>
              <span className="font-mono font-bold text-sm text-soil">{buyerRequirement.requiredQuantityQtl} Quintals</span>
            </div>

            <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
              <span className="text-[10px] text-soil/50 block">PREFERRED GRADE</span>
              <span className="font-mono font-bold text-sm text-datateal">{buyerRequirement.preferredGrade}</span>
            </div>

            <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
              <span className="text-[10px] text-soil/50 block">TARGET REGION</span>
              <span className="font-body font-bold text-sm text-soil">{buyerRequirement.preferredLocation}</span>
            </div>

            <div className="p-3 bg-soil/5 rounded-xl border border-soil/10">
              <span className="text-[10px] text-soil/50 block">BUDGET CEILING</span>
              <span className="font-mono font-bold text-sm text-turmeric">₹{buyerRequirement.maxPrice.toLocaleString('en-IN')}/qtl</span>
            </div>
          </div>
        )}
      </div>

      {/* TOP MATCHED LOTS RECOMMENDATION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-turmeric" />
            <h2 className="font-serif text-2xl font-bold text-soil">
              Top Matched Produce Lots
            </h2>
          </div>
          <Link
            to="/buyer/lots"
            className="text-xs font-body font-semibold text-soil hover:text-turmeric transition-colors flex items-center gap-1"
          >
            <span>View All ({availableLots.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {matchedLots.length === 0 ? (
          <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
            <Sprout className="w-12 h-12 text-soil/30 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-soil">No Matching Produce Lots Currently Active</h3>
            <p className="font-body text-xs text-soil/60 max-w-sm mx-auto">
              Try relaxing your procurement criteria to view all available regional harvest lots.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedLots.slice(0, 6).map(({ lot, match }) => {
              const grossVal = lot.expectedPrice * lot.quantityQtl

              return (
                <div
                  key={lot.id}
                  className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm hover:border-turmeric/60 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Top Bar: Lot ID, Score Badge, Crop */}
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-soil/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-soil/60">{lot.id}</span>
                          <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            match.score >= 80
                              ? 'bg-datateal/20 text-soil border border-datateal/40'
                              : 'bg-turmeric/20 text-soil border border-turmeric/40'
                          }`}>
                            {match.score}% MATCH
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-soil mt-1">{lot.crop}</h3>
                        <p className="font-body text-xs text-soil/70">{lot.variety}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-soil block">
                          ₹{lot.expectedPrice.toLocaleString('en-IN')}<span className="text-[10px] text-soil/60">/qtl</span>
                        </span>
                        <span className="font-mono text-[11px] text-datateal font-bold">
                          ₹{grossVal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Specs Pill */}
                    <div className="grid grid-cols-2 gap-2 py-3">
                      <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                        <span className="text-[10px] text-soil/50 block">AVAILABLE</span>
                        <span className="font-mono text-xs font-bold text-soil">{lot.quantityQtl} {lot.unit || 'qtl'}</span>
                      </div>

                      <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                        <span className="text-[10px] text-soil/50 block">GRADE / MOISTURE</span>
                        <span className="font-mono text-xs font-bold text-soil">{lot.grade} &bull; {lot.moisturePercent}%</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs font-body text-soil/70 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-turmeric flex-shrink-0" />
                      <span className="truncate">{lot.location}</span>
                    </div>

                    {/* Match Reasons Tag Pills */}
                    <div className="mt-3 pt-3 border-t border-soil/10 space-y-1.5">
                      <span className="text-[10px] font-mono text-soil/50 uppercase tracking-wider block">
                        MATCH RATIONALE:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {match.matchReasons.slice(0, 3).map((r, rIdx) => (
                          <span
                            key={rIdx}
                            className="text-[10px] font-body px-2 py-0.5 rounded-full bg-soil/5 border border-soil/10 text-soil/80"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-soil/10 flex items-center justify-between gap-2">
                    <Link
                      to={`/buyer/lots/${lot.id}`}
                      className="px-3 py-2 rounded-xl bg-monsoon text-wheat font-body text-xs font-semibold hover:bg-monsoon/90 transition-colors flex items-center gap-1"
                    >
                      <span>Inspect Lot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/buyer/lots/${lot.id}?action=offer`}
                      className="px-4 py-2 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Make Offer</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* RECENT BIDS / OFFERS TRACKER */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-soil/10">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-turmeric" />
            <h3 className="font-serif text-xl font-bold text-soil">
              Recent Procurement Bids
            </h3>
          </div>
          <Link
            to="/buyer/offers"
            className="text-xs font-body font-semibold text-soil hover:text-turmeric transition-colors"
          >
            View All Offers ({myOffers.length})
          </Link>
        </div>

        {myOffers.length === 0 ? (
          <p className="text-xs font-body text-soil/60 py-4 text-center">
            No bids submitted yet. Browse active lots above and make your first offer!
          </p>
        ) : (
          <div className="divide-y divide-soil/10">
            {myOffers.slice(0, 4).map((o) => (
              <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-body">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-soil">{o.id}</span>
                    <span className="font-semibold text-soil">{o.lotTitle}</span>
                    <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      o.status === 'Accepted'
                        ? 'bg-datateal/20 text-soil border border-datateal/40'
                        : o.status === 'Pending'
                        ? 'bg-turmeric/20 text-soil border border-turmeric/40'
                        : 'bg-red-500/10 text-red-700'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <span className="text-soil/60 text-[11px] block mt-0.5">
                    {o.pickupLocation} &bull; {o.createdDate}
                  </span>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-soil block">
                      ₹{o.offeredPrice.toLocaleString('en-IN')}/qtl
                    </span>
                    <span className="font-mono text-[11px] text-soil/60">
                      Total: ₹{o.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    to="/buyer/offers"
                    className="p-2 rounded-xl bg-soil/5 hover:bg-soil/10 text-soil transition-colors"
                    title="View offer status"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

