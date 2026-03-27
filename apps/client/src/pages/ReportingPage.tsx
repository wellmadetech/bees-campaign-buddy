import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { STATUS_LABELS, CAMPAIGN_TYPE_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus, CampaignTypeCode, AnalyticsFilters, AttributionModel, AnalyticsOverview, ChannelMixResult, FunnelSequence, ChannelAttribution, TouchpointChannel } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { BarChart3, TrendingUp, Users, Target, Eye, MousePointer, Send, ArrowUpRight, Layers, GitBranch, PieChart, Search, DollarSign, ShoppingCart } from 'lucide-react';
import { getAnalyticsOverview, getChannelMix, getFunnel, getAttribution, getCampaignMetrics } from '../api/analytics';
import { listBranches } from '../api/branches';
import AnalyticsFiltersBar from '../components/analytics/AnalyticsFilters';
import ChannelBadge from '../components/analytics/ChannelBadge';
import ChannelMixChart from '../components/analytics/ChannelMixChart';
import FunnelVisualization from '../components/analytics/FunnelVisualization';
import AttributionChart from '../components/analytics/AttributionChart';

// DC Manager — org-wide reporting data
const ORG_STATS = {
  total: 2297,
  thisMonth: 312,
  avgCycleTimeDays: 3.2,
  automationRate: 78,
};

const BY_STATUS: { status: CampaignStatus; count: number }[] = [
  { status: 'completed', count: 1842 },
  { status: 'active', count: 187 },
  { status: 'in_progress', count: 98 },
  { status: 'in_progress', count: 64 },
  { status: 'scheduled', count: 42 },
  { status: 'in_progress', count: 31 },
  { status: 'needs_attention', count: 18 },
  { status: 'cancelled', count: 15 },
];

const BY_TYPE: { type: CampaignTypeCode; count: number; pct: number }[] = [
  { type: 'ad_hoc_sales', count: 1102, pct: 48 },
  { type: 'ad_hoc_operational', count: 688, pct: 30 },
  { type: 'opt_in', count: 230, pct: 10 },
  { type: 'edge_algo', count: 161, pct: 7 },
  { type: 'lifecycle', count: 116, pct: 5 },
];

const BY_BRANCH: { name: string; count: number }[] = [
  { name: 'Northeast Distribution', count: 687 },
  { name: 'Southeast Distribution', count: 543 },
  { name: 'West Coast Distribution', count: 412 },
  { name: 'Midwest Distribution', count: 358 },
  { name: 'Southwest Distribution', count: 297 },
];

const MONTHLY_TREND = [
  { month: 'Oct', count: 245 },
  { month: 'Nov', count: 268 },
  { month: 'Dec', count: 198 },
  { month: 'Jan', count: 287 },
  { month: 'Feb', count: 302 },
  { month: 'Mar', count: 312 },
];

// Wholesaler — per-campaign performance data
const MY_CAMPAIGNS_PERFORMANCE = [
  { id: 'demo-1', title: 'Spring Beer Promo — Bud Light', status: 'active' as CampaignStatus, sent: 4820, delivered: 4756, opened: 1892, clicked: 643, ctr: 13.5, openRate: 39.8, revenue: 28450 },
  { id: 'demo-6', title: 'Summer Seltzer Push — Michelob Ultra', status: 'active' as CampaignStatus, sent: 3210, delivered: 3178, opened: 1340, clicked: 487, ctr: 15.3, openRate: 42.2, revenue: 19200 },
  { id: 'demo-7', title: 'NPS Survey — Q1 2026', status: 'completed' as CampaignStatus, sent: 5100, delivered: 5043, opened: 2115, clicked: 892, ctr: 17.7, openRate: 41.9, revenue: 0 },
  { id: 'demo-10', title: 'Opt-in: BEES Rewards Launch', status: 'active' as CampaignStatus, sent: 8450, delivered: 8372, opened: 3768, clicked: 1504, ctr: 18.0, openRate: 45.0, revenue: 42100 },
];

const MY_TOTALS = {
  totalSent: 21580,
  totalDelivered: 21349,
  totalOpened: 9115,
  totalClicked: 3526,
  avgOpenRate: 42.2,
  avgCtr: 16.1,
  totalRevenue: 89750,
};

function formatNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
}

// --- Tab definitions ---

type Tab = 'overview' | 'channel-mix' | 'journeys' | 'attribution';

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'channel-mix', label: 'Channel Mix', icon: Layers },
  { id: 'journeys', label: 'Journey Analysis', icon: GitBranch },
  { id: 'attribution', label: 'Attribution', icon: PieChart },
];

// --- Overview tab (existing content) ---

