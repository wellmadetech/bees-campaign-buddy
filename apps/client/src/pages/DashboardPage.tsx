import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listCampaigns } from '../api/campaigns';
import { useAuthStore } from '../store/authStore';
import { Plus, Megaphone, Clock, Zap, AlertTriangle, DollarSign, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react';

const MOCK_CAMPAIGNS = [
  { id: 'demo-1', status: 'active' },
  { id: 'demo-2', status: 'in_progress' },
  { id: 'demo-3', status: 'scheduled' },
  { id: 'demo-4', status: 'in_progress' },
  { id: 'demo-5', status: 'needs_attention' },
  { id: 'demo-6', status: 'active' },
  { id: 'demo-7', status: 'completed' },
  { id: 'demo-8', status: 'scheduled' },
];

const REVENUE_METRICS = {
  digitalNetRevenue: 1247500,
  revenueGrowth: 18.3,
  avgOrderValue: 342,
  aovGrowth: 7.2,
  totalOrders: 3648,
  ordersGrowth: 12.1,
  conversionRate: 4.8,
  conversionGrowth: 0.6,
};

const WEEKLY_REVENUE = [
  { week: 'W1', revenue: 285000 },
  { week: 'W2', revenue: 312000 },
  { week: 'W3', revenue: 298000 },
  { week: 'W4', revenue: 352500 },
];

const TOP_CAMPAIGNS_BY_REVENUE = [
  { title: 'BEES Rewards Launch', revenue: 42100, orders: 312 },
  { title: 'Spring Beer Promo — Bud Light', revenue: 28450, orders: 187 },
  { title: 'Summer Seltzer Push — Michelob Ultra', revenue: 19200, orders: 142 },
  { title: 'Cinco de Mayo — Corona Bundle', revenue: 15800, orders: 98 },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isDemo = useAuthStore((s) => s.token === 'demo-token');

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', { limit: 100 }],
    queryFn: () => listCampaigns({ limit: 100 }),
    enabled: !isDemo,
  });

  const campaigns = isDemo ? MOCK_CAMPAIGNS : (data?.data ?? []);
  const statusCounts = campaigns.reduce(
    (acc: Record<string, number>, c: { status: string }) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const stats = [
    { label: 'Total', value: campaigns.length, icon: Megaphone, style: 'text-info-600 bg-info-50' },
    { label: 'Work In Progress', value: (statusCounts['in_progress'] ?? 0) + (statusCounts['scheduled'] ?? 0), icon: Clock, style: 'text-brand-600 bg-brand-100' },
    { label: 'Active', value: statusCounts['active'] ?? 0, icon: Zap, style: 'text-success-600 bg-success-50' },
    { label: 'Needs Attention', value: statusCounts['needs_attention'] ?? 0, icon: AlertTriangle, style: 'text-danger-600 bg-danger-50' },
  ];

  const loading = isLoading && !isDemo;
  const maxWeekRevenue = Math.max(...WEEKLY_REVENUE.map(w => w.revenue));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold text-surface-900 tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-surface-500 mt-1">Your campaign overview</p>
        </div>
        {user?.role !== 'content_creator' && (
          <button onClick={() => navigate('/campaigns/new')} className="btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        )}
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-surface-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.style}`}>
                <stat.icon className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-surface-900 tabular-nums">
              {loading ? <div className="w-8 h-7 bg-surface-100 rounded animate-pulse" /> : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Digital Net Revenue */}
      <h2 className="text-[15px] font-semibold text-surface-900 mb-4">Digital Net Revenue</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Net Revenue', value: `$${(REVENUE_METRICS.digitalNetRevenue / 1000).toFixed(0)}k`, growth: REVENUE_METRICS.revenueGrowth, icon: DollarSign, style: 'text-success-600 bg-success-50' },
          { label: 'Avg Order Value', value: `$${REVENUE_METRICS.avgOrderValue}`, growth: REVENUE_METRICS.aovGrowth, icon: ShoppingCart, style: 'text-brand-600 bg-brand-100' },
          { label: 'Total Orders', value: REVENUE_METRICS.totalOrders.toLocaleString(), growth: REVENUE_METRICS.ordersGrowth, icon: BarChart3, style: 'text-info-600 bg-info-50' },
          { label: 'Conversion Rate', value: `${ REVENUE_METRICS.conversionRate}%`, growth: REVENUE_METRICS.conversionGrowth, icon: TrendingUp, style: 'text-surface-600 bg-surface-100' },
        ].map((m) => (
          <div key={m.label} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-surface-500">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.style}`}>
                <m.icon className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-surface-900 tabular-nums">{m.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-success-600" />
              <span className="text-xs font-medium text-success-600">+{m.growth}%</span>
              <span className="text-xs text-surface-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Weekly Revenue (March)</h3>
          <div className="flex items-end gap-4 h-32">
            {WEEKLY_REVENUE.map((w) => (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-medium text-surface-900 tabular-nums">${(w.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full bg-success-400 rounded-t-md" style={{ height: `${(w.revenue / maxWeekRevenue) * 100}%`, minHeight: 8 }} />
                <span className="text-[11px] text-surface-400">{w.week}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Top Campaigns by Revenue</h3>
          <div className="space-y-3">
            {TOP_CAMPAIGNS_BY_REVENUE.map((c, i) => (
              <div key={c.title} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-brand-500 tabular-nums w-4">#{i + 1}</span>
                  <span className="text-sm text-surface-700 truncate">{c.title}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-sm font-semibold text-surface-900 tabular-nums">${c.revenue.toLocaleString()}</div>
                  <div className="text-[10px] text-surface-400">{c.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
