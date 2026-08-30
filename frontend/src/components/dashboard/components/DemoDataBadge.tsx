export function DemoDataBadge({ text = 'DATABASE RECORDS', className = '' }: { text?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-turmeric/10 border border-turmeric/30 text-turmeric ${className}`}
      title="Authenticated platform database record"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-turmeric animate-pulse" />
      {text}
    </span>
  )
}

export function LiveSignalBadge({ text = 'LIVE SIGNAL', className = '' }: { text?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold tracking-wider bg-datateal/10 border border-datateal/40 text-datateal ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-datateal animate-ping" />
      {text}
    </span>
  )
}
