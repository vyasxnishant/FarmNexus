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
  Sprout
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { DemoDataBadge, LiveSignalBadge } from '../components/DemoDataBadge'

export function ProfileView() {
  const { profile, lang } = useDashboard()

  return (
    <div className="space-y-8">
      {/* Profile Banner */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-monsoon text-turmeric flex items-center justify-center font-serif text-3xl font-bold border-2 border-turmeric/40 flex-shrink-0">
              RP
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-serif text-3xl font-semibold text-soil">{profile.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs font-body text-datateal bg-monsoon px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Verified Producer' : 'सत्यापित उत्पादक'}
                </span>
              </div>
              <p className="font-body text-xs text-soil/70 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-turmeric" />
                <span>{profile.village}, {profile.district}, {profile.state} — {profile.pincode}</span>
              </p>
              <p className="font-mono text-xs text-soil/60 mt-1">
                {profile.phone} • {lang === 'en' ? `Member since ${profile.memberSince}` : `सदस्यता: ${profile.memberSince}`}
              </p>
            </div>
          </div>

          <DemoDataBadge />
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verification Badges Card */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-semibold text-soil flex items-center gap-2">
            <Award className="w-5 h-5 text-turmeric" />
            {lang === 'en' ? 'KYC & Public Digital Rail Badges' : 'केवाईसी व प्रमाणन बैज'}
          </h3>

          <div className="space-y-3 font-body text-xs">
            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-datateal" />
                <div>
                  <p className="font-semibold text-soil">Aadhaar & Land Record KYC</p>
                  <p className="text-soil/50 text-[11px]">e-Khata MP Bhu-Abhilekh Verified</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-datateal bg-monsoon px-2 py-0.5 rounded">AUTHENTICATED</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-datateal" />
                <div>
                  <p className="font-semibold text-soil">Kisan Credit Card (KCC)</p>
                  <p className="text-soil/50 text-[11px]">SBI Harda Main Branch (Limit: ₹6.5 Lakh)</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-datateal bg-monsoon px-2 py-0.5 rounded">LINKED</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-datateal" />
                <div>
                  <p className="font-semibold text-soil">Soil Health Card Certified</p>
                  <p className="text-soil/50 text-[11px]">Nitrogen & Organic Carbon Assayed 2026</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-turmeric bg-monsoon px-2 py-0.5 rounded">GRADE A LAB</span>
            </div>
          </div>
        </div>

        {/* Landholding & Production */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-semibold text-soil flex items-center gap-2">
            <Sprout className="w-5 h-5 text-turmeric" />
            {lang === 'en' ? 'Landholding & Farm Profile' : 'भूमि व फसल विवरण'}
          </h3>

          <div className="grid grid-cols-2 gap-3 font-body text-xs">
            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10">
              <span className="text-soil/50 block text-[11px]">{lang === 'en' ? 'Cultivated Land' : 'कृषि भूमि'}</span>
              <span className="font-mono text-xl font-bold text-soil">{profile.totalLandAcres} Acres</span>
              <span className="text-[10px] text-soil/60 block mt-0.5">100% Narmada Canal Irrigated</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10">
              <span className="text-soil/50 block text-[11px]">{lang === 'en' ? 'Primary Crops' : 'प्रमुख फसलें'}</span>
              <span className="font-semibold text-soil block text-sm">Wheat, Soybean</span>
              <span className="text-[10px] text-soil/60 block mt-0.5">Chana & Mustard (Rabi)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-soil/5 border border-soil/10 col-span-2">
              <span className="text-soil/50 block text-[11px]">{lang === 'en' ? 'FPO Affiliation' : 'FPO संबद्धता'}</span>
              <span className="font-semibold text-soil block text-sm">{profile.fpoName}</span>
              <span className="text-[11px] text-soil/70 block mt-0.5">{profile.fpoRole}</span>
            </div>
          </div>
        </div>

        {/* Banking & UPI */}
        <div className="bg-monsoon text-wheat rounded-3xl border border-wheat/10 p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-wheat flex items-center gap-2">
            <Landmark className="w-5 h-5 text-turmeric" />
            {lang === 'en' ? 'Settlement Bank & UPI Details' : 'बैंक व UPI विवरण'}
          </h3>

          <div className="space-y-3 font-body text-xs">
            <div className="p-3.5 rounded-2xl bg-wheat/5 border border-wheat/10">
              <span className="text-wheat/50 block text-[11px]">{lang === 'en' ? 'Bank Account' : 'बैंक खाता'}</span>
              <span className="font-mono text-base font-bold text-wheat">{profile.bankAccountMasked}</span>
              <span className="text-wheat/50 block text-[11px]">State Bank of India • IFSC: SBIN0000382</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-wheat/5 border border-wheat/10 flex items-center justify-between">
              <div>
                <span className="text-wheat/50 block text-[11px]">{lang === 'en' ? 'Linked VPA / UPI ID' : 'UPI आईडी'}</span>
                <span className="font-mono text-sm font-semibold text-datateal">{profile.upiId}</span>
              </div>
              <QrCode className="w-6 h-6 text-wheat/40" />
            </div>
          </div>
        </div>

        {/* Support & Helpline */}
        <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-semibold text-soil flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-turmeric" />
            {lang === 'en' ? 'Farmer Support & Advisory' : 'किसान सहायता व मार्गदर्शन'}
          </h3>

          <p className="font-body text-xs text-soil/70 leading-relaxed">
            {lang === 'en'
              ? 'Need help grading your crop, arranging transport, or resolving an escrow transaction?'
              : 'फसल ग्रेडिंग, वाहन व्यवस्था या भुगतान संबंधी सहायता के लिए संपर्क करें।'}
          </p>

          <div className="space-y-2 font-body text-xs">
            <div className="p-3 rounded-xl bg-soil/5 border border-soil/10 flex items-center justify-between">
              <span className="text-soil/70">FarmNexus Kisan Desk:</span>
              <strong className="font-mono text-soil">1800-419-FARM (Toll Free)</strong>
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

