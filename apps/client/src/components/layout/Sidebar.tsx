import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Megaphone, CalendarDays, Package, FileText, ImageIcon, BarChart3, Inbox, Users, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/requests', icon: Inbox, label: 'Requests', roles: ['dc_manager'] },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar', roles: ['dc_manager', 'wholesaler_manager'] },
  { to: '/bundles', icon: Package, label: 'Bundles', roles: ['dc_manager', 'wholesaler_manager'] },
  { to: '/templates', icon: FileText, label: 'Templates', roles: ['dc_manager', 'content_creator'] },
  { to: '/assets', icon: ImageIcon, label: 'Assets', roles: ['dc_manager', 'content_creator'] },
  { to: '/reporting', icon: BarChart3, label: 'Reporting', roles: ['dc_manager', 'wholesaler_manager'] },
  { to: '/users', icon: Users, label: 'Users', roles: ['dc_manager'] },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[260px] bg-surface-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white text-lg leading-none">B</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white tracking-tight">Campaign Buddy</h1>
            <p className="text-[11px] text-surface-400 font-medium tracking-wide uppercase">BEES One</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 overflow-auto">
        <div className="space-y-0.5">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user?.role ?? ''))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-surface-400 hover:bg-white/5 hover:text-surface-200',
                  )
                }
              >
                <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {item.label}
              </NavLink>
            ))}
        </div>
      </nav>

      {/* User section */}
      <div className="px-3 pb-4">
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-xs font-medium text-surface-300">
              {user?.displayName?.split(' ').map(n => n[0]).join('') ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-surface-200 truncate">{user?.displayName}</div>
              <div className="text-[11px] text-surface-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-[13px] font-medium text-surface-500 hover:text-surface-300 hover:bg-white/5 rounded-lg transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