// --- Wholesaler / Branch Comparison (DC Manager view) ---

const WHOLESALER_PERFORMANCE = [
  {
    name: 'Northeast Distribution',
    code: 'NE-001',
    campaigns: 687,
    convRate: 16.2,
    topCombo: ['push', 'email'] as TouchpointChannel[],
    revenue: 82400,
    topChannel: 'Push' as const,
    topChannelPct: 38,
    trend: 12.4,
  },
  {
    name: 'Southeast Distribution',
    code: 'SE-001',
    campaigns: 543,
    convRate: 14.8,
    topCombo: ['email', 'push', 'sms'] as TouchpointChannel[],
    revenue: 64200,
    topChannel: 'Email' as const,
    topChannelPct: 34,
    trend: 18.7,
  },
  {
    name: 'West Coast Distribution',
    code: 'WC-001',
    campaigns: 412,
    convRate: 8.1,
    topCombo: ['push'] as TouchpointChannel[],
    revenue: 38900,
    topChannel: 'Push' as const,
    topChannelPct: 62,
    trend: -2.3,
  },
  {
    name: 'Midwest Distribution',
    code: 'MW-001',
    campaigns: 358,
    convRate: 12.4,
    topCombo: ['push', 'whatsapp'] as TouchpointChannel[],
    revenue: 41500,
    topChannel: 'WhatsApp' as const,
    topChannelPct: 41,
    trend: 22.1,
  },
  {
    name: 'Southwest Distribution',
    code: 'SW-001',
    campaigns: 297,
    convRate: 11.2,
    topCombo: ['email', 'sms'] as TouchpointChannel[],
    revenue: 29800,
    topChannel: 'SMS' as const,
    topChannelPct: 36,
    trend: 8.9,
  },
];

