import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Check, X, Sprout } from 'lucide-react'
import { indianCropCategories, allIndianCrops, type IndianCrop, type CropCategoryGroup } from '../../data/indianCrops'

interface SearchableCropSelectProps {
  value: string
  onChange: (cropName: string, categoryName: string, cropHi?: string) => void
  lang?: 'en' | 'hi'
  error?: string
  className?: string
  placeholder?: string
}

export function SearchableCropSelect({
  value,
  onChange,
  lang = 'en',
  error,
  className = '',
  placeholder,
}: SearchableCropSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Find currently selected crop
  const selectedCrop = useMemo(() => {
    if (!value) return undefined
    const lower = value.trim().toLowerCase()
    return allIndianCrops.find(
      c => c.name.toLowerCase() === lower || c.nameHi.toLowerCase() === lower || c.name.toLowerCase().includes(lower)
    )
  }, [value])

  // Filter crops based on search query in English & Hindi
  const filteredGroups = useMemo<CropCategoryGroup[]>(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return indianCropCategories

    return indianCropCategories
      .map(group => {
        const matchingCrops = group.crops.filter(crop => {
          const nameMatch = crop.name.toLowerCase().includes(q)
          const nameHiMatch = crop.nameHi.toLowerCase().includes(q)
          const categoryMatch = crop.category.toLowerCase().includes(q) || crop.categoryHi.toLowerCase().includes(q)
          const termsMatch = crop.searchTerms?.some(t => t.toLowerCase().includes(q))
          return nameMatch || nameHiMatch || categoryMatch || termsMatch
        })

        return {
          ...group,
          crops: matchingCrops,
        }
      })
      .filter(group => group.crops.length > 0)
  }, [searchQuery])

  const totalResults = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.crops.length, 0)
  }, [filteredGroups])

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (crop: IndianCrop) => {
    onChange(crop.name, crop.category, crop.nameHi)
    setIsOpen(false)
    setSearchQuery('')
  }

  const defaultPlaceholder = lang === 'en' ? 'Select or Search Crop...' : 'फसल चुनें या खोजें...'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button / Display */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full px-4 py-2.5 rounded-xl bg-soil/5 border transition-all cursor-pointer flex items-center justify-between gap-2 ${
          isOpen
            ? 'border-turmeric ring-2 ring-turmeric/20 bg-wheat shadow-xs'
            : error
            ? 'border-red-500 bg-red-50/10'
            : 'border-soil/15 hover:border-soil/30'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Sprout className="w-4 h-4 text-turmeric flex-shrink-0" />
          {selectedCrop ? (
            <span className="font-body text-xs font-semibold text-soil truncate">
              {selectedCrop.name} <span className="text-soil/60 font-normal">/ {selectedCrop.nameHi}</span>
            </span>
          ) : value ? (
            <span className="font-body text-xs font-semibold text-soil truncate">
              {value}
            </span>
          ) : (
            <span className="font-body text-xs text-soil/40">
              {placeholder || defaultPlaceholder}
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
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-wheat rounded-2xl border border-soil/20 shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[380px]">
          {/* Search Bar Header */}
          <div className="p-2.5 bg-soil/5 border-b border-soil/10">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-soil/40 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search in English or Hindi (e.g. Mustard / सरसों)...' : 'अंग्रेजी या हिंदी में खोजें (उदा. सरसों / Mustard)...'}
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
              <span>{lang === 'en' ? `${totalResults} Indian crops found` : `${totalResults} फसलें उपलब्ध`}</span>
              <span className="font-mono text-turmeric font-medium">{lang === 'en' ? 'Type in EN / हिंदी' : 'EN / हिंदी खोज'}</span>
            </div>
          </div>

          {/* Grouped Crop Options List */}
          <div className="overflow-y-auto p-1.5 space-y-2 flex-1">
            {filteredGroups.length === 0 ? (
              <div className="p-6 text-center text-xs text-soil/50 font-body">
                <p>{lang === 'en' ? 'No matching crops found' : 'कोई मेल खाती फसल नहीं मिली'}</p>
                <p className="text-[11px] text-soil/40 mt-1">
                  {lang === 'en' ? 'Select "Other" or search by alternate name.' : '"अन्य" चुनें या अन्य नाम से खोजें।'}
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.category} className="space-y-0.5">
                  {/* Category Header */}
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-turmeric bg-monsoon/5 rounded-md flex items-center justify-between">
                    <span>{group.category}</span>
                    <span className="text-soil/50 font-normal font-body">{group.categoryHi}</span>
                  </div>

                  {/* Crop Items */}
                  <div className="space-y-0.5 pt-0.5">
                    {group.crops.map((c) => {
                      const isSelected = value.toLowerCase() === c.name.toLowerCase() || (selectedCrop && selectedCrop.id === c.id)

                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelect(c)}
                          className={`px-3 py-2 rounded-xl text-xs font-body transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-turmeric text-monsoon font-bold shadow-xs'
                              : 'hover:bg-soil/10 text-soil'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.name}</span>
                            <span className={`text-[11px] ${isSelected ? 'text-monsoon/80' : 'text-soil/60'}`}>
                              / {c.nameHi}
                            </span>
                          </div>

                          {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-monsoon stroke-[3]" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-700 font-body text-[11px] mt-1">{error}</p>}
    </div>
  )
}

