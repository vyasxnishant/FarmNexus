import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
  Award,
  MapPin,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Building2,
  PhoneCall
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { Button } from '../../ui/Button'
import { DemoDataBadge, LiveSignalBadge } from '../components/DemoDataBadge'

export function BuyerMatchesView() {
  const { buyerMatches, setIsListModalOpen, lang } = useDashboard()
  const [selectedTag, setSelectedTag] = useState<string>('All')

  const filterTags = ['All', 'Verified Buyer', 'Instant UPI', 'e-NAM Partner', 'ONDC Network', 'Farm-gate Pickup']

  const filteredBuyers = buyerMatches.filter(buyer => {
    if (selectedTag === 'All') return true
    return buyer.tags.includes(selectedTag)
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lang === 'en' ? 'Verified Buyer Network' : 'सत्यापित खरीदार नेटवर्क'}
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-soil">
              {lang === 'en' ? 'Buyer Matches & Direct Millers' : 'खरीदार मिलान व प्रत्यक्ष मिलर्स'}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1">
              {lang === 'en'
                ? 'Institutional procurement partners with verified escrow bank accounts & KYC authentication.'
                : 'सत्यापित एस्क्रो बैंक खाते व केवाईसी प्रमाणीकरण वाले संस्थागत खरीददार।'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LiveSignalBadge text="4 ACTIVE MATCHES" />
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-soil/10">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-monsoon text-wheat font-semibold shadow-sm'
                  : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Buyer Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredBuyers.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm hover:border-turmeric/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Buyer Name & Match % */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-soil font-serif text-xl font-semibold">
                    <span>{buyer.buyerName}</span>
                    {buyer.verified && (
                      <span title="KYC & Escrow Verified">
                        <ShieldCheck className="w-5 h-5 text-datateal" />
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-soil/60 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-soil/40" />
                    <span>{buyer.company}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-datateal bg-monsoon px-2.5 py-1 rounded-lg">
                    {buyer.matchPercentage}% MATCH
                  </span>
                  <p className="font-mono text-[11px] text-soil/60 mt-1">
                    ★ {buyer.reliabilityScore} ({buyer.tradesCompleted} deals)
                  </p>
                </div>
              </div>

              {/* Requirement Specs */}
              <div className="bg-soil/5 rounded-2xl p-4 my-4 space-y-2.5 font-body text-xs text-soil/80 border border-soil/10">
                <div className="flex justify-between">
                  <span className="text-soil/60">{lang === 'en' ? 'Target Crop:' : 'फसल:'}</span>
                  <span className="font-semibold text-soil">{buyer.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soil/60">{lang === 'en' ? 'Quality Requirement:' : 'गुणवत्ता आवश्यकता:'}</span>
                  <span className="font-medium text-turmeric">{buyer.requiredGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soil/60">{lang === 'en' ? 'Required Volume:' : 'आवश्यक मात्रा:'}</span>
                  <span className="font-mono font-semibold text-soil">{buyer.requiredQuantityQtl} Quintals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-soil/60">{lang === 'en' ? 'Offered Procurement Price:' : 'प्रस्तावित खरीद भाव:'}</span>
                  <span className="font-mono text-base font-bold text-datateal bg-monsoon px-2 py-0.5 rounded">
                    ₹{buyer.offeredPrice.toLocaleString('en-IN')}/qtl
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-soil/10">
                  <span className="text-soil/60">{lang === 'en' ? 'Delivery Point:' : 'डिलीवरी केंद्र:'}</span>
                  <span className="font-medium text-soil flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-turmeric" />
                    {buyer.deliveryLocation}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {buyer.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[10px] font-medium bg-soil/10 text-soil/80 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-soil/10">
              <Link to="/farmer/offers" className="flex-1">
                <Button variant="fill" size="md" className="w-full text-xs">
                  {lang === 'en' ? 'View Live Lot Offers' : 'ऑफ़र विवरण देखें'}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-monsoon text-wheat rounded-3xl border border-wheat/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-turmeric flex items-center justify-center text-monsoon flex-shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-wheat">
              {lang === 'en' ? 'Zero Middleman, 100% Escrow Guarantee' : 'शून्य बिचौलिया, 100% एस्क्रो गारंटी'}
            </h3>
            <p className="font-body text-xs text-wheat/70 mt-1 max-w-xl">
              {lang === 'en'
                ? 'Every deal on FarmNexus is backed by digital e-NWR warehouse escrow. Funds are locked before you dispatch your harvest.'
                : 'FarmNexus पर हर सौदा डिजिटल एस्क्रो द्वारा सुरक्षित है। माल भेजने से पहले खरीदार की राशि सुरक्षित कर ली जाती है।'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsListModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-wheat text-monsoon font-body font-semibold text-xs hover:bg-wheat/90 transition-colors whitespace-nowrap cursor-pointer"
        >
          {lang === 'en' ? 'List Produce to Match' : 'उपज जोड़ें'}
        </button>
      </div>
    </div>
  )
}
