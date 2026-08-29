import { useSectionReveal } from '../../hooks/useSectionReveal'

interface TrustedRailsProps {
  lang: 'en' | 'hi'
}

const rails = [
  { name: 'e-NAM', desc: 'National Agriculture Market', descHi: 'राष्ट्रीय कृषि बाजार' },
  { name: 'ONDC', desc: 'Open Network for Digital Commerce', descHi: 'डिजिटल कॉमर्स के लिए ओपन नेटवर्क' },
  { name: 'WDRA e-NWR', desc: 'Electronic Negotiable Warehouse Receipts', descHi: 'इलेक्ट्रॉनिक नेगोशिएबल वेयरहाउस रसीदें' },
  { name: 'UPI', desc: 'Unified Payments Interface', descHi: 'यूनिफाइड पेमेंट्स इंटरफ़ेस' },
]

export function TrustedRails({ lang }: TrustedRailsProps) {
  const sectionRef = useSectionReveal<HTMLDivElement>()

  return (
    <section ref={sectionRef} className="bg-wheat py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-serif text-2xl md:text-3xl text-soil mb-4">
          {lang === 'en' ? 'Built on trusted rails' : 'विश्वसनीय रेल पर निर्मित'}
        </h2>
        <p className="font-body text-soil/60 mb-12">
          {lang === 'en'
            ? "India's public digital infrastructure, working for agriculture."
            : 'भारत का सार्वजनिक डिजिटल इंफ्रास्ट्रक्चर, कृषि के लिए काम कर रहा है।'}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {rails.map((rail) => (
            <div
              key={rail.name}
              className="px-5 py-3 rounded-xl border border-soil/15 bg-wheat group hover:border-turmeric/40 transition-colors duration-200"
            >
              <p className="font-mono text-sm font-semibold text-soil">
                {rail.name}
              </p>
              <p className="font-body text-xs text-soil/50 mt-0.5">
                {lang === 'en' ? rail.desc : rail.descHi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
