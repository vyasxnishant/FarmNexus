import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Building2,
  User,
  MoreVertical,
  XCircle,
  Eye,
  Check,
  Sprout,
  Tag,
  Receipt,
  CreditCard,
  Package,
  RefreshCw
} from 'lucide-react'
import { useDashboard, type UserRecord, type CropLot, type Offer, type FarmTransaction } from '../../../context/DashboardContext'
import { adminApi } from '../../../services/apiServices'

export function AdminUsersView() {
  const { users, updateUserStatus, verifyUser, lots, offers, transactions } = useDashboard()

  const [dbUsers, setDbUsers] = useState<UserRecord[]>(users)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Farmer' | 'Buyer' | 'Admin'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Pending Verification'>('All')
  const [isLoading, setIsLoading] = useState(false)

  // Selected User Modal / Action
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [actionConfirm, setActionConfirm] = useState<{
    user: UserRecord
    action: 'verify' | 'suspend' | 'activate'
  } | null>(null)

  // Fetch real users from backend on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const res = await adminApi.getUsers()
        if (res.data && Array.isArray(res.data)) {
          const mapped: UserRecord[] = res.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            userType: u.user_type === 'FARMER' ? 'Farmer' : u.user_type === 'BUYER' ? 'Buyer' : 'Admin',
            location: u.location || 'Madhya Pradesh',
            district: u.district || 'Harda',
            state: u.state || 'Madhya Pradesh',
            registeredDate: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026',
            status: u.status || 'Active',
            kycVerified: Boolean(u.kyc_verified),
            organization: u.organization,
          }))
          setDbUsers(mapped)
        }
      } catch (err) {
        console.warn('[AdminUsersView] Using context users fallback', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const currentUsersList = dbUsers.length > 0 ? dbUsers : users

  const filteredUsers = currentUsersList.filter((u) => {
    if (roleFilter !== 'All' && u.userType !== roleFilter) return false
    if (statusFilter !== 'All' && u.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q)) ||
        u.location.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const handleExecuteAction = async () => {
    if (!actionConfirm) return
    const { user, action } = actionConfirm

    if (action === 'verify') {
      await verifyUser(user.id)
      setDbUsers(prev => prev.map(u => u.id === user.id ? { ...u, kycVerified: true } : u))
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, kycVerified: true } : null)
      }
    } else if (action === 'suspend') {
      await updateUserStatus(user.id, 'Suspended')
      setDbUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Suspended' } : u))
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: 'Suspended' } : null)
      }
    } else if (action === 'activate') {
      await updateUserStatus(user.id, 'Active')
      setDbUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Active' } : u))
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: 'Active' } : null)
      }
    }

    setActionConfirm(null)
  }

  const getStatusBadge = (status: UserRecord['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-datateal/20 text-soil border border-datateal/40'
      case 'Pending Verification':
        return 'bg-amber-500/20 text-amber-900 border border-amber-400'
      case 'Suspended':
        return 'bg-red-500/20 text-red-900 border border-red-400'
      default:
        return 'bg-soil/10 text-soil'
    }
  }

  // Get user-specific linked objects for User Details view
  const userLots = selectedUser ? lots.filter(l => l.farmerId === selectedUser.id || selectedUser.userType === 'Farmer') : []
  const userOffers = selectedUser ? offers.filter(o => o.buyerId === selectedUser.id || (selectedUser.userType === 'Farmer' && o.status === 'Pending')) : []
  const userTransactions = selectedUser ? transactions.filter(t => t.farmerId === selectedUser.id || t.buyerId === selectedUser.id) : []

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-turmeric" />
                USER IDENTITY & KYC DESK
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Registered Users Directory
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect database-backed user records, verify KYC compliance, manage platform permissions, and enforce administrative account suspensions.
            </p>
          </div>

          <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-turmeric uppercase block">POSTGRES USERS INDEX</span>
              <span className="font-mono text-xl font-bold text-datateal">{currentUsersList.length} Accounts</span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-soil/10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soil/40" />
            <input
              type="text"
              placeholder="Search by name, organization, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl pl-9 pr-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              <option value="All">All User Roles</option>
              <option value="Farmer">Farmers / Producers</option>
              <option value="Buyer">Corporate Buyers</option>
              <option value="Admin">Administrators</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-soil/5 border border-soil/15 rounded-xl px-3 py-2.5 font-body text-xs text-soil focus:outline-none focus:border-turmeric cursor-pointer"
            >
              <option value="All">All Account Statuses</option>
              <option value="Active">Active Accounts</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-wheat rounded-3xl border border-soil/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body text-soil">
            <thead className="bg-soil/5 border-b border-soil/10 uppercase font-mono text-[10px] text-soil/60">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Organization / Location</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4">KYC / Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-soil/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-monsoon text-turmeric flex items-center justify-center font-bold font-serif text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-soil block">{user.name}</span>
                        <span className="font-mono text-[10px] text-soil/50">{user.email} &bull; {user.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-soil/10 text-soil">
                      {user.userType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-soil block">{user.organization || 'Independent'}</span>
                    <span className="text-soil/50 text-[11px]">{user.location}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-soil/60">
                    {user.registeredDate}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                      {user.kycVerified && (
                        <span className="font-mono text-[10px] text-datateal bg-monsoon px-1.5 py-0.5 rounded font-bold">
                          KYC
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg bg-soil/5 hover:bg-soil/10 text-soil transition-colors cursor-pointer"
                        title="View User Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!user.kycVerified && (
                        <button
                          type="button"
                          onClick={() => setActionConfirm({ user, action: 'verify' })}
                          className="px-2.5 py-1 rounded-lg bg-datateal/20 text-soil font-bold text-[11px] hover:bg-datateal/30 transition-colors cursor-pointer"
                        >
                          Verify
                        </button>
                      )}

                      {user.status === 'Active' && user.userType !== 'Admin' && (
                        <button
                          type="button"
                          onClick={() => setActionConfirm({ user, action: 'suspend' })}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 font-bold text-[11px] hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}

                      {user.status === 'Suspended' && (
                        <button
                          type="button"
                          onClick={() => setActionConfirm({ user, action: 'activate' })}
                          className="px-2.5 py-1 rounded-lg bg-datateal text-monsoon font-bold text-[11px] hover:bg-datateal/90 transition-colors cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Admin User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-6 h-6 text-turmeric" />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-soil">Account Details & Oversight</h3>
                  <span className="font-mono text-[10px] text-soil/60 uppercase">{selectedUser.id} &bull; {selectedUser.userType}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-soil/40 hover:text-soil text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 bg-monsoon text-wheat rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-2xl font-bold">{selectedUser.name}</h4>
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedUser.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                <p className="text-xs text-wheat/80 mt-0.5">{selectedUser.organization || 'Independent Account'}</p>
                <p className="font-mono text-xs text-turmeric mt-1">{selectedUser.email} &bull; {selectedUser.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                {!selectedUser.kycVerified ? (
                  <button
                    type="button"
                    onClick={() => setActionConfirm({ user: selectedUser, action: 'verify' })}
                    className="px-3 py-1.5 rounded-xl bg-datateal text-monsoon font-body font-bold text-xs hover:bg-datateal/90 transition-all cursor-pointer"
                  >
                    Verify KYC
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-datateal/20 text-datateal font-mono text-xs font-bold border border-datateal/40">
                    KYC APPROVED
                  </span>
                )}

                {selectedUser.status === 'Active' && selectedUser.userType !== 'Admin' && (
                  <button
                    type="button"
                    onClick={() => setActionConfirm({ user: selectedUser, action: 'suspend' })}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 font-body font-bold text-xs hover:bg-red-500/30 transition-all cursor-pointer border border-red-500/40"
                  >
                    Suspend
                  </button>
                )}

                {selectedUser.status === 'Suspended' && (
                  <button
                    type="button"
                    onClick={() => setActionConfirm({ user: selectedUser, action: 'activate' })}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-monsoon font-body font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs font-body text-soil">
              <div className="p-3.5 bg-soil/5 border border-soil/10 rounded-xl">
                <span className="text-soil/50 block text-[11px]">Primary Location / District</span>
                <span className="font-semibold text-soil block mt-0.5">{selectedUser.location} ({selectedUser.district}, {selectedUser.state})</span>
              </div>

              <div className="p-3.5 bg-soil/5 border border-soil/10 rounded-xl">
                <span className="text-soil/50 block text-[11px]">Platform Registration Date</span>
                <span className="font-semibold text-soil block mt-0.5">{selectedUser.registeredDate}</span>
              </div>

              {selectedUser.userType === 'Farmer' && (
                <>
                  <div className="p-3.5 bg-soil/5 border border-soil/10 rounded-xl">
                    <span className="text-soil/50 block text-[11px]">FPO Affiliation</span>
                    <span className="font-semibold text-soil block mt-0.5">{selectedUser.organization || 'Producer Member'}</span>
                  </div>
                  <div className="p-3.5 bg-soil/5 border border-soil/10 rounded-xl">
                    <span className="text-soil/50 block text-[11px]">Active Produce Listings</span>
                    <span className="font-mono text-sm font-bold text-soil block mt-0.5">{userLots.length} Crop Lots</span>
                  </div>
                </>
              )}

              {selectedUser.userType === 'Buyer' && (
                <>
                  <div className="p-3.5 bg-soil/5 border border-soil/10 rounded-xl">
                    <span className="text-soil/50 block text-[11px]">Enterprise GSTIN</span>
                    <span className="font-mono font-bold text-soil block mt-0.5">23AAACA1234F1Z8</span>
                  </div>
                  <div className="p-3.5 bg-soil/5 border border-soil/10 rounded-xl">
                    <span className="text-soil/50 block text-[11px]">Procurement Desk</span>
                    <span className="font-semibold text-soil block mt-0.5">Active Buyer ({userOffers.length} Bids Placed)</span>
                  </div>
                </>
              )}
            </div>

            {/* Linked Data Section */}
            <div className="space-y-3 pt-2">
              <h5 className="font-serif text-base font-bold text-soil flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-turmeric" />
                <span>Trade & Contract History ({userTransactions.length} Deals)</span>
              </h5>

              {userTransactions.length === 0 ? (
                <p className="text-xs text-soil/60 italic p-3 bg-soil/5 rounded-xl">No trade transactions recorded yet for this account.</p>
              ) : (
                <div className="space-y-2">
                  {userTransactions.map(txn => (
                    <div key={txn.id} className="p-3 bg-soil/5 border border-soil/10 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-soil">{txn.id}</span>
                        <span className="text-soil/60 block">{txn.crop} &bull; {txn.quantityQtl} qtl</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-soil">₹{txn.finalAmount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-datateal block font-semibold">{txn.transactionStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-soil/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-monsoon text-wheat font-body text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-soil">Confirm Administrative Action</h3>
            </div>

            <p className="text-xs font-body text-soil/80 leading-relaxed">
              Are you sure you want to <strong>{actionConfirm.action.toUpperCase()}</strong> account{' '}
              <strong>{actionConfirm.user.name}</strong> ({actionConfirm.user.id})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionConfirm(null)}
                className="px-4 py-2 rounded-xl bg-soil/10 text-soil font-body text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-4 py-2 rounded-xl font-body text-xs font-bold cursor-pointer ${
                  actionConfirm.action === 'suspend'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-datateal text-monsoon hover:bg-datateal/90'
                }`}
              >
                Confirm {actionConfirm.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
