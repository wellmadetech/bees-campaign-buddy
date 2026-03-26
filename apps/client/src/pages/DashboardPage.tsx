import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listCampaigns } from '../api/campaigns';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { Plus, Megaphone, Clock, Zap, AlertTriangle, DollarSign, TrendingUp, ShoppingCart, BarChart3 } from 'lucide-react';

type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

const REVENUE_BY_PERIOD: Record<TimePeriod, { digitalNetRevenue: number; revenueGrowth: number; avgOrderValue: number; aovGrowth: number; totalOrders: number; ordersGrowth: number; conversionRate: number; conversionGrowth: number }> = {
  week: { digitalNetRevenue: 352500, revenueGrowth: 8.1, avgOrderValue: 358, aovGrowth: 3.4, totalOrders: 984, ordersGrowth: 5.2, conversionRate: 5.1, conversionGrowth: 0.3 },
  month: { digitalNetRevenue: 1247500, revenueGrowth: 18.3, avgOrderValue: 342, aovGrowth: 7.2, totalOrders: 3648, ordersGrowth: 12.1, conversionRate: 4.8, conversionGrowth: 0.6 },
  quarter: { digitalNetRevenue: 3420000, revenueGrowth: 22.6, avgOrderValue: 338, aovGrowth: 5.8, totalOrders: 10118, ordersGrowth: 15.4, conversionRate: 4.6, conversionGrowth: 0.8 },
  year: { digitalNetRevenue: 12840000, revenueGrowth: 31.2, avgOrderValue: 329, aovGrowth: 4.1, totalOrders: 39027, ordersGrowth: 24.8, conversionRate: 4.3, conversionGrowth: 1.2 },
};

const CHART_BY_PERIOD: Record<TimePeriod, { label: string; revenue: number }[]> = {
  week: [
    { label: 'Mon', revenue: 48200 }, { label: 'Tue', revenue: 52100 }, { label: 'Wed', revenue: 45800 },
    { label: 'Thu', revenue: 58400 }, { label: 'Fri', revenue: 62300 }, { label: 'Sat', revenue: 42500 }, { label: 'Sun', revenue: 43200 },
  ],
  month: [
    { label: 'W1', revenue: 285000 }, { label: 'W2', revenue: 312000 }, { label: 'W3', revenue: 298000 }, { label: 'W4', revenue: 352500 },
  ],
  quarter: [
    { label: 'Jan', revenue: 1020000 }, { label: 'Feb', revenue: 1150000 }, { label: 'Mar', revenue: 1250000 },
  ],
  year: [
    { label: 'Q1', revenue: 2890000 }, { label: 'Q2', revenue: 3120000 }, { label: 'Q3', revenue: 3340000 }, { label: 'Q4', revenue: 3490000 },
  ],
};

const PERIOD_LABELS: Record<TimePeriod, string> = { week: 'This Week', month: 'This Month', quarter: 'This Quarter', year: 'This Year' };

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

  const [period, setPeriod] = useState<TimePeriod>('month');

  const STATS_BY_PERIOD: Record<TimePeriod, { total: number; wip: number; active: number; attention: number }> = {
    week: { total: 3, wip: 1, active: 2, attention: 0 },
    month: { total: 8, wip: 4, active: 2, attention: 1 },
    quarter: { total: 24, wip: 8, active: 7, attention: 3 },
    year: { total: 142, wip: 12, active: 18, attention: 5 },
  };
  const ps = isDemo ? STATS_BY_PERIOD[period] : { total: campaigns.length, wip: (statusCounts['in_progress'] ?? 0) + (statusCounts['scheduled'] ?? 0), active: statusCounts['active'] ?? 0, attention: statusCounts['needs_attention'] ?? 0 };

  const stats = [
    { label: 'Total', value: ps.total, icon: Megaphone, style: 'text-info-600 bg-info-50' },
    { label: 'Work In Progress', value: ps.wip, icon: Clock, style: 'text-brand-600 bg-brand-100' },
    { label: 'Active', value: ps.active, icon: Zap, style: 'text-success-600 bg-success-50' },
    { label: 'Needs Attention', value: ps.attention, icon: AlertTriangle, style: 'text-danger-600 bg-danger-50' },
  ];
  const loading = isLoading && !isDemo;
  const metrics = REVENUE_BY_PERIOD[period];
  const chartData = CHART_BY_PERIOD[period];
  const maxChartValue = Math.max(...chartData.map(d => d.revenue));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold text-surface-900 tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-surface-500 mt-1">Your campaign overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-100 rounded-lg p-0.5">
            {(['week', 'month', 'quarter', 'year'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {p === 'week' ? 'Week' : p === 'month' ? 'Month' : p === 'quarter' ? 'Quarter' : 'Year'}
              </button>
            ))}
          </div>
          {user?.role !== 'content_creator' && (
            <button onClick={() => navigate('/campaigns/new')} className="btn-primary hidden sm:inline-flex">
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          )}
        </div>
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-surface-900">Digital Net Revenue</h2>
        <span className="text-xs text-surface-400">{PERIOD_LABELS[period]}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Net Revenue', value: `$${metrics.digitalNetRevenue >= 1000000 ? (metrics.digitalNetRevenue / 1000000).toFixed(1) + 'M' : (metrics.digitalNetRevenue / 1000).toFixed(0) + 'k'}`, growth: metrics.revenueGrowth, icon: DollarSign, style: 'text-success-600 bg-success-50' },
          { label: 'Avg Order Value', value: `$${metrics.avgOrderValue}`, growth: metrics.aovGrowth, icon: ShoppingCart, style: 'text-brand-600 bg-brand-100' },
          { label: 'Total Orders', value: metrics.totalOrders.toLocaleString(), growth: metrics.ordersGrowth, icon: BarChart3, style: 'text-info-600 bg-info-50' },
          { label: 'Conversion Rate', value: `${metrics.conversionRate}%`, growth: metrics.conversionGrowth, icon: TrendingUp, style: 'text-surface-600 bg-surface-100' },
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
          <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Revenue — {PERIOD_LABELS[period]}</h3>
          <div className="flex items-end gap-3 h-32">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-surface-900 tabular-nums">${d.revenue >= 1000000 ? (d.revenue / 1000000).toFixed(1) + 'M' : (d.revenue / 1000).toFixed(0) + 'k'}</span>
                <div className="w-full rounded-t-md" style={{ height: `${(d.revenue / maxChartValue) * 100}%`, minHeight: 8, backgroundColor: '#22c55e' }} />
                <span className="text-[10px] text-surface-400">{d.label}</span>
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
