import { useState } from 'react'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ArrowDownToLine,
  ShieldCheck,
  QrCode,
  FileCheck
} from 'lucide-react'
import { useDashboard, type PaymentStatus } from '../../../context/DashboardContext'
import { DemoDataBadge, LiveSignalBadge } from '../components/DemoDataBadge'

export function PaymentsView() {
  const { payments, profile, lang } = useDashboard()
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | 'All'>('All')

  const filterTabs: (PaymentStatus | 'All')[] = ['All', 'Paid', 'Processing', 'Pending', 'Delayed']

  const filteredPayments = payments.filter(p => {
    if (activeFilter === 'All') return true
    return p.status === activeFilter
  })

  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0)
  const totalInProcessing = payments
    .filter(p => p.status === 'Processing' || p.status === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="space-y-8">
      {/* Header & Payout Summary */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lang === 'en' ? 'UPI & e-NWR Escrow' : 'UPI व e-NWR एस्क्रो'}
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-soil">
              {lang === 'en' ? 'Payments & Transactions' : 'भुगतान व लेनदेन'}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1">
              {lang === 'en'
                ? 'Automated escrow disbursements directly to your linked Kisan bank account via UPI.'
                : 'UPI के माध्यम से किसान बैंक खाते में सुरक्षित एस्क्रो हस्तांतरण।'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LiveSignalBadge text="100% ESCROW PROTECTED" />
          </div>
        </div>

        {/* 2 Big Stat Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-soil/10">
          <div className="bg-monsoon text-wheat p-5 rounded-2xl border border-wheat/10 flex items-center justify-between">
            <div>
              <span className="font-body text-xs text-wheat/60">{lang === 'en' ? 'Total Settled Payouts' : 'कुल प्राप्त भुगतान'}</span>
              <div className="font-mono text-3xl font-bold text-datateal mt-1">
                ₹{totalPaid.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-wheat/10 flex items-center justify-center text-datateal">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-soil/5 text-soil p-5 rounded-2xl border border-soil/10 flex items-center justify-between">
            <div>
              <span className="font-body text-xs text-soil/60">{lang === 'en' ? 'Funds in Escrow / Processing' : 'एस्क्रो में प्रक्रियाधीन राशि'}</span>
              <div className="font-mono text-3xl font-bold text-soil mt-1">
                ₹{totalInProcessing.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-turmeric/20 flex items-center justify-center text-monsoon">
              <Clock className="w-6 h-6 text-turmeric" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-soil/10">
          {filterTabs.map((tab) => {
            const count = tab === 'All' ? payments.length : payments.filter(p => p.status === tab).length
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === tab
                    ? 'bg-monsoon text-wheat font-semibold shadow-sm'
                    : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                }`}
              >
                <span>{tab}</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab ? 'bg-turmeric text-monsoon' : 'bg-soil/10 text-soil/60'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Linked Account Card */}
      <div className="bg-monsoon text-wheat rounded-3xl border border-wheat/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-turmeric/20 text-turmeric flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-body text-xs text-wheat/60">{lang === 'en' ? 'Primary Payout Bank Account' : 'प्राथमिक बैंक खाता'}</p>
            <p className="font-mono text-sm font-bold text-wheat">{profile.bankAccountMasked}</p>
            <p className="font-mono text-xs text-wheat/50">UPI ID: {profile.upiId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-datateal bg-datateal/10 border border-datateal/20 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4" />
          <span>NPCI Auto-Direct Active</span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soil/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-soil/50">{payment.id}</span>
                  <span
                    className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      payment.status === 'Paid'
                        ? 'bg-datateal/20 text-soil border border-datateal/40'
                        : payment.status === 'Processing'
                        ? 'bg-turmeric/20 text-soil border border-turmeric/40'
                        : payment.status === 'Pending'
                        ? 'bg-soil/10 text-soil/70'
                        : 'bg-red-500/10 text-red-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                  <span className="font-mono text-xs text-soil/60 bg-soil/5 px-2 py-0.5 rounded">
                    {payment.paymentMethod}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-soil">{payment.lotTitle}</h3>
                <p className="font-body text-xs text-soil/70">Buyer: <strong>{payment.buyerName}</strong></p>
              </div>

              <div className="text-right">
                <span className="font-mono text-3xl font-bold text-soil">
                  ₹{payment.amount.toLocaleString('en-IN')}
                </span>
                <p className="font-body text-xs text-soil/60 mt-0.5">
                  {payment.status === 'Paid' ? `Settled on ${payment.paidDate}` : `Due by ${payment.dueDate}`}
                </p>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="py-6 border-b border-soil/10">
              <span className="font-body text-xs font-semibold text-soil/70 uppercase tracking-wider block mb-4">
                {lang === 'en' ? 'Disbursement Milestones' : 'भुगतान प्रगति चरण'}
              </span>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {payment.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      step.completed
                        ? 'bg-soil/5 border-datateal/40 text-soil'
                        : 'bg-soil/2 border-soil/10 text-soil/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-datateal" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-soil/30" />
                      )}
                      <span className="font-mono text-[10px] font-semibold text-soil/60">
                        Step {idx + 1}
                      </span>
                    </div>
                    <p className="font-body text-xs font-semibold">{step.step}</p>
                    <span className="font-mono text-[10px] text-soil/50 block mt-1">{step.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer reference */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 font-mono text-xs text-soil/60">
              <span>Ref ID: <strong className="text-soil">{payment.referenceId}</strong></span>
              <span className="flex items-center gap-1 text-datateal font-body text-xs font-semibold">
                <FileCheck className="w-4 h-4" />
                {lang === 'en' ? 'Tax Invoice & e-Waybill Generated' : 'ई-वे बिल व रसीद उपलब्ध'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

