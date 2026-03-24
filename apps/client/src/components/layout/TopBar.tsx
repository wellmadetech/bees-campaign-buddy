import { useAuthStore } from '../../store/authStore';
import { ROLE_LABELS } from '@campaignbuddy/shared';
import type { UserRole } from '@campaignbuddy/shared';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const isDemo = useAuthStore((s) => s.token === 'demo-token');

  return (
    <div className="flex items-center justify-between w-full">
      <div className="hidden sm:block">
        <GlobalSearch />
      </div>
      <div className="sm:hidden" />
      <div className="flex items-center gap-2">
        {isDemo && <span className="badge badge-warn hidden sm:inline-flex">Demo</span>}
        <span className="badge badge-default hidden sm:inline-flex">
          {user?.role ? ROLE_LABELS[user.role as UserRole] : ''}
        </span>
        <NotificationBell />
      </div>
    </div>
  );
}
