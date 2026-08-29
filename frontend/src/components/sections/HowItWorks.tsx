import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Sprout,
  Users,
  Receipt,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Check
} from 'lucide-react'
import { steps } from '../../data/steps'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface HowItWorksProps {
  lang: 'en' | 'hi'
}

const stepVisuals = [
  {
    icon: Sprout,
    badgeEn: 'Produce Intake',
    badgeHi: 'उपज पंजीकरण',
    taglineEn: 'Standardized lot specs & farmer-provided quality metrics in 60s.',
    taglineHi: '60 सेकंड में मानकीकृत लॉट विवरण व गुणवत्ता जानकारी।',
    highlightsEn: ['Self-declared quality grade', 'Target & floor price locks', 'Godown pickup coordinates'],
    highlightsHi: ['स्व-घोषित गुणवत्ता ग्रेड', 'न्यूनतम व अपेक्षित भाव', 'गोदाम पिकअप का पता'],
  },
  {
    icon: Users,
    badgeEn: 'Algorithmic Matching',
    badgeHi: 'सत्यापित मिलान',
    taglineEn: 'Direct broadcasting to verified millers, FPOs, and corporate buyers.',
    taglineHi: 'सत्यापित मिल मालिकों व संस्थागत खरीदारों से सीधा मिलान।',
    highlightsEn: ['Instant demand matching', 'Verified buyer credit scores', 'Zero intermediate broker cuts'],
    highlightsHi: ['तत्काल मांग मिलान', 'क्रेडिट-सत्यापित खरीदार', 'शून्य बिचौलिया कटौती'],
  },
  {
    icon: Receipt,
    badgeEn: 'Transparent Bidding',
    badgeHi: 'पारदर्शी सौदे',
    taglineEn: 'Compare competitive bids side-by-side with locked digital escrow.',
    taglineHi: 'सुरक्षित एस्क्रो के साथ कई बोलियों की साथ-साथ तुलना करें।',
    highlightsEn: ['Side-by-side offer comparison', 'Direct counter-offer engine', '100% price transparency'],
    highlightsHi: ['पारदर्शी ऑफ़र तुलना', 'डिजिटल काउंटर ऑफ़र', '100% मूल्य पारदर्शिता'],
  },
  {
    icon: Truck,
    badgeEn: 'Smart Logistics',
    badgeHi: 'स्मार्ट लॉजिस्टिक्स',
    taglineEn: 'Coordinated farm-gate transport & weighment verification.',
    taglineHi: 'खेत से सीधे पिकअप व वजन सत्यापन की सुविधा।',
    highlightsEn: ['Farm-gate scheduled pickup', 'Standardized digital weighment', 'Transit status visibility'],
    highlightsHi: ['खेत से तयशुदा पिकअप', 'डिजिटल वजन पर्ची', 'पारगमन स्थिति ट्रैकिंग'],
  },
  {
    icon: ShieldCheck,
    badgeEn: 'Guaranteed Settlement',
    badgeHi: 'सुरक्षित भुगतान',
    taglineEn: 'Instant UPI & bank credit directly upon weighment confirmation.',
    taglineHi: 'वजन पुष्टि होते ही सीधे बैंक खाते में तत्काल UPI भुगतान।',
    highlightsEn: ['Direct bank UPI credit', 'Zero gate deduction loss', 'Real-time payout tracking'],
    highlightsHi: ['सीधा बैंक ट्रांसफर', 'शून्य मंडी गेट कटौती', 'रियल-टाइम भुगतान रसीद'],
  },
]

