import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cropPrices } from '../../data/prices'
import { Sparkline } from '../ui/Sparkline'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface LivePricePreviewProps {
  lang: 'en' | 'hi'
}

export function LivePricePreview({ lang }: LivePricePreviewProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [displayPrices, setDisplayPrices] = useState<number[]>(cropPrices.map(() => 0))
  const [hasAnimated, setHasAnimated] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    if (reducedMotion) {
      setDisplayPrices(cropPrices.map(c => c.price))
      setHasAnimated(true)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      onEnter: () => {
        if (hasAnimated) return
        setHasAnimated(true)

        cropPrices.forEach((crop, index) => {
          const obj = { value: 0 }
          gsap.to(obj, {
            value: crop.price,
            duration: 1.5,
            delay: index * 0.2,
            ease: 'power2.out',
            onUpdate: () => {
              setDisplayPrices(prev => {
                const next = [...prev]
                next[index] = Math.round(obj.value)
                return next
              })
            },
          })
        })
      },
      once: true,
    })

    return () => {
      trigger.kill()
    }
  }, [reducedMotion, hasAnimated])

  return (
    <section ref={sectionRef} className="relative bg-monsoon py-24 md:py-32">
      <div className="absolute inset-0 bg-monsoon/80" />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl text-wheat text-center mb-4">
          {lang === 'en' ? 'Live mandi prices, at a glance' : 'लाइव मंडी भाव, एक नज़र में'}
        </h2>
        <p className="font-body text-wheat/60 text-center mb-12">
          {lang === 'en'
            ? 'Updated every 15 minutes from e-NAM and partner mandis.'
            : 'e-NAM और पार्टनर मंडियों से हर 15 मिनट में अपडेट।'}
        </p>

        {/* Dashboard card */}
        <div className="bg-wheat/5 border border-wheat/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-wheat/10 flex items-center justify-between">
            <span className="font-body text-sm text-wheat/50">
              {lang === 'en' ? 'Commodity' : 'कमोडिटी'}
            </span>
            <div className="flex items-center gap-8">
              <span className="font-body text-sm text-wheat/50 hidden sm:block">
                {lang === 'en' ? '7d Trend' : '7 दिन का रुझान'}
              </span>
              <span className="font-body text-sm text-wheat/50 w-24 text-right">
                {lang === 'en' ? 'Price' : 'भाव'}
              </span>
            </div>
          </div>

          {/* Rows */}
          {cropPrices.map((crop, index) => (
            <div
              key={crop.name}
              className={`px-6 py-5 flex items-center justify-between ${
                index < cropPrices.length - 1 ? 'border-b border-wheat/5' : ''
              }`}
            >
              <div>
                <p className="font-body text-wheat font-medium">
                  {lang === 'en' ? crop.name : crop.nameHi}
                </p>
                <p className="font-body text-xs text-wheat/40 mt-0.5">{crop.unit}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:block">
                  <Sparkline data={crop.sparkline} />
                </div>

                <div className="text-right w-24">
                  <p className="font-mono text-xl font-bold text-datateal">
                    ₹{displayPrices[index].toLocaleString('en-IN')}
                  </p>
                  <p className={`font-mono text-xs mt-0.5 ${
                    crop.change >= 0 ? 'text-datateal' : 'text-turmeric'
                  }`}>
                    {crop.change >= 0 ? '▲' : '▼'} {Math.abs(crop.change)}%
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div className="px-6 py-3 bg-wheat/3 text-center">
            <p className="font-body text-xs text-wheat/30">
              {lang === 'en'
                ? 'Sample data for preview — prices update live in the full platform'
                : 'प्रीव्यू के लिए सैंपल डेटा — पूर्ण प्लेटफ़ॉर्म में लाइव भाव अपडेट होते हैं'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
