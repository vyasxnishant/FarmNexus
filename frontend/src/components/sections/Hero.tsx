import { Button } from '../ui/Button'

interface HeroProps {
  lang: 'en' | 'hi'
}

export function Hero({ lang }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col justify-between">
      {/* Scrim overlay for text legibility over 3D canvas */}
      <div className="absolute inset-0 bg-monsoon/70 backdrop-blur-[1px]" />

      {/* Top Navbar with Brand Logo */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="FarmNexus Logo"
            className="w-11 h-11 rounded-2xl object-cover border border-wheat/20 shadow-md group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-serif text-2xl font-bold text-wheat tracking-tight group-hover:text-turmeric transition-colors block leading-none">
              FarmNexus
            </span>
            <span className="font-mono text-[10px] uppercase font-medium text-wheat/60 tracking-wider">
              Connecting Agriculture
            </span>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="/farmer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-body font-semibold text-turmeric bg-monsoon/80 border border-turmeric/40 hover:bg-turmeric hover:text-monsoon transition-all"
          >
            <span>{lang === 'en' ? 'Farmer Portal' : 'किसान पोर्टल'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-datateal animate-pulse" />
          </a>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-12 my-auto">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-wheat leading-tight mb-6">
          {lang === 'en'
            ? 'Every harvest deserves a fair price.'
            : 'हर फसल को उचित मूल्य मिलना चाहिए।'}
        </h1>

        <p className="font-body text-lg md:text-xl text-wheat/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          {lang === 'en'
            ? 'FarmNexus connects farmers and FPOs to verified buyers with real-time mandi prices, quality grading, and transparent deals.'
            : 'FarmNexus किसानों और FPOs को रियल-टाइम मंडी भाव, गुणवत्ता ग्रेडिंग और पारदर्शी सौदों के साथ सत्यापित खरीदारों से जोड़ता है।'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/farmer">
            <Button variant="fill" size="lg">
              {lang === 'en' ? 'List Your Produce' : 'अपनी उपज लिस्ट करें'}
            </Button>
          </a>
          <Button variant="outline" size="lg">
            {lang === 'en' ? 'Source Verified Crops' : 'सत्यापित फसलें खोजें'}
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-wheat/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-wheat/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
