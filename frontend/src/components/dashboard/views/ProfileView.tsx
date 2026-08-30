import { useState, FormEvent } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

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

  const isBuyer = currentUser?.user_type === 'BUYER'
  const isAdmin = currentUser?.user_type === 'ADMIN'

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

  const getInitials = (name?: string) => {
    if (!name) return 'FN'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

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
                <MapPin className="w-3.5 h-3.5 text-turmeric" />
                <span>{currentUser?.location || 'Central Region'}, {currentUser?.district}, {currentUser?.state}</span>
              </p>
              <p className="font-mono text-xs text-soil/60 mt-1 flex items-center gap-4">
                <span>{currentUser?.phone}</span>
                <span>•</span>
                <span>{currentUser?.email}</span>
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

            <div>
              <label className="block font-semibold text-soil mb-1">Village / Address / Delivery Point</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-body focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-soil mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 text-soil font-body focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-soil mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                {currentUser?.district || 'Harda'}, {currentUser?.state || 'M.P.'}
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

        {/* Banking & UPI */}
        <div className="bg-monsoon text-wheat rounded-3xl border border-wheat/10 p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-wheat flex items-center gap-2">
            <Landmark className="w-5 h-5 text-turmeric" />
            <span>Virtual Escrow Settlement Details</span>
          </h3>

          <div className="space-y-3 font-body text-xs">
            <div className="p-3.5 rounded-2xl bg-wheat/5 border border-wheat/10">
              <span className="text-wheat/50 block text-[11px]">Virtual Vault Escrow Account</span>
              <span className="font-mono text-base font-bold text-wheat">
                ESC-ICICI-••••-{currentUser?.id ? currentUser.id.slice(-4) : '2026'}
              </span>
              <span className="text-wheat/50 block text-[11px]">Two-party automated ledger settlement</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-wheat/5 border border-wheat/10 flex items-center justify-between">
              <div>
                <span className="text-wheat/50 block text-[11px]">Registered Payer/Payee ID</span>
                <span className="font-mono text-sm font-semibold text-datateal">
                  {currentUser?.name ? `${currentUser.name.toLowerCase().replace(/\s+/g, '.')}@icici` : 'user@icici'}
                </span>
              </div>
              <QrCode className="w-6 h-6 text-wheat/40" />
            </div>
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
    </div>
  )
}
