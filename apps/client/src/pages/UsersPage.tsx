import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listUsers, createUser, deactivateUser } from '../api/users';
import { listBranches } from '../api/branches';
import { useAuthStore } from '../store/authStore';
import { ROLE_LABELS } from '@campaignbuddy/shared';
import { InvitePanel } from '../components/users/InvitePanel';
import type { UserRole, UserWithBranches, Branch } from '@campaignbuddy/shared';
import { Plus, Trash2, X } from 'lucide-react';

const MOCK_USERS: UserWithBranches[] = [
  { id: 'demo-dc-001', besSsoId: 'sso-dc-001', email: 'dc.manager@bees.com', displayName: 'Dana Campbell', role: 'dc_manager', isActive: true, createdAt: '2026-01-15', updatedAt: '2026-01-15', branches: [{ branchId: 'branch-1', branchName: 'Northeast Distribution', branchCode: 'NE-001', isPrimary: true }, { branchId: 'branch-2', branchName: 'Southeast Distribution', branchCode: 'SE-001', isPrimary: false }, { branchId: 'branch-3', branchName: 'West Coast Distribution', branchCode: 'WC-001', isPrimary: false }] },
  { id: 'demo-ws-001', besSsoId: 'sso-ws-001', email: 'wholesaler@bees.com', displayName: 'Walter Smith', role: 'wholesaler_manager', isActive: true, createdAt: '2026-01-20', updatedAt: '2026-01-20', branches: [{ branchId: 'branch-1', branchName: 'Northeast Distribution', branchCode: 'NE-001', isPrimary: true }] },
  { id: 'demo-cc-001', besSsoId: 'sso-cc-001', email: 'creator@bees.com', displayName: 'Carmen Rodriguez', role: 'content_creator', isActive: true, createdAt: '2026-02-01', updatedAt: '2026-02-01', branches: [{ branchId: 'branch-1', branchName: 'Northeast Distribution', branchCode: 'NE-001', isPrimary: true }] },
  { id: 'demo-ws-002', besSsoId: 'sso-ws-002', email: 'maria.j@bees.com', displayName: 'Maria Johnson', role: 'wholesaler_manager', isActive: true, createdAt: '2026-02-10', updatedAt: '2026-02-10', branches: [{ branchId: 'branch-2', branchName: 'Southeast Distribution', branchCode: 'SE-001', isPrimary: true }] },
  { id: 'demo-cc-002', besSsoId: 'sso-cc-002', email: 'james.w@bees.com', displayName: 'James Wilson', role: 'content_creator', isActive: true, createdAt: '2026-02-15', updatedAt: '2026-02-15', branches: [{ branchId: 'branch-3', branchName: 'West Coast Distribution', branchCode: 'WC-001', isPrimary: true }] },
];

const MOCK_BRANCHES: Branch[] = [
  { id: 'branch-1', name: 'Northeast Distribution', code: 'NE-001', region: 'Northeast', isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'branch-2', name: 'Southeast Distribution', code: 'SE-001', region: 'Southeast', isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'branch-3', name: 'West Coast Distribution', code: 'WC-001', region: 'West', isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

const ROLE_STYLES: Record<string, string> = {
  dc_manager: 'badge-brand',
  content_creator: 'badge-info',
  wholesaler_manager: 'badge-default',
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((s) => s.token === 'demo-token');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'wholesaler_manager' as UserRole,
    branchIds: [] as string[],
  });

  const { data: apiUsers, isLoading } = useQuery({ queryKey: ['users'], queryFn: listUsers, enabled: !isDemo });
  const { data: apiBranches } = useQuery({ queryKey: ['branches'], queryFn: listBranches, enabled: !isDemo });

  const users = isDemo ? MOCK_USERS : apiUsers;
  const branches = isDemo ? MOCK_BRANCHES : apiBranches;

  const createMutation = useMutation({
    mutationFn: () => createUser(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
      setFormData({ email: '', displayName: '', role: 'wholesaler_manager', branchIds: [] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Users</h1>
          <p className="text-sm text-surface-500 mt-1">{users?.length ?? 0} user{(users?.length ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* New User Form */}
      {showForm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-surface-900">New User</h2>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@bees.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Full name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value as UserRole }))}
                className="input-field"
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Branches</label>
              <div className="space-y-1.5 max-h-28 overflow-auto">
                {branches?.map((branch: Branch) => (
                  <label key={branch.id} className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.branchIds.includes(branch.id)}
                      onChange={(e) => {
                        setFormData((f) => ({
                          ...f,
                          branchIds: e.target.checked
                            ? [...f.branchIds, branch.id]
                            : f.branchIds.filter((id) => id !== branch.id),
                        }));
                      }}
                      className="rounded border-surface-300"
                    />
                    {branch.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-100">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => !isDemo && createMutation.mutate()}
              disabled={!formData.email || !formData.displayName || formData.branchIds.length === 0}
              className="btn-primary"
            >
              Create User
            </button>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Branches</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {(isLoading && !isDemo) ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-100/60 animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 w-36 bg-surface-100 rounded" /></td>
                  <td className="px-5 py-4"><div className="h-5 w-24 bg-surface-100 rounded" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-40 bg-surface-100 rounded" /></td>
                  <td />
                </tr>
              ))
            ) : !users?.length ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-surface-400">No users found</td>
              </tr>
            ) : (
              users.map((user: UserWithBranches, i: number) => (
                <tr key={user.id} className={`hover:bg-surface-50 transition-colors duration-100 ${i < users.length - 1 ? 'border-b border-surface-100/60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-xs font-medium text-surface-600">
                        {user.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-surface-900">{user.displayName}</div>
                        <div className="text-xs text-surface-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${ROLE_STYLES[user.role] ?? 'badge-default'}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-surface-500">
                    {user.branches?.map((b) => b.branchName).join(', ')}
                  </td>
                  <td className="px-5 py-3.5">
                    {!isDemo && (
                      <button onClick={() => deleteMutation.mutate(user.id)} className="btn-ghost p-1.5 text-surface-400 hover:text-danger-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Panel */}
      <div className="mt-8">
        <InvitePanel />
      </div>
    </div>
  );
}
