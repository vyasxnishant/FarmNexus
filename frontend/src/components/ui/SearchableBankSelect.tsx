import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Check, X, Landmark } from 'lucide-react'

export interface BankOption {
  id: string
  name: string
  code?: string
  aliases?: string[]
}

export const INDIAN_BANKS: BankOption[] = [
  { id: 'sbi', name: 'State Bank of India (SBI)', code: 'SBIN', aliases: ['SBI', 'State Bank of India', 'State Bank'] },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', aliases: ['HDFC', 'HDFC Bank Ltd'] },
  { id: 'icici', name: 'ICICI Bank', code: 'ICIC', aliases: ['ICICI', 'ICICI Bank Ltd'] },
  { id: 'axis', name: 'Axis Bank', code: 'UTIB', aliases: ['Axis', 'UTI Bank'] },
  { id: 'pnb', name: 'Punjab National Bank (PNB)', code: 'PUNB', aliases: ['PNB', 'Punjab National Bank'] },
  { id: 'bob', name: 'Bank of Baroda', code: 'BARB', aliases: ['BOB', 'Baroda Bank'] },
  { id: 'canara', name: 'Canara Bank', code: 'CNRB', aliases: ['Canara', 'Syndicate Bank'] },
  { id: 'union', name: 'Union Bank of India', code: 'UBIN', aliases: ['Union Bank', 'UBI', 'Andhra Bank', 'Corporation Bank'] },
  { id: 'boi', name: 'Bank of India', code: 'BKID', aliases: ['BOI'] },
  { id: 'indian', name: 'Indian Bank', code: 'IDIB', aliases: ['Indian Bank', 'Allahabad Bank'] },
  { id: 'cbi', name: 'Central Bank of India', code: 'CBIN', aliases: ['CBI', 'Central Bank'] },
  { id: 'iob', name: 'Indian Overseas Bank', code: 'IOBA', aliases: ['IOB'] },
  { id: 'uco', name: 'UCO Bank', code: 'UCBA', aliases: ['UCO'] },
  { id: 'bom', name: 'Bank of Maharashtra', code: 'MAHB', aliases: ['BOM', 'Maharashtra Bank'] },
  { id: 'idbi', name: 'IDBI Bank', code: 'IBKL', aliases: ['IDBI'] },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KKBK', aliases: ['Kotak', 'Kotak Bank'] },
  { id: 'indusind', name: 'IndusInd Bank', code: 'INDB', aliases: ['IndusInd'] },
  { id: 'yes', name: 'Yes Bank', code: 'YESB', aliases: ['Yes Bank Ltd'] },
  { id: 'federal', name: 'Federal Bank', code: 'FDRL', aliases: ['Federal'] },
  { id: 'au', name: 'AU Small Finance Bank', code: 'AUBL', aliases: ['AU Bank', 'AU Small Finance'] },
  { id: 'other', name: 'Other', aliases: ['Others', 'Gramin Bank', 'Cooperative Bank'] },
]

export function resolveBankName(rawBankName?: string | null): { selectedPreset: string; customName: string } {
  if (!rawBankName || !rawBankName.trim()) {
    return { selectedPreset: '', customName: '' }
  }

  const clean = rawBankName.trim()
  const lower = clean.toLowerCase()

  // 1. Exact or alias match with preset
  const matched = INDIAN_BANKS.find(
    b => b.id !== 'other' && (
      b.name.toLowerCase() === lower ||
      b.name.toLowerCase().includes(lower) ||
      lower.includes(b.name.toLowerCase()) ||
      b.aliases?.some(a => a.toLowerCase() === lower) ||
      (b.code && lower.startsWith(b.code.toLowerCase()))
    )
  )

  if (matched) {
    return { selectedPreset: matched.name, customName: '' }
  }

  if (clean === 'Other' || clean === 'Others') {
    return { selectedPreset: 'Other', customName: '' }
  }

  // Not in standard list -> "Other" with custom name
  return { selectedPreset: 'Other', customName: clean }
}

interface SearchableBankSelectProps {
  value: string
  onChange: (bankName: string) => void
  error?: string
  className?: string
  placeholder?: string
}

export function SearchableBankSelect({
  value,
  onChange,
  error,
  className = '',
  placeholder = 'Select or search Bank Name...',
}: SearchableBankSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter banks based on search query
  const filteredBanks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return INDIAN_BANKS

    return INDIAN_BANKS.filter(b => {
      if (b.name.toLowerCase().includes(q)) return true
      if (b.code && b.code.toLowerCase().includes(q)) return true
      if (b.aliases?.some(a => a.toLowerCase().includes(q))) return true
      return false
    })
  }, [searchQuery])

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (bank: BankOption) => {
    onChange(bank.name)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-soil/5 border transition-all cursor-pointer flex items-center justify-between gap-2 ${
          isOpen
            ? 'border-turmeric ring-2 ring-turmeric/20 bg-wheat shadow-xs'
            : error
            ? 'border-red-500 bg-red-50/10'
            : 'border-soil/15 hover:border-soil/30'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Landmark className="w-4 h-4 text-turmeric flex-shrink-0" />
          {value ? (
            <span className="font-body text-xs font-semibold text-soil truncate">
              {value}
            </span>
          ) : (
            <span className="font-body text-xs text-soil/40">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ChevronDown
            className={`w-4 h-4 text-soil/50 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-turmeric' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-wheat rounded-2xl border border-soil/20 shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[300px]">
          {/* Search Header */}
          <div className="p-2.5 bg-soil/5 border-b border-soil/10">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-soil/40 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bank name or code (e.g. SBI, HDFC, Baroda)..."
                className="w-full pl-9 pr-8 py-2 bg-wheat rounded-xl border border-soil/15 text-xs font-body text-soil placeholder:text-soil/40 focus:outline-none focus:border-turmeric focus:ring-1 focus:ring-turmeric"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchQuery('')
                    searchInputRef.current?.focus()
                  }}
                  className="absolute right-2.5 text-soil/40 hover:text-soil p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-soil/50 mt-1 px-1 font-body">
              <span>{filteredBanks.length} banks found</span>
              <span className="font-mono text-turmeric font-medium">Searchable List</span>
            </div>
          </div>

          {/* Banks List */}
          <div className="overflow-y-auto p-1.5 space-y-1 flex-1">
            {filteredBanks.length === 0 ? (
              <div className="p-4 text-center text-xs text-soil/50 font-body">
                <p>No matching banks found</p>
                <button
                  type="button"
                  onClick={() => handleSelect({ id: 'other', name: 'Other' })}
                  className="mt-2 px-3 py-1 bg-turmeric text-monsoon text-xs font-bold rounded-lg cursor-pointer"
                >
                  Select "Other" Bank
                </button>
              </div>
            ) : (
              filteredBanks.map((b) => {
                const isSelected = value.toLowerCase() === b.name.toLowerCase()

                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelect(b)}
                    className={`px-3 py-2 rounded-xl text-xs font-body transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-turmeric text-monsoon font-bold shadow-xs'
                        : 'hover:bg-soil/10 text-soil'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{b.name}</span>
                      {b.code && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-monsoon/10 text-monsoon' : 'bg-soil/10 text-soil/60'}`}>
                          {b.code}
                        </span>
                      )}
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-monsoon stroke-[3]" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-700 font-body text-[11px] mt-1">{error}</p>}
    </div>
  )
}

