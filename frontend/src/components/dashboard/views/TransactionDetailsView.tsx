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
  FileText,
  CreditCard
} from 'lucide-react'
import { useDashboard, type FarmTransaction, type TransactionLifecycleStatus, type TransactionPaymentStatus } from '../../../context/DashboardContext'
import { paymentApi } from '../../../services/apiServices'
import { useRazorpay } from '../../../hooks/useRazorpay'

export function TransactionDetailsView() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isBuyerMode = location.pathname.startsWith('/buyer')

  const { getTransactionById, updateTransactionPayment, advanceTransactionLifecycle, currentUser, lang } = useDashboard()
  const txn = transactionId ? getTransactionById(transactionId) : undefined
  const { isLoaded: isRzpLoaded, loadRazorpayScript } = useRazorpay()

  // Pay Modal State for Buyer
  const actionParam = searchParams.get('action')
  const [isPayModalOpen, setIsPayModalOpen] = useState(actionParam === 'deposit')
  const [selectedPayMethod, setSelectedPayMethod] = useState<'RAZORPAY_TEST' | 'UPI' | 'NetBanking' | 'Card'>('RAZORPAY_TEST')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [verifiedReceipt, setVerifiedReceipt] = useState<any>(null)

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
          className="px-6 py-2.5 rounded-xl bg-monsoon text-wheat font-body text-xs font-bold cursor-pointer"
        >
          Return to Transactions Desk
        </button>
      </div>
    )
  }

  const [selectedBank, setSelectedBank] = useState('State Bank of India')
  const [payerVpaInput, setPayerVpaInput] = useState(currentUser?.email ? `${currentUser.name.toLowerCase().replace(/\s+/g, '.')}@icici` : 'buyer.agrocorp@icici')

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessingPayment(true)
    setIsVerifying(true)
    setPaymentError(null)

    try {
      // Execute backend Razorpay Sandbox Payment with cryptographic HMAC SHA-256 verification
      const verifyRes = await paymentApi.processSandbox({
        transactionId: txn.id,
        paymentMethod: `Razorpay Test (${selectedPayMethod} - ${selectedPayMethod === 'NetBanking' ? selectedBank : selectedPayMethod === 'UPI' ? payerVpaInput : 'Corporate Card'})`,
        payerVpa: selectedPayMethod === 'UPI' ? payerVpaInput : `${selectedBank.replace(/\s+/g, '').toLowerCase()}@netbanking`,
      })

      if (verifyRes.success && verifyRes.data) {
        updateTransactionPayment(
          txn.id,
          'Payment Successful',
          'Payment Completed',
          {
            method: `Razorpay Gateway (${selectedPayMethod})`,
            transactionRef: verifyRes.data.gatewayPaymentId,
            paidAt: verifyRes.data.paidAt,
            escrowRef: verifyRes.data.escrowReference,
          }
        )
        setVerifiedReceipt(verifyRes.data)
        setPaymentSuccess(true)
      } else {
        setPaymentError(verifyRes.message || 'Payment verification failed on server.')
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || err.message || 'Payment processing failed. Please try again.')
    } finally {
      setIsProcessingPayment(false)
      setIsVerifying(false)
    }
  }

  const handleLiveRazorpayCheckout = async () => {
    setIsProcessingPayment(true)
    setPaymentError(null)
    try {
      // 1. Create order on backend with exact server-calculated amount
      const orderRes = await paymentApi.createOrder(txn.id, 'RAZORPAY_POPUP')
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to initialize payment order on server.')
      }

      const orderData = orderRes.data

      // If Razorpay Standard Checkout SDK is available in browser
      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: orderData.keyId || 'rzp_test_5173FarmNexus',
          amount: orderData.amountInPaise,
          currency: 'INR',
          name: 'FarmNexus Escrow Vault',
          description: `Escrow Fund Deposit for ${txn.crop} (${txn.id})`,
          image: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            setIsVerifying(true)
            try {
              // 2. Cryptographically verify signature on backend server
              const verifyRes = await paymentApi.verify({
                transactionId: txn.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payerVpa: payerVpaInput,
              })

              if (verifyRes.success && verifyRes.data && verifyRes.data.verified) {
                updateTransactionPayment(
                  txn.id,
                  'Payment Successful',
                  'Payment Completed',
                  {
                    method: 'Razorpay Gateway (Standard Checkout)',
                    transactionRef: verifyRes.data.gatewayPaymentId,
                    paidAt: verifyRes.data.paidAt,
                    escrowRef: verifyRes.data.escrowReference,
                  }
                )
                setVerifiedReceipt(verifyRes.data)
                setPaymentSuccess(true)
              } else {
                setPaymentError(verifyRes.message || 'Payment signature verification failed on server.')
              }
            } catch (vErr: any) {
              setPaymentError(vErr.response?.data?.message || vErr.message || 'Payment verification failed on server.')
            } finally {
              setIsVerifying(false)
              setIsProcessingPayment(false)
            }
          },
          prefill: {
            name: txn.buyerName,
            email: currentUser?.email || 'buyer.agrocorp@farmnexus.in',
            contact: currentUser?.phone || '9876543210',
          },
          notes: {
            transactionId: txn.id,
            crop: txn.crop,
          },
          theme: {
            color: '#152A26',
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false)
            },
          },
        })

        rzp.open()
      } else {
        // Fallback to server-signed sandbox verification
        const verifyRes = await paymentApi.processSandbox({
          transactionId: txn.id,
          paymentMethod: 'Razorpay Test (UPI / Standard)',
          payerVpa: payerVpaInput,
        })
        if (verifyRes.success && verifyRes.data) {
          updateTransactionPayment(
            txn.id,
            'Payment Successful',
            'Payment Completed',
            {
              method: 'Razorpay Gateway (Sandbox Verified)',
              transactionRef: verifyRes.data.gatewayPaymentId,
              paidAt: verifyRes.data.paidAt,
              escrowRef: verifyRes.data.escrowReference,
            }
          )
          setVerifiedReceipt(verifyRes.data)
          setPaymentSuccess(true)
        }
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || err.message || 'Payment processing failed.')
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

      {/* Buyer Razorpay Test Mode Escrow Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            {paymentSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-datateal/20 text-datateal border border-datateal/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                    CRYPTOGRAPHICALLY VERIFIED &bull; ESCROW LOCKED
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-soil">
                    Payment Successful
                  </h3>
                  <p className="font-body text-xs text-soil/70 max-w-sm mx-auto">
                    ₹{txn.finalAmount.toLocaleString('en-IN')} has been securely deposited into the FarmNexus Escrow Sub-Ledger.
                  </p>
                </div>

                {/* Verified Receipt Card */}
                <div className="p-4 bg-monsoon text-wheat rounded-2xl text-left space-y-3 font-body text-xs">
                  <div className="flex items-center justify-between border-b border-wheat/10 pb-2">
                    <span className="font-bold text-wheat flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-turmeric" />
                      <span>FarmNexus Escrow Receipt</span>
                    </span>
                    <span className="font-mono text-[10px] text-datateal font-bold">RAZORPAY TEST</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-wheat/50 block">Transaction ID:</span>
                      <strong className="font-mono text-wheat">{txn.id}</strong>
                    </div>
                    <div>
                      <span className="text-wheat/50 block">Razorpay Payment ID:</span>
                      <strong className="font-mono text-turmeric truncate block">
                        {verifiedReceipt?.gatewayPaymentId || txn.paymentDetails?.transactionRef || 'pay_test_verified'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-wheat/50 block">Amount Paid:</span>
                      <strong className="font-mono text-datateal text-sm font-bold">
                        ₹{txn.finalAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div>
                      <span className="text-wheat/50 block">Producer / Farmer:</span>
                      <strong className="text-wheat truncate block">{txn.farmerName}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-wheat/10 text-[10px] text-wheat/60 flex items-center justify-between">
                    <span>Escrow Vault: {txn.paymentDetails?.escrowRef || `ESC-VAULT-${txn.id}`}</span>
                    <span>{verifiedReceipt?.paidAt || 'Just now'}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPayModalOpen(false)
                      setPaymentSuccess(false)
                    }}
                    className="px-6 py-2.5 bg-monsoon text-wheat font-body text-xs font-bold rounded-xl hover:bg-monsoon/90 transition-all cursor-pointer"
                  >
                    Done / Return to Deal Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRazorpayPayment} className="space-y-4">
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
                    className="text-soil/40 hover:text-soil text-xl font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3.5 bg-monsoon text-wheat rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-turmeric uppercase">CONTRACT PAYABLE AMOUNT</span>
                    <span className="font-mono text-[10px] bg-wheat/10 text-wheat/80 px-2 py-0.5 rounded-full">
                      SERVER COMPUTED
                    </span>
                  </div>
                  <p className="font-mono text-3xl font-bold text-datateal">
                    ₹{txn.finalAmount.toLocaleString('en-IN')}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-wheat/70 pt-1 border-t border-wheat/10">
                    <span>{txn.crop} ({txn.quantityQtl} {txn.unit})</span>
                    <span className="font-mono">{txn.id}</span>
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-700 text-xs font-body flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Payment Instrument Selector */}
                <div className="space-y-2">
                  <span className="font-body text-[11px] text-soil/70 font-semibold block">Select Test Payment Instrument:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('UPI')}
                      className={`p-2.5 rounded-xl border text-xs font-body font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        selectedPayMethod === 'UPI' || selectedPayMethod === 'RAZORPAY_TEST'
                          ? 'bg-monsoon text-wheat border-monsoon shadow-xs'
                          : 'bg-soil/5 text-soil/70 border-soil/15 hover:bg-soil/10'
                      }`}
                    >
                      <span>⚡ UPI / QR</span>
                      <span className="text-[10px] opacity-70 font-normal">GPay, PhonePe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('NetBanking')}
                      className={`p-2.5 rounded-xl border text-xs font-body font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        selectedPayMethod === 'NetBanking'
                          ? 'bg-monsoon text-wheat border-monsoon shadow-xs'
                          : 'bg-soil/5 text-soil/70 border-soil/15 hover:bg-soil/10'
                      }`}
                    >
                      <span>🏦 NetBanking</span>
                      <span className="text-[10px] opacity-70 font-normal">SBI, HDFC, ICICI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPayMethod('Card')}
                      className={`p-2.5 rounded-xl border text-xs font-body font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        selectedPayMethod === 'Card'
                          ? 'bg-monsoon text-wheat border-monsoon shadow-xs'
                          : 'bg-soil/5 text-soil/70 border-soil/15 hover:bg-soil/10'
                      }`}
                    >
                      <span>💳 Cards</span>
                      <span className="text-[10px] opacity-70 font-normal">Visa / Master</span>
                    </button>
                  </div>

                  {/* Instrument Specific Details */}
                  {(selectedPayMethod === 'UPI' || selectedPayMethod === 'RAZORPAY_TEST') && (
                    <div className="p-3 bg-soil/5 rounded-xl border border-soil/10 space-y-1.5">
                      <label className="font-body text-[10px] text-soil/60 block">Virtual Payment Address (VPA / UPI ID)</label>
                      <input
                        type="text"
                        value={payerVpaInput}
                        onChange={(e) => setPayerVpaInput(e.target.value)}
                        placeholder="buyer.agrocorp@icici"
                        className="w-full bg-wheat border border-soil/20 rounded-lg px-3 py-1.5 font-mono text-xs text-soil focus:outline-none focus:border-turmeric"
                      />
                    </div>
                  )}

                  {selectedPayMethod === 'NetBanking' && (
                    <div className="p-3 bg-soil/5 rounded-xl border border-soil/10 space-y-1.5">
                      <label className="font-body text-[10px] text-soil/60 block">Choose Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-wheat border border-soil/20 rounded-lg px-3 py-1.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
                      >
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                      </select>
                    </div>
                  )}

                  {selectedPayMethod === 'Card' && (
                    <div className="p-3 bg-soil/5 rounded-xl border border-soil/10 space-y-1 font-mono text-[11px] text-soil/80">
                      <div className="flex items-center justify-between">
                        <span>Card: 4242 •••• •••• 4242</span>
                        <span className="text-[10px] text-turmeric font-bold">TEST VISA</span>
                      </div>
                      <p className="font-body text-[10px] text-soil/50">Exp: 12/28 &bull; CVV: 123 (Auto-filled for sandbox)</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-turmeric/10 rounded-xl border border-turmeric/30 text-xs font-body space-y-1 text-soil/80">
                  <div className="flex items-center gap-2 font-bold text-soil text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-turmeric flex-shrink-0" />
                    <span>Cryptographic Escrow Protection (HMAC SHA-256)</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-soil/70">
                    Funds are held in electronic custody and released upon mandi gate weighment confirmation.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={isProcessingPayment || isVerifying}
                    className="w-full py-3.5 bg-turmeric text-monsoon font-body text-xs font-bold rounded-xl hover:bg-turmeric/90 active:bg-turmeric/80 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isProcessingPayment || isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying HMAC Signature & Securing Escrow...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{txn.finalAmount.toLocaleString('en-IN')} (Server Verified Test)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingPayment || isVerifying}
                    onClick={handleLiveRazorpayCheckout}
                    className="w-full py-2.5 bg-soil/5 text-soil hover:bg-soil/10 border border-soil/15 font-body text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-turmeric" />
                    <span>Launch Razorpay Standard Checkout Popup</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

