import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sprout,
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  FileText,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { LocationSelector } from '../ui/LocationSelector'
import { isValidDistrictForState } from '../../data/indiaLocations'

export function RegisterView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, lang } = useDashboard()

  const initialRole = searchParams.get('role') === 'buyer' ? 'BUYER' : 'FARMER'
  const [role, setRole] = useState<'FARMER' | 'BUYER'>(initialRole)

  // Farmer Form State
  const [farmerData, setFarmerData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    state: '',
    district: '',
    village: '',
    totalLandAcres: '10',
    fpoName: '',
  })

  // Buyer Form State
  const [buyerData, setBuyerData] = useState({
    companyName: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    gstNumber: '',
    state: '',
    district: '',
    deliveryLocation: '',
    procurementCrop: 'Wheat (Sharbati)',
  })

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'buyer') setRole('BUYER')
    else if (roleParam === 'farmer') setRole('FARMER')
  }, [searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (role === 'FARMER') {
      if (!farmerData.name.trim() || !farmerData.phone.trim() || !farmerData.email.trim() || !farmerData.password.trim()) {
        setError('Please fill in all required farmer fields.')
        return
      }
      if (!farmerData.state) {
        setError('Please select your State.')
        return
      }
      if (!farmerData.district) {
        setError('Please select your District.')
        return
      }
      if (!isValidDistrictForState(farmerData.state, farmerData.district)) {
        setError(`"${farmerData.district}" is not a valid district in ${farmerData.state}.`)
        return
      }
      if (farmerData.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      setIsLoading(true)
      try {
        await register({
          name: farmerData.name.trim(),
          phone: farmerData.phone.trim(),
          email: farmerData.email.trim(),
          password: farmerData.password,
          user_type: 'FARMER',
          location: farmerData.village.trim() || `${farmerData.district}, ${farmerData.state}`,
          district: farmerData.district,
          state: farmerData.state,
          organization: farmerData.fpoName.trim(),
          total_land_acres: Number(farmerData.totalLandAcres) || 10,
        })
        navigate('/farmer', { replace: true })
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your details.'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    } else {
      if (!buyerData.companyName.trim() || !buyerData.name.trim() || !buyerData.phone.trim() || !buyerData.email.trim() || !buyerData.password.trim()) {
        setError('Please fill in all required buyer organization fields.')
        return
      }
      if (!buyerData.state) {
        setError('Please select your operating State.')
        return
      }
      if (!buyerData.district) {
        setError('Please select your operating District.')
        return
      }
      if (!isValidDistrictForState(buyerData.state, buyerData.district)) {
        setError(`"${buyerData.district}" is not a valid district in ${buyerData.state}.`)
        return
      }
      if (buyerData.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      setIsLoading(true)
      try {
        await register({
          name: buyerData.name.trim(),
          phone: buyerData.phone.trim(),
          email: buyerData.email.trim(),
          password: buyerData.password,
          user_type: 'BUYER',
          company_name: buyerData.companyName.trim(),
          organization: buyerData.companyName.trim(),
          gst_number: buyerData.gstNumber.trim() || '23AAACA0000A1Z0',
          location: buyerData.deliveryLocation.trim() || `${buyerData.district}, ${buyerData.state}`,
          district: buyerData.district,
          state: buyerData.state,
        })
        navigate('/buyer/dashboard', { replace: true })
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your details.'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-monsoon flex flex-col justify-between relative overflow-hidden py-12 px-6">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #5FD0C0 1px, transparent 1px), radial-gradient(circle, #E4A335 1px, transparent 1px)',
        backgroundSize: '40px 40px, 60px 60px',
      }} />

      {/* Header with Logo */}
      <div className="relative z-10 max-w-xl w-full mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-3 group mb-4">
          <img
            src="/logo.jpg"
            alt="FarmNexus Logo"
            className="w-12 h-12 rounded-2xl object-cover border border-wheat/20 shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="text-left">
            <span className="font-serif text-2xl font-bold text-wheat tracking-tight block leading-none">
              FarmNexus
            </span>
            <span className="font-mono text-[10px] uppercase font-medium text-turmeric tracking-wider">
              Registration Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="relative z-10 max-w-xl w-full mx-auto my-auto">
        <div className="bg-wheat rounded-3xl p-8 sm:p-10 shadow-2xl border border-soil/15 text-soil space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-3xl font-bold text-soil">
              {lang === 'en' ? 'Create Your Account' : 'नया खाता बनाएं'}
            </h2>
            <p className="font-body text-xs text-soil/70">
              Join India's unified agricultural market network with direct APMC price intelligence
            </p>
          </div>

          {/* Role Tab Switcher (Farmer vs Buyer) */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-soil/10 border border-soil/15">
            <button
              type="button"
              onClick={() => { setRole('FARMER'); setError(null); }}
              className={`py-3 rounded-xl font-body font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'FARMER'
                  ? 'bg-turmeric text-monsoon shadow-sm'
                  : 'text-soil/70 hover:text-soil'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Farmer / FPO</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('BUYER'); setError(null); }}
              className={`py-3 rounded-xl font-body font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'BUYER'
                  ? 'bg-monsoon text-wheat shadow-sm'
                  : 'text-soil/70 hover:text-soil'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#5FD0C0]" />
              <span>Corporate Buyer</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-body flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'FARMER' ? (
              // FARMER FIELDS
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={farmerData.name}
                        onChange={(e) => setFarmerData({ ...farmerData, name: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98261 00000"
                        value={farmerData.phone}
                        onChange={(e) => setFarmerData({ ...farmerData, phone: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="email"
                        required
                        placeholder="farmer@example.com"
                        value={farmerData.email}
                        onChange={(e) => setFarmerData({ ...farmerData, email: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={farmerData.password}
                        onChange={(e) => setFarmerData({ ...farmerData, password: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC REUSABLE STATE & DISTRICT SELECTOR */}
                <LocationSelector
                  selectedState={farmerData.state}
                  selectedDistrict={farmerData.district}
                  onStateChange={(state) => setFarmerData(prev => ({ ...prev, state, district: '' }))}
                  onDistrictChange={(district) => setFarmerData(prev => ({ ...prev, district }))}
                  required
                />

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Village / Tehsil
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sirali"
                      value={farmerData.village}
                      onChange={(e) => setFarmerData({ ...farmerData, village: e.target.value })}
                      className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Cultivated Land (Acres)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={farmerData.totalLandAcres}
                      onChange={(e) => setFarmerData({ ...farmerData, totalLandAcres: e.target.value })}
                      className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      FPO / Cooperative
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Narmada Valley FPO"
                      value={farmerData.fpoName}
                      onChange={(e) => setFarmerData({ ...farmerData, fpoName: e.target.value })}
                      className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              // BUYER FIELDS
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Company / Enterprise Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. AgroCorp Direct India Ltd."
                        value={buyerData.companyName}
                        onChange={(e) => setBuyerData({ ...buyerData, companyName: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Authorized Contact Person *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sunil Aggarwal"
                        value={buyerData.name}
                        onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Corporate Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="email"
                        required
                        placeholder="procurement@agrocorp.com"
                        value={buyerData.email}
                        onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 731 000000"
                        value={buyerData.phone}
                        onChange={(e) => setBuyerData({ ...buyerData, phone: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={buyerData.password}
                        onChange={(e) => setBuyerData({ ...buyerData, password: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      GSTIN Number (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                      <input
                        type="text"
                        placeholder="23AAACA1234F1Z8"
                        value={buyerData.gstNumber}
                        onChange={(e) => setBuyerData({ ...buyerData, gstNumber: e.target.value })}
                        className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC REUSABLE STATE & DISTRICT SELECTOR FOR BUYER */}
                <LocationSelector
                  selectedState={buyerData.state}
                  selectedDistrict={buyerData.district}
                  onStateChange={(state) => setBuyerData(prev => ({ ...prev, state, district: '' }))}
                  onDistrictChange={(district) => setBuyerData(prev => ({ ...prev, district }))}
                  stateLabel="Operating State / UT"
                  districtLabel="Primary Mandi Hub / District"
                  required
                />

                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1">
                    Processing Plant / Warehouse Delivery Point
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-soil/40" />
                    <input
                      type="text"
                      placeholder="e.g. Processing Terminal, AB Road Industrial Area"
                      value={buyerData.deliveryLocation}
                      onChange={(e) => setBuyerData({ ...buyerData, deliveryLocation: e.target.value })}
                      className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-10 pr-3 py-2.5 font-body text-xs text-soil focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 rounded-xl bg-turmeric text-monsoon font-body font-bold text-sm hover:bg-turmeric/90 active:bg-turmeric/80 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <span>Create {role === 'FARMER' ? 'Farmer' : 'Buyer'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="font-body text-xs text-soil/70">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-turmeric hover:underline">
                Sign In to Your Portal
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="relative z-10 text-center text-wheat/40 font-body text-xs mt-6">
        <p>FarmNexus Platform • Verified Agricultural Producer & Institutional Buyer Rails</p>
      </div>
    </div>
  )
}
