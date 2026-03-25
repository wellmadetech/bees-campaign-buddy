import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REQUEST_STATUS_LABELS } from '@campaignbuddy/shared';
import { CAMPAIGN_TYPE_LABELS } from '@campaignbuddy/shared';
import type { CampaignTypeCode } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { Check, X, Eye, Search, Filter } from 'lucide-react';

interface CampaignRequest {
  id: string;
  title: string;
  description: string;
  campaignTypeCode: CampaignTypeCode;
  wholesaler: string;
  wholesalerBranch: string;
  submittedAt: string;
  status: 'in_review' | 'denied' | 'accepted';
  channel: string;
  scheduledStart: string | null;
  denyReason?: string;
}

const INITIAL_REQUESTS: CampaignRequest[] = [
  { id: 'req-1', title: 'Summer BBQ Promo — Bud Light Seltzer', description: 'Push campaign for Memorial Day weekend BBQ specials', campaignTypeCode: 'ad_hoc_sales', wholesaler: 'Walter Smith', wholesalerBranch: 'Northeast Distribution', submittedAt: '2026-03-24T14:30:00Z', status: 'in_review', channel: 'Push', scheduledStart: '2026-05-22T09:00:00Z' },
  { id: 'req-2', title: 'Price Adjustment Notice — April', description: 'Email notification about upcoming price changes', campaignTypeCode: 'ad_hoc_operational', wholesaler: 'Maria Johnson', wholesalerBranch: 'Southeast Distribution', submittedAt: '2026-03-24T11:00:00Z', status: 'in_review', channel: 'Email', scheduledStart: '2026-04-01T08:00:00Z' },
  { id: 'req-3', title: 'Stella Artois Feature — Spring', description: 'In-app promotion for Stella Artois spring campaign', campaignTypeCode: 'ad_hoc_sales', wholesaler: 'Robert Chen', wholesalerBranch: 'West Coast Distribution', submittedAt: '2026-03-23T16:00:00Z', status: 'in_review', channel: 'In-App', scheduledStart: '2026-04-10T09:00:00Z' },
  { id: 'req-4', title: 'Warehouse Reroute — Construction', description: 'Push notification about delivery delays', campaignTypeCode: 'ad_hoc_operational', wholesaler: 'Walter Smith', wholesalerBranch: 'Northeast Distribution', submittedAt: '2026-03-22T09:00:00Z', status: 'accepted', channel: 'Push', scheduledStart: '2026-03-25T06:00:00Z' },
  { id: 'req-5', title: 'Unauthorized Brand Campaign', description: 'Campaign for a brand not in our portfolio', campaignTypeCode: 'ad_hoc_sales', wholesaler: 'James Wilson', wholesalerBranch: 'Southwest Distribution', submittedAt: '2026-03-21T10:00:00Z', status: 'denied', channel: 'Email', scheduledStart: null, denyReason: 'Brand not authorized for BEES campaigns' },
  { id: 'req-6', title: 'Corona Cinco de Mayo Push', description: 'Push notification for Cinco de Mayo Corona deals', campaignTypeCode: 'ad_hoc_sales', wholesaler: 'Maria Johnson', wholesalerBranch: 'Southeast Distribution', submittedAt: '2026-03-20T13:00:00Z', status: 'accepted', channel: 'Push', scheduledStart: '2026-04-28T09:00:00Z' },
];

export function CampaignRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<string>('in_review');
  const [search, setSearch] = useState('');
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');

  const filtered = requests.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.wholesaler.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAccept = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r));
  };

  const handleDeny = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'denied' as const, denyReason } : r));
    setDenyingId(null);
    setDenyReason('');
  };

  const inReviewCount = requests.filter(r => r.status === 'in_review').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-[22px] font-semibold text-surface-900 tracking-tight">Campaign Requests</h1>
          <p className="text-sm text-surface-500 mt-1">{inReviewCount} pending review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="text" placeholder="Search requests..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-2">
          {([['in_review', 'In Review'], ['accepted', 'Accepted'], ['denied', 'Denied'], ['', 'All']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === val ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
              }`}
            >
              {label}
              {val === 'in_review' && inReviewCount > 0 && (
                <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{inReviewCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Request cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Filter className="w-8 h-8 text-surface-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-surface-500">No requests found</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${getStatusStyle(req.status)}`}>
                      {REQUEST_STATUS_LABELS[req.status] ?? req.status}
                    </span>
                    <span className="badge badge-default text-[10px]">{req.channel}</span>
                    <span className="badge badge-default text-[10px]">
                      {CAMPAIGN_TYPE_LABELS[req.campaignTypeCode]}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-surface-900 mb-1">{req.title}</h3>
                  <p className="text-sm text-surface-500 mb-2">{req.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                    <span>From: <span className="font-medium text-surface-600">{req.wholesaler}</span></span>
                    <span>&middot;</span>
                    <span>{req.wholesalerBranch}</span>
                    <span>&middot;</span>
                    <span>Submitted {new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    {req.scheduledStart && (
                      <>
                        <span>&middot;</span>
                        <span>Scheduled: {new Date(req.scheduledStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                  {req.status === 'denied' && req.denyReason && (
                    <div className="mt-2 p-2 bg-danger-50 rounded-lg text-xs text-danger-600">
                      Denied: {req.denyReason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {req.status === 'in_review' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => setDenyingId(req.id)}
                      className="btn-danger"
                    >
                      <X className="w-4 h-4" /> Deny
                    </button>
                  </div>
                )}
                {req.status === 'accepted' && (
                  <button onClick={() => navigate('/campaigns')} className="btn-secondary text-xs shrink-0">
                    <Eye className="w-3.5 h-3.5" /> View Campaign
                  </button>
                )}
              </div>

              {/* Deny reason form */}
              {denyingId === req.id && (
                <div className="mt-4 pt-4 border-t border-surface-100">
                  <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Reason for denial</label>
                  <textarea
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    rows={2}
                    placeholder="Explain why this request is being denied..."
                    className="input-field resize-none mb-3"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setDenyingId(null); setDenyReason(''); }} className="btn-secondary text-xs">Cancel</button>
                    <button onClick={() => handleDeny(req.id)} disabled={!denyReason.trim()} className="btn-danger text-xs">
                      Confirm Denial
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
