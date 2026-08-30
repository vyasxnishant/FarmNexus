import { useState, type FormEvent, useId } from 'react'
import { X, Sprout, CheckCircle2, Sparkles } from 'lucide-react'
import { useDashboard, type CropType, type QualityGrade } from '../../../context/DashboardContext'
import { Button } from '../../ui/Button'
import { LocationSelector } from '../../ui/LocationSelector'

export function ListProduceModal() {
  const { isListModalOpen, setIsListModalOpen, addLot, lang } = useDashboard()
  const cropFieldId = useId()
  const varietyFieldId = useId()
  const quantityFieldId = useId()
  const expectedPriceFieldId = useId()
  const gradeFieldId = useId()
  const moistureFieldId = useId()
  const harvestDateFieldId = useId()
  const locationFieldId = useId()

  const [crop, setCrop] = useState<CropType>('Wheat (Sharbati)')
  const [variety, setVariety] = useState('Sharbati C-306 Special')
  const [quantityQtl, setQuantityQtl] = useState(120)
  const [grade, setGrade] = useState<QualityGrade>('Grade A (Export)')
  const [expectedPrice, setExpectedPrice] = useState(2780)
  const [moisturePercent, setMoisturePercent] = useState(10.5)
  const [harvestDate, setHarvestDate] = useState('2026-05-15')
  const [stateName, setStateName] = useState('Madhya Pradesh')
  const [district, setDistrict] = useState('Harda')
  const [location, setLocation] = useState('Sirali Godown #2, Harda')
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isListModalOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await addLot({
      crop,
      cropHi: crop === 'Wheat (Sharbati)' ? 'गेहूं (शरबती)' : crop === 'Soybean' ? 'सोयाबीन' : crop === 'Basmati Rice' ? 'बासमती चावल' : 'चना',
      variety,
      quantityQtl,
      unit: 'Quintal',
      grade,
      expectedPrice,
      moisturePercent,
      harvestDate,
      state: stateName,
      district,
      location: location || `${district}, ${stateName}`,
      status: 'Active',
    })
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setIsListModalOpen(false)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-monsoon/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-wheat rounded-3xl border border-soil/20 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="bg-monsoon px-6 py-5 flex items-center justify-between text-wheat border-b border-wheat/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-turmeric/20 text-turmeric flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-wheat">
                {lang === 'en' ? 'List Your Produce' : 'अपनी उपज सूचीबद्ध करें'}
              </h3>
              <p className="font-body text-xs text-wheat/60">
                {lang === 'en'
                  ? 'Connect with verified institutional buyers across India'
                  : 'अखिल भारतीय स्तर पर सत्यापित खरीदारों से जुड़ें'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsListModalOpen(false)}
            className="text-wheat/60 hover:text-wheat p-1.5 rounded-lg hover:bg-wheat/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-datateal/20 text-datateal flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-serif text-2xl font-semibold text-soil">
              {lang === 'en' ? 'Produce Listed on FarmNexus!' : 'उपज सफलतापूर्वक सूचीबद्ध!'}
            </h4>
            <p className="font-body text-sm text-soil/70 max-w-md">
              {lang === 'en'
                ? `Your lot of ${quantityQtl} qtl ${crop} is now broadcasted to verified millers and exporters.`
                : `${quantityQtl} क्विंटल ${crop} का आपका लॉट अब खरीदारों को लाइव दिखाई दे रहा है।`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Crop Type */}
              <div>
                <label htmlFor={cropFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Commodity / Crop' : 'फसल / कमोडिटी'} *
                </label>
                <select
                  id={cropFieldId}
                  value={crop}
                  onChange={(e) => {
                    const c = e.target.value as CropType
                    setCrop(c)
                    if (c.includes('Wheat')) setExpectedPrice(2780)
                    else if (c.includes('Soybean')) setExpectedPrice(5020)
                    else if (c.includes('Rice')) setExpectedPrice(4300)
                    else if (c.includes('Chana')) setExpectedPrice(5850)
                  }}
                  className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-body text-soil text-sm focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                  required
                >
                  <option value="Wheat (Sharbati)">Wheat (Sharbati) / गेहूं (शरबती)</option>
                  <option value="Soybean">Soybean / सोयाबीन</option>
                  <option value="Basmati Rice">Basmati Rice / बासमती धान</option>
                  <option value="Chana (Gram)">Chana (Gram) / चना</option>
                  <option value="Mustard">Mustard / सरसों</option>
                  <option value="Maize">Maize / मक्का</option>
                </select>
              </div>

              {/* Variety */}
              <div>
                <label htmlFor={varietyFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Variety / Cultivar' : 'किस्म'} *
                </label>
                <input
                  id={varietyFieldId}
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. C-306 Sharbati Golden"
                  className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-body text-soil text-sm focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor={quantityFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Total Quantity (Quintals)' : 'कुल मात्रा (क्विंटल)'} *
                </label>
                <input
                  id={quantityFieldId}
                  type="number"
                  min="5"
                  max="5000"
                  value={quantityQtl}
                  onChange={(e) => setQuantityQtl(Number(e.target.value))}
                  className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-mono text-soil text-sm font-semibold focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                  required
                />
              </div>

              {/* Quality Grade */}
              <div>
                <label htmlFor={gradeFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Assayed Quality Grade' : 'गुणवत्ता ग्रेड'} *
                </label>
                <select
                  id={gradeFieldId}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as QualityGrade)}
                  className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-body text-soil text-sm focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                >
                  <option value="Grade A (Export)">Grade A (Export Quality / Bold Grain)</option>
                  <option value="Grade A">Grade A (Standard Premium)</option>
                  <option value="Grade B">Grade B (Commercial Mill Grade)</option>
                  <option value="Grade C">Grade C (Standard Feed / Industrial)</option>
                </select>
              </div>

              {/* Expected Price */}
              <div>
                <label htmlFor={expectedPriceFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Expected Minimum Price (₹/qtl)' : 'अपेक्षित न्यूनतम मूल्य (₹/क्विंटल)'} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono text-soil/60 text-sm">₹</span>
                  <input
                    id={expectedPriceFieldId}
                    type="number"
                    min="500"
                    max="20000"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    className="w-full bg-wheat border border-soil/25 rounded-xl pl-8 pr-4 py-2.5 font-mono text-soil text-sm font-bold focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Moisture */}
              <div>
                <label htmlFor={moistureFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Moisture Level (%)' : 'नमी प्रतिशत (%)'}
                </label>
                <input
                  id={moistureFieldId}
                  type="number"
                  step="0.1"
                  min="5"
                  max="25"
                  value={moisturePercent}
                  onChange={(e) => setMoisturePercent(Number(e.target.value))}
                  className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-mono text-soil text-sm focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                />
              </div>

              {/* Harvest Date */}
              <div>
                <label htmlFor={harvestDateFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Harvest Date' : 'कटाई की तारीख'}
                </label>
                <input
                  id={harvestDateFieldId}
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-body text-soil text-sm focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                />
              </div>

              {/* Specific Storage / Godown Landmark */}
              <div>
                <label htmlFor={locationFieldId} className="block font-body text-xs font-semibold text-soil/80 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Godown / Pickup Landmark' : 'गोदाम / पिकअप स्थान'} *
                </label>
                <input
                  id={locationFieldId}
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Godown #2, Highway Gate"
                  className="w-full bg-wheat border border-soil/25 rounded-xl px-4 py-2.5 font-body text-soil text-sm focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                  required
                />
              </div>
            </div>

            {/* Dynamic State & District Selector */}
            <LocationSelector
              selectedState={stateName}
              selectedDistrict={district}
              onStateChange={(s) => { setStateName(s); setDistrict(''); }}
              onDistrictChange={(d) => setDistrict(d)}
              required
            />

            {/* Smart Match Estimate Banner */}
            <div className="bg-monsoon text-wheat rounded-2xl p-4 flex items-center justify-between border border-wheat/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-datateal" />
                <div>
                  <p className="font-body text-xs text-wheat font-medium">
                    {lang === 'en' ? 'Instant AI Buyer Matching' : 'त्वरित खरीदार मिलान'}
                  </p>
                  <p className="font-body text-[11px] text-wheat/60">
                    {lang === 'en'
                      ? 'Based on your grade and price, ~4 verified buyers match in Harda/Indore.'
                      : 'आपके ग्रेड और मूल्य के आधार पर ~4 सत्यापित खरीदार तुरंत उपलब्ध हैं।'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-datateal text-sm font-bold">
                ₹{(quantityQtl * expectedPrice).toLocaleString('en-IN')} Est.
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-body text-sm text-soil/70 hover:bg-soil/5 border border-soil/20 transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <Button type="submit" variant="fill" size="md">
                {lang === 'en' ? 'Publish Produce Lot' : 'लॉट प्रकाशित करें'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

