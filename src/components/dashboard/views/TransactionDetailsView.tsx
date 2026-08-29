import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Receipt,
  Building2,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Truck,
  ShieldCheck,
  Lock,
  Download,
  Printer,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  XCircle,
  FileText
} from 'lucide-react'
import {
  useDashboard,
  type FarmTransaction,
  type TransactionLifecycleStatus,
  type TransactionPaymentStatus
} from '../../../context/DashboardContext'
import { verifyPayment } from '../../../services/paymentService'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function TransactionDetailsView() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isBuyerMode = location.pathname.startsWith('/buyer')

  const { getTransactionById, updateTransactionPayment, advanceTransactionLifecycle, lang } = useDashboard()
  const txn = transactionId ? getTransactionById(transactionId) : undefined

  // Pay Modal State for Buyer
  const actionParam = searchParams.get('action')
  const [isPayModalOpen, setIsPayModalOpen] = useState(actionParam === 'deposit')
  const [selectedPayMethod, setSelectedPayMethod] = useState<'UPI' | 'NetBanking' | 'e-NWR Escrow' | 'RTGS/NEFT'>('UPI')
  const [vpaInput, setVpaInput] = useState('agrocorp.procure@icici')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Dispatch & Delivery Action loading
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    if (actionParam === 'deposit' && txn?.paymentStatus === 'Payment Pending') {
      setIsPayModalOpen(true)
    }
  }, [actionParam, txn?.paymentStatus])

  if (!txn) {
    return (
      <div className="bg-wheat rounded-3xl border border-soil/15 p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-soil">Transaction Not Found</h2>
        <p className="font-body text-xs text-soil/70 max-w-sm mx-auto">
          The requested transaction record does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate(isBuyerMode ? '/buyer/transactions' : '/farmer/transactions')}
          className="px-6 py-2.5 rounded-xl bg-monsoon text-wheat font-body text-xs font-bold"
        >
          Return to Transactions Desk
        </button>
      </div>
    )
  }

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessingPayment(true)
    setPaymentError(null)

    try {
      // Execute backend verification abstraction
      const verifyRes = await verifyPayment({
        transactionId: txn.id,
        orderId: `ORD-${Date.now()}`,
        paymentId: `PAY-${Date.now()}`,
        paymentMethod: selectedPayMethod,
        payerVpa: vpaInput,
      })

      if (verifyRes.success) {
        updateTransactionPayment(
          txn.id,
          'Payment Successful',
          'Payment Completed',
          {
            method: selectedPayMethod,
            transactionRef: verifyRes.paymentId,
            payerVpa: vpaInput,
            paidAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            escrowRef: verifyRes.escrowReference,
          }
        )
        setPaymentSuccess(true)
        setTimeout(() => {
          setIsPayModalOpen(false)
          setPaymentSuccess(false)
        }, 1500)
      } else {
        setPaymentError(verifyRes.message || 'Payment verification failed.')
      }
    } catch (err: any) {
      setPaymentError(err?.message || 'Payment simulation failed. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleDispatchShipment = () => {
    setIsActionLoading(true)
    setTimeout(() => {
      advanceTransactionLifecycle(txn.id, 'In Transit')
      setIsActionLoading(false)
    }, 600)
  }

  const handleConfirmDelivery = () => {
    setIsActionLoading(true)
    setTimeout(() => {
      advanceTransactionLifecycle(txn.id, 'Completed')
      setIsActionLoading(false)
    }, 600)
  }

  const backLink = isBuyerMode ? '/buyer/transactions' : '/farmer/transactions'

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-xs font-body font-semibold text-soil/70 hover:text-soil transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-turmeric" />
          <span>Back to Transactions Desk</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-wheat text-soil border border-soil/15 hover:bg-soil/10 transition-colors text-xs font-body font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-turmeric" />
            <span>Print e-Contract</span>
          </button>
        </div>
      </div>

      {/* Transaction Header Hero Card */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-soil/10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs font-bold text-soil/60">{txn.id}</span>
              <span className="font-mono text-xs text-soil/40">&bull; Created {txn.createdDate}</span>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-monsoon text-wheat">
                Lot: {txn.lotId}
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              {txn.crop} <span className="font-normal text-xl text-soil/60">({txn.variety})</span>
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1">
              Binding Electronic Agri-Trade Contract & Escrow Guarantee
            </p>
          </div>

          {/* Amount & Status Hero Card */}
          <div className="p-4 rounded-2xl bg-monsoon text-wheat border border-turmeric/30 text-right space-y-1 min-w-[220px]">
            <span className="text-[10px] font-mono text-turmeric uppercase tracking-wider block">
              FINAL ESCROW DEAL VALUE
            </span>
            <p className="font-mono text-3xl font-bold text-datateal">
              ₹{txn.finalAmount.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-wheat/10 text-wheat border border-wheat/20">
                {txn.paymentStatus}
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-turmeric text-monsoon">
                {txn.transactionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Counterparty 2-Column Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Seller / Farmer Box */}
          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10 space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-turmeric" />
              <span className="font-mono text-[10px] uppercase font-bold text-soil/60 tracking-wider">
                SELLER (FARMER / PRODUCER)
              </span>
            </div>
            <h4 className="font-serif text-lg font-bold text-soil">{txn.farmerName}</h4>
            <div className="space-y-1 text-xs font-body text-soil/80">
              <p><span className="text-soil/50">Location:</span> {txn.farmerLocation}</p>
              <p><span className="text-soil/50">Phone:</span> <span className="font-mono font-semibold">{txn.farmerPhone}</span></p>
            </div>
          </div>

          {/* Buyer / Corporate Box */}
          <div className="bg-soil/5 rounded-2xl p-4 border border-soil/10 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-turmeric" />
              <span className="font-mono text-[10px] uppercase font-bold text-soil/60 tracking-wider">
                BUYER (PROCUREMENT CORP)
              </span>
            </div>
            <h4 className="font-serif text-lg font-bold text-soil">{txn.buyerOrganization}</h4>
            <div className="space-y-1 text-xs font-body text-soil/80">
              <p><span className="text-soil/50">Representative:</span> {txn.buyerName}</p>
              <p><span className="text-soil/50">Delivery Terminal:</span> {txn.buyerLocation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Financial Breakdown & Timeline, Right Quick Actions */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Step Timeline & Produce Valuation Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* 6-Stage Transaction Lifecycle Timeline */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">
                  Transaction & Escrow Timeline
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold text-soil/60">
                Stage {txn.timeline.filter(t => t.completed).length} of {txn.timeline.length} Complete
              </span>
            </div>

            <div className="space-y-4">
              {txn.timeline.map((event, idx) => {
                const isCurrent = !event.completed && (idx === 0 || txn.timeline[idx - 1]?.completed)

                return (
                  <div key={idx} className="flex items-start gap-4">
                    {/* Step Icon Indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          event.completed
                            ? 'bg-datateal text-monsoon shadow-xs'
                            : isCurrent
                            ? 'bg-turmeric text-monsoon ring-4 ring-turmeric/20 animate-pulse'
                            : 'bg-soil/10 text-soil/40 border border-soil/15'
                        }`}
                      >
                        {event.completed ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      {idx < txn.timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-10 my-1 ${
                            event.completed ? 'bg-datateal' : 'bg-soil/15'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="pt-0.5 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-serif text-base font-bold ${event.completed ? 'text-soil' : isCurrent ? 'text-monsoon' : 'text-soil/50'}`}>
                          {event.label}
                        </h4>
                        <span className="font-mono text-[10px] text-soil/50 bg-soil/5 px-2 py-0.5 rounded-full">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className={`text-xs font-body leading-relaxed ${event.completed ? 'text-soil/70' : isCurrent ? 'text-soil/80 font-medium' : 'text-soil/40'}`}>
                        {event.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Agreed Financial Valuation Breakdown */}
          <div className="bg-wheat rounded-3xl border border-soil/15 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-soil/10">
              <Receipt className="w-5 h-5 text-turmeric" />
              <h3 className="font-serif text-xl font-bold text-soil">
                Agreed Financial Invoice Breakdown
              </h3>
            </div>

            <div className="space-y-3 font-body text-xs text-soil/80">
              <div className="flex items-center justify-between pb-2 border-b border-soil/10">
                <span>Produce Value ({txn.quantityQtl} {txn.unit} @ ₹{txn.agreedPricePerQtl.toLocaleString('en-IN')}/qtl):</span>
                <span className="font-mono text-sm font-bold text-soil">₹{txn.produceValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soil/10">
                <span>Agreed Logistics & Freight:</span>
                <span className="font-mono text-sm font-bold text-soil">
                  {txn.transportCost > 0 ? `+₹${txn.transportCost.toLocaleString('en-IN')}` : '₹0 (Farm-Gate Pickup)'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-soil/10 text-soil/60">
                <span>Statutory APMC Mandi Cess (1.5% - Handled in settlement):</span>
                <span className="font-mono text-xs font-semibold">₹{txn.mandiCess.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-4 bg-soil/5 rounded-2xl border border-soil/15 flex items-center justify-between">
                <div>
                  <span className="font-serif text-base font-bold text-soil block">Total Binding Contract Value</span>
                  <span className="text-[11px] text-soil/60">Escrow Locked & Guaranteed</span>
                </div>
                <span className="font-mono text-2xl font-bold text-datateal">
                  ₹{txn.finalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic Action Desk */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 bg-monsoon text-wheat rounded-3xl p-6 border-2 border-turmeric/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-wheat/15">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-turmeric" />
                <span className="font-mono text-xs font-bold text-turmeric uppercase tracking-wider">
                  TRANSACTION ACTION DESK
                </span>
              </div>
              <span className="font-mono text-xs text-wheat/60">{isBuyerMode ? 'Buyer Desk' : 'Farmer Desk'}</span>
            </div>

            {/* Buyer Deposit Action */}
            {isBuyerMode && txn.paymentStatus === 'Payment Pending' && (
              <div className="space-y-4 p-4 rounded-2xl bg-wheat/10 border border-turmeric/30">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-turmeric" />
                  <h4 className="font-serif text-lg font-bold text-wheat">
                    Deposit Capital into Escrow
                  </h4>
                </div>
                <p className="text-xs font-body text-wheat/80 leading-relaxed">
                  Lock ₹{txn.finalAmount.toLocaleString('en-IN')} into FarmNexus Escrow vault. Funds are only released upon verified quality gate arrival.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(true)}
                  className="w-full py-3 bg-turmeric text-monsoon font-body text-xs font-bold rounded-xl hover:bg-turmeric/90 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Deposit ₹{txn.finalAmount.toLocaleString('en-IN')} via Sandbox</span>
                </button>
              </div>
            )}

            {/* Farmer Dispatch Action */}
            {!isBuyerMode && txn.paymentStatus === 'Payment Successful' && txn.transactionStatus === 'Payment Completed' && (
              <div className="space-y-4 p-4 rounded-2xl bg-wheat/10 border border-datateal/40">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-datateal" />
                  <h4 className="font-serif text-lg font-bold text-wheat">
                    Escrow Funded — Ready for Dispatch
                  </h4>
                </div>
                <p className="text-xs font-body text-wheat/80 leading-relaxed">
                  Buyer has deposited ₹{txn.finalAmount.toLocaleString('en-IN')} in escrow. Dispatch harvest from farm-gate to begin transit tracking.
                </p>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleDispatchShipment}
                  className="w-full py-3 bg-datateal text-monsoon font-body text-xs font-bold rounded-xl hover:bg-datateal/90 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  <span>Confirm Dispatch & Handover</span>
                </button>
              </div>
            )}

            {/* Buyer Delivery Confirmation Action */}
            {isBuyerMode && txn.transactionStatus === 'In Transit' && (
              <div className="space-y-4 p-4 rounded-2xl bg-wheat/10 border border-datateal/40">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-datateal" />
                  <h4 className="font-serif text-lg font-bold text-wheat">
                    Verify Gate Arrival & Release Payout
                  </h4>
                </div>
                <p className="text-xs font-body text-wheat/80 leading-relaxed">
                  Produce has arrived at terminal. Confirming gate assay will release ₹{txn.produceValue.toLocaleString('en-IN')} to farmer linked SBI account.
                </p>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={handleConfirmDelivery}
                  className="w-full py-3 bg-datateal text-monsoon font-body text-xs font-bold rounded-xl hover:bg-datateal/90 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verify Gate Receipt & Release Funds</span>
                </button>
              </div>
            )}

            {/* Completed Notice */}
            {txn.transactionStatus === 'Completed' && (
              <div className="p-4 rounded-2xl bg-datateal/20 border border-datateal/40 space-y-2 text-center">
                <CheckCircle2 className="w-10 h-10 text-datateal mx-auto" />
                <h4 className="font-serif text-lg font-bold text-wheat">Deal Fully Settled</h4>
                <p className="text-xs font-body text-wheat/80">
                  Produce successfully delivered and payout of ₹{txn.produceValue.toLocaleString('en-IN')} settled to farmer bank account.
                </p>
              </div>
            )}

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-2xl bg-wheat/5 border border-wheat/10 space-y-2 text-xs font-body text-wheat/70">
              <span className="font-bold text-wheat block">FarmNexus Escrow Guarantee:</span>
              <p>&bull; Client-side security: Zero private credentials stored on client.</p>
              <p>&bull; Dual verification: Digital gate receipt triggers automated UPI settlement.</p>
              <p>&bull; Dispute resolution: 24/7 dedicated APMC liaison support.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Payment / Escrow Simulation Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl animate-fade-in">
            {paymentSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-datateal mx-auto animate-bounce" />
                <h3 className="font-serif text-2xl font-bold text-soil">
                  Escrow Deposit Verified!
                </h3>
                <p className="font-body text-xs text-soil/70 max-w-xs mx-auto">
                  ₹{txn.finalAmount.toLocaleString('en-IN')} is secured in FarmNexus Escrow Account. Seller notified for carrier dispatch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-soil/10">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-turmeric" />
                    <h3 className="font-serif text-xl font-bold text-soil">
                      Deposit into Escrow Vault
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="text-soil/40 hover:text-soil cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-monsoon text-wheat rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-turmeric uppercase block">CONTRACT AMOUNT TO SECURE</span>
                  <p className="font-mono text-2xl font-bold text-datateal">
                    ₹{txn.finalAmount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-wheat/60 block">
                    {txn.crop} ({txn.quantityQtl} {txn.unit}) &bull; {txn.id}
                  </span>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 text-xs font-body flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Payment Method Selector */}
                <div>
                  <label className="block font-body text-xs font-semibold text-soil mb-1.5">
                    Select Payment Rail
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['UPI', 'e-NWR Escrow', 'NetBanking', 'RTGS/NEFT'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedPayMethod(m)}
                        className={`py-2 px-3 rounded-xl font-body text-xs font-semibold border text-center transition-all cursor-pointer ${
                          selectedPayMethod === m
                            ? 'bg-monsoon text-wheat border-monsoon shadow-xs'
                            : 'bg-soil/5 text-soil border-soil/15 hover:bg-soil/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPayMethod === 'UPI' && (
                  <div>
                    <label className="block font-body text-xs font-semibold text-soil mb-1">
                      Corporate Payer UPI VPA
                    </label>
                    <input
                      type="text"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                      placeholder="company@bank"
                      className="w-full px-3 py-2 rounded-xl bg-wheat border border-soil/20 font-mono text-xs font-bold text-soil"
                    />
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-soil/5 border border-soil/10 text-[11px] text-soil/60 font-body">
                  ⚠️ <strong>Sandbox Simulation:</strong> This tests the end-to-end backend verification pipeline without transferring actual bank capital.
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3 bg-turmeric text-monsoon font-body text-xs font-bold rounded-xl hover:bg-turmeric/90 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying with Escrow Vault...</span>
                    </>
                  ) : (
                    <span>Confirm & Authorize Escrow Deposit</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
