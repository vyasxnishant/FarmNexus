import { useState, useEffect, FormEvent } from 'react'
import {
  User,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  Landmark,
  FileBadge,
  Award,
  CheckCircle2,
  HelpCircle,
  QrCode,
  Sprout,
  Edit3,
  Save,
  X,
  Mail,
  AlertCircle,
  CreditCard,
  Lock,
  PlusCircle,
  RefreshCw,
  Check
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'
import { LocationSelector } from '../../ui/LocationSelector'
import { bankApi } from '../../../services/apiServices'

export function ProfileView() {
  const { currentUser, updateUserProfile, lang } = useDashboard()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
    district: currentUser?.district || '',
    state: currentUser?.state || 'Madhya Pradesh',
    organization: currentUser?.organization || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Bank & Settlement Details State
  const [bankDetails, setBankDetails] = useState<{
    is_configured: boolean
    bank_name: string | null
    account_holder_name: string | null
    bank_account_masked: string | null
    ifsc_code_masked: string | null
    upi_id_masked: string | null
  }>({
    is_configured: false,
    bank_name: null,
    account_holder_name: null,
    bank_account_masked: null,
    ifsc_code_masked: null,
    upi_id_masked: null,
  })
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [bankFormData, setBankFormData] = useState({
    account_holder_name: currentUser?.name || '',
    bank_name: '',
    account_number: '',
    confirm_account_number: '',
    ifsc_code: '',
    upi_id: '',
  })
  const [bankError, setBankError] = useState<string | null>(null)
  const [isBankSaving, setIsBankSaving] = useState(false)
  const [bankSuccessMsg, setBankSuccessMsg] = useState<string | null>(null)

  const isBuyer = currentUser?.user_type === 'BUYER'
  const isAdmin = currentUser?.user_type === 'ADMIN'

  // Fetch Bank Details for authenticated farmer on mount
  useEffect(() => {
    const loadBankDetails = async () => {
      if (currentUser?.user_type === 'FARMER' || currentUser?.user_type === 'ADMIN') {
        try {
          const res = await bankApi.getBankDetails()
          if (res.data) {
            setBankDetails(res.data)
            if (res.data.bank_name) {
              setBankFormData(prev => ({
                ...prev,
                bank_name: res.data.bank_name || '',
                account_holder_name: res.data.account_holder_name || currentUser?.name || '',
              }))
            }
          }
        } catch (err) {
          console.warn('[ProfileView] Failed to load settlement bank details', err)
        }
      }
    }
    loadBankDetails()
  }, [currentUser])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage(null)

    try {
      await updateUserProfile(formData)
      setIsEditing(false)
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(null), 4000)
    } catch (err: any) {
      setSaveMessage(err.message || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBankSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBankError(null)
    setBankSuccessMsg(null)

    // Basic Frontend Validations
    if (!bankFormData.account_holder_name.trim() || !bankFormData.bank_name.trim()) {
      setBankError('Please enter Account Holder Name and Bank Name.')
      return
    }

    const cleanAcc = bankFormData.account_number.trim().replace(/\s+/g, '')
    const cleanConfirm = bankFormData.confirm_account_number.trim().replace(/\s+/g, '')

    if (!cleanAcc || !/^\d{9,18}$/.test(cleanAcc)) {
      setBankError('Account Number must be between 9 and 18 numeric digits.')
      return
    }

    if (cleanAcc !== cleanConfirm) {
      setBankError('Account Number and Confirm Account Number do not match.')
      return
    }

    const cleanIfsc = bankFormData.ifsc_code.trim().toUpperCase()
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setBankError('Invalid IFSC Code format (e.g. SBIN0000382, HDFC0001234).')
      return
    }

    if (bankFormData.upi_id.trim() && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(bankFormData.upi_id.trim())) {
      setBankError('Invalid UPI ID format (e.g. farmer@sbi, name@okhdfcbank).')
      return
    }

    setIsBankSaving(true)
    try {
      const res = await bankApi.updateBankDetails({
        account_holder_name: bankFormData.account_holder_name.trim(),
        bank_name: bankFormData.bank_name.trim(),
        account_number: cleanAcc,
        confirm_account_number: cleanConfirm,
        ifsc_code: cleanIfsc,
        upi_id: bankFormData.upi_id.trim() || undefined,
      })

      if (res.data) {
        setBankDetails(res.data)
      }
      setBankSuccessMsg('Bank details saved & encrypted successfully!')
      setBankFormData(prev => ({ ...prev, account_number: '', confirm_account_number: '' }))
      setTimeout(() => {
        setIsBankModalOpen(false)
        setBankSuccessMsg(null)
      }, 1500)
    } catch (err: any) {
      setBankError(err.response?.data?.message || err.message || 'Failed to update bank details.')
    } finally {
      setIsBankSaving(false)
    }
  }

  const getInitials = (name?: string | null): string => {
    if (!name || typeof name !== 'string') return 'FN'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'FN'
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    const first = parts[0].charAt(0)
    const second = parts[1].charAt(0)
    return `${first}${second}`.toUpperCase()
  }

  const formattedLocation = [currentUser?.location, currentUser?.district, currentUser?.state].filter(Boolean).join(', ') || 'Central Region, India'

  return (
    <div className="space-y-8">
      {/* Profile Banner */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-monsoon text-turmeric flex items-center justify-center font-serif text-3xl font-bold border-2 border-turmeric/40 flex-shrink-0">
              {getInitials(currentUser?.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-serif text-3xl font-semibold text-soil">
                  {currentUser?.name || 'Account Holder'}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-body text-datateal bg-monsoon px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentUser?.user_type === 'ADMIN'
                    ? 'Platform Administrator'
                    : isBuyer
                    ? 'Verified Institutional Buyer'
                    : 'Verified Agricultural Producer'}
                </span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  currentUser?.status === 'Active'
                    ? 'bg-emerald-500/15 text-emerald-800'
                    : 'bg-amber-500/15 text-amber-800'
                }`}>
                  {currentUser?.status || 'Active'}
                </span>
              </div>
              <p className="font-body text-xs text-soil/70 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-turmeric shrink-0" />
                <span>{formattedLocation}</span>
              </p>
              <p className="font-mono text-xs text-soil/60 mt-1 flex items-center gap-4">
                <span>{currentUser?.phone || '—'}</span>
                <span>•</span>
                <span>{currentUser?.email || '—'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-monsoon text-wheat font-body font-bold text-xs hover:bg-monsoon/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-turmeric" />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-body flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-semibold text-soil flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-turmeric" />
            <span>Update Account Profile</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 font-body text-xs">
            <div>
              <label className="block font-semibold text-soil mb-1">Full / Contact Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-body focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-soil mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-body focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-soil mb-1">Organization / FPO / Enterprise</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-body focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <LocationSelector
                selectedState={formData.state}
                selectedDistrict={formData.district}
                onStateChange={(state) => setFormData(prev => ({ ...prev, state, district: '' }))}
                onDistrictChange={(district) => setFormData(prev => ({ ...prev, district }))}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-soil mb-1">Village / Local Address / Delivery Hub</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-body focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-soil/10 text-soil font-body font-bold text-xs hover:bg-soil/15 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-turmeric text-monsoon font-body font-bold text-xs hover:bg-turmeric/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2-Column Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verification Badges Card */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-semibold text-soil flex items-center gap-2">
            <Award className="w-5 h-5 text-turmeric" />
            <span>KYC & Verification Status</span>
          </h3>

          <div className="space-y-3 font-body text-xs">
            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-datateal" />
                <div>
                  <p className="font-semibold text-soil">Government KYC Status</p>
                  <p className="text-soil/50 text-[11px]">
                    {currentUser?.kyc_verified ? 'Verified & Authenticated' : 'Under Review / Active'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-datateal bg-monsoon px-2 py-0.5 rounded">
                {currentUser?.kyc_verified ? 'VERIFIED' : 'ACTIVE'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-datateal" />
                <div>
                  <p className="font-semibold text-soil">Registered Email Identity</p>
                  <p className="text-soil/50 text-[11px]">{currentUser?.email}</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-datateal bg-monsoon px-2 py-0.5 rounded">LINKED</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-datateal" />
                <div>
                  <p className="font-semibold text-soil">APMC Trading Clearance</p>
                  <p className="text-soil/50 text-[11px]">Authorized for Direct Virtual Escrow Deals</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-turmeric bg-monsoon px-2 py-0.5 rounded">AUTHORIZED</span>
            </div>
          </div>
        </div>

        {/* Organization / Farm Info */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-semibold text-soil flex items-center gap-2">
            {isBuyer ? <Building2 className="w-5 h-5 text-turmeric" /> : <Sprout className="w-5 h-5 text-turmeric" />}
            <span>{isBuyer ? 'Enterprise Information' : 'Farm & FPO Profile'}</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 font-body text-xs">
            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10">
              <span className="text-soil/50 block text-[11px]">Organization / Entity</span>
              <span className="font-semibold text-soil block text-sm mt-0.5">
                {currentUser?.organization || (isBuyer ? 'Institutional Buyer' : 'Independent Farmer')}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10">
              <span className="text-soil/50 block text-[11px]">Operational Hub</span>
              <span className="font-semibold text-soil block text-sm mt-0.5">
                {[currentUser?.district || currentUser?.location, currentUser?.state].filter(Boolean).join(', ') || 'Madhya Pradesh'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 col-span-2">
              <span className="text-soil/50 block text-[11px]">Primary Trading Scope</span>
              <span className="font-semibold text-soil block text-sm mt-0.5">
                {isBuyer ? 'Spot & Forward APMC Procurement' : 'Grade A Certified Grains & Oilseeds'}
              </span>
              <span className="text-[11px] text-soil/70 block mt-0.5">Direct farm-gate to processor dispatch</span>
            </div>
          </div>
        </div>

        {/* USER-SPECIFIC BANK & SETTLEMENT DETAILS (No fake/hardcoded escrow) */}
        <div className="bg-monsoon text-wheat rounded-3xl border border-wheat/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-semibold text-wheat flex items-center gap-2">
              <Landmark className="w-5 h-5 text-turmeric" />
              <span>Bank & Settlement Details</span>
            </h3>
            {bankDetails.is_configured && (
              <span className="font-mono text-[10px] text-datateal bg-monsoon border border-datateal/40 px-2 py-0.5 rounded-full font-bold">
                LINKED & ACTIVE
              </span>
            )}
          </div>

          <div className="space-y-3 font-body text-xs">
            {!bankDetails.is_configured ? (
              <div className="p-4 rounded-2xl bg-wheat/5 border border-wheat/10 space-y-3 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-turmeric block uppercase">
                      Settlement Setup
                    </span>
                    <p className="text-wheat/80 font-body text-xs mt-0.5">
                      Payment settlement account not configured.
                    </p>
                    <p className="text-wheat/50 text-[11px] mt-0.5">
                      Add your verified Indian bank account to receive trade disbursements directly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBankError(null)
                      setIsBankModalOpen(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-turmeric text-monsoon font-body font-bold text-xs hover:bg-turmeric/90 transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Bank Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-wheat/5 border border-wheat/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-wheat/50 block text-[11px]">Bank Name & Holder</span>
                    <span className="font-serif font-bold text-wheat text-sm">
                      {bankDetails.bank_name} &bull; {bankDetails.account_holder_name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBankError(null)
                      setIsBankModalOpen(true)
                    }}
                    className="px-3 py-1 rounded-lg bg-wheat/10 text-wheat hover:bg-wheat/20 font-body text-xs font-bold transition-colors cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-wheat/10 font-mono text-xs">
                  <div>
                    <span className="text-wheat/50 block text-[10px] uppercase">Account Number</span>
                    <span className="font-bold text-wheat">{bankDetails.bank_account_masked}</span>
                  </div>
                  <div>
                    <span className="text-wheat/50 block text-[10px] uppercase">IFSC Code</span>
                    <span className="font-bold text-datateal">{bankDetails.ifsc_code_masked}</span>
                  </div>
                </div>

                {bankDetails.upi_id_masked && (
                  <div className="pt-2 border-t border-wheat/10 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-wheat/50 block text-[10px] uppercase">Linked VPA / UPI ID</span>
                      <span className="font-semibold text-turmeric">{bankDetails.upi_id_masked}</span>
                    </div>
                    <QrCode className="w-5 h-5 text-wheat/40" />
                  </div>
                )}

                <div className="pt-2 text-[10px] text-wheat/40 font-body border-t border-wheat/10">
                  <span>Settlement Setup (Demo Settlement Reference) &bull; 256-bit encrypted storage</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support & Helpline */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-semibold text-soil flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-turmeric" />
            <span>FarmNexus Support & Operations Desk</span>
          </h3>

          <p className="font-body text-xs text-soil/70 leading-relaxed">
            Need assistance with KYC re-verification, transport coordination, or trade contract settlement?
          </p>

          <div className="space-y-2 font-body text-xs">
            <div className="p-3 rounded-xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <span className="text-soil/70">Toll-Free Kisan Desk:</span>
              <strong className="font-mono text-soil">1800-419-FARM</strong>
            </div>
            <div className="p-3 rounded-xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <span className="text-soil/70">e-NAM Support Center:</span>
              <strong className="font-mono text-soil">1800-270-0224</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Settlement Bank Details Form Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-6 h-6 text-turmeric" />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-soil">Settlement Bank Details</h3>
                  <p className="font-body text-xs text-soil/60">Configure your direct settlement account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="text-soil/40 hover:text-soil text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bankError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-body flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bankError}</span>
              </div>
            )}

            {bankSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-body flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bankSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleBankSubmit} className="space-y-4 font-body text-xs text-soil">
              <div>
                <label className="block font-semibold mb-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={bankFormData.account_holder_name}
                  onChange={(e) => setBankFormData({ ...bankFormData, account_holder_name: e.target.value })}
                  className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-semibold focus:outline-none focus:border-turmeric"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Bank of India, Punjab National Bank, HDFC Bank"
                  value={bankFormData.bank_name}
                  onChange={(e) => setBankFormData({ ...bankFormData, bank_name: e.target.value })}
                  className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-semibold focus:outline-none focus:border-turmeric"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="9 to 18 numeric digits"
                    value={bankFormData.account_number}
                    onChange={(e) => setBankFormData({ ...bankFormData, account_number: e.target.value })}
                    className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-mono focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Confirm Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Re-enter account number"
                    value={bankFormData.confirm_account_number}
                    onChange={(e) => setBankFormData({ ...bankFormData, confirm_account_number: e.target.value })}
                    className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-mono focus:outline-none focus:border-turmeric"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0000382"
                    value={bankFormData.ifsc_code}
                    onChange={(e) => setBankFormData({ ...bankFormData, ifsc_code: e.target.value.toUpperCase() })}
                    className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-mono uppercase focus:outline-none focus:border-turmeric"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ramesh@sbi"
                    value={bankFormData.upi_id}
                    onChange={(e) => setBankFormData({ ...bankFormData, upi_id: e.target.value })}
                    className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-mono focus:outline-none focus:border-turmeric"
                  />
                </div>
              </div>

              <div className="p-3 bg-soil/5 border border-soil/10 rounded-xl text-[11px] text-soil/70 flex items-start gap-2">
                <Lock className="w-4 h-4 text-turmeric shrink-0 mt-0.5" />
                <span>
                  <strong>Security Guarantee:</strong> FarmNexus encrypts all banking details using AES-256 at rest. We never request ATM PIN, CVV, Card Numbers, or passwords.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-soil/10 text-soil font-body text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isBankSaving}
                  className="px-6 py-2 rounded-xl bg-turmeric text-monsoon font-body text-xs font-bold hover:bg-turmeric/90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isBankSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Encrypting & Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Bank Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
