import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginWithSso } from '../api/auth';
import type { AuthUser } from '@campaignbuddy/shared';
import { Shield, Users, Palette } from 'lucide-react';

const DEV_USERS = [
  {
    ssoId: 'sso-dc-manager-001',
    label: 'Dana Campbell',
    subtitle: 'Digicomm Manager',
    description: 'Full access — manage users, campaigns, and workflows',
    icon: Shield,
    mock: {
      id: 'demo-dc-001',
      email: 'dc.manager@bees.com',
      displayName: 'Dana Campbell',
      role: 'dc_manager',
      branchIds: ['branch-1', 'branch-2', 'branch-3'],
    } as AuthUser,
  },
  {
    ssoId: 'sso-wholesaler-001',
    label: 'Walter Smith',
    subtitle: 'Wholesaler Manager',
    description: 'Submit campaigns, track status, manage branches',
    icon: Users,
    mock: {
      id: 'demo-ws-001',
      email: 'wholesaler@bees.com',
      displayName: 'Walter Smith',
      role: 'wholesaler_manager',
      branchIds: ['branch-1'],
    } as AuthUser,
  },
  {
    ssoId: 'sso-creator-001',
    label: 'Carmen Rodriguez',
    subtitle: 'Asset Creator',
    description: 'Review drafts, customize content, manage templates',
    icon: Palette,
    mock: {
      id: 'demo-cc-001',
      email: 'creator@bees.com',
      displayName: 'Carmen Rodriguez',
      role: 'content_creator',
      branchIds: ['branch-1'],
    } as AuthUser,
  },
];

export function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = async (ssoId: string) => {
    setLoading(ssoId);
    setError('');
    const devUser = DEV_USERS.find((u) => u.ssoId === ssoId)!;
    try {
      const result = await loginWithSso(ssoId);
      login(result.accessToken, result.user);
      navigate('/');
    } catch {
      login('demo-token', devUser.mock);
      navigate('/');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-surface-800)_0%,_var(--color-surface-900)_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 mb-5 shadow-lg shadow-brand-500/20">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign Buddy</h1>
          <p className="text-surface-400 text-sm mt-1.5">BEES One Digital Communications</p>
        </div>

        {error && (
          <div className="bg-danger-50 text-danger-600 p-3 rounded-xl mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        {/* User cards */}
        <div className="space-y-3">
          {DEV_USERS.map((user) => (
            <button
              key={user.ssoId}
              onClick={() => handleLogin(user.ssoId)}
              disabled={!!loading}
              className="w-full text-left bg-white/[0.06] backdrop-blur border border-white/10 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.1] hover:border-white/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors duration-200">
                  <user.icon className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors duration-200" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{user.label}</span>
                    <span className="text-[11px] font-medium text-surface-500 bg-white/5 px-2 py-0.5 rounded-md">
                      {user.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">{user.description}</p>
                </div>
                {loading === user.ssoId && (
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-surface-600 text-center mt-8">
          In production, this redirects to BEES One SSO
        </p>
      </div>
    </div>
  );
}
