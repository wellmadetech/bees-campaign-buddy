import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listCampaigns } from '../api/campaigns';
import { useAuthStore } from '../store/authStore';
import { STATUS_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { Plus, Megaphone, Clock, CheckCircle, AlertTriangle, ArrowUpRight, Copy, Trophy } from 'lucide-react';
import { GettingStarted } from '../components/dashboard/GettingStarted';

const MOCK_CAMPAIGNS = [
  { id: 'demo-1', title: 'Spring Beer Promo — Bud Light', status: 'launched', branchName: 'Northeast Distribution', createdAt: '2026-03-20T10:00:00Z', campaignTypeCode: 'ad_hoc_sales', createdByName: 'Walter Smith' },
  { id: 'demo-2', title: 'Holiday Closure Notice — Memorial Day', status: 'in_progress', branchName: 'Southeast Distribution', createdAt: '2026-03-19T14:30:00Z', campaignTypeCode: 'ad_hoc_operational', createdByName: 'Walter Smith' },
  { id: 'demo-3', title: 'New IPA Launch — Goose Island', status: 'in_qa', branchName: 'Northeast Distribution', createdAt: '2026-03-18T09:15:00Z', campaignTypeCode: 'lifecycle', createdByName: 'Dana Campbell' },
  { id: 'demo-4', title: 'Cinco de Mayo — Corona Bundle', status: 'draft', branchName: 'West Coast Distribution', createdAt: '2026-03-17T16:45:00Z', campaignTypeCode: 'ad_hoc_sales', createdByName: 'Walter Smith' },
  { id: 'demo-5', title: 'Delivery Reroute — I-95 Construction', status: 'feedback_needed', branchName: 'Northeast Distribution', createdAt: '2026-03-16T11:00:00Z', campaignTypeCode: 'ad_hoc_operational', createdByName: 'Dana Campbell' },
  { id: 'demo-6', title: 'Summer Seltzer Push — Michelob Ultra', status: 'launched', branchName: 'Southeast Distribution', createdAt: '2026-03-15T08:30:00Z', campaignTypeCode: 'ad_hoc_sales', createdByName: 'Walter Smith' },
  { id: 'demo-7', title: 'NPS Survey — Q1 2026', status: 'completed', branchName: 'West Coast Distribution', createdAt: '2026-03-14T13:00:00Z', campaignTypeCode: 'lifecycle', createdByName: 'Dana Campbell' },
  { id: 'demo-8', title: 'Edge Recommendation — Stella Artois', status: 'submitted', branchName: 'Northeast Distribution', createdAt: '2026-03-13T10:20:00Z', campaignTypeCode: 'edge_algo', createdByName: 'Walter Smith' },
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
    { label: 'Active', value: (statusCounts['in_progress'] ?? 0) + (statusCounts['in_qa'] ?? 0) + (statusCounts['picked_up'] ?? 0), icon: Clock, style: 'text-brand-600 bg-brand-100' },
    { label: 'Launched', value: statusCounts['launched'] ?? 0, icon: CheckCircle, style: 'text-success-600 bg-success-50' },
    { label: 'Attention', value: statusCounts['feedback_needed'] ?? 0, icon: AlertTriangle, style: 'text-danger-600 bg-danger-50' },
  ];

  const loading = isLoading && !isDemo;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-surface-500 mt-1">Your campaign overview</p>
        </div>
        {user?.role !== 'content_creator' && (
          <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
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

      {/* Getting Started */}
      <GettingStarted />

      {/* Recent campaigns */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="text-[15px] font-semibold text-surface-900">Recent Campaigns</h2>
          <button
            onClick={() => navigate('/campaigns')}
            className="btn-ghost text-xs"
          >
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-40 h-4 bg-surface-100 rounded" />
                <div className="w-24 h-4 bg-surface-100 rounded" />
                <div className="flex-1" />
                <div className="w-16 h-5 bg-surface-100 rounded" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Megaphone className="w-8 h-8 text-surface-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-surface-500">No campaigns yet</p>
            <p className="text-xs text-surface-400 mt-1">Create your first campaign to get started</p>
          </div>
        ) : (
          <div>
            {campaigns.slice(0, 8).map((campaign: { id: string; title: string; status: string; branchName: string; createdAt: string }, i: number) => (
              <div
                key={campaign.id}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors duration-100 hover:bg-surface-50 ${
                  i < campaigns.slice(0, 8).length - 1 ? 'border-b border-surface-100/60' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm font-medium text-surface-900 truncate">{campaign.title}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-xs text-surface-400 hidden sm:block">{campaign.branchName}</span>
                  <span className={`badge ${getStatusStyle(campaign.status)}`}>
                    {STATUS_LABELS[campaign.status as CampaignStatus] ?? campaign.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What Worked Before — Campaign Cloning */}
      {user?.role !== 'content_creator' && (
        <div className="card overflow-hidden mt-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-brand-500" />
              <h2 className="text-[15px] font-semibold text-surface-900">What Worked Before</h2>
            </div>
            <span className="text-[11px] text-surface-400">Top performing campaigns — click to reuse</span>
          </div>
          <div>
            {[
              { id: 'top-1', title: 'BEES Rewards Launch', openRate: 45.0, ctr: 18.0, revenue: '$42.1k', type: 'Opt-in' },
              { id: 'top-2', title: 'Summer Seltzer Push — Michelob Ultra', openRate: 42.2, ctr: 15.3, revenue: '$19.2k', type: 'Ad-hoc Sales' },
              { id: 'top-3', title: 'Spring Beer Promo — Bud Light', openRate: 39.8, ctr: 13.5, revenue: '$28.5k', type: 'Ad-hoc Sales' },
            ].map((c, i, arr) => (
              <div
                key={c.id}
                onClick={() => navigate('/campaigns/new')}
                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors duration-100 hover:bg-surface-50 ${
                  i < arr.length - 1 ? 'border-b border-surface-100/60' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-bold text-brand-500 tabular-nums w-4">#{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium text-surface-900">{c.title}</span>
                    <span className="text-[11px] text-surface-400 ml-2">{c.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 shrink-0 ml-4">
                  <div className="text-right">
                    <div className="text-xs font-medium text-success-600 tabular-nums">{c.openRate}% open</div>
                    <div className="text-[10px] text-surface-400 tabular-nums">{c.ctr}% CTR</div>
                  </div>
                  <span className="text-xs font-semibold text-surface-900 tabular-nums w-14 text-right">{c.revenue}</span>
                  <button className="btn-ghost text-[11px] px-2 py-1">
                    <Copy className="w-3 h-3" /> Reuse
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
