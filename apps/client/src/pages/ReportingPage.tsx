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
  { status: 'launched', count: 187 },
  { status: 'in_progress', count: 98 },
  { status: 'draft', count: 64 },
  { status: 'in_qa', count: 42 },
  { status: 'submitted', count: 31 },
  { status: 'feedback_needed', count: 18 },
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
  { id: 'demo-1', title: 'Spring Beer Promo — Bud Light', status: 'launched' as CampaignStatus, sent: 4820, delivered: 4756, opened: 1892, clicked: 643, ctr: 13.5, openRate: 39.8, revenue: 28450 },
  { id: 'demo-6', title: 'Summer Seltzer Push — Michelob Ultra', status: 'launched' as CampaignStatus, sent: 3210, delivered: 3178, opened: 1340, clicked: 487, ctr: 15.3, openRate: 42.2, revenue: 19200 },
  { id: 'demo-7', title: 'NPS Survey — Q1 2026', status: 'completed' as CampaignStatus, sent: 5100, delivered: 5043, opened: 2115, clicked: 892, ctr: 17.7, openRate: 41.9, revenue: 0 },
  { id: 'demo-10', title: 'Opt-in: BEES Rewards Launch', status: 'launched' as CampaignStatus, sent: 8450, delivered: 8372, opened: 3768, clicked: 1504, ctr: 18.0, openRate: 45.0, revenue: 42100 },
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
      <div className="grid grid-cols-4 gap-4 mb-6">
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

      <div className="grid grid-cols-2 gap-5 mb-5">
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

      <div className="grid grid-cols-2 gap-5">
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
  return (
    <>
      {/* Personal KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Sent', value: formatNum(MY_TOTALS.totalSent), icon: Send, style: 'text-info-600 bg-info-50' },
          { label: 'Avg. Open Rate', value: `${MY_TOTALS.avgOpenRate}%`, icon: Eye, style: 'text-brand-600 bg-brand-100' },
          { label: 'Avg. CTR', value: `${MY_TOTALS.avgCtr}%`, icon: MousePointer, style: 'text-success-600 bg-success-50' },
          { label: 'Est. Revenue', value: `$${(MY_TOTALS.totalRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, style: 'text-surface-600 bg-surface-100' },
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

      {/* Campaign performance table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <h2 className="text-[15px] font-semibold text-surface-900">Campaign Performance</h2>
          <p className="text-xs text-surface-400 mt-0.5">Delivery and engagement metrics for your launched campaigns</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Campaign</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Sent</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Delivered</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Open Rate</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">CTR</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Clicks</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {MY_CAMPAIGNS_PERFORMANCE.map((c, i) => (
              <tr key={c.id} className={`hover:bg-surface-50 transition-colors ${i < MY_CAMPAIGNS_PERFORMANCE.length - 1 ? 'border-b border-surface-100/60' : ''}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`badge text-[10px] ${getStatusStyle(c.status)}`}>{STATUS_LABELS[c.status]}</span>
                    <span className="text-sm font-medium text-surface-900">{c.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-surface-600 text-right tabular-nums">{c.sent.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-sm text-surface-600 text-right tabular-nums">{c.delivered.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-sm font-medium tabular-nums ${c.openRate >= 40 ? 'text-success-600' : c.openRate >= 30 ? 'text-brand-600' : 'text-surface-600'}`}>
                    {c.openRate}%
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-sm font-medium tabular-nums ${c.ctr >= 15 ? 'text-success-600' : c.ctr >= 10 ? 'text-brand-600' : 'text-surface-600'}`}>
                    {c.ctr}%
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-surface-600 text-right tabular-nums">{c.clicked.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-surface-900 text-right tabular-nums">
                  {c.revenue > 0 ? `$${c.revenue.toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-surface-200 bg-surface-50">
              <td className="px-5 py-3 text-sm font-semibold text-surface-900">Totals</td>
              <td className="px-5 py-3 text-sm font-semibold text-surface-900 text-right tabular-nums">{MY_TOTALS.totalSent.toLocaleString()}</td>
              <td className="px-5 py-3 text-sm font-semibold text-surface-900 text-right tabular-nums">{MY_TOTALS.totalDelivered.toLocaleString()}</td>
              <td className="px-5 py-3 text-sm font-semibold text-success-600 text-right tabular-nums">{MY_TOTALS.avgOpenRate}%</td>
              <td className="px-5 py-3 text-sm font-semibold text-success-600 text-right tabular-nums">{MY_TOTALS.avgCtr}%</td>
              <td className="px-5 py-3 text-sm font-semibold text-surface-900 text-right tabular-nums">{MY_TOTALS.totalClicked.toLocaleString()}</td>
              <td className="px-5 py-3 text-sm font-semibold text-surface-900 text-right tabular-nums">${MY_TOTALS.totalRevenue.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Performance tips */}
      <div className="card p-5 mt-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900 mb-1">Performance Insight</h3>
            <p className="text-sm text-surface-500">Your BEES Rewards Launch campaign has the highest engagement at 18% CTR — consider duplicating this format for upcoming promotions.</p>
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
    </div>
  );
}
