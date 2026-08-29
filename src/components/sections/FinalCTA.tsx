import { Button } from '../ui/Button'
import { LanguageToggle } from '../ui/LanguageToggle'
import { useSectionReveal } from '../../hooks/useSectionReveal'

interface FinalCTAProps {
  lang: 'en' | 'hi'
  onToggleLang: () => void
}

export function FinalCTA({ lang, onToggleLang }: FinalCTAProps) {
  const sectionRef = useSectionReveal<HTMLDivElement>()

  return (
    <>
      {/* CTA Section */}
      <section ref={sectionRef} className="relative py-32 md:py-40">
        <div className="absolute inset-0 bg-monsoon/60" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-wheat font-semibold mb-6">
            {lang === 'en'
              ? 'Ready to connect?'
              : 'जुड़ने के लिए तैयार हैं?'}
          </h2>
          <p className="font-body text-lg text-wheat/70 mb-10">
            {lang === 'en'
              ? 'Start listing your produce or find verified suppliers today.'
              : 'आज ही अपनी उपज लिस्ट करना शुरू करें या सत्यापित आपूर्तिकर्ता खोजें।'}
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
      </section>

      {/* Footer */}
      <footer className="relative bg-monsoon border-t border-wheat/10 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="FarmNexus"
              className="w-8 h-8 rounded-xl object-cover border border-wheat/20"
            />
            <span className="font-serif text-xl text-wheat font-semibold">FarmNexus</span>
            <span className="font-body text-xs text-wheat/30">·</span>
            <span className="font-body text-sm text-wheat/40">
              © {new Date().getFullYear()}
            </span>
          </div>

          <LanguageToggle lang={lang} onToggle={onToggleLang} />
        </div>
      </footer>
    </>
  )
}
