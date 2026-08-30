import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Tag,
  Clock,
  ShieldCheck,
  Building2,
  Handshake,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MapPin,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Trash2,
  DollarSign
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'

export function BuyerOffersView() {
  const { offers, cancelBuyerOffer, buyerProfile, currentUser, lang } = useDashboard()
  const [filterStatus, setFilterStatus] = useState<string>('All')

  const filterTabs = ['All', 'Pending', 'Accepted', 'Countered', 'Rejected']

  // Filter offers made by the authenticated buyer
  const myOffers = offers.filter(o => {
    if (!currentUser) return true
    if (currentUser.user_type === 'ADMIN') return true
    return (
      o.buyerId === currentUser.id ||
      o.buyerName?.toLowerCase() === currentUser.name?.toLowerCase() ||
      (currentUser.organization && o.buyerCompany?.toLowerCase().includes(currentUser.organization.toLowerCase())) ||
      o.buyerId === 'USR-BUY-01'
    )
  })

  const filteredOffers = myOffers.filter(offer => {
    if (filterStatus === 'All') return true
    return offer.status === filterStatus
  })

  // Summary Metrics
  const totalBids = myOffers.length
  const pendingBids = myOffers.filter(o => o.status === 'Pending').length
  const acceptedDeals = myOffers.filter(o => o.status === 'Accepted').length
  const totalCapitalCommitted = myOffers
    .filter(o => o.status === 'Accepted' || o.status === 'Pending')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Summary Bar */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-turmeric" />
                Procurement Deal Desk
              </span>
              <span className="font-mono text-xs text-soil/60">
                {buyerProfile.company}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              My Bids & Purchase Offers
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Track binding bids placed on farmer lots, review farmer responses, and proceed to digital escrow funding.
            </p>
          </div>

          <Link
            to="/buyer/lots"
            className="px-4 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center gap-1.5 shadow-md self-start md:self-auto"
          >
            <span>+ Place New Bid</span>
          </Link>
        </div>

        {/* 4 Summary Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-soil/10">
          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">TOTAL BIDS SUBMITTED</span>
            <p className="font-mono text-xl font-bold text-soil mt-0.5">{totalBids}</p>
          </div>

          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">PENDING RESPONSES</span>
            <p className="font-mono text-xl font-bold text-turmeric mt-0.5">{pendingBids}</p>
          </div>

          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">ACCEPTED DEALS</span>
            <p className="font-mono text-xl font-bold text-datateal mt-0.5">{acceptedDeals}</p>
          </div>

          <div className="bg-soil/5 rounded-2xl p-3 border border-soil/10">
            <span className="font-body text-[11px] text-soil/60 block">CAPITAL IN PLAY</span>
            <p className="font-mono text-xl font-bold text-soil mt-0.5">₹{totalCapitalCommitted.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-soil/10">
          {filterTabs.map((tab) => {
            const count =
              tab === 'All'
                ? myOffers.length
                : myOffers.filter(o => o.status === tab).length

            return (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3.5 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === tab
                    ? 'bg-monsoon text-wheat font-semibold shadow-sm'
                    : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterStatus === tab ? 'bg-turmeric text-monsoon font-bold' : 'bg-soil/10 text-soil/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* OFFERS LIST / GRID */}
      {filteredOffers.length === 0 ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
          <Tag className="w-12 h-12 text-soil/30 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-soil">No Offers Found in this Category</h3>
          <p className="font-body text-xs text-soil/60 max-w-sm mx-auto">
            Browse available farmer lots and place competitive bids to secure institutional harvest volumes.
          </p>
          <Link
            to="/buyer/lots"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all shadow-md"
          >
            Browse Farmer Lots
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredOffers.map((offer) => {
            const isAccepted = offer.status === 'Accepted'
            const isPending = offer.status === 'Pending'
            const isRejected = offer.status === 'Rejected'
            const isCountered = offer.status === 'Countered'

            return (
              <div
                key={offer.id}
                className={`bg-wheat rounded-3xl border p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isAccepted
                    ? 'border-datateal/60 bg-datateal/5'
                    : isPending
                    ? 'border-turmeric/50'
                    : 'border-soil/15'
                }`}
              >
                <div>
                  {/* Top Bar: Offer ID, Status, Timestamp */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-soil/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-soil/60">{offer.id}</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isAccepted
                              ? 'bg-datateal/20 text-soil border border-datateal/40'
                              : isPending
                              ? 'bg-turmeric/20 text-soil border border-turmeric/40'
                              : isCountered
                              ? 'bg-purple-500/20 text-purple-800'
                              : 'bg-red-500/10 text-red-700'
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-soil mt-1">{offer.lotTitle}</h3>
                      <span className="text-[11px] font-body text-soil/60 block">
                        Target Lot: {offer.lotId}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-base font-bold text-soil block">
                        ₹{offer.offeredPrice.toLocaleString('en-IN')}<span className="text-[10px] text-soil/60">/qtl</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-datateal">
                        ₹{offer.totalAmount.toLocaleString('en-IN')} Total
                      </span>
                    </div>
                  </div>

                  {/* Financial & Volume Comparison Pill */}
                  <div className="grid grid-cols-3 gap-2 py-3">
                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="text-[10px] text-soil/50 block">BID QUANTITY</span>
                      <span className="font-mono text-xs font-bold text-soil">{offer.quantityQtl} qtl</span>
                    </div>

                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="text-[10px] text-soil/50 block">YOUR BID</span>
                      <span className="font-mono text-xs font-bold text-turmeric">₹{offer.offeredPrice}/qtl</span>
                    </div>

                    <div className="bg-soil/5 rounded-xl p-2.5 border border-soil/10">
                      <span className="text-[10px] text-soil/50 block">FARMER TARGET</span>
                      <span className="font-mono text-xs font-bold text-soil/70">₹{offer.lotExpectedPrice}/qtl</span>
                    </div>
                  </div>

                  {/* Payment & Pickup Coordinates */}
                  <div className="space-y-1.5 text-xs font-body text-soil/80 pt-1">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-turmeric flex-shrink-0" />
                      <span className="truncate">{offer.paymentTerms}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-soil/60">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{offer.pickupLocation}</span>
                    </div>
                  </div>

                  {/* Counter offer note if farmer responded */}
                  {isCountered && offer.counterPrice && (
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-xs font-body text-purple-900">
                      <span className="font-bold">Farmer Counter Bid:</span> ₹{offer.counterPrice}/qtl (Awaiting your acceptance).
                    </div>
                  )}

                  {/* Accepted congratulations box */}
                  {isAccepted && (
                    <div className="p-3 bg-datateal/15 rounded-xl border border-datateal/30 text-xs font-body text-soil flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-datateal flex-shrink-0" />
                      <span>Farmer accepted your offer! Lot is locked in direct escrow.</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-soil/10 flex items-center justify-between gap-2">
                  <Link
                    to={`/buyer/lots/${offer.lotId}`}
                    className="px-3 py-1.5 rounded-xl bg-monsoon text-wheat font-body text-xs font-semibold hover:bg-monsoon/90 transition-colors flex items-center gap-1"
                  >
                    <span>Inspect Lot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => cancelBuyerOffer(offer.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-700 border border-red-500/20 hover:bg-red-500/20 transition-colors font-body text-xs font-semibold cursor-pointer"
                      >
                        Cancel Bid
                      </button>
                    )}

                    {isAccepted && (
                      <Link
                        to="/buyer/transactions"
                        className="px-3.5 py-1.5 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all shadow-xs"
                      >
                        Deposit to Escrow
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

