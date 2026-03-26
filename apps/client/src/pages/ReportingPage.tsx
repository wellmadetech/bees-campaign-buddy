import { useAuthStore } from '../store/authStore';
import { STATUS_LABELS, CAMPAIGN_TYPE_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus, CampaignTypeCode } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { BarChart3, TrendingUp, Users, Target, Eye, MousePointer, Send, ArrowUpRight } from 'lucide-react';

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

function OrgReporting() {
  const maxBarCount = Math.max(...BY_BRANCH.map((b) => b.count));
  const maxTrend = Math.max(...MONTHLY_TREND.map((m) => m.count));

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Campaigns (2025)', value: ORG_STATS.total.toLocaleString(), icon: BarChart3, style: 'text-info-600 bg-info-50' },
          { label: 'This Month', value: ORG_STATS.thisMonth.toString(), icon: TrendingUp, style: 'text-success-600 bg-success-50' },
          { label: 'Avg. Cycle Time', value: `${ORG_STATS.avgCycleTimeDays} days`, icon: Target, style: 'text-brand-600 bg-brand-100' },
          { label: 'Automation Rate', value: `${ORG_STATS.automationRate}%`, icon: Users, style: 'text-surface-600 bg-surface-100' },
        ].map((s) => (
          <div key={s.label} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium text-surface-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.style}`}>
                <s.icon className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="text-2xl font-semibold text-surface-900 tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Monthly Trend */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Monthly Volume</h2>
          <div className="flex items-end gap-3 h-36">
            {MONTHLY_TREND.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-medium text-surface-900 tabular-nums">{m.count}</span>
                <div className="w-full bg-brand-400 rounded-t-md transition-all duration-500" style={{ height: `${(m.count / maxTrend) * 100}%`, minHeight: 8 }} />
                <span className="text-[11px] text-surface-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Campaign Type */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">By Campaign Type</h2>
          <div className="space-y-3">
            {BY_TYPE.map((t) => (
              <div key={t.type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-surface-700 font-medium">{CAMPAIGN_TYPE_LABELS[t.type]}</span>
                  <span className="text-surface-400 tabular-nums text-xs">{t.count} ({t.pct}%)</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* By Status */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">By Status</h2>
          <div className="space-y-2">
            {BY_STATUS.map((s) => (
              <div key={s.status} className="flex items-center justify-between py-1.5">
                <span className={`badge ${getStatusStyle(s.status)}`}>{STATUS_LABELS[s.status]}</span>
                <span className="text-sm font-medium text-surface-900 tabular-nums">{s.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Branch */}
        <div className="card p-5">
          <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Top Branches</h2>
          <div className="space-y-3">
            {BY_BRANCH.map((b, i) => (
              <div key={b.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-surface-700 font-medium"><span className="text-surface-400 mr-2">#{i + 1}</span>{b.name}</span>
                  <span className="text-surface-400 tabular-nums text-xs">{b.count}</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-surface-400 rounded-full transition-all duration-700" style={{ width: `${(b.count / maxBarCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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

export function ReportingPage() {
  const user = useAuthStore((s) => s.user);
  const isDcManager = user?.role === 'dc_manager';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">
          {isDcManager ? 'Reporting' : 'My Campaign Performance'}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          {isDcManager ? 'Organization-wide campaign analytics' : 'Track how your campaigns are performing'}
        </p>
      </div>
      {isDcManager ? <OrgReporting /> : <WholesalerReporting />}

      {/* What Worked Before */}
      <div className="card overflow-hidden mt-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="text-[15px] font-semibold text-surface-900">What Worked Before</h2>
          <span className="text-[11px] text-surface-400">Top performing campaigns — reuse their format</span>
        </div>
        <div>
          {[
            { title: 'BEES Rewards Launch', openRate: 45.0, ctr: 18.0, revenue: '$42.1k', type: 'Opt-in' },
            { title: 'Summer Seltzer Push — Michelob Ultra', openRate: 42.2, ctr: 15.3, revenue: '$19.2k', type: 'Ad-hoc Sales' },
            { title: 'Spring Beer Promo — Bud Light', openRate: 39.8, ctr: 13.5, revenue: '$28.5k', type: 'Ad-hoc Sales' },
          ].map((c, i, arr) => (
            <div key={c.title} className={`flex items-center justify-between px-5 py-3.5 hover:bg-surface-50 transition-colors ${i < arr.length - 1 ? 'border-b border-surface-100/60' : ''}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-bold text-brand-500 tabular-nums w-4">#{i + 1}</span>
                <div>
                  <span className="text-sm font-medium text-surface-900">{c.title}</span>
                  <span className="text-[11px] text-surface-400 ml-2">{c.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-5 shrink-0 ml-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-success-600 tabular-nums">{c.openRate}% open</div>
                  <div className="text-[10px] text-surface-400 tabular-nums">{c.ctr}% CTR</div>
                </div>
                <span className="text-xs font-semibold text-surface-900 tabular-nums w-14 text-right">{c.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
