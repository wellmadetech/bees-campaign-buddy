import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listCampaigns } from '../api/campaigns';
import { useAuthStore } from '../store/authStore';
import { STATUS_LABELS, CAMPAIGN_TYPE_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus, CampaignTypeCode } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { Plus, Search, Download, CheckSquare, ArrowRight } from 'lucide-react';

const MOCK_CAMPAIGNS = [
  { id: 'demo-1', title: 'Spring Beer Promo — Bud Light', status: 'active' as CampaignStatus, branchName: 'Northeast Distribution', createdAt: '2026-03-20T10:00:00Z', campaignTypeCode: 'ad_hoc_sales' as CampaignTypeCode, createdByName: 'Walter Smith' },
  { id: 'demo-2', title: 'Holiday Closure Notice — Memorial Day', status: 'in_progress' as CampaignStatus, branchName: 'Southeast Distribution', createdAt: '2026-03-19T14:30:00Z', campaignTypeCode: 'ad_hoc_operational' as CampaignTypeCode, createdByName: 'Walter Smith' },
  { id: 'demo-3', title: 'New IPA Launch — Goose Island', status: 'scheduled' as CampaignStatus, branchName: 'Northeast Distribution', createdAt: '2026-03-18T09:15:00Z', campaignTypeCode: 'lifecycle' as CampaignTypeCode, createdByName: 'Dana Campbell' },
  { id: 'demo-4', title: 'Cinco de Mayo — Corona Bundle', status: 'in_progress' as CampaignStatus, branchName: 'West Coast Distribution', createdAt: '2026-03-17T16:45:00Z', campaignTypeCode: 'ad_hoc_sales' as CampaignTypeCode, createdByName: 'Walter Smith' },
  { id: 'demo-5', title: 'Delivery Reroute — I-95 Construction', status: 'needs_attention' as CampaignStatus, branchName: 'Northeast Distribution', createdAt: '2026-03-16T11:00:00Z', campaignTypeCode: 'ad_hoc_operational' as CampaignTypeCode, createdByName: 'Dana Campbell' },
  { id: 'demo-6', title: 'Summer Seltzer Push — Michelob Ultra', status: 'active' as CampaignStatus, branchName: 'Southeast Distribution', createdAt: '2026-03-15T08:30:00Z', campaignTypeCode: 'ad_hoc_sales' as CampaignTypeCode, createdByName: 'Walter Smith' },
  { id: 'demo-7', title: 'NPS Survey — Q1 2026', status: 'completed' as CampaignStatus, branchName: 'West Coast Distribution', createdAt: '2026-03-14T13:00:00Z', campaignTypeCode: 'lifecycle' as CampaignTypeCode, createdByName: 'Dana Campbell' },
  { id: 'demo-8', title: 'Edge Recommendation — Stella Artois', status: 'scheduled' as CampaignStatus, branchName: 'Northeast Distribution', createdAt: '2026-03-13T10:20:00Z', campaignTypeCode: 'edge_algo' as CampaignTypeCode, createdByName: 'Walter Smith' },
  { id: 'demo-9', title: 'Price Increase Notice — March 2026', status: 'scheduled' as CampaignStatus, branchName: 'Southeast Distribution', createdAt: '2026-03-12T15:00:00Z', campaignTypeCode: 'ad_hoc_operational' as CampaignTypeCode, createdByName: 'Dana Campbell' },
  { id: 'demo-10', title: 'Opt-in: BEES Rewards Launch', status: 'active' as CampaignStatus, branchName: 'West Coast Distribution', createdAt: '2026-03-11T09:45:00Z', campaignTypeCode: 'opt_in' as CampaignTypeCode, createdByName: 'Walter Smith' },
];

export function CampaignListPage() {
  const user = useAuthStore((s) => s.user);
  const isDemo = useAuthStore((s) => s.token === 'demo-token');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', { search, status: statusFilter, page }],
    queryFn: () =>
      listCampaigns({
        search: search || undefined,
        status: (statusFilter || undefined) as CampaignStatus | undefined,
        page,
        limit: 20,
      }),
    enabled: !isDemo,
  });

  type CampaignRow = typeof MOCK_CAMPAIGNS[number];
  let campaigns: CampaignRow[] = isDemo ? MOCK_CAMPAIGNS : (data?.data ?? []);

  if (isDemo) {
    if (search) campaigns = campaigns.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) campaigns = campaigns.filter((c) => c.status === statusFilter);
  }

  const loading = isLoading && !isDemo;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold text-surface-900 tracking-tight">Campaigns</h1>
          <p className="text-sm text-surface-500 mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const csv = ['Title,Type,Branch,Status,Created By,Date', ...campaigns.map((c) =>
                `"${c.title}","${c.campaignTypeCode}","${c.branchName}","${c.status}","${c.createdByName}","${c.createdAt}"`
              )].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'campaigns.csv'; a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          {user?.role !== 'content_creator' && (
            <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-surface-900 text-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-4 h-4" />
            <span className="text-sm font-medium">{selected.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              Clear
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-white text-surface-900 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-1">
              Bulk Transition <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === campaigns.length && campaigns.length > 0}
                  onChange={(e) => setSelected(e.target.checked ? new Set(campaigns.map(c => c.id)) : new Set())}
                  className="rounded border-surface-300"
                />
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Campaign</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Wholesaler</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Created by</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-100/60 animate-pulse">
                  <td className="px-5 py-3.5"><div className="h-4 w-48 bg-surface-100 rounded" /></td>
                  <td className="px-5 py-3.5"><div className="h-4 w-20 bg-surface-100 rounded" /></td>
                  <td className="px-5 py-3.5"><div className="h-4 w-28 bg-surface-100 rounded" /></td>
                  <td className="px-5 py-3.5"><div className="h-5 w-16 bg-surface-100 rounded" /></td>
                  <td className="px-5 py-3.5"><div className="h-4 w-24 bg-surface-100 rounded" /></td>
                  <td className="px-5 py-3.5"><div className="h-4 w-16 bg-surface-100 rounded" /></td>
                </tr>
              ))
            ) : !campaigns.length ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-surface-400">
                  No campaigns found
                </td>
              </tr>
            ) : (
              campaigns.map((c, i) => (
                <tr
                  key={c.id}
                  className={`cursor-pointer transition-colors duration-100 hover:bg-surface-50 ${
                    i < campaigns.length - 1 ? 'border-b border-surface-100/60' : ''
                  } ${selected.has(c.id) ? 'bg-brand-50/30' : ''}`}
                >
                  <td className="w-10 px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={(e) => {
                        setSelected(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(c.id); else next.delete(c.id);
                          return next;
                        });
                      }}
                      className="rounded border-surface-300"
                    />
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-surface-900" onClick={() => navigate(`/campaigns/${c.id}`)}>{c.title}</td>
                  <td className="px-5 py-3.5 text-[13px] text-surface-500">
                    {CAMPAIGN_TYPE_LABELS[c.campaignTypeCode] ?? c.campaignTypeCode}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-surface-500">{c.branchName}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${getStatusStyle(c.status)}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-surface-500">{c.createdByName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-surface-400 tabular-nums">
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isDemo && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-[13px] text-surface-500">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-xs">
              Previous
            </button>
            <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-xs">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
