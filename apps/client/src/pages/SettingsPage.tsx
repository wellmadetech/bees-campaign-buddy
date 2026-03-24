import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ROLE_LABELS } from '@campaignbuddy/shared';
import type { UserRole } from '@campaignbuddy/shared';
import { Check, User, Bell, Shield, Building2 } from 'lucide-react';

const BEES_BRANCHES = [
  { id: 'branch-1', name: 'Northeast Distribution', code: 'NE-001' },
  { id: 'branch-2', name: 'Southeast Distribution', code: 'SE-001' },
  { id: 'branch-3', name: 'West Coast Distribution', code: 'WC-001' },
  { id: 'branch-4', name: 'Midwest Distribution', code: 'MW-001' },
  { id: 'branch-5', name: 'Southwest Distribution', code: 'SW-001' },
];

type Tab = 'profile' | 'notifications' | 'branches' | 'security';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ displayName: user?.displayName ?? '', phone: '', timezone: 'America/New_York' });
  const [notifications, setNotifications] = useState({ statusChanges: true, comments: true, bundles: true, weeklyDigest: false, emailNotifs: true, pushNotifs: true });
  const [selectedBranches, setSelectedBranches] = useState(['branch-1']);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'branches', label: 'Branches', icon: Building2 },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Settings</h1>
        <p className="text-sm text-surface-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium flex-1 justify-center transition-all ${
              tab === t.key ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            <t.icon className="w-4 h-4" strokeWidth={1.8} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center text-xl font-semibold text-surface-600">
              {user?.displayName?.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-lg font-semibold text-surface-900">{user?.displayName}</div>
              <div className="text-sm text-surface-500">{user?.email}</div>
              <span className="badge badge-brand text-[10px] mt-1">{user?.role ? ROLE_LABELS[user.role as UserRole] : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-100">
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Display Name</label>
              <input value={profile.displayName} onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Email</label>
              <input value={user?.email ?? ''} disabled className="input-field bg-surface-50 text-surface-400" />
              <p className="text-[10px] text-surface-400 mt-1">Managed by BEES One SSO</p>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Timezone</label>
              <select value={profile.timezone} onChange={(e) => setProfile(p => ({ ...p, timezone: e.target.value }))} className="input-field">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="text-[15px] font-semibold text-surface-900 mb-1">Activity Notifications</h3>
            <p className="text-xs text-surface-400 mb-4">Choose what you want to be notified about</p>
            <div className="space-y-3">
              {[
                { key: 'statusChanges' as const, label: 'Campaign status changes', desc: 'When a campaign moves to a new status' },
                { key: 'comments' as const, label: 'New comments', desc: 'When someone comments on your campaigns' },
                { key: 'bundles' as const, label: 'Bundle launch alerts', desc: 'When new campaign bundles are available' },
                { key: 'weeklyDigest' as const, label: 'Weekly digest', desc: 'Summary of campaign activity every Monday' },
              ].map((pref) => (
                <label key={pref.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors">
                  <div>
                    <div className="text-sm font-medium text-surface-900">{pref.label}</div>
                    <div className="text-xs text-surface-400">{pref.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[pref.key]}
                    onChange={(e) => setNotifications(n => ({ ...n, [pref.key]: e.target.checked }))}
                    className="rounded border-surface-300 w-5 h-5"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-surface-100">
            <h3 className="text-[15px] font-semibold text-surface-900 mb-1">Delivery Channels</h3>
            <p className="text-xs text-surface-400 mb-4">How you receive notifications</p>
            <div className="space-y-3">
              {[
                { key: 'emailNotifs' as const, label: 'Email notifications', desc: 'Receive notifications to your email' },
                { key: 'pushNotifs' as const, label: 'Browser push notifications', desc: 'Show desktop notifications in your browser' },
              ].map((ch) => (
                <label key={ch.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors">
                  <div>
                    <div className="text-sm font-medium text-surface-900">{ch.label}</div>
                    <div className="text-xs text-surface-400">{ch.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[ch.key]}
                    onChange={(e) => setNotifications(n => ({ ...n, [ch.key]: e.target.checked }))}
                    className="rounded border-surface-300 w-5 h-5"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Branches */}
      {tab === 'branches' && (
        <div className="card p-6">
          <h3 className="text-[15px] font-semibold text-surface-900 mb-1">Branch Access</h3>
          <p className="text-xs text-surface-400 mb-4">
            {user?.role === 'dc_manager'
              ? 'As a DC Manager, you have access to all branches'
              : 'Select the distribution branches you manage'}
          </p>
          <div className="space-y-1">
            {BEES_BRANCHES.map((branch) => {
              const isSelected = user?.role === 'dc_manager' || selectedBranches.includes(branch.id);
              return (
                <label
                  key={branch.id}
                  className={`flex items-center gap-3 p-3.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'bg-brand-50 border border-brand-200' : 'hover:bg-surface-50 border border-transparent'
                  } ${user?.role === 'dc_manager' ? 'pointer-events-none' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={user?.role === 'dc_manager'}
                    onChange={(e) => {
                      setSelectedBranches(prev =>
                        e.target.checked ? [...prev, branch.id] : prev.filter(id => id !== branch.id)
                      );
                    }}
                    className="rounded border-surface-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-surface-900">{branch.name}</div>
                    <div className="text-xs text-surface-400">{branch.code}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="text-[15px] font-semibold text-surface-900 mb-1">Authentication</h3>
            <p className="text-xs text-surface-400 mb-4">Your account is managed through BEES One SSO</p>
            <div className="bg-surface-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-surface-900">Single Sign-On (SSO)</div>
                <div className="text-xs text-surface-400">Authenticated via BEES One</div>
              </div>
              <span className="badge badge-success text-[10px]">Active</span>
            </div>
          </div>
          <div className="pt-4 border-t border-surface-100">
            <h3 className="text-[15px] font-semibold text-surface-900 mb-1">Two-Factor Authentication</h3>
            <p className="text-xs text-surface-400 mb-4">Managed through your BEES One account</p>
            <div className="bg-surface-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-surface-900">2FA Status</div>
                <div className="text-xs text-surface-400">Enforced by organization policy</div>
              </div>
              <span className="badge badge-success text-[10px]">Enabled</span>
            </div>
          </div>
          <div className="pt-4 border-t border-surface-100">
            <h3 className="text-[15px] font-semibold text-surface-900 mb-1">Active Sessions</h3>
            <div className="bg-surface-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-surface-900">Current Session</div>
                  <div className="text-xs text-surface-400">Chrome · macOS · Last active now</div>
                </div>
                <span className="badge badge-success text-[10px]">Current</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button onClick={handleSave} className="btn-primary">
          {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
