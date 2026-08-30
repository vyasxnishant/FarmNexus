import { useState, useEffect, type ChangeEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Sprout,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  Scale,
  ShieldCheck,
  FileText,
  Upload,
  AlertCircle,
  Truck,
  DollarSign,
  TrendingUp,
  Info,
  Layers,
  Save,
  Send,
  X,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import {
  useDashboard,
  type CropLot,
  type QualityGrade,
  type QuantityUnit,
  type VisualQuality,
  type DamageLevel,
  type GrainSize
} from '../../../context/DashboardContext'
import { LocationSelector } from '../../ui/LocationSelector'

interface CreateLotViewProps {
  isEditing?: boolean
}

export function CreateLotView({ isEditing = false }: CreateLotViewProps) {
  const navigate = useNavigate()
  const { lotId } = useParams<{ lotId: string }>()
  const { addLot, updateLot, getLotById, lang } = useDashboard()

  const existingLot = isEditing && lotId ? getLotById(lotId) : undefined

  // Form State
  const [crop, setCrop] = useState<string>(existingLot?.crop || 'Wheat (Sharbati)')
  const [category, setCategory] = useState<string>(existingLot?.category || 'Grains & Cereals')
  const [variety, setVariety] = useState<string>(existingLot?.variety || 'C-306 Sharbati Premium')
  const [quantity, setQuantity] = useState<number>(existingLot?.quantityQtl || 100)
  const [unit, setUnit] = useState<QuantityUnit>(existingLot?.unit || 'Quintal')
  const [harvestDate, setHarvestDate] = useState<string>(existingLot?.harvestDate || new Date().toISOString().split('T')[0])
  const [availableFrom, setAvailableFrom] = useState<string>(existingLot?.availableFrom || new Date().toISOString().split('T')[0])
  const [availableUntil, setAvailableUntil] = useState<string>(existingLot?.availableUntil || '2026-06-30')
  const [location, setLocation] = useState<string>(existingLot?.location || 'Sirali Farm Godown #2, Harda')
  const [description, setDescription] = useState<string>(existingLot?.description || 'Machine cleaned, sun-dried on pucca floor, stored in breathable gunny bags.')
  const [imageUrl, setImageUrl] = useState<string>(existingLot?.imageUrl || '')

  // Quality State
  const [grade, setGrade] = useState<QualityGrade>(existingLot?.grade || 'Grade A')
  const [visualQuality, setVisualQuality] = useState<VisualQuality>(existingLot?.visualQuality || 'Good')
  const [damageLevel, setDamageLevel] = useState<DamageLevel>(existingLot?.damageLevel || 'Low')
  const [grainSize, setGrainSize] = useState<GrainSize>(existingLot?.grainSize || 'Medium')
  const [moisture, setMoisture] = useState<number>(existingLot?.moisturePercent || 10.5)
  const [foreignMatter, setForeignMatter] = useState<number>(existingLot?.foreignMatterPercent || 0.8)
  const [damagedGrain, setDamagedGrain] = useState<number>(existingLot?.damagedGrainPercent || 0.5)
  const [qualityNotes, setQualityNotes] = useState<string>(existingLot?.qualityNotes || 'Sun-dried on pucca floor, machine cleaned, zero pesticide residue.')
  const [certificateUploaded, setCertificateUploaded] = useState<boolean>(Boolean(existingLot?.certificateUrl))

  // Pricing State
  const [expectedPrice, setExpectedPrice] = useState<number>(existingLot?.expectedPrice || 2780)
  const [minPrice, setMinPrice] = useState<number>(existingLot?.minAcceptablePrice || 2650)
  const marketReferencePrice = 2840 // Benchmark from live AGMARKNET feed

  // Location & Logistics State
  const [stateName, setStateName] = useState<string>(existingLot?.state || 'Madhya Pradesh')
  const [district, setDistrict] = useState<string>(existingLot?.district || 'Harda')
  const [village, setVillage] = useState<string>(existingLot?.village || 'Sirali')
  const [pickupLocation, setPickupLocation] = useState<string>(existingLot?.pickupLocation || 'Godown #2, Main Highway Gate')

  // Validation & Feedback States
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Populate if editing lot loads late
  useEffect(() => {
    if (existingLot) {
      setCrop(existingLot.crop)
      setCategory(existingLot.category || 'Grains & Cereals')
      setVariety(existingLot.variety)
      setQuantity(existingLot.quantityQtl)
      setUnit(existingLot.unit || 'Quintal')
      setHarvestDate(existingLot.harvestDate)
      setAvailableFrom(existingLot.availableFrom || '')
      setAvailableUntil(existingLot.availableUntil || '')
      setLocation(existingLot.location)
      setDescription(existingLot.description || '')
      setImageUrl(existingLot.imageUrl || '')
      setGrade(existingLot.grade)
      setVisualQuality(existingLot.visualQuality || 'Good')
      setDamageLevel(existingLot.damageLevel || 'Low')
      setGrainSize(existingLot.grainSize || 'Medium')
      setMoisture(existingLot.moisturePercent || 10.5)
      setForeignMatter(existingLot.foreignMatterPercent || 0.8)
      setDamagedGrain(existingLot.damagedGrainPercent || 0.5)
      setQualityNotes(existingLot.qualityNotes || '')
      setExpectedPrice(existingLot.expectedPrice)
      setMinPrice(existingLot.minAcceptablePrice || Math.round(existingLot.expectedPrice * 0.95))
      setStateName(existingLot.state || 'Madhya Pradesh')
      setDistrict(existingLot.district || 'Harda')
      setVillage(existingLot.village || 'Sirali')
      setPickupLocation(existingLot.pickupLocation || '')
    }
  }, [existingLot])

  // Conversion: Quantity in Quintals
  const quantityInQuintals = unit === 'Quintal' ? quantity : unit === 'Tonne' ? quantity * 10 : quantity / 100
  const grossEstimatedValue = expectedPrice * quantityInQuintals

  // Image Upload handler
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        setImageUrl(uploadEvent.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Validation Routine
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {}

    if (!crop.trim()) errs.crop = 'Please select or enter a crop name.'
    if (!variety.trim()) errs.variety = 'Please specify crop variety.'
    if (!category.trim()) errs.category = 'Please select a crop category.'
    if (quantity <= 0) errs.quantity = 'Quantity must be greater than 0.'
    if (expectedPrice <= 0) errs.expectedPrice = 'Expected price must be greater than 0.'
    if (minPrice > expectedPrice) errs.minPrice = 'Minimum floor price cannot exceed expected price.'
    if (moisture < 0 || moisture > 100) errs.moisture = 'Moisture must be between 0% and 100%.'
    if (foreignMatter < 0 || foreignMatter > 100) errs.foreignMatter = 'Foreign matter must be between 0% and 100%.'
    if (damagedGrain < 0 || damagedGrain > 100) errs.damagedGrain = 'Damaged grain must be between 0% and 100%.'
    if (!harvestDate) errs.harvestDate = 'Please select harvest date.'
    if (!location.trim()) errs.location = 'Please provide produce storage location.'

    if (availableFrom && availableUntil && new Date(availableUntil) < new Date(availableFrom)) {
      errs.availableUntil = 'Available-until date cannot be before available-from date.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Save Draft or Publish
  const handleSave = (status: 'Draft' | 'Active') => {
    if (status === 'Active' && !validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    const lotPayload = {
      crop,
      cropHi: crop.includes('Wheat') ? 'गेहूं (शरबती)' : crop.includes('Soybean') ? 'सोयाबीन' : crop.includes('Rice') ? 'बासमती चावल' : 'चना',
      category,
      variety,
      quantityQtl: quantityInQuintals,
      unit,
      grade,
      visualQuality,
      damageLevel,
      grainSize,
      expectedPrice,
      minAcceptablePrice: minPrice,
      marketReferencePrice,
      moisturePercent: moisture,
      foreignMatterPercent: foreignMatter,
      damagedGrainPercent: damagedGrain,
      qualityNotes,
      description,
      imageUrl: imageUrl || undefined,
      certificateUrl: certificateUploaded ? 'https://farmnexus.gov.in/certs/self-declared.pdf' : undefined,
      harvestDate,
      availableFrom,
      availableUntil,
      location,
      state: stateName,
      district,
      village,
      pickupLocation,
      status,
    }

    setTimeout(() => {
      if (isEditing && lotId) {
        updateLot(lotId, lotPayload)
      } else {
        addLot(lotPayload)
      }
      setIsSubmitting(false)
      setShowSuccessToast(true)
      setTimeout(() => {
        navigate('/farmer/lots')
      }, 1000)
    }, 600)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/lots"
            className="p-2.5 rounded-2xl bg-wheat text-soil hover:bg-wheat/80 border border-soil/15 transition-colors cursor-pointer"
            aria-label="Back to Lots"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-turmeric uppercase tracking-wider bg-monsoon px-2.5 py-0.5 rounded-full">
                FarmNexus Produce Engine
              </span>
              <span className="font-mono text-xs text-soil/60 bg-soil/5 border border-soil/15 px-2 py-0.5 rounded-full">
                {isEditing ? `Editing ${lotId}` : 'New Lot Draft'}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil mt-1">
              {isEditing ? (lang === 'en' ? 'Edit Produce Lot' : 'लॉट विवरण संपादित करें') : (lang === 'en' ? 'Create New Produce Lot' : 'नया फसल लॉट बनाएं')}
            </h1>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('Draft')}
            className="px-4 py-2.5 rounded-xl font-body text-xs font-semibold text-soil bg-wheat hover:bg-wheat/80 border border-soil/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-turmeric" />
            <span>{lang === 'en' ? 'Save as Draft' : 'ड्राफ्ट सहेजें'}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('Active')}
            className="px-5 py-2.5 rounded-xl font-body text-xs font-bold text-monsoon bg-turmeric hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isEditing ? (lang === 'en' ? 'Update & Publish Lot' : 'अपडेट व प्रकाशित करें') : (lang === 'en' ? 'Publish Lot to Buyers' : 'लॉट प्रकाशित करें')}</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-datateal/20 border border-datateal/50 text-soil flex items-center gap-3 animate-fade-in shadow-md">
          <CheckCircle2 className="w-5 h-5 text-datateal flex-shrink-0" />
          <div>
            <p className="font-body text-xs font-bold text-soil">
              {isEditing ? 'Lot Updated Successfully!' : 'Lot Created & Broadcasted Successfully!'}
            </p>
            <p className="text-[11px] text-soil/70">Redirecting to your produce inventory...</p>
          </div>
        </div>
      )}

      {/* Main Multi-Section Form & Preview Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: 4 Core Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A — PRODUCE DETAILS */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-soil/10">
              <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                <Sprout className="w-5 h-5 text-turmeric" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-soil">
                  {lang === 'en' ? 'Section A — Produce Details' : 'भाग क — फसल विवरण'}
                </h3>
                <p className="font-body text-xs text-soil/70 mt-0.5">
                  {lang === 'en' ? 'Specify commodity, category, variety, harvest date, and volume.' : 'फसल का प्रकार, श्रेणी, किस्म, कटाई की तारीख व मात्रा दर्ज करें।'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Crop Name & Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Crop Name *' : 'फसल का नाम *'}
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
                  >
                    <option value="Wheat (Sharbati)">Wheat (Sharbati) / शरबती गेहूं</option>
                    <option value="Soybean">Soybean / सोयाबीन</option>
                    <option value="Basmati Rice">Basmati Rice / बासमती धान</option>
                    <option value="Chana (Gram)">Chana (Gram) / चना (देसी/डॉलर)</option>
                    <option value="Mustard">Mustard / सरसों</option>
                    <option value="Maize">Maize / मक्का</option>
                    <option value="Cotton (Kapas)">Cotton (Kapas) / कपास</option>
                  </select>
                  {errors.crop && <p className="text-red-700 font-body text-[11px] mt-1">{errors.crop}</p>}
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Crop Category *' : 'फसल श्रेणी *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
                  >
                    <option value="Grains & Cereals">Grains & Cereals / अनाज</option>
                    <option value="Oilseeds">Oilseeds / तिलहन</option>
                    <option value="Pulses & Legumes">Pulses & Legumes / दलहन</option>
                    <option value="Fibers & Cash Crops">Fibers & Cash Crops / रेशेदार फसलें</option>
                    <option value="Spices & Condiments">Spices & Condiments / मसाले</option>
                  </select>
                  {errors.category && <p className="text-red-700 font-body text-[11px] mt-1">{errors.category}</p>}
                </div>
              </div>

              {/* Variety */}
              <div>
                <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                  {lang === 'en' ? 'Variety / Cultivar Name *' : 'किस्म का नाम *'}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. C-306 Sharbati, JS-9560, Pusa 1121, Desi Dollar"
                  className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                />
                {errors.variety && <p className="text-red-700 font-body text-[11px] mt-1">{errors.variety}</p>}
              </div>

              {/* Quantity & Unit Toggle */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Quantity Volume *' : 'उपज मात्रा *'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-bold focus:outline-none focus:border-turmeric"
                      placeholder="100"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as QuantityUnit)}
                      className="px-3 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric cursor-pointer"
                    >
                      <option value="Quintal">Quintals (qtl)</option>
                      <option value="Tonne">Tonnes (MT)</option>
                      <option value="Kg">Kilograms (kg)</option>
                    </select>
                  </div>
                  <span className="font-mono text-[11px] text-soil/60 mt-1 block">
                    = {quantityInQuintals} Quintals ({(quantityInQuintals / 10).toFixed(1)} MT)
                  </span>
                  {errors.quantity && <p className="text-red-700 font-body text-[11px] mt-1">{errors.quantity}</p>}
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Harvest Date *' : 'कटाई की तारीख *'}
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                  />
                  {errors.harvestDate && <p className="text-red-700 font-body text-[11px] mt-1">{errors.harvestDate}</p>}
                </div>
              </div>

              {/* Available Window */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Available From (Ready for Pickup)' : 'उपलब्धता प्रारंभ तारीख'}
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Available Until (Lot Expiry)' : 'अंतिम तारीख'}
                  </label>
                  <input
                    type="date"
                    value={availableUntil}
                    onChange={(e) => setAvailableUntil(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                  />
                  {errors.availableUntil && <p className="text-red-700 font-body text-[11px] mt-1">{errors.availableUntil}</p>}
                </div>
              </div>

              {/* Produce Description */}
              <div>
                <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                  {lang === 'en' ? 'Produce Description & Lot Highlights' : 'उपज का विस्तृत विवरण'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe harvest condition, storage method, or key buyer highlights..."
                  className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                />
              </div>

              {/* Crop Image Upload */}
              <div>
                <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                  {lang === 'en' ? 'Crop Sample Photograph (Optional)' : 'फसल का नमूना फोटो (वैकल्पिक)'}
                </label>
                <div className="p-4 rounded-2xl bg-soil/5 border border-dashed border-soil/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Crop sample preview"
                        className="w-14 h-14 rounded-xl object-cover border border-soil/20 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-soil/10 flex items-center justify-center text-soil/40">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-body text-xs font-bold text-soil">
                        {imageUrl ? 'Sample Image Attached' : 'Upload produce grain sample photo'}
                      </p>
                      <p className="text-[11px] text-soil/60">
                        PNG, JPG or WEBP up to 5MB. Helps buyers inspect luster & purity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 rounded-xl bg-wheat text-soil font-body text-xs font-semibold border border-soil/20 hover:bg-soil/10 transition-colors cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-turmeric" />
                      <span>{imageUrl ? 'Change Photo' : 'Select Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-2 rounded-xl bg-red-500/10 text-red-700 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B — QUALITY INFORMATION */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-soil/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-turmeric" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-soil">
                    {lang === 'en' ? 'Section B — Quality Information' : 'भाग ख — गुणवत्ता जानकारी'}
                  </h3>
                  <p className="font-body text-xs text-soil/70 mt-0.5">
                    {lang === 'en' ? 'Moisture content, foreign matter, and physical grain parameters.' : 'नमी प्रतिशत, बाहरी अशुद्धता व दाना गुणवत्ता मापदंड।'}
                  </p>
                </div>
              </div>

              {/* Data Integrity Badge */}
              <span className="font-mono text-[10px] font-semibold text-soil/80 bg-turmeric/15 border border-turmeric/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
                Farmer Provided Quality Information
              </span>
            </div>

            <div className="space-y-5">
              {/* Quality Grade Selector */}
              <div>
                <label className="block font-body text-xs font-semibold text-soil mb-2">
                  {lang === 'en' ? 'Assigned Quality Grade *' : 'गुणवत्ता ग्रेड *'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'Grade A (Export)', title: 'Grade A (Export)', desc: 'Premium uniform, <10% moisture' },
                    { id: 'Grade A', title: 'Grade A (FAQ)', desc: 'Standard fair average quality, <12%' },
                    { id: 'Grade B', title: 'Grade B', desc: 'Commercial grade, 12–14% moisture' },
                    { id: 'Grade C', title: 'Grade C', desc: 'Standard feed / mixed grade' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrade(g.id as QualityGrade)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        grade === g.id
                          ? 'bg-monsoon text-wheat border-monsoon shadow-sm'
                          : 'bg-soil/5 text-soil border-soil/15 hover:bg-soil/10'
                      }`}
                    >
                      <span className="font-body text-xs font-bold block">{g.title}</span>
                      <span className={`text-[10px] block mt-0.5 ${grade === g.id ? 'text-wheat/70' : 'text-soil/60'}`}>
                        {g.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Quality & Condition */}
              <div>
                <label className="block font-body text-xs font-semibold text-soil mb-2">
                  {lang === 'en' ? 'Visual Quality & Appearance' : 'दृश्य गुणवत्ता व चमक'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Excellent', 'Good', 'Average', 'Poor'] as VisualQuality[]).map((vq) => (
                    <button
                      key={vq}
                      type="button"
                      onClick={() => setVisualQuality(vq)}
                      className={`py-2 px-3 rounded-xl font-body text-xs font-semibold border text-center transition-all cursor-pointer ${
                        visualQuality === vq
                          ? 'bg-monsoon text-wheat border-monsoon shadow-xs'
                          : 'bg-soil/5 text-soil border-soil/15 hover:bg-soil/10'
                      }`}
                    >
                      {vq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Defects / Damage Level & Grain Size Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Damage Level */}
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Defects / Grain Damage Level' : 'क्षति / दाग स्तर'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['None', 'Low', 'Medium', 'High'] as DamageLevel[]).map((dl) => (
                      <button
                        key={dl}
                        type="button"
                        onClick={() => setDamageLevel(dl)}
                        className={`py-2 px-2 rounded-xl font-body text-xs font-semibold border text-center transition-all cursor-pointer ${
                          damageLevel === dl
                            ? 'bg-turmeric text-monsoon font-bold border-turmeric shadow-xs'
                            : 'bg-soil/5 text-soil border-soil/15 hover:bg-soil/10'
                        }`}
                      >
                        {dl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grain Size */}
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Grain Size / Uniformity' : 'दाने का आकार / एकरूपता'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Uniform Bold', 'Medium', 'Small / Mixed'] as GrainSize[]).map((gs) => (
                      <button
                        key={gs}
                        type="button"
                        onClick={() => setGrainSize(gs)}
                        className={`py-2 px-2 rounded-xl font-body text-xs font-semibold border text-center transition-all cursor-pointer truncate ${
                          grainSize === gs
                            ? 'bg-monsoon text-wheat border-monsoon shadow-xs'
                            : 'bg-soil/5 text-soil border-soil/15 hover:bg-soil/10'
                        }`}
                      >
                        {gs}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Moisture, Foreign Matter, Damaged Grain */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Moisture Content (%) (Optional)' : 'नमी प्रतिशत (%) (वैकल्पिक)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-bold focus:outline-none focus:border-turmeric"
                    placeholder="10.5"
                  />
                  {errors.moisture && <p className="text-red-700 font-body text-[11px] mt-1">{errors.moisture}</p>}
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Foreign Matter (%)' : 'अशुद्धता (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={foreignMatter}
                    onChange={(e) => setForeignMatter(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-bold focus:outline-none focus:border-turmeric"
                    placeholder="0.8"
                  />
                  {errors.foreignMatter && <p className="text-red-700 font-body text-[11px] mt-1">{errors.foreignMatter}</p>}
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Damaged / Shriveled (%)' : 'क्षतिग्रस्त दाना (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={damagedGrain}
                    onChange={(e) => setDamagedGrain(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-sm text-soil font-bold focus:outline-none focus:border-turmeric"
                    placeholder="0.5"
                  />
                  {errors.damagedGrain && <p className="text-red-700 font-body text-[11px] mt-1">{errors.damagedGrain}</p>}
                </div>
              </div>

              {/* Quality Notes */}
              <div>
                <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                  {lang === 'en' ? 'Additional Quality Notes & Handling Description' : 'गुणवत्ता विवरण व अतिरिक्त जानकारी'}
                </label>
                <textarea
                  rows={2}
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  placeholder="e.g. Machine cleaned, sun dried on pucca floor, uniform bold grains, zero weevil infestation."
                  className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                />
              </div>

              {/* Quality Certificate Upload Placeholder */}
              <div className="p-4 rounded-2xl bg-soil/5 border border-dashed border-soil/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-turmeric" />
                  <div>
                    <p className="font-body text-xs font-bold text-soil">
                      {lang === 'en' ? 'Quality Certificate / Lab Assay Document (Optional)' : 'गुणवत्ता प्रमाण पत्र / लैब रिपोर्ट (वैकल्पिक)'}
                    </p>
                    <p className="text-[11px] text-soil/60">
                      {certificateUploaded
                        ? 'sample-assay-certificate.pdf (Attached)'
                        : 'Upload NABL / FPO lab assay report for faster verified buyer approval.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCertificateUploaded((prev) => !prev)}
                  className="px-3.5 py-1.5 rounded-xl bg-wheat text-soil font-body text-xs font-semibold border border-soil/20 hover:bg-soil/10 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-turmeric" />
                  <span>{certificateUploaded ? 'Remove File' : 'Upload PDF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION C — PRICING & MARKET BENCHMARK */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-soil/10">
              <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                <DollarSign className="w-5 h-5 text-turmeric" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-soil">
                  {lang === 'en' ? 'Section C — Pricing & Market Reference' : 'भाग ग — मूल्य निर्धारण'}
                </h3>
                <p className="font-body text-xs text-soil/70 mt-0.5">
                  {lang === 'en' ? 'Set your expected target price and minimum acceptable floor price.' : 'अपेक्षित मूल्य व न्यूनतम स्वीकार्य भाव निर्धारित करें।'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Expected Price (₹ / Quintal) *' : 'अपेक्षित भाव (₹/क्विंटल) *'}
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-base text-soil font-bold focus:outline-none focus:border-turmeric"
                    placeholder="2780"
                  />
                  {errors.expectedPrice && <p className="text-red-700 font-body text-[11px] mt-1">{errors.expectedPrice}</p>}
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Minimum Acceptable Price (₹ / Quintal)' : 'न्यूनतम स्वीकार्य भाव (फ्लोर प्राइस)'}
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-mono text-base text-soil font-bold focus:outline-none focus:border-turmeric"
                    placeholder="2650"
                  />
                  {errors.minPrice && <p className="text-red-700 font-body text-[11px] mt-1">{errors.minPrice}</p>}
                </div>
              </div>

              {/* AGMARKNET Benchmark Banner & Compare Markets Link */}
              <div className="p-4 rounded-2xl bg-monsoon text-wheat flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-datateal animate-pulse" />
                    <span className="font-mono text-xs font-semibold text-turmeric">
                      AGMARKNET MANDI BENCHMARK
                    </span>
                  </div>
                  <p className="font-body text-xs text-wheat/80 mt-1">
                    Current nearby Mandi Modal Price for {crop} is <span className="font-mono font-bold text-datateal">₹{marketReferencePrice}/qtl</span>.
                  </p>
                </div>

                <Link
                  to="/farmer/market-intelligence"
                  className="px-3.5 py-1.5 rounded-xl bg-wheat/10 text-wheat font-body text-xs font-semibold hover:bg-wheat/20 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-turmeric" />
                  <span>{lang === 'en' ? 'Compare Markets' : 'मंडी भाव तुलना'}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* SECTION D — LOCATION & LOGISTICS */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-soil/10">
              <div className="p-2.5 bg-monsoon text-wheat rounded-2xl">
                <Truck className="w-5 h-5 text-turmeric" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-soil">
                  {lang === 'en' ? 'Section D — Location & Logistics' : 'भाग घ — स्थान व लॉजिस्टिक्स'}
                </h3>
                <p className="font-body text-xs text-soil/70 mt-0.5">
                  {lang === 'en' ? 'Preferred dispatch godown and pickup point.' : 'उपज का भंडारण स्थान व पिकअप पॉइंट।'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <LocationSelector
                selectedState={stateName}
                selectedDistrict={district}
                onStateChange={(s) => { setStateName(s); setDistrict(''); }}
                onDistrictChange={(d) => setDistrict(d)}
                required
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Village / Tehsil' : 'गांव / तहसील'}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Sirali"
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    {lang === 'en' ? 'Pickup Godown / Landmark *' : 'पिकअप गोदाम / लैंडमार्क *'}
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Godown #2, Main Highway Gate"
                    className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                  {lang === 'en' ? 'Preferred Pickup Location / Godown Address *' : 'पिकअप स्थान / गोदाम का पता *'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sirali Farm Godown #2, Harda-Hoshangabad Road"
                  className="w-full px-4 py-2.5 rounded-xl bg-soil/5 border border-soil/15 font-body text-xs text-soil font-semibold focus:outline-none focus:border-turmeric"
                />
                {errors.location && <p className="text-red-700 font-body text-[11px] mt-1">{errors.location}</p>}
              </div>

              <div className="p-3 bg-soil/5 rounded-2xl border border-soil/10 flex items-center gap-2 text-xs font-body text-soil/70">
                <Info className="w-4 h-4 text-turmeric flex-shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Transport estimate will be calculated after buyer/market selection.'
                    : 'खरीदार व मंडी चयन के बाद सटीक परिवहन लागत की गणना की जाएगी।'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Live Sticky Lot Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-monsoon text-wheat rounded-3xl p-6 border-2 border-turmeric/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-wheat/10">
              <span className="font-mono text-xs font-bold text-turmeric uppercase tracking-wider">
                LOT PREVIEW
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-turmeric/15 text-turmeric border border-turmeric/30">
                DRAFT / LIVE PREVIEW
              </span>
            </div>

            {imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-wheat/20 max-h-40">
                <img src={imageUrl} alt="Lot preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <span className="font-mono text-[11px] text-wheat/50 block">PROPOSED LOT IDENTIFIER</span>
              <p className="font-mono text-xl font-bold text-wheat">
                {isEditing && lotId ? lotId : 'LOT-AGN-PROV'}
              </p>
              <h4 className="font-serif text-2xl font-bold text-wheat mt-1">{crop}</h4>
              <p className="font-body text-xs text-wheat/70">{variety} &bull; <span className="text-wheat/50">{category}</span></p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-wheat/5 border border-wheat/10 rounded-xl p-3">
                <span className="font-body text-[10px] text-wheat/50 block">QUANTITY</span>
                <span className="font-mono text-base font-bold text-wheat">{quantity} {unit}</span>
              </div>

              <div className="bg-wheat/5 border border-wheat/10 rounded-xl p-3">
                <span className="font-body text-[10px] text-wheat/50 block">QUALITY GRADE</span>
                <span className="font-mono text-base font-bold text-datateal">{grade}</span>
              </div>

              <div className="bg-wheat/5 border border-wheat/10 rounded-xl p-3">
                <span className="font-body text-[10px] text-wheat/50 block">MOISTURE</span>
                <span className="font-mono text-base font-bold text-wheat">{moisture}%</span>
              </div>

              <div className="bg-wheat/5 border border-wheat/10 rounded-xl p-3">
                <span className="font-body text-[10px] text-wheat/50 block">EXPECTED PRICE</span>
                <span className="font-mono text-base font-bold text-turmeric">₹{expectedPrice.toLocaleString('en-IN')}<span className="text-[10px] text-wheat/50">/qtl</span></span>
              </div>
            </div>

            {/* Financial Valuation Card */}
            <div className="p-4 bg-wheat/10 rounded-2xl border border-turmeric/30">
              <span className="font-body text-xs text-wheat/70 block">{lang === 'en' ? 'Estimated Gross Value' : 'अनुमानित कुल मूल्य'}</span>
              <p className="font-mono text-3xl font-bold text-datateal mt-1">
                ₹{grossEstimatedValue.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-wheat/10 text-xs font-mono text-wheat/60">
                <span>Floor Minimum:</span>
                <span className="text-wheat font-semibold">₹{(minPrice * quantityInQuintals).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Primary Action Buttons in Preview */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('Active')}
                className="w-full py-3 px-4 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isEditing ? (lang === 'en' ? 'Update & Publish Lot' : 'अपडेट व प्रकाशित करें') : (lang === 'en' ? 'Publish Lot to Network' : 'लॉट प्रकाशित करें')}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('Draft')}
                className="w-full py-2.5 px-4 rounded-xl bg-wheat/10 text-wheat font-body text-xs font-semibold hover:bg-wheat/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-turmeric" />
                <span>{lang === 'en' ? 'Save as Draft' : 'ड्राफ्ट सहेजें'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/farmer/lots')}
                className="w-full py-2 text-center text-wheat/50 hover:text-wheat font-body text-xs transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Cancel & Return' : 'रद्द करें'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
