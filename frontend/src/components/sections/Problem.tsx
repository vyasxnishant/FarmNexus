import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface ProblemProps {
  lang: 'en' | 'hi'
}

const stats = [
  {
    number: '~₹92,000 Cr',
    numberHi: '~₹92,000 करोड़',
    text: 'estimated annual post-harvest losses due to fragmented supply chains',
    textHi: 'बिखरी आपूर्ति श्रृंखलाओं के कारण अनुमानित वार्षिक फसल कटाई के बाद का नुकसान',
    note: 'placeholder estimate',
  },
  {
    number: '5–7',
    numberHi: '5–7',
    text: 'middlemen between a farmer and the end buyer, each taking a cut',
    textHi: 'बिचौलिए किसान और अंतिम खरीदार के बीच, हर एक अपना हिस्सा लेता है',
    note: 'placeholder estimate',
  },
  {
    number: '< 6%',
    numberHi: '< 6%',
    text: 'of Indian farmers currently access real-time market prices before selling',
    textHi: 'भारतीय किसान वर्तमान में बिक्री से पहले रियल-टाइम बाजार भाव देख पाते हैं',
    note: 'placeholder estimate',
  },
]

export function Problem({ lang }: ProblemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const items = el.querySelectorAll('.stat-item')

    if (reducedMotion) {
      gsap.set(items, { opacity: 1, y: 0 })
      return
    }

    gsap.set(items, { opacity: 0, y: 30 })

    items.forEach((item, index) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: index * 0.15,
            ease: 'power2.out',
          })
        },
        once: true,
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [reducedMotion])

  return (
    <section className="relative bg-wheat py-24 md:py-32">
      <div ref={containerRef} className="max-w-3xl mx-auto px-6 space-y-16">
        <h2 className="font-serif text-3xl md:text-4xl text-soil text-center mb-16">
          {lang === 'en' ? 'The disconnect is costly.' : 'विसंगति की कीमत भारी है।'}
        </h2>

        {stats.map((stat, index) => (
          <div key={index} className="stat-item text-center">
            <p className="font-mono text-4xl md:text-5xl font-bold text-soil mb-3">
              {lang === 'en' ? stat.number : stat.numberHi}
            </p>
            <p className="font-body text-lg text-soil/80 max-w-lg mx-auto">
              {lang === 'en' ? stat.text : stat.textHi}
            </p>
            <p className="font-body text-xs text-soil/40 mt-2 italic">
              ({stat.note})
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
