import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkline } from '../ui/Sparkline'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { marketApiService, type ApiMarketPrice } from '../../services/marketApiService'

gsap.registerPlugin(ScrollTrigger)

interface LivePricePreviewProps {
  lang: 'en' | 'hi'
}

interface CropDisplayRow {
  name: string
  nameHi: string
  unit: string
  price: number
  change: number
  sparkline: number[]
}

export function LivePricePreview({ lang }: LivePricePreviewProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [livePrices, setLivePrices] = useState<CropDisplayRow[]>([])
  const [displayPrices, setDisplayPrices] = useState<number[]>([])
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    let isMounted = true
    marketApiService.getLatestPrices(10)
      .then((records: ApiMarketPrice[]) => {
        if (!isMounted) return
        if (records && records.length > 0) {
          const rows: CropDisplayRow[] = records.slice(0, 5).map(r => ({
            name: `${r.commodity} (${r.market})`,
            nameHi: `${r.commodity} (${r.market})`,
            unit: '₹/qtl',
            price: Number(r.modal_price) || 0,
            change: 0,
            sparkline: [
              Number(r.min_price) || 0,
              Math.round(((Number(r.min_price) || 0) + (Number(r.modal_price) || 0)) / 2),
              Number(r.modal_price) || 0,
              Number(r.modal_price) || 0,
              Number(r.max_price) || 0
            ]
          }))
          setLivePrices(rows)
          setDisplayPrices(rows.map(() => 0))
        } else {
          setLivePrices([])
          setDisplayPrices([])
        }
        setIsLoading(false)
      })
      .catch(() => {
        if (isMounted) {
          setLivePrices([])
          setDisplayPrices([])
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el || livePrices.length === 0) return

    if (reducedMotion) {
      setDisplayPrices(livePrices.map(c => c.price))
      setHasAnimated(true)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      onEnter: () => {
        if (hasAnimated) return
        setHasAnimated(true)

        livePrices.forEach((crop, index) => {
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
  }, [reducedMotion, hasAnimated, livePrices])

  return (
    <section ref={sectionRef} className="relative bg-monsoon py-24 md:py-32">
      <div className="absolute inset-0 bg-monsoon/80" />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <h2 className="font-serif text-3xl md:text-4xl text-wheat text-center mb-4">
          {lang === 'en' ? 'Live mandi prices, at a glance' : 'लाइव मंडी भाव, एक नज़र में'}
        </h2>
        <p className="font-body text-wheat/60 text-center mb-12">
          {lang === 'en'
            ? 'Real-time daily prices directly connected to APMC & e-NAM mandis.'
            : 'APMC व e-NAM मंडियों से सीधे जुड़े रियल-टाइम दैनिक भाव।'}
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
                {lang === 'en' ? 'Price Range' : 'भाव दायरा'}
              </span>
              <span className="font-body text-sm text-wheat/50 w-24 text-right">
                {lang === 'en' ? 'Price' : 'भाव'}
              </span>
            </div>
          </div>

          {/* Rows / Empty state */}
          {isLoading ? (
            <div className="p-8 text-center text-wheat/60 text-xs font-body">
              {lang === 'en' ? 'Loading live market feeds...' : 'लाइव मंडी भाव लोड हो रहे हैं...'}
            </div>
          ) : livePrices.length === 0 ? (
            <div className="p-10 text-center text-wheat/50 text-xs font-body space-y-2">
              <p className="font-semibold text-wheat text-sm">
                {lang === 'en' ? 'No market data available' : 'कोई मंडी डेटा उपलब्ध नहीं है'}
              </p>
              <p className="text-wheat/40">
                {lang === 'en'
                  ? 'Connect government AGMARKNET / e-NAM feeds in the dashboard to stream real prices.'
                  : 'वास्तविक भाव प्राप्त करने के लिए डैशबोर्ड में AGMARKNET / e-NAM फीड कनेक्ट करें।'}
              </p>
            </div>
          ) : (
            livePrices.map((crop, index) => (
              <div
                key={index}
                className={`px-6 py-5 flex items-center justify-between ${
                  index < livePrices.length - 1 ? 'border-b border-wheat/5' : ''
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
                      ₹{(displayPrices[index] ?? crop.price).toLocaleString('en-IN')}
                    </p>
                    <p className="font-mono text-xs mt-0.5 text-datateal">
                      LIVE
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Footer note */}
          <div className="px-6 py-3 bg-wheat/3 text-center">
            <p className="font-body text-xs text-wheat/40">
              {lang === 'en'
                ? 'Official APMC & AGMARKNET market prices verified through national data rails.'
                : 'राष्ट्रीय डेटा रेल द्वारा सत्यापित आधिकारिक APMC व AGMARKNET मंडी भाव।'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
