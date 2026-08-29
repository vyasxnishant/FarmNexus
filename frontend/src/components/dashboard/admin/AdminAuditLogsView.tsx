import { useState } from 'react'
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  User,
  Database,
  Package,
  CreditCard,
  Receipt,
  FileText,
  Copy,
  Check
} from 'lucide-react'
import { useDashboard, type AuditLog } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminAuditLogsView() {
  const { auditLogs } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('All')
  const [copied, setCopied] = useState(false)

  const targetTypes = ['All', 'User', 'Lot', 'MarketPrice', 'Transaction', 'Offer', 'Payment']

  const filteredLogs = auditLogs.filter((log) => {
    if (targetTypeFilter !== 'All' && log.targetType !== targetTypeFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.adminUser.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const getTargetIcon = (type: AuditLog['targetType']) => {
    switch (type) {
      case 'User':
      case 'Farmer':
      case 'Buyer':
        return <User className="w-4 h-4 text-turmeric" />
      case 'Lot':
        return <Package className="w-4 h-4 text-turmeric" />
      case 'MarketPrice':
        return <Database className="w-4 h-4 text-turmeric" />
      case 'Transaction':
        return <CreditCard className="w-4 h-4 text-turmeric" />
      case 'Offer':
        return <Receipt className="w-4 h-4 text-turmeric" />
      default:
        return <Activity className="w-4 h-4 text-turmeric" />
    }
  }

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(JSON.stringify(auditLogs, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-turmeric" />
                IMMUTABLE AUDIT & COMPLIANCE LOGS
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Administrative Activity Trail
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Chronological ledger tracking administrative validations, user status changes, price updates, and trade verifications. Ready for PostgreSQL audit table sync.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyLogs}
            className="px-4 py-2.5 bg-monsoon text-wheat font-body text-xs font-semibold rounded-xl hover:bg-monsoon/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-datateal" /> : <Copy className="w-4 h-4 text-turmeric" />}
            <span>{copied ? 'Audit JSON Copied' : 'Export Audit JSON'}</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-soil/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search action, admin, target ID, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
            />
          </div>

          <div>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              {targetTypes.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Target Modules' : `Module: ${t}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-soil">
            <thead className="bg-soil/5 border-b border-soil/10 uppercase font-mono text-[10px] text-soil/60">
              <tr>
                <th className="py-3.5 px-4">Log ID / Time</th>
                <th className="py-3.5 px-4">Admin Operator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil/10">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-soil/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-soil block">{log.id}</span>
                    <span className="font-mono text-[10px] text-soil/50">{log.timestamp}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-soil">
                    {log.adminUser}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-monsoon text-wheat inline-flex items-center gap-1.5">
                      {getTargetIcon(log.targetType)}
                      <span>{log.action}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-soil/80">
                    {log.targetId}
                  </td>

                  <td className="py-3.5 px-4 text-soil/80 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

