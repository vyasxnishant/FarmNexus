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
  AlertCircle
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { Button } from '../../ui/Button'
import { DemoDataBadge, LiveSignalBadge } from '../components/DemoDataBadge'

export function OffersView() {
  const { offers, lots, acceptOffer, rejectOffer, setCounterModalOffer, currentUser, lang } = useDashboard()
  const [filterStatus, setFilterStatus] = useState<string>('All')

  const filterTabs = ['All', 'Pending', 'Accepted', 'Countered', 'Rejected']

  // Filter offers received by authenticated farmer (matching farmer ID or owned lot IDs)
  const myFarmerLots = lots.filter(l => currentUser ? (currentUser.user_type === 'ADMIN' || l.farmerId === currentUser.id) : false)
  const myLotIdSet = new Set(myFarmerLots.map(l => l.id))

  const receivedOffers = offers.filter(offer => {
    if (!currentUser) return false
    if (currentUser.user_type === 'ADMIN') return true
    return offer.farmerId === currentUser.id || myLotIdSet.has(offer.lotId)
  })

  const filteredOffers = receivedOffers.filter(offer => {
    if (filterStatus === 'All') return true
    return offer.status === filterStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lang === 'en' ? 'Direct Deal Desk' : 'डील डेस्क'}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-soil">
              {lang === 'en' ? 'Incoming Buyer Offers' : 'प्राप्त खरीदार ऑफ़र'}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1">
              {lang === 'en'
                ? 'Review binding bids from verified millers & institutional buyers. Accept, reject, or negotiate.'
                : 'सत्यापित मिलर्स और संस्थागत खरीदारों की बोलियां देखें। स्वीकार करें या नया काउंटर भाव दें।'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LiveSignalBadge text={`${receivedOffers.filter(o => o.status === 'Pending').length} PENDING BIDS`} />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-soil/10">
          {filterTabs.map((tab) => {
            const count = tab === 'All' ? receivedOffers.length : receivedOffers.filter(o => o.status === tab).length
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
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterStatus === tab ? 'bg-turmeric text-monsoon' : 'bg-soil/10 text-soil/60'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center">
          <Tag className="w-12 h-12 text-soil/30 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-semibold text-soil">
            {lang === 'en' ? 'No Offers in this Category' : 'इस श्रेणी में कोई ऑफ़र नहीं है'}
          </h3>
          <p className="font-body text-xs text-soil/60 max-w-sm mx-auto mt-1 mb-6">
            {lang === 'en'
              ? 'Active offers appear as buyers review your published crop lots.'
              : 'खरीदार द्वारा बोली लगाने पर ऑफ़र यहाँ दिखाई देंगे।'}
          </p>
          <Link to="/farmer/lots">
            <Button variant="fill" size="md">
              {lang === 'en' ? 'Check My Lots' : 'मेरे लॉट देखें'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOffers.map((offer) => {
            const diff = offer.offeredPrice - offer.lotExpectedPrice

            return (
              <div
                key={offer.id}
                className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm hover:border-soil/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-soil/10">
                  {/* Left info */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold text-soil/50">{offer.id}</span>
                      <span
                        className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          offer.status === 'Pending'
                            ? 'bg-turmeric/20 text-soil border border-turmeric/40'
                            : offer.status === 'Accepted'
                            ? 'bg-datateal/20 text-soil border border-datateal/40'
                            : offer.status === 'Countered'
                            ? 'bg-monsoon text-wheat'
                            : 'bg-red-500/10 text-red-800'
                        }`}
                      >
                        {offer.status}
                      </span>
                      {offer.status === 'Pending' && (
                        <span className="font-body text-[11px] text-soil/60 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-turmeric" />
                          {lang === 'en' ? `Expires in ${offer.expiresInHours} hours` : `${offer.expiresInHours} घंटे शेष`}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-2xl font-semibold text-soil">{offer.lotTitle}</h3>

                    <div className="flex flex-wrap items-center gap-3 mt-1 font-body text-xs text-soil/80">
                      <span className="font-semibold text-soil flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-soil/50" />
                        {offer.buyerName}
                      </span>
                      <span className="text-soil/30">•</span>
                      <span className="text-soil/60">{offer.buyerCompany}</span>
                      <span className="font-mono text-xs bg-soil/10 text-soil px-2 py-0.5 rounded">
                        ★ {offer.buyerReliability} Reliability
                      </span>
                    </div>
                  </div>

                  {/* Right Pricing */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline lg:flex-col lg:items-end gap-2 bg-monsoon text-wheat p-4 md:p-5 rounded-2xl border border-wheat/10">
                    <div className="flex items-baseline gap-2">
                      <span className="font-body text-xs text-wheat/60">{lang === 'en' ? 'Offered Bid:' : 'प्रस्तावित भाव:'}</span>
                      <span className="font-mono text-3xl font-bold text-datateal">
                        ₹{offer.offeredPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="font-body text-xs text-wheat/50">/qtl</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-wheat/60">
                        {lang === 'en' ? 'Expected:' : 'अपेक्षित:'} ₹{offer.lotExpectedPrice}/qtl
                      </span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded ${
                          diff >= 0 ? 'bg-datateal/20 text-datateal' : 'bg-turmeric/20 text-turmeric'
                        }`}
                      >
                        {diff >= 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                      </span>
                    </div>

                    <div className="font-mono text-sm text-wheat/90 font-semibold pt-1 border-t border-wheat/10 mt-1 w-full text-right">
                      {lang === 'en' ? 'Total Deal Value:' : 'कुल सौदा राशि:'}{' '}
                      <span className="text-datateal font-bold">₹{offer.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Offer Details Row */}
                <div className="grid md:grid-cols-2 gap-4 py-4 font-body text-xs text-soil/80">
                  <div className="flex items-start gap-2 bg-soil/5 p-3 rounded-xl">
                    <CreditCard className="w-4 h-4 text-turmeric flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-soil block">{lang === 'en' ? 'Payment Terms' : 'भुगतान शर्तें'}</span>
                      <span className="text-soil/70 text-[11px]">{offer.paymentTerms}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-soil/5 p-3 rounded-xl">
                    <MapPin className="w-4 h-4 text-turmeric flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-soil block">{lang === 'en' ? 'Logistics & Collection' : 'परिवहन व पिकअप'}</span>
                      <span className="text-soil/70 text-[11px]">{offer.pickupLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Offer Countered Notice */}
                {offer.status === 'Countered' && offer.counterPrice && (
                  <div className="bg-turmeric/10 border border-turmeric/30 rounded-2xl p-4 mb-4 flex items-center justify-between font-body text-xs text-soil">
                    <div className="flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-turmeric" />
                      <span>
                        {lang === 'en'
                          ? `You submitted a counter offer of ₹${offer.counterPrice}/qtl (Total: ₹${(offer.counterPrice * offer.quantityQtl).toLocaleString('en-IN')}). Waiting for buyer confirmation.`
                          : `आपने ₹${offer.counterPrice}/क्विंटल का काउंटर ऑफ़र भेजा है।`}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-turmeric text-xs">Awaiting Reply</span>
                  </div>
                )}

                {/* Action Buttons */}
                {offer.status === 'Pending' && (
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-soil/10">
                    <button
                      onClick={() => rejectOffer(offer.id)}
                      className="px-4 py-2.5 rounded-xl font-body text-xs font-semibold text-soil/70 hover:bg-soil/10 border border-soil/20 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-soil/50" />
                      {lang === 'en' ? 'Decline' : 'अस्वीकार करें'}
                    </button>

                    <button
                      onClick={() => setCounterModalOffer(offer)}
                      className="px-5 py-2.5 rounded-xl font-body text-xs font-semibold bg-soil/10 text-soil hover:bg-soil/15 border border-soil/20 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Handshake className="w-4 h-4 text-turmeric" />
                      {lang === 'en' ? 'Make Counter Offer' : 'काउंटर ऑफ़र दें'}
                    </button>

                    <Button
                      variant="fill"
                      size="md"
                      onClick={() => acceptOffer(offer.id)}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === 'en' ? 'Accept & Lock Deal' : 'स्वीकारें व सौदा लॉक करें'}
                    </Button>
                  </div>
                )}

                {offer.status === 'Accepted' && (
                  <div className="flex items-center justify-between pt-4 border-t border-soil/10">
                    <span className="font-body text-xs text-datateal font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === 'en' ? 'Deal Accepted! Funds locked in escrow.' : 'सौदा स्वीकृत! राशि एस्क्रो में सुरक्षित।'}
                    </span>
                    <Link to="/farmer/transactions" className="font-body text-xs text-turmeric font-semibold hover:underline flex items-center gap-1">
                      {lang === 'en' ? 'View Contract & Track Escrow →' : 'अनुबंध देखें व एस्क्रो ट्रैक करें →'}
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

