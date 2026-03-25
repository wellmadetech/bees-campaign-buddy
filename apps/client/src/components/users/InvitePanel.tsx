import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ROLE_LABELS } from '@campaignbuddy/shared';
import type { UserRole } from '@campaignbuddy/shared';
import { Send, X, Clock, Check, XCircle, Copy, Mail } from 'lucide-react';

interface Invite {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  orgType: 'bees_internal' | 'wholesaler';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

const INITIAL_INVITES: Invite[] = [
  { id: 'inv-1', email: 'new.wholesaler@example.com', role: 'wholesaler_manager', status: 'pending', orgType: 'wholesaler', invitedBy: 'Dana Campbell', createdAt: '2026-03-22', expiresAt: '2026-03-29' },
  { id: 'inv-2', email: 'sarah.d@example.com', role: 'wholesaler_manager', status: 'accepted', orgType: 'wholesaler', invitedBy: 'Dana Campbell', createdAt: '2026-03-18', expiresAt: '2026-03-25' },
  { id: 'inv-3', email: 'designer@bees.com', role: 'content_creator', status: 'pending', orgType: 'bees_internal', invitedBy: 'Dana Campbell', createdAt: '2026-03-20', expiresAt: '2026-03-27' },
  { id: 'inv-4', email: 'old.invite@example.com', role: 'wholesaler_manager', status: 'expired', orgType: 'wholesaler', invitedBy: 'Dana Campbell', createdAt: '2026-03-01', expiresAt: '2026-03-08' },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'badge-warn',
  accepted: 'badge-success',
  expired: 'badge-default',
  revoked: 'badge-danger',
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  accepted: Check,
  expired: XCircle,
  revoked: XCircle,
};

export function InvitePanel() {
  const user = useAuthStore((s) => s.user);
  const [invites, setInvites] = useState(INITIAL_INVITES);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    role: 'wholesaler_manager' as UserRole,
    orgType: 'wholesaler' as 'bees_internal' | 'wholesaler',
    message: '',
  });

  const handleSend = () => {
    const invite: Invite = {
      id: `inv-${Date.now()}`,
      email: form.email,
      role: form.role,
      status: 'pending',
      orgType: form.orgType,
      invitedBy: user?.displayName ?? 'Unknown',
      createdAt: new Date().toISOString().slice(0, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
    setInvites(prev => [invite, ...prev]);
    setShowForm(false);
    setForm({ email: '', role: 'wholesaler_manager', orgType: 'wholesaler', message: '' });
  };

  const handleRevoke = (id: string) => {
    setInvites(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'revoked' as const } : inv));
  };

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`https://bees-one.com/invite/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingCount = invites.filter(i => i.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-surface-900">Invitations</h2>
          <p className="text-xs text-surface-400">{pendingCount} pending invite{pendingCount !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs">
          <Mail className="w-3.5 h-3.5" /> Send Invite
        </button>
      </div>

      {/* Invite Form */}
      {showForm && (
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-surface-900">New Invitation</h3>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1"><X className="w-3.5 h-3.5" /></button>
          </div>

          <div className="space-y-3">
            {/* Org type toggle */}
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Account Type</label>
              <div className="flex gap-2">
                {([['wholesaler', 'Wholesaler'], ['bees_internal', 'BEES Internal']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setForm(f => ({ ...f, orgType: val, role: val === 'bees_internal' ? 'content_creator' : 'wholesaler_manager' }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      form.orgType === val ? 'border-surface-900 bg-surface-50' : 'border-surface-200 hover:border-surface-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder={form.orgType === 'wholesaler' ? 'wholesaler@company.com' : 'name@bees.com'}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="input-field">
                {form.orgType === 'wholesaler' ? (
                  <option value="wholesaler_manager">Wholesaler Manager</option>
                ) : (
                  <>
                    <option value="content_creator">Asset Creator</option>
                    <option value="dc_manager">Digicomm Manager</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Personal Message (optional)</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                rows={2}
                placeholder="Welcome to Campaign Buddy..."
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-surface-100">
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs">Cancel</button>
            <button onClick={handleSend} disabled={!form.email} className="btn-primary text-xs">
              <Send className="w-3.5 h-3.5" /> Send Invitation
            </button>
          </div>
        </div>
      )}

      {/* Invite list */}
      <div className="card overflow-hidden">
        {invites.length === 0 ? (
          <div className="p-8 text-center text-sm text-surface-400">No invitations sent yet</div>
        ) : (
          <div>
            {invites.map((inv, i) => {
              const StatusIcon = STATUS_ICONS[inv.status];
              return (
                <div key={inv.id} className={`flex items-center gap-3 px-4 py-3 ${i < invites.length - 1 ? 'border-b border-surface-100/60' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-surface-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-900">{inv.email}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-surface-400">
                        {ROLE_LABELS[inv.role as UserRole] ?? inv.role}
                      </span>
                      <span className="text-[11px] text-surface-300">&middot;</span>
                      <span className="text-[11px] text-surface-400">
                        {inv.orgType === 'bees_internal' ? 'BEES Internal' : 'Wholesaler'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge text-[10px] ${STATUS_STYLES[inv.status]}`}>
                      <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                      {inv.status}
                    </span>
                    {inv.status === 'pending' && (
                      <>
                        <button onClick={() => handleCopyLink(inv.id)} className="btn-ghost p-1.5" title="Copy invite link">
                          {copiedId === inv.id ? <Check className="w-3 h-3 text-success-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button onClick={() => handleRevoke(inv.id)} className="btn-ghost p-1.5 text-danger-600" title="Revoke">
                          <XCircle className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
