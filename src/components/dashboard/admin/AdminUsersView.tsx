import { useState } from 'react'
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
  Check
} from 'lucide-react'
import { useDashboard, type UserRecord } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function AdminUsersView() {
  const { users, updateUserStatus, verifyUser } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Farmer' | 'Buyer' | 'Admin'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Pending Verification'>('All')

  // Selected User Modal / Action
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [actionConfirm, setActionConfirm] = useState<{
    user: UserRecord
    action: 'verify' | 'suspend' | 'activate'
  } | null>(null)

  const filteredUsers = users.filter((u) => {
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

  const handleExecuteAction = () => {
    if (!actionConfirm) return
    const { user, action } = actionConfirm

    if (action === 'verify') {
      verifyUser(user.id)
    } else if (action === 'suspend') {
      updateUserStatus(user.id, 'Suspended')
    } else if (action === 'activate') {
      updateUserStatus(user.id, 'Active')
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
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-soil">
              Registered Users Directory
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1 max-w-2xl">
              Inspect user credentials, verify KYC compliance, manage platform permissions, and enforce administrative account suspensions.
            </p>
          </div>

          <div className="p-3 bg-monsoon text-wheat rounded-2xl border border-turmeric/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-turmeric flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-turmeric uppercase block">TOTAL REGISTRATIONS</span>
              <span className="font-mono text-xl font-bold text-datateal">{users.length} Users</span>
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
                <th className="py-3.5 px-4">Status</th>
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
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg bg-soil/5 hover:bg-soil/10 text-soil transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {user.status === 'Pending Verification' && (
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-monsoon/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wheat rounded-3xl border border-soil/15 max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-soil/10">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-turmeric" />
                <h3 className="font-serif text-xl font-bold text-soil">User Account Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-soil/40 hover:text-soil cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-monsoon text-wheat rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-turmeric uppercase block">{selectedUser.id} &bull; {selectedUser.userType}</span>
              <h4 className="font-serif text-xl font-bold">{selectedUser.name}</h4>
              <p className="text-xs text-wheat/80">{selectedUser.organization || 'Independent Account'}</p>
            </div>

            <div className="space-y-2 text-xs font-body text-soil/80">
              <p><strong className="text-soil">Email:</strong> <span className="font-mono">{selectedUser.email}</span></p>
              <p><strong className="text-soil">Phone:</strong> <span className="font-mono">{selectedUser.phone}</span></p>
              <p><strong className="text-soil">Location:</strong> {selectedUser.location} ({selectedUser.district}, {selectedUser.state})</p>
              <p><strong className="text-soil">KYC Status:</strong> {selectedUser.kycVerified ? '✅ Government Verified' : '⏳ Pending KYC'}</p>
              <p><strong className="text-soil">Registered Date:</strong> {selectedUser.registeredDate}</p>
            </div>

            <div className="pt-3 border-t border-soil/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-monsoon text-wheat font-body text-xs font-bold rounded-xl"
              >
                Close
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
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
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
