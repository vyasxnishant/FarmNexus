import { useState, type FormEvent, useId } from 'react'
import { X, Handshake, CheckCircle2, TrendingUp } from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { Button } from '../../ui/Button'

export function CounterOfferModal() {
  const { counterModalOffer, setCounterModalOffer, counterOffer, lang } = useDashboard()
  const counterPriceFieldId = useId()
  const [counterPrice, setCounterPrice] = useState(
    counterModalOffer ? Math.round(counterModalOffer.offeredPrice * 1.03) : 2800
  )
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!counterModalOffer) return null

  const originalTotal = counterModalOffer.offeredPrice * counterModalOffer.quantityQtl
  const counterTotal = counterPrice * counterModalOffer.quantityQtl
  const difference = counterTotal - originalTotal

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    counterOffer(counterModalOffer.id, counterPrice)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setCounterModalOffer(null)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-monsoon/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-wheat rounded-3xl border border-soil/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-monsoon px-6 py-5 flex items-center justify-between text-wheat border-b border-wheat/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-turmeric/20 text-turmeric flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-wheat">
                {lang === 'en' ? 'Make a Counter Offer' : 'काउंटर ऑफ़र भेजें'}
              </h3>
              <p className="font-body text-xs text-wheat/60">{counterModalOffer.buyerCompany}</p>
            </div>
          </div>
          <button
            onClick={() => setCounterModalOffer(null)}
            className="text-wheat/60 hover:text-wheat p-1.5 rounded-lg hover:bg-wheat/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-datateal/20 text-datateal flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-xl font-semibold text-soil">
              {lang === 'en' ? 'Counter Offer Sent!' : 'काउंटर ऑफ़र भेज दिया गया!'}
            </h4>
            <p className="font-body text-xs text-soil/70">
              {lang === 'en'
                ? `Offered ₹${counterPrice}/qtl for ${counterModalOffer.quantityQtl} qtl. Buyer notified via SMS and portal.`
                : `खरीदार को ₹${counterPrice}/क्विंटल का प्रस्ताव भेजा गया।`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Offer Summary */}
            <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10 space-y-2 font-body text-xs text-soil/80">
              <div className="flex justify-between">
                <span className="text-soil/60">{lang === 'en' ? 'Lot Item:' : 'लॉट:'}</span>
                <span className="font-semibold text-soil">{counterModalOffer.lotTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soil/60">{lang === 'en' ? 'Buyer Offer Price:' : 'खरीदार का ऑफ़र भाव:'}</span>
                <span className="font-mono font-bold text-soil">₹{counterModalOffer.offeredPrice}/qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soil/60">{lang === 'en' ? 'Your Expected Price:' : 'आपका अपेक्षित मूल्य:'}</span>
                <span className="font-mono text-soil">₹{counterModalOffer.lotExpectedPrice}/qtl</span>
              </div>
            </div>

            {/* Input Counter Price */}
            <div>
              <label htmlFor={counterPriceFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                {lang === 'en' ? 'Your Counter Price (₹/quintal)' : 'आपका नया प्रस्तावित मूल्य (₹/क्विंटल)'} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 font-mono text-soil/60 text-base">₹</span>
                <input
                  id={counterPriceFieldId}
                  type="number"
                  min={counterModalOffer.offeredPrice}
                  max={10000}
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full bg-wheat border-2 border-turmeric/60 rounded-xl pl-8 pr-4 py-2.5 font-mono text-soil text-lg font-bold focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                  required
                />
              </div>
            </div>

            {/* Price Delta calculation */}
            <div className="bg-monsoon text-wheat rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body text-xs text-wheat/60">{lang === 'en' ? 'Net Impact' : 'कुल प्रभाव'}</p>
                <p className="font-mono text-sm text-wheat font-bold">
                  ₹{counterTotal.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-wheat/60">
                    ({counterModalOffer.quantityQtl} qtl)
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-datateal font-mono text-xs font-semibold bg-datateal/10 border border-datateal/20 px-2.5 py-1 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                <span>+₹{difference.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Note to Buyer */}
            <div>
              <label className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                {lang === 'en' ? 'Reason / Condition (Optional)' : 'टिप्पणी या शर्त (वैकल्पिक)'}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Export quality assayed batch, moisture under 10%"
                className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-body text-soil text-xs focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCounterModalOffer(null)}
                className="px-4 py-2.5 rounded-xl font-body text-xs text-soil/70 hover:bg-soil/5 border border-soil/20 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <Button type="submit" variant="fill" size="md">
                {lang === 'en' ? 'Submit Counter Offer' : 'काउंटर ऑफ़र भेजें'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

