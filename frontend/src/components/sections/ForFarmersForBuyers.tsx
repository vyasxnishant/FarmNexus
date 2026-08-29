import { useState } from 'react'
import { useSectionReveal } from '../../hooks/useSectionReveal'

interface ForFarmersForBuyersProps {
  lang: 'en' | 'hi'
}

interface Benefit {
  title: string
  titleHi: string
  detail: string
  detailHi: string
}

const farmerBenefits: Benefit[] = [
  {
    title: 'Real-time mandi prices before you sell',
    titleHi: 'बेचने से पहले रियल-टाइम मंडी भाव',
    detail: 'Know what your crop is worth across mandis in your district and beyond.',
    detailHi: 'जानें कि आपकी फसल आपके जिले और उससे आगे की मंडियों में कितनी मूल्यवान है।',
  },
  {
    title: 'Verified buyers, no middlemen',
    titleHi: 'सत्यापित खरीदार, कोई बिचौलिया नहीं',
    detail: 'Every buyer on FarmNexus is identity-verified and trade-rated.',
    detailHi: 'FarmNexus पर हर खरीदार पहचान-सत्यापित और व्यापार-रेटेड है।',
  },
  {
    title: 'Payments straight to your bank',
    titleHi: 'भुगतान सीधे आपके बैंक में',
    detail: 'UPI-powered transfers, tracked and timestamped on-chain.',
    detailHi: 'UPI-संचालित ट्रांसफर, ट्रैक और टाइमस्टैम्प किया हुआ।',
  },
  {
    title: 'Quality grading that increases your price',
    titleHi: 'गुणवत्ता ग्रेडिंग जो आपकी कीमत बढ़ाती है',
    detail: 'Standardized grading helps you command the price your produce deserves.',
    detailHi: 'मानकीकृत ग्रेडिंग आपको वह कीमत दिलाने में मदद करती है जो आपकी उपज की हकदार है।',
  },
]

const buyerBenefits: Benefit[] = [
  {
    title: 'Source directly from farms and FPOs',
    titleHi: 'सीधे खेतों और FPOs से सोर्स करें',
    detail: 'Cut procurement costs by buying directly from the source.',
    detailHi: 'सीधे स्रोत से खरीदकर प्रोक्योरमेंट लागत कम करें।',
  },
  {
    title: 'Quality-graded produce, every lot',
    titleHi: 'गुणवत्ता-ग्रेडेड उपज, हर लॉट',
    detail: 'Consistent grading standards mean fewer surprises at delivery.',
    detailHi: 'सुसंगत ग्रेडिंग मानकों का मतलब है डिलीवरी पर कम आश्चर्य।',
  },
  {
    title: 'Transparent pricing, no hidden markups',
    titleHi: 'पारदर्शी मूल्य निर्धारण, कोई छिपा मार्कअप नहीं',
    detail: 'See exactly what you are paying and why, benchmarked to mandi rates.',
    detailHi: 'देखें कि आप क्या भुगतान कर रहे हैं और क्यों, मंडी दरों से बेंचमार्क।',
  },
  {
    title: 'End-to-end logistics support',
    titleHi: 'एंड-टू-एंड लॉजिस्टिक्स सपोर्ट',
    detail: 'From farm gate to warehouse — we handle the last mile.',
    detailHi: 'खेत के गेट से गोदाम तक — हम लास्ट माइल संभालते हैं।',
  },
]

function BenefitItem({ benefit, lang, theme }: { benefit: Benefit; lang: 'en' | 'hi'; theme: 'light' | 'dark' }) {
  const [hovered, setHovered] = useState(false)

  const textColor = theme === 'light' ? 'text-soil' : 'text-wheat'
  const detailColor = theme === 'light' ? 'text-soil/60' : 'text-wheat/60'
  const borderColor = theme === 'light' ? 'border-soil/10' : 'border-wheat/10'

  return (
    <div
      className={`py-4 border-b ${borderColor} cursor-default`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="listitem"
    >
      <p className={`font-body font-medium ${textColor}`}>
        {lang === 'en' ? benefit.title : benefit.titleHi}
      </p>
      <p className={`font-body text-sm ${detailColor} transition-all duration-300 overflow-hidden ${
        hovered ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'
      }`}>
        {lang === 'en' ? benefit.detail : benefit.detailHi}
      </p>
    </div>
  )
}

export function ForFarmersForBuyers({ lang }: ForFarmersForBuyersProps) {
  const sectionRef = useSectionReveal<HTMLDivElement>()

  return (
    <section ref={sectionRef} className="relative">
      <div className="grid md:grid-cols-2">
        {/* Farmers column — light, taller */}
        <div className="bg-wheat px-6 md:px-12 py-20 md:py-28">
          <span className="font-mono text-xs text-turmeric uppercase tracking-widest mb-4 block">
            {lang === 'en' ? 'For Farmers & FPOs' : 'किसानों और FPOs के लिए'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-soil mb-8">
            {lang === 'en' ? 'Sell smarter, earn more' : 'समझदारी से बेचें, ज़्यादा कमाएं'}
          </h2>
          <div role="list">
            {farmerBenefits.map((b, i) => (
              <BenefitItem key={i} benefit={b} lang={lang} theme="light" />
            ))}
          </div>
        </div>

        {/* Buyers column — dark, slightly different padding to avoid mirrored look */}
        <div className="bg-monsoon px-6 md:px-12 py-16 md:py-24">
          <span className="font-mono text-xs text-turmeric uppercase tracking-widest mb-4 block">
            {lang === 'en' ? 'For Buyers' : 'खरीदारों के लिए'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-wheat mb-8">
            {lang === 'en' ? 'Source with confidence' : 'भरोसे के साथ सोर्स करें'}
          </h2>
          <div role="list">
            {buyerBenefits.map((b, i) => (
              <BenefitItem key={i} benefit={b} lang={lang} theme="dark" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
