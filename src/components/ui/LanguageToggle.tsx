interface LanguageToggleProps {
  lang: 'en' | 'hi'
  onToggle: () => void
}

export function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-wheat/30 text-wheat/70 hover:text-wheat hover:border-wheat/50 transition-colors duration-200 text-sm font-body cursor-pointer"
      aria-label={`Switch language to ${lang === 'en' ? 'Hindi' : 'English'}`}
    >
      <span className={lang === 'en' ? 'text-turmeric font-semibold' : 'opacity-60'}>EN</span>
      <span className="text-wheat/30">|</span>
      <span className={lang === 'hi' ? 'text-turmeric font-semibold' : 'opacity-60'}>हि</span>
    </button>
  )
}
