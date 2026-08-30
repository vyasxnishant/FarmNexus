import React, { useState, useRef, useEffect, useMemo } from 'react'
import { MapPin, Search, ChevronDown, Check, X } from 'lucide-react'
import {
  ALL_INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  isValidDistrictForState,
} from '../../data/indiaLocations'

interface LocationSelectorProps {
  selectedState: string
  selectedDistrict: string
  onStateChange: (state: string) => void
  onDistrictChange: (district: string) => void
  disabled?: boolean
  stateLabel?: string
  districtLabel?: string
  required?: boolean
  className?: string
  layout?: 'stacked' | 'grid'
}

export function LocationSelector({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  disabled = false,
  stateLabel = 'State / UT',
  districtLabel = 'District',
  required = true,
  className = '',
  layout = 'grid',
}: LocationSelectorProps) {
  // Dropdown Open States
  const [isStateOpen, setIsStateOpen] = useState(false)
  const [isDistrictOpen, setIsDistrictOpen] = useState(false)

  // Search Filters
  const [stateSearch, setStateSearch] = useState('')
  const [districtSearch, setDistrictSearch] = useState('')

  const stateRef = useRef<HTMLDivElement>(null)
  const districtRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setIsStateOpen(false)
      }
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) {
        setIsDistrictOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered States
  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return ALL_INDIAN_STATES_AND_UTS
    const q = stateSearch.toLowerCase()
    return ALL_INDIAN_STATES_AND_UTS.filter(s => s.toLowerCase().includes(q))
  }, [stateSearch])

  // Districts for current State
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState)
  }, [selectedState])

  // Filtered Districts
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return availableDistricts
    const q = districtSearch.toLowerCase()
    return availableDistricts.filter(d => d.toLowerCase().includes(q))
  }, [availableDistricts, districtSearch])

  // Handle State Selection
  const handleSelectState = (state: string) => {
    if (state !== selectedState) {
      onStateChange(state)
      onDistrictChange('') // IMMEDIATELY RESET DISTRICT ON STATE CHANGE
    }
    setIsStateOpen(false)
    setStateSearch('')
  }

  // Handle District Selection
  const handleSelectDistrict = (district: string) => {
    onDistrictChange(district)
    setIsDistrictOpen(false)
    setDistrictSearch('')
  }

  const isDistrictDisabled = disabled || !selectedState || availableDistricts.length === 0

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
        {/* 1. STATE SELECTOR */}
        <div className="relative" ref={stateRef}>
          <label className="block font-body text-xs font-semibold text-soil mb-1">
            {stateLabel} {required && <span className="text-red-500">*</span>}
          </label>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setIsStateOpen(!isStateOpen)
              setIsDistrictOpen(false)
            }}
            className={`w-full bg-soil/5 border ${
              isStateOpen ? 'border-turmeric ring-2 ring-turmeric/20' : 'border-soil/15'
            } rounded-xl px-3.5 py-2.5 font-body text-xs text-soil flex items-center justify-between text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <MapPin className="w-3.5 h-3.5 text-turmeric shrink-0" />
              <span className={selectedState ? 'text-soil font-semibold' : 'text-soil/40 font-normal'}>
                {selectedState || 'Select State / UT'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-soil/50 transition-transform ${isStateOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* State Dropdown Menu */}
          {isStateOpen && (
            <div className="absolute z-50 mt-1.5 w-full bg-wheat rounded-2xl border border-soil/20 shadow-2xl overflow-hidden py-1 max-h-64 flex flex-col">
              {/* Search Box */}
              <div className="p-2 border-b border-soil/10 sticky top-0 bg-wheat z-10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-soil/40" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search state or UT..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full bg-soil/5 border border-soil/15 rounded-lg pl-8 pr-3 py-1.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
                  />
                  {stateSearch && (
                    <button
                      type="button"
                      onClick={() => setStateSearch('')}
                      className="absolute right-2.5 top-2.5 text-soil/40 hover:text-soil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* State Options */}
              <div className="overflow-y-auto flex-1 divide-y divide-soil/5">
                {filteredStates.length > 0 ? (
                  filteredStates.map((state) => {
                    const isSelected = state === selectedState
                    return (
                      <button
                        key={state}
                        type="button"
                        onClick={() => handleSelectState(state)}
                        className={`w-full px-3.5 py-2 font-body text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-turmeric text-monsoon font-bold'
                            : 'text-soil hover:bg-soil/10'
                        }`}
                      >
                        <span>{state}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs font-body text-soil/50">
                    No matching state found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. DISTRICT SELECTOR (Dynamic & Searchable) */}
        <div className="relative" ref={districtRef}>
          <label className="block font-body text-xs font-semibold text-soil mb-1">
            {districtLabel} {required && <span className="text-red-500">*</span>}
          </label>

          <button
            type="button"
            disabled={isDistrictDisabled}
            onClick={() => {
              if (!isDistrictDisabled) {
                setIsDistrictOpen(!isDistrictOpen)
                setIsStateOpen(false)
              }
            }}
            className={`w-full bg-soil/5 border ${
              isDistrictOpen ? 'border-turmeric ring-2 ring-turmeric/20' : 'border-soil/15'
            } rounded-xl px-3.5 py-2.5 font-body text-xs text-soil flex items-center justify-between text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className={selectedDistrict ? 'text-soil font-semibold' : 'text-soil/40 font-normal'}>
                {!selectedState
                  ? 'Select State First'
                  : selectedDistrict || 'Select District'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-soil/50 transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* District Dropdown Menu */}
          {isDistrictOpen && !isDistrictDisabled && (
            <div className="absolute z-50 mt-1.5 w-full bg-wheat rounded-2xl border border-soil/20 shadow-2xl overflow-hidden py-1 max-h-64 flex flex-col">
              {/* Search Box */}
              <div className="p-2 border-b border-soil/10 sticky top-0 bg-wheat z-10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-soil/40" />
                  <input
                    type="text"
                    autoFocus
                    placeholder={`Search in ${selectedState}...`}
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full bg-soil/5 border border-soil/15 rounded-lg pl-8 pr-3 py-1.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
                  />
                  {districtSearch && (
                    <button
                      type="button"
                      onClick={() => setDistrictSearch('')}
                      className="absolute right-2.5 top-2.5 text-soil/40 hover:text-soil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* District Options */}
              <div className="overflow-y-auto flex-1 divide-y divide-soil/5">
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((district) => {
                    const isSelected = district === selectedDistrict
                    return (
                      <button
                        key={district}
                        type="button"
                        onClick={() => handleSelectDistrict(district)}
                        className={`w-full px-3.5 py-2 font-body text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-turmeric text-monsoon font-bold'
                            : 'text-soil hover:bg-soil/10'
                        }`}
                      >
                        <span>{district}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs font-body text-soil/50">
                    No district found matching "{districtSearch}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