function WholesalerComparison() {
  const [search, setSearch] = useState('');
  const filtered = WHOLESALER_PERFORMANCE.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase())
  );
  const maxRevenue = Math.max(...WHOLESALER_PERFORMANCE.map((w) => w.revenue));
  const avgConvRate = WHOLESALER_PERFORMANCE.reduce((s, w) => s + w.convRate, 0) / WHOLESALER_PERFORMANCE.length;

  return (
    <div className="card overflow-hidden mt-5">
      <div className="px-5 py-4 border-b border-surface-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-surface-900">Wholesaler Performance</h2>
          <p className="text-xs text-surface-400 mt-0.5">Compare campaign performance across branches — spot who needs support</p>
        </div>
        <div className="relative flex-shrink-0">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search wholesaler..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-surface-200 rounded-lg pl-8 pr-3 py-2 w-52 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Quick insight */}
      {!search && (
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-800">
            <strong>Opportunity:</strong> West Coast has the lowest conversion rate ({WHOLESALER_PERFORMANCE.find(w => w.code === 'WC-001')?.convRate}%) and relies heavily on single-channel Push.
            Recommend adding Email or SMS to their campaign mix to match the {avgConvRate.toFixed(1)}% average.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Branch</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Campaigns</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Conv. Rate</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Revenue</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Trend</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Best Channel Mix</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-surface-400">No wholesalers match "{search}"</td></tr>
            )}
            {filtered.map((w, i) => {
              const isLow = w.convRate < avgConvRate * 0.75;
              return (
                <tr key={w.code} className={`hover:bg-surface-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-surface-100/60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-surface-900">{w.name}</div>
                    <div className="text-[11px] text-surface-400">{w.code}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-surface-600 text-right tabular-nums">{w.campaigns}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-sm font-semibold tabular-nums ${isLow ? 'text-danger-600' : w.convRate >= avgConvRate ? 'text-success-600' : 'text-surface-900'}`}>
                      {w.convRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-surface-900 text-right tabular-nums">${w.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`text-sm font-medium tabular-nums ${w.trend >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {w.trend >= 0 ? '+' : ''}{w.trend}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {w.topCombo.map((ch) => (
                        <ChannelBadge key={ch} channel={ch} />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const MONTHLY_DATA = [
  { month: 'Oct', campaigns: 245, revenue: 142000 },
  { month: 'Nov', campaigns: 268, revenue: 185000 },
  { month: 'Dec', campaigns: 198, revenue: 128000 },
  { month: 'Jan', campaigns: 287, revenue: 224000 },
  { month: 'Feb', campaigns: 302, revenue: 263000 },
  { month: 'Mar', campaigns: 312, revenue: 312000 },
];

function CampaignsRevenueChart() {
  const maxCampaigns = Math.max(...MONTHLY_DATA.map((d) => d.campaigns));
  const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));
  const chartHeight = 180;
  const points = MONTHLY_DATA.length;

  function campaignY(val: number) {
    return chartHeight - (val / maxCampaigns) * (chartHeight - 20);
  }
  function revenueY(val: number) {
    return chartHeight - (val / maxRevenue) * (chartHeight - 20);
  }
  function x(i: number) {
    return (i / (points - 1)) * 100;
  }

  const campaignPath = MONTHLY_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${campaignY(d.campaigns)}`).join(' ');
  const revenuePath = MONTHLY_DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${revenueY(d.revenue)}`).join(' ');

  return (
    <div className="card p-5 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider">Campaigns & Revenue</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-brand-500 rounded" />
            <span className="text-[11px] text-surface-500">Campaigns</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-green-500 rounded" />
            <span className="text-[11px] text-surface-500">Revenue</span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: chartHeight + 30 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-7 flex flex-col justify-between text-[10px] text-brand-400 font-medium tabular-nums w-8">
          <span>{maxCampaigns}</span>
          <span>{Math.round(maxCampaigns / 2)}</span>
          <span>0</span>
        </div>
        <div className="absolute right-0 top-0 bottom-7 flex flex-col justify-between text-[10px] text-green-500 font-medium tabular-nums w-12 text-right">
          <span>${(maxRevenue / 1000).toFixed(0)}k</span>
          <span>${(maxRevenue / 2000).toFixed(0)}k</span>
          <span>$0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-10 right-14 top-0" style={{ height: chartHeight }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-b border-surface-100" />
            ))}
          </div>

          {/* SVG lines */}
          <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
            {/* Campaign line */}
            <path d={campaignPath} fill="none" stroke="var(--color-brand-500, #e5a000)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            {/* Revenue line */}
            <path d={revenuePath} fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>

          {/* Data points — campaigns */}
          {MONTHLY_DATA.map((d, i) => (
            <div
              key={`c-${i}`}
              className="absolute flex flex-col items-center"
              style={{ left: `${x(i)}%`, top: campaignY(d.campaigns) - 18, transform: 'translateX(-50%)' }}
            >
              <span className="text-[11px] font-semibold text-brand-600 tabular-nums">{d.campaigns}</span>
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-brand-500 mt-0.5" />
            </div>
          ))}

          {/* Data points — revenue */}
          {MONTHLY_DATA.map((d, i) => (
            <div
              key={`r-${i}`}
              className="absolute flex flex-col items-center"
              style={{ left: `${x(i)}%`, top: revenueY(d.revenue) + 12, transform: 'translateX(-50%)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-green-500" />
              <span className="text-[11px] font-semibold text-green-600 tabular-nums mt-0.5">${(d.revenue / 1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-10 right-14 bottom-0 flex justify-between">
          {MONTHLY_DATA.map((d) => (
            <span key={d.month} className="text-xs text-surface-400">{d.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrgReporting() {
  const revenueStats = [
    { label: 'Digital Net Revenue', value: '$1.25M', growth: 18.3, icon: DollarSign, style: 'text-success-600 bg-success-50' },
    { label: 'Avg Order Value', value: '$342', growth: 7.2, icon: ShoppingCart, style: 'text-brand-600 bg-brand-100' },
    { label: 'Total Orders', value: '3,648', growth: 12.1, icon: BarChart3, style: 'text-info-600 bg-info-50' },
    { label: 'Conversion Rate', value: '4.8%', growth: 0.6, icon: Target, style: 'text-surface-600 bg-surface-100' },
  ];

  return (
    <>
      {/* Revenue KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {revenueStats.map((s) => (
          <div key={s.label} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-surface-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.style}`}>
                <s.icon className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-surface-900 tabular-nums">{s.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-success-600" />
              <span className="text-xs font-medium text-success-600">+{s.growth}%</span>
              <span className="text-xs text-surface-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns & Revenue — dual line chart */}
      <CampaignsRevenueChart />

      {/* Wholesaler Performance Comparison */}
      <WholesalerComparison />
    </>
  );
}

function WholesalerReporting() {
  const CHANNEL_PERF = [
    { channel: 'Push Notification', sent: 12480, openRate: 41.2, ctr: 14.8, revenue: 52300, benchmark: { openRate: 35, ctr: 11 } },
    { channel: 'Email', sent: 6200, openRate: 44.1, ctr: 18.2, revenue: 31200, benchmark: { openRate: 38, ctr: 14 } },
    { channel: 'SMS / MMS', sent: 1850, openRate: 92.4, ctr: 22.1, revenue: 8750, benchmark: { openRate: 85, ctr: 18 } },
    { channel: 'WhatsApp', sent: 1050, openRate: 88.6, ctr: 26.3, revenue: 4200, benchmark: { openRate: 80, ctr: 20 } },
  ];

  const BRAND_PERF = [
    { brand: 'Bud Light', campaigns: 5, revenue: 28450, orders: 187, growth: 12.4 },
    { brand: 'Corona', campaigns: 4, revenue: 22100, orders: 145, growth: 18.7 },
    { brand: 'Michelob Ultra', campaigns: 3, revenue: 19200, orders: 142, growth: 8.2 },
    { brand: 'Stella Artois', campaigns: 2, revenue: 12800, orders: 89, growth: -3.1 },
    { brand: 'Goose Island', campaigns: 2, revenue: 7200, orders: 52, growth: 24.6 },
  ];

  const MONTHLY_PERF = [
    { month: 'Oct', revenue: 14200, campaigns: 3, openRate: 38.1 },
    { month: 'Nov', revenue: 18500, campaigns: 4, openRate: 39.4 },
    { month: 'Dec', revenue: 12800, campaigns: 2, openRate: 36.8 },
    { month: 'Jan', revenue: 22400, campaigns: 5, openRate: 41.2 },
    { month: 'Feb', revenue: 26300, campaigns: 6, openRate: 42.8 },
    { month: 'Mar', revenue: 31200, campaigns: 7, openRate: 44.1 },
  ];

  const ROI_DATA = {
    totalSpend: 4200,
    totalRevenue: 89750,
    roi: 2036,
    costPerOrder: 1.15,
    revenuePerCampaign: 7479,
  };

  const maxMonthRevenue = Math.max(...MONTHLY_PERF.map((m) => m.revenue));
  const maxBrandRevenue = Math.max(...BRAND_PERF.map((b) => b.revenue));

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Sent', value: formatNum(MY_TOTALS.totalSent), icon: Send, style: 'text-info-600 bg-info-50', sub: `${MY_CAMPAIGNS_PERFORMANCE.length} campaigns` },
          { label: 'Avg. Open Rate', value: `${MY_TOTALS.avgOpenRate}%`, icon: Eye, style: 'text-brand-600 bg-brand-100', sub: 'Benchmark: 35%' },
          { label: 'Avg. CTR', value: `${MY_TOTALS.avgCtr}%`, icon: MousePointer, style: 'text-success-600 bg-success-50', sub: 'Benchmark: 11%' },
          { label: 'Est. Revenue', value: `$${(MY_TOTALS.totalRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, style: 'text-surface-600 bg-surface-100', sub: `${ROI_DATA.roi}% ROI` },
        ].map((s) => (
          <div key={s.label} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-surface-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.style}`}>
                <s.icon className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-surface-900 tabular-nums">{s.value}</div>
            <div className="text-[11px] text-surface-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ROI Card */}
      <div className="card p-5 mb-5">
        <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Return on Investment</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Campaign Spend', value: `$${ROI_DATA.totalSpend.toLocaleString()}` },
            { label: 'Revenue Generated', value: `$${ROI_DATA.totalRevenue.toLocaleString()}` },
            { label: 'ROI', value: `${ROI_DATA.roi}%`, highlight: true },
            { label: 'Cost per Order', value: `$${ROI_DATA.costPerOrder}` },
          ].map((m) => (
            <div key={m.label} className="text-center p-3 bg-surface-50 rounded-lg">
              <div className={`text-xl font-semibold tabular-nums ${m.highlight ? 'text-success-600' : 'text-surface-900'}`}>{m.value}</div>
              <div className="text-[11px] text-surface-400 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Monthly Revenue Trend */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Monthly Revenue</h2>
          <div className="flex items-end gap-3 h-36">
            {MONTHLY_PERF.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-surface-900 tabular-nums">${(m.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full bg-success-400 rounded-t-md" style={{ height: `${(m.revenue / maxMonthRevenue) * 100}%`, minHeight: 8 }} />
                <span className="text-[10px] text-surface-400">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3 justify-center">
            <ArrowUpRight className="w-3 h-3 text-success-600" />
            <span className="text-xs text-success-600 font-medium">+18.6% revenue growth over 6 months</span>
          </div>
        </div>

        {/* Channel Performance vs Benchmark */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Channel Performance vs Benchmark</h2>
          <div className="space-y-4">
            {CHANNEL_PERF.map((ch) => {
              const openDiff = ch.openRate - ch.benchmark.openRate;
              const ctrDiff = ch.ctr - ch.benchmark.ctr;
              return (
                <div key={ch.channel}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-surface-700">{ch.channel}</span>
                    <span className="text-xs text-surface-400 tabular-nums">{formatNum(ch.sent)} sent</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between bg-surface-50 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] text-surface-400">Open</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-surface-900 tabular-nums">{ch.openRate}%</span>
                        <span className={`text-[10px] font-medium ${openDiff >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {openDiff >= 0 ? '+' : ''}{openDiff.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-surface-50 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] text-surface-400">CTR</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-surface-900 tabular-nums">{ch.ctr}%</span>
                        <span className={`text-[10px] font-medium ${ctrDiff >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {ctrDiff >= 0 ? '+' : ''}{ctrDiff.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brand / Product Performance */}
      <div className="card p-5 mb-5">
        <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Brand Performance</h2>
        <div className="space-y-3">
          {BRAND_PERF.map((b, i) => (
            <div key={b.brand} className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-brand-500 tabular-nums w-5">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-surface-900">{b.brand}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-surface-400 tabular-nums">{b.campaigns} campaigns</span>
                    <span className="text-xs text-surface-400 tabular-nums">{b.orders} orders</span>
                    <span className="text-sm font-semibold text-surface-900 tabular-nums w-20 text-right">${b.revenue.toLocaleString()}</span>
                    <span className={`text-[11px] font-medium w-12 text-right ${b.growth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {b.growth >= 0 ? '+' : ''}{b.growth}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(b.revenue / maxBrandRevenue) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign performance table */}
      <div className="card overflow-x-auto mb-5">
        <div className="px-5 py-4 border-b border-surface-100">
          <h2 className="text-[15px] font-semibold text-surface-900">Campaign Performance</h2>
          <p className="text-xs text-surface-400 mt-0.5">Delivery and engagement metrics for your launched campaigns</p>
        </div>
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Campaign</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Sent</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Open Rate</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">CTR</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Clicks</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Revenue</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">ROI</th>
            </tr>
          </thead>
          <tbody>
            {MY_CAMPAIGNS_PERFORMANCE.map((c, i) => {
              const campaignRoi = c.revenue > 0 ? Math.round((c.revenue / 350) * 100) : 0;
              return (
                <tr key={c.id} className={`hover:bg-surface-50 transition-colors ${i < MY_CAMPAIGNS_PERFORMANCE.length - 1 ? 'border-b border-surface-100/60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`badge text-[10px] ${getStatusStyle(c.status)}`}>{STATUS_LABELS[c.status]}</span>
                      <span className="text-sm font-medium text-surface-900">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-600 text-right tabular-nums">{c.sent.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-sm font-medium tabular-nums ${c.openRate >= 40 ? 'text-success-600' : c.openRate >= 30 ? 'text-brand-600' : 'text-surface-600'}`}>{c.openRate}%</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-sm font-medium tabular-nums ${c.ctr >= 15 ? 'text-success-600' : c.ctr >= 10 ? 'text-brand-600' : 'text-surface-600'}`}>{c.ctr}%</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-600 text-right tabular-nums">{c.clicked.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-surface-900 text-right tabular-nums">{c.revenue > 0 ? `$${c.revenue.toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    {campaignRoi > 0 && <span className="text-sm font-medium text-success-600 tabular-nums">{campaignRoi}%</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Performance insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 text-success-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900 mb-1">Top Performer</h3>
              <p className="text-sm text-surface-500">BEES Rewards Launch has your highest CTR at 18% — 63% above the platform benchmark. Consider replicating this format.</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-info-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900 mb-1">Channel Opportunity</h3>
              <p className="text-sm text-surface-500">Your SMS campaigns have a 92.4% open rate. Try moving more operational notices to SMS for higher visibility.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Mock MTA Data for demos ---

const MOCK_OVERVIEW: AnalyticsOverview = {
  totalTouchpoints: 38062,
  totalConversions: 942,
  totalRevenue: 218450,
  avgConversionRate: 2.48,
  uniquePocs: 487,
  topChannel: 'sms',
  topChannelConversionRate: 4.12,
  periodComparison: { touchpointsDelta: 14.2, conversionsDelta: 22.8, revenueDelta: 18.6 },
};

const MOCK_CHANNEL_MIX: ChannelMixResult[] = [
  { channelCombo: ['email', 'push', 'sms'], comboLabel: 'Email + Push + SMS', pocCount: 89, conversions: 19, conversionRate: 0.2135, avgRevenue: 284, totalRevenue: 5396 },
  { channelCombo: ['email', 'push'], comboLabel: 'Email + Push', pocCount: 312, conversions: 52, conversionRate: 0.1667, avgRevenue: 231, totalRevenue: 12012 },
  { channelCombo: ['email', 'in_app', 'push'], comboLabel: 'Email + In-App + Push', pocCount: 145, conversions: 23, conversionRate: 0.1586, avgRevenue: 267, totalRevenue: 6141 },
  { channelCombo: ['push', 'whatsapp'], comboLabel: 'Push + WhatsApp', pocCount: 67, conversions: 10, conversionRate: 0.1493, avgRevenue: 312, totalRevenue: 3120 },
  { channelCombo: ['email', 'push', 'sms', 'whatsapp'], comboLabel: 'Email + Push + SMS + WhatsApp', pocCount: 34, conversions: 5, conversionRate: 0.1471, avgRevenue: 356, totalRevenue: 1780 },
  { channelCombo: ['push'], comboLabel: 'Push', pocCount: 1842, conversions: 148, conversionRate: 0.0803, avgRevenue: 198, totalRevenue: 29304 },
  { channelCombo: ['email'], comboLabel: 'Email', pocCount: 956, conversions: 94, conversionRate: 0.0983, avgRevenue: 215, totalRevenue: 20210 },
  { channelCombo: ['in_app'], comboLabel: 'In-App', pocCount: 423, conversions: 28, conversionRate: 0.0662, avgRevenue: 178, totalRevenue: 4984 },
];

const MOCK_FUNNEL: FunnelSequence[] = [
  {
    sequence: ['push', 'email'], sequenceLabel: 'Push → Email', pocCount: 312, conversions: 52, conversionRate: 0.1667, avgTouchpoints: 2,
    steps: [
      { channel: 'push', eventType: 'sent', count: 312, dropOffRate: 0 },
      { channel: 'push', eventType: 'delivered', count: 306, dropOffRate: 0.019 },
      { channel: 'push', eventType: 'opened', count: 128, dropOffRate: 0.581 },
      { channel: 'push', eventType: 'clicked', count: 47, dropOffRate: 0.633 },
      { channel: 'email', eventType: 'sent', count: 312, dropOffRate: 0 },
      { channel: 'email', eventType: 'delivered', count: 308, dropOffRate: 0.013 },
      { channel: 'email', eventType: 'opened', count: 142, dropOffRate: 0.539 },
      { channel: 'email', eventType: 'clicked', count: 58, dropOffRate: 0.592 },
    ],
  },
  {
    sequence: ['push'], sequenceLabel: 'Push', pocCount: 1842, conversions: 148, conversionRate: 0.0803, avgTouchpoints: 1,
    steps: [
      { channel: 'push', eventType: 'sent', count: 1842, dropOffRate: 0 },
      { channel: 'push', eventType: 'delivered', count: 1805, dropOffRate: 0.02 },
      { channel: 'push', eventType: 'opened', count: 736, dropOffRate: 0.592 },
      { channel: 'push', eventType: 'clicked', count: 264, dropOffRate: 0.641 },
    ],
  },
  {
    sequence: ['email', 'push', 'sms'], sequenceLabel: 'Email → Push → SMS', pocCount: 89, conversions: 19, conversionRate: 0.2135, avgTouchpoints: 3,
    steps: [
      { channel: 'email', eventType: 'sent', count: 89, dropOffRate: 0 },
      { channel: 'email', eventType: 'opened', count: 41, dropOffRate: 0.539 },
      { channel: 'push', eventType: 'sent', count: 89, dropOffRate: 0 },
      { channel: 'push', eventType: 'opened', count: 38, dropOffRate: 0.573 },
      { channel: 'sms', eventType: 'sent', count: 89, dropOffRate: 0 },
      { channel: 'sms', eventType: 'opened', count: 82, dropOffRate: 0.079 },
      { channel: 'sms', eventType: 'clicked', count: 24, dropOffRate: 0.707 },
    ],
  },
  {
    sequence: ['email'], sequenceLabel: 'Email', pocCount: 956, conversions: 94, conversionRate: 0.0983, avgTouchpoints: 1,
    steps: [
      { channel: 'email', eventType: 'sent', count: 956, dropOffRate: 0 },
      { channel: 'email', eventType: 'delivered', count: 941, dropOffRate: 0.016 },
      { channel: 'email', eventType: 'opened', count: 418, dropOffRate: 0.556 },
      { channel: 'email', eventType: 'clicked', count: 172, dropOffRate: 0.589 },
    ],
  },
  {
    sequence: ['push', 'whatsapp'], sequenceLabel: 'Push → WhatsApp', pocCount: 67, conversions: 10, conversionRate: 0.1493, avgTouchpoints: 2,
    steps: [
      { channel: 'push', eventType: 'sent', count: 67, dropOffRate: 0 },
      { channel: 'push', eventType: 'opened', count: 28, dropOffRate: 0.582 },
      { channel: 'whatsapp', eventType: 'sent', count: 67, dropOffRate: 0 },
      { channel: 'whatsapp', eventType: 'opened', count: 59, dropOffRate: 0.119 },
      { channel: 'whatsapp', eventType: 'clicked', count: 18, dropOffRate: 0.695 },
    ],
  },
];

// Position-based: 40% first, 40% last, 20% middle — balanced view
const MOCK_ATTRIBUTION_POSITION: ChannelAttribution[] = [
  { channel: 'push', attributedConversions: 342.6, attributedRevenue: 78120, percentOfTotal: 36.4, avgTouchesBeforeConversion: 5.2 },
  { channel: 'email', attributedConversions: 285.2, attributedRevenue: 65890, percentOfTotal: 30.3, avgTouchesBeforeConversion: 3.8 },
  { channel: 'in_app', attributedConversions: 148.4, attributedRevenue: 34250, percentOfTotal: 15.8, avgTouchesBeforeConversion: 6.1 },
  { channel: 'sms', attributedConversions: 98.1, attributedRevenue: 24680, percentOfTotal: 10.4, avgTouchesBeforeConversion: 2.4 },
  { channel: 'whatsapp', attributedConversions: 67.7, attributedRevenue: 15510, percentOfTotal: 7.1, avgTouchesBeforeConversion: 2.1 },
];

// First touch: push dominates because it's usually the first channel POCs encounter
const MOCK_ATTRIBUTION_FIRST: ChannelAttribution[] = [
  { channel: 'push', attributedConversions: 486.0, attributedRevenue: 112400, percentOfTotal: 51.6, avgTouchesBeforeConversion: 5.2 },
  { channel: 'email', attributedConversions: 248.0, attributedRevenue: 57320, percentOfTotal: 26.3, avgTouchesBeforeConversion: 3.8 },
  { channel: 'in_app', attributedConversions: 62.0, attributedRevenue: 14330, percentOfTotal: 6.6, avgTouchesBeforeConversion: 6.1 },
  { channel: 'sms', attributedConversions: 56.0, attributedRevenue: 12940, percentOfTotal: 5.9, avgTouchesBeforeConversion: 2.4 },
  { channel: 'whatsapp', attributedConversions: 90.0, attributedRevenue: 20810, percentOfTotal: 9.6, avgTouchesBeforeConversion: 2.1 },
];

// Last touch: SMS and WhatsApp get more credit — they're often the final nudge before purchase
const MOCK_ATTRIBUTION_LAST: ChannelAttribution[] = [
  { channel: 'sms', attributedConversions: 218.0, attributedRevenue: 50360, percentOfTotal: 23.1, avgTouchesBeforeConversion: 2.4 },
  { channel: 'email', attributedConversions: 274.0, attributedRevenue: 63310, percentOfTotal: 29.1, avgTouchesBeforeConversion: 3.8 },
  { channel: 'push', attributedConversions: 196.0, attributedRevenue: 45280, percentOfTotal: 20.8, avgTouchesBeforeConversion: 5.2 },
  { channel: 'whatsapp', attributedConversions: 168.0, attributedRevenue: 38820, percentOfTotal: 17.8, avgTouchesBeforeConversion: 2.1 },
  { channel: 'in_app', attributedConversions: 86.0, attributedRevenue: 19880, percentOfTotal: 9.2, avgTouchesBeforeConversion: 6.1 },
];

// Linear: even split — every channel gets equal credit
const MOCK_ATTRIBUTION_LINEAR: ChannelAttribution[] = [
  { channel: 'push', attributedConversions: 268.0, attributedRevenue: 61940, percentOfTotal: 28.4, avgTouchesBeforeConversion: 5.2 },
  { channel: 'email', attributedConversions: 262.0, attributedRevenue: 60550, percentOfTotal: 27.8, avgTouchesBeforeConversion: 3.8 },
  { channel: 'in_app', attributedConversions: 156.0, attributedRevenue: 36040, percentOfTotal: 16.5, avgTouchesBeforeConversion: 6.1 },
  { channel: 'sms', attributedConversions: 148.0, attributedRevenue: 34200, percentOfTotal: 15.7, avgTouchesBeforeConversion: 2.4 },
  { channel: 'whatsapp', attributedConversions: 108.0, attributedRevenue: 24950, percentOfTotal: 11.6, avgTouchesBeforeConversion: 2.1 },
];

const MOCK_ATTRIBUTION_BY_MODEL: Record<AttributionModel, ChannelAttribution[]> = {
  position: MOCK_ATTRIBUTION_POSITION,
  first_touch: MOCK_ATTRIBUTION_FIRST,
  last_touch: MOCK_ATTRIBUTION_LAST,
  linear: MOCK_ATTRIBUTION_LINEAR,
};

// --- MTA Overview KPI cards (shown above tabs on MTA views) ---

function MtaOverviewCards({ filters }: { filters: AnalyticsFilters }) {
  const { data: overview } = useQuery({
    queryKey: ['analytics-overview', filters],
    queryFn: () => getAnalyticsOverview(filters),
    retry: false,
  });

  const data = overview || MOCK_OVERVIEW;

  const cards = [
    {
      label: 'Total Touchpoints',
      value: data.totalTouchpoints.toLocaleString(),
      icon: Send,
      style: 'text-info-600 bg-info-50',
      delta: data.periodComparison.touchpointsDelta,
    },
    {
      label: 'Total Conversions',
      value: data.totalConversions.toLocaleString(),
      icon: Target,
      style: 'text-success-600 bg-success-50',
      delta: data.periodComparison.conversionsDelta,
    },
    {
      label: 'Total Revenue',
      value: `$${data.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      style: 'text-brand-600 bg-brand-100',
      delta: data.periodComparison.revenueDelta,
    },
    {
      label: 'Conversion Rate',
      value: `${data.avgConversionRate}%`,
      icon: BarChart3,
      style: 'text-surface-600 bg-surface-100',
      sub: `${data.uniquePocs.toLocaleString()} unique POCs`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="card px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-surface-500">{card.label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.style}`}>
              <card.icon className="w-4 h-4" strokeWidth={2} />
            </div>
          </div>
          <div className="text-2xl font-semibold text-surface-900 tabular-nums">{card.value}</div>
          {card.delta !== undefined && (
            <div className={`text-[11px] mt-0.5 font-medium ${card.delta >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {card.delta >= 0 ? '+' : ''}{card.delta}% vs prior period
            </div>
          )}
          {card.sub && <div className="text-[11px] text-surface-400 mt-0.5">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// --- Channel Mix Tab ---

function ChannelMixTab({ filters }: { filters: AnalyticsFilters }) {
  const { data } = useQuery({
    queryKey: ['analytics-channel-mix', filters],
    queryFn: () => getChannelMix(filters),
    retry: false,
  });

  return <ChannelMixChart data={data && data.length > 0 ? data : MOCK_CHANNEL_MIX} />;
}

// --- Journey Analysis Tab ---

function JourneyTab({ filters }: { filters: AnalyticsFilters }) {
  const { data } = useQuery({
    queryKey: ['analytics-funnel', filters],
    queryFn: () => getFunnel(filters),
    retry: false,
  });

  return <FunnelVisualization data={data && data.length > 0 ? data : MOCK_FUNNEL} />;
}

// --- Attribution Tab ---

function AttributionTab({ filters, onModelChange }: { filters: AnalyticsFilters; onModelChange: (m: AttributionModel) => void }) {
  const model = filters.model || 'position';
  const { data } = useQuery({
    queryKey: ['analytics-attribution', filters],
    queryFn: () => getAttribution(filters),
    retry: false,
  });

  const mockFallback = MOCK_ATTRIBUTION_BY_MODEL[model];

  return (
    <AttributionChart
      data={data && data.length > 0 ? data : mockFallback}
      currentModel={model}
      onModelChange={onModelChange}
    />
  );
}

// --- Main Page ---

export function ReportingPage() {
  const user = useAuthStore((s) => s.user);
  const isDcManager = user?.role === 'dc_manager';
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => listBranches(),
  });

  const branches = branchesData?.data || [];

  function handleModelChange(model: AttributionModel) {
    setFilters((prev) => ({ ...prev, model }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">
          {isDcManager ? 'Reporting & Analytics' : 'My Campaign Performance'}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          {isDcManager
            ? 'Organization-wide campaign analytics and multi-touch attribution'
            : 'Track how your campaigns are performing across channels'}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-1 mb-5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-surface-primary shadow-sm'
                : 'text-surface-secondary hover:text-surface-primary'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters bar (shown for MTA tabs) */}
      {activeTab !== 'overview' && (
        <div className="mb-5">
          <AnalyticsFiltersBar
            filters={filters}
            onChange={setFilters}
            branches={branches}
          />
        </div>
      )}

      {/* MTA KPI overview (shown for MTA tabs) */}
      {activeTab !== 'overview' && <MtaOverviewCards filters={filters} />}

      {/* Tab content */}
      {activeTab === 'overview' && (
        <>
          {isDcManager ? <OrgReporting /> : <WholesalerReporting />}
        </>
      )}

      {activeTab === 'channel-mix' && <ChannelMixTab filters={filters} />}
      {activeTab === 'journeys' && <JourneyTab filters={filters} />}
      {activeTab === 'attribution' && <AttributionTab filters={filters} onModelChange={handleModelChange} />}
    </div>
  );
}
