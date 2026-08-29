import { useState } from 'react'
import { Layout } from './Layout'
import { NexusCanvas } from './NexusGraph/NexusCanvas'
import { Hero } from './sections/Hero'
import { Problem } from './sections/Problem'
import { HowItWorks } from './sections/HowItWorks'
import { LivePricePreview } from './sections/LivePricePreview'
import { ForFarmersForBuyers } from './sections/ForFarmersForBuyers'
import { TrustedRails } from './sections/TrustedRails'
import { FinalCTA } from './sections/FinalCTA'
import { useScrollProgress } from '../hooks/useScrollProgress'

export function LandingPage() {
  const scrollProgress = useScrollProgress()
  const [lang, setLang] = useState<'en' | 'hi'>('en')

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'hi' : 'en'))

  return (
    <Layout>
      {/* 3D Background — fixed, behind everything */}
      <NexusCanvas scrollProgress={scrollProgress} />

      {/* Content layers — above the canvas */}
      <main id="main-content" className="relative z-10">
        <Hero lang={lang} />
        <Problem lang={lang} />
        <HowItWorks lang={lang} />
        <LivePricePreview lang={lang} />
        <ForFarmersForBuyers lang={lang} />
        <TrustedRails lang={lang} />
        <FinalCTA lang={lang} onToggleLang={toggleLang} />
      </main>
    </Layout>
  )
}