export function HowItWorks({ lang }: HowItWorksProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinTargetRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState<number>(0)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    const pinTarget = pinTargetRef.current
    if (!container || !pinTarget || reducedMotion) return

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=2400',
      pin: pinTarget,
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress
        setScrollProgress(p)
        const step = Math.min(steps.length - 1, Math.floor(p * steps.length))
        setActiveStepIndex(step)
      },
    })

    return () => {
      trigger.kill()
    }
  }, [reducedMotion])

  // Continuous position inside the 5-step spectrum (0 to 4)
  const currentFractionalStep = scrollProgress * (steps.length - 1)

  return (
    <section ref={containerRef} className="relative bg-monsoon min-h-screen text-wheat">
      {/* Background Scrim for high contrast */}
      <div className="absolute inset-0 bg-monsoon/85" />

      {/* Pinned Viewport Container */}
      <div
        ref={pinTargetRef}
        className="relative z-10 min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-6 py-16"
      >
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-wheat/5 border border-wheat/10 px-3 py-1 rounded-full inline-block mb-3">
            {lang === 'en' ? 'The FarmNexus Workflow' : 'FarmNexus कार्यप्रणाली'}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-wheat">
            {lang === 'en' ? 'How it works' : 'यह कैसे काम करता है'}
          </h2>
          <p className="font-body text-xs md:text-sm text-wheat/60 max-w-lg mx-auto mt-2">
            {lang === 'en'
              ? 'A transparent 5-step digital rail from produce listing to instant bank settlement.'
              : 'फसल लिस्टिंग से लेकर त्वरित बैंक भुगतान तक 5-चरणीय पारदर्शी डिजिटल व्यवस्था।'}
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 cols): Step Rail & Progress Line */}
          <div className="md:col-span-5 relative space-y-6">
            {/* Vertical Background Track Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-wheat/15" />

            {/* Active Scrubbing Progress Line */}
            <div
              className="absolute left-[19px] top-4 w-0.5 bg-turmeric shadow-[0_0_10px_#E4A335] transition-all duration-75"
              style={{
                height: `${Math.min(100, Math.max(4, scrollProgress * 100))}%`,
              }}
            />

            {/* 5 Interactive Step Items */}
            {steps.map((step, idx) => {
              const isActive = idx === activeStepIndex
              const isPast = idx < activeStepIndex

              return (
                <div
                  key={step.number}
                  className={`relative flex items-start gap-4 transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-x-1' : isPast ? 'opacity-70' : 'opacity-30'
                  }`}
                >
                  {/* Step Number Circle Indicator */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-turmeric text-monsoon ring-4 ring-turmeric/30 scale-110 shadow-lg'
                        : isPast
                        ? 'bg-datateal text-monsoon font-semibold'
                        : 'bg-monsoon border-2 border-wheat/30 text-wheat/50'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                  </div>

                  {/* Title & Micro description */}
                  <div className="pt-1">
                    <h3
                      className={`font-serif text-lg md:text-xl font-semibold transition-colors duration-300 ${
                        isActive ? 'text-turmeric' : 'text-wheat'
                      }`}
                    >
                      {lang === 'en' ? step.title : step.titleHi}
                    </h3>
                    <p
                      className={`font-body text-xs text-wheat/70 transition-all duration-300 mt-0.5 ${
                        isActive ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden md:max-h-20 md:opacity-40'
                      }`}
                    >
                      {lang === 'en' ? step.description : step.descriptionHi}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column (7 cols): Smooth Morphing Step Cards */}
          <div className="md:col-span-7 relative h-[380px] md:h-[420px] flex items-center justify-center">
            {steps.map((step, idx) => {
              // Continuous distance delta from active progress
              const delta = currentFractionalStep - idx
              const isActive = Math.abs(delta) < 0.6

              // Calculate continuous transform and opacity
              const opacity = Math.max(0, Math.min(1, 1 - Math.abs(delta) * 1.4))
              const translateY = delta * -35 // Previous floats up, next floats in from bottom
              const scale = 1 - Math.min(0.15, Math.abs(delta) * 0.08)

              const visual = stepVisuals[idx] || stepVisuals[0]
              const IconComponent = visual.icon

              return (
                <div
                  key={step.number}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-150"
                  style={{
                    opacity: reducedMotion ? (isActive ? 1 : 0) : opacity,
                    transform: reducedMotion
                      ? 'none'
                      : `translateY(${translateY}px) scale(${scale})`,
                    zIndex: isActive ? 20 : 10,
                  }}
                >
                  <div className="w-full bg-wheat/10 backdrop-blur-md border border-wheat/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-wheat">
                    {/* Oversized Background Watermark Numeral */}
                    <span
                      className="absolute -right-4 -bottom-6 font-mono text-[140px] md:text-[180px] font-bold text-wheat/5 select-none pointer-events-none leading-none"
                      aria-hidden="true"
                    >
                      0{step.number}
                    </span>

                    {/* Top Row: Icon & Tag Badge */}
                    <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-wheat/10">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-turmeric text-monsoon rounded-2xl shadow-md">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-mono text-[11px] font-bold text-turmeric uppercase tracking-wider block">
                            STEP 0{step.number} OF 05
                          </span>
                          <h4 className="font-serif text-2xl font-bold text-wheat mt-0.5">
                            {lang === 'en' ? step.title : step.titleHi}
                          </h4>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-datateal/20 border border-datateal/40 text-datateal">
                        {lang === 'en' ? visual.badgeEn : visual.badgeHi}
                      </span>
                    </div>

                    {/* Tagline / Core Message */}
                    <div className="relative z-10 mt-5">
                      <p className="font-body text-sm md:text-base text-wheat/90 leading-relaxed font-medium">
                        {lang === 'en' ? visual.taglineEn : visual.taglineHi}
                      </p>
                    </div>

                    {/* 3 Bullet Feature Highlights */}
                    <div className="relative z-10 mt-6 pt-5 border-t border-wheat/10 space-y-2.5">
                      {(lang === 'en' ? visual.highlightsEn : visual.highlightsHi).map((item, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2.5 text-xs font-body text-wheat/80">
                          <CheckCircle2 className="w-4 h-4 text-datateal flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Progress Tracker Footer */}
                    <div className="relative z-10 mt-6 pt-4 border-t border-wheat/10 flex items-center justify-between text-xs font-mono text-wheat/50">
                      <span>FarmNexus Protocol</span>
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2, 3, 4].map((dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              dotIdx === idx
                                ? 'w-6 bg-turmeric shadow-[0_0_8px_#E4A335]'
                                : dotIdx < idx
                                ? 'w-2 bg-datateal'
                                : 'w-2 bg-wheat/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
