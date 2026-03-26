import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCampaign, getCampaignHistory, transitionCampaign, deleteCampaign, duplicateCampaign, updateCampaign } from '../api/campaigns';
import { useAuthStore } from '../store/authStore';
import {
  STATUS_LABELS,
  CAMPAIGN_TYPE_LABELS,
  ALLOWED_TRANSITIONS,
} from '@campaignbuddy/shared';
import type { CampaignStatus, CampaignTypeCode } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { CampaignComments } from '../components/campaigns/CampaignComments';
import { ApprovalReview } from '../components/campaigns/ApprovalReview';
import { ArrowLeft, Trash2, Clock, ArrowRight, ExternalLink, Copy, Pencil, X, Check, Pause, Play, GitBranch, Link2 } from 'lucide-react';

type DetailCampaign = {
  id: string; title: string; description: string; status: CampaignStatus;
  campaignTypeCode: CampaignTypeCode; branchName: string; createdByName: string;
  createdAt: string; updatedAt: string;
  contentJson: { headline: string; body: string; cta: string };
  scheduledStart: string | null; scheduledEnd: string | null;
  brazeCampaignId: string | null; brazeSegmentId: string | null; brazeStatus: string | null;
  assignedToName: string | null; campaignTypeId: string; templateId: string | null;
  branchId: string; createdBy: string; assignedTo: string | null; parentId: string | null;
  creativeJson: null; productsJson: null; isDeleted: boolean;
};

const MOCK_CAMPAIGNS: Record<string, DetailCampaign> = {
  'demo-stpat': { id: 'demo-stpat', title: "St. Patrick's Day — Opt-In Selections", description: "March & April opt-in campaign for St. Patrick's Day themed promotions. Wholesalers can access curated selections of Irish-style beers, stouts, and seasonal bundles through the BEES platform. Selection window opened Feb 9 and closed Feb 20 — selections are now live.", status: 'active', campaignTypeCode: 'opt_in', branchName: 'Northeast Distribution', createdByName: 'Dana Campbell', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-17T10:00:00Z', contentJson: { headline: "St. Patrick's Day Opt-In Selections Are Live!", body: "Your curated St. Patrick's Day selections are now available on BEES. Explore Irish stouts, ales, and festive bundles hand-picked for the season. March & April selections go live now — stock up before the holiday rush!", cta: 'Access Opt-In Selections Here' }, scheduledStart: '2026-03-01T09:00:00Z', scheduledEnd: '2026-04-30T23:59:00Z', brazeCampaignId: 'brz-stpat-2026', brazeSegmentId: 'seg-stpat-northeast', brazeStatus: 'active', assignedToName: 'Carmen Rodriguez', campaignTypeId: 'ct-3', templateId: null, branchId: 'branch-1', createdBy: 'demo-dc-001', assignedTo: 'demo-cc-001', parentId: null, creativeJson: null, productsJson: null, isDeleted: false },
  'demo-1': { id: 'demo-1', title: 'Spring Beer Promo — Bud Light', description: 'Push notification campaign to promote Bud Light spring lineup across Northeast retailers.', status: 'active', campaignTypeCode: 'ad_hoc_sales', branchName: 'Northeast Distribution', createdByName: 'Walter Smith', createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-03-21T14:00:00Z', contentJson: { headline: 'Spring Into Savings!', body: 'Order Bud Light cases this week and get 10% off your next delivery. Limited time offer for BEES retailers.', cta: 'Order Now' }, scheduledStart: '2026-03-25T09:00:00Z', scheduledEnd: '2026-04-15T23:59:00Z', brazeCampaignId: 'brz-abc-123', brazeSegmentId: 'seg-xyz-456', brazeStatus: 'active', assignedToName: null, campaignTypeId: 'ct-1', templateId: null, branchId: 'branch-1', createdBy: 'demo-ws-001', assignedTo: null, parentId: null, creativeJson: null, productsJson: null, isDeleted: false },
  'demo-2': { id: 'demo-2', title: 'Holiday Closure Notice — Memorial Day', description: 'Operational notice for Memorial Day warehouse closure and adjusted delivery schedule.', status: 'in_progress', campaignTypeCode: 'ad_hoc_operational', branchName: 'Southeast Distribution', createdByName: 'Walter Smith', createdAt: '2026-03-19T14:30:00Z', updatedAt: '2026-03-20T09:00:00Z', contentJson: { headline: 'Memorial Day Delivery Update', body: 'Our warehouse will be closed May 26. Orders placed by May 23 will be delivered on schedule.', cta: 'View Schedule' }, scheduledStart: '2026-05-20T08:00:00Z', scheduledEnd: '2026-05-25T23:59:00Z', brazeCampaignId: null, brazeSegmentId: null, brazeStatus: null, assignedToName: 'Carmen Rodriguez', campaignTypeId: 'ct-2', templateId: null, branchId: 'branch-2', createdBy: 'demo-ws-001', assignedTo: 'demo-cc-001', parentId: null, creativeJson: null, productsJson: null, isDeleted: false },
  'demo-3': { id: 'demo-3', title: 'New IPA Launch — Goose Island', description: 'Lifecycle campaign for the launch of Goose Island new seasonal IPA.', status: 'scheduled', campaignTypeCode: 'lifecycle', branchName: 'Northeast Distribution', createdByName: 'Dana Campbell', createdAt: '2026-03-18T09:15:00Z', updatedAt: '2026-03-19T16:00:00Z', contentJson: { headline: 'Try the New Goose Island Seasonal IPA', body: 'Introducing Goose Island Summer Haze — a refreshing new IPA perfect for the season.', cta: 'Learn More' }, scheduledStart: '2026-04-01T09:00:00Z', scheduledEnd: null, brazeCampaignId: 'brz-def-456', brazeSegmentId: 'seg-abc-789', brazeStatus: 'draft', assignedToName: 'Carmen Rodriguez', campaignTypeId: 'ct-5', templateId: null, branchId: 'branch-1', createdBy: 'demo-dc-001', assignedTo: 'demo-cc-001', parentId: 'demo-1', creativeJson: null, productsJson: null, isDeleted: false },
  'demo-4': { id: 'demo-4', title: 'Cinco de Mayo — Corona Bundle', description: 'Sales campaign for Corona Cinco de Mayo bundle promotion.', status: 'in_progress', campaignTypeCode: 'ad_hoc_sales', branchName: 'West Coast Distribution', createdByName: 'Walter Smith', createdAt: '2026-03-17T16:45:00Z', updatedAt: '2026-03-17T16:45:00Z', contentJson: { headline: 'Celebrate Cinco de Mayo', body: 'Stock up on Corona Extra and Corona Light bundles — special pricing for the holiday weekend.', cta: 'Shop Bundles' }, scheduledStart: '2026-04-28T09:00:00Z', scheduledEnd: '2026-05-05T23:59:00Z', brazeCampaignId: null, brazeSegmentId: null, brazeStatus: null, assignedToName: null, campaignTypeId: 'ct-1', templateId: null, branchId: 'branch-3', createdBy: 'demo-ws-001', assignedTo: null, parentId: null, creativeJson: null, productsJson: null, isDeleted: false },
  'demo-5': { id: 'demo-5', title: 'Delivery Reroute — I-95 Construction', description: 'Notify affected retailers about delivery reroute due to I-95 construction.', status: 'needs_attention', campaignTypeCode: 'ad_hoc_operational', branchName: 'Northeast Distribution', createdByName: 'Dana Campbell', createdAt: '2026-03-16T11:00:00Z', updatedAt: '2026-03-18T10:00:00Z', contentJson: { headline: 'Delivery Route Update', body: 'Due to I-95 construction, deliveries in the Hartford area may be delayed by 1-2 hours starting March 25.', cta: 'Check My Route' }, scheduledStart: '2026-03-24T06:00:00Z', scheduledEnd: null, brazeCampaignId: null, brazeSegmentId: null, brazeStatus: null, assignedToName: null, campaignTypeId: 'ct-2', templateId: null, branchId: 'branch-1', createdBy: 'demo-dc-001', assignedTo: null, parentId: null, creativeJson: null, productsJson: null, isDeleted: false },
};

const MOCK_HISTORY = [
  { id: 'h-1', toStatus: 'in_progress' as CampaignStatus, changedByName: 'Walter Smith', createdAt: '2026-03-20T10:00:00Z', notes: 'Request accepted' },
  { id: 'h-2', toStatus: 'in_progress' as CampaignStatus, changedByName: 'Dana Campbell', createdAt: '2026-03-20T14:30:00Z', notes: 'Assigned to Carmen Rodriguez' },
  { id: 'h-3', toStatus: 'scheduled' as CampaignStatus, changedByName: 'Carmen Rodriguez', createdAt: '2026-03-21T09:00:00Z', notes: 'Content ready, campaign scheduled' },
  { id: 'h-4', toStatus: 'active' as CampaignStatus, changedByName: 'System', createdAt: '2026-03-25T09:00:00Z', notes: 'Campaign went live via Braze' },
];

const MOCK_CHILDREN: { id: string; title: string; status: CampaignStatus; branchName: string }[] = [
  { id: 'demo-3', title: 'New IPA Launch — Goose Island', status: 'scheduled', branchName: 'Northeast Distribution' },
];

const MOCK_BRANCHES = [
  { id: 'branch-1', name: 'Northeast Distribution' },
  { id: 'branch-2', name: 'Southeast Distribution' },
  { id: 'branch-3', name: 'West Coast Distribution' },
];

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((s) => s.token === 'demo-token');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [dupBranchId, setDupBranchId] = useState('');

  const { data: apiCampaign, isLoading } = useQuery({
    queryKey: ['campaign', id], queryFn: () => getCampaign(id!), enabled: !!id && !isDemo,
  });
  const { data: apiHistory } = useQuery({
    queryKey: ['campaignHistory', id], queryFn: () => getCampaignHistory(id!), enabled: !!id && !isDemo,
  });

  const campaign = isDemo ? (id ? MOCK_CAMPAIGNS[id] : undefined) : apiCampaign;
  const history = isDemo ? MOCK_HISTORY : apiHistory;
  const children = isDemo && id === 'demo-1' ? MOCK_CHILDREN : [];

  const transitionMutation = useMutation({
    mutationFn: (to: CampaignStatus) => transitionCampaign(id!, { to }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); queryClient.invalidateQueries({ queryKey: ['campaignHistory', id] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCampaign(id!),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); navigate('/campaigns'); },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateCampaign(id!, editForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaign', id] }); setEditing(false); },
  });

  const dupMutation = useMutation({
    mutationFn: () => duplicateCampaign(id!, dupBranchId || undefined),
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); setShowDuplicateModal(false); if (data?.id) navigate(`/campaigns/${data.id}`); },
  });

  if (isLoading && !isDemo) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-4 w-16 bg-surface-100 rounded" />
        <div className="h-8 w-72 bg-surface-100 rounded" />
        <div className="card p-6 space-y-4"><div className="h-4 w-full bg-surface-100 rounded" /><div className="h-4 w-3/4 bg-surface-100 rounded" /></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-500 text-sm mb-4">Campaign not found</p>
        <button onClick={() => navigate('/campaigns')} className="btn-secondary text-sm">Back to Campaigns</button>
      </div>
    );
  }

  const allowedTransitions = ALLOWED_TRANSITIONS[campaign.status as CampaignStatus] ?? [];
  const canEdit = campaign.status === 'in_progress' || campaign.status === 'needs_attention';
  const isActive = campaign.status === 'active';
  const channel = 'Push Notification'; // Demo — would come from campaign data
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtDateTime = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const startEdit = () => {
    setEditForm({ title: campaign.title, description: campaign.description ?? '' });
    setEditing(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/campaigns')} className="btn-ghost text-xs mb-4 -ml-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Campaigns
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`badge ${getStatusStyle(campaign.status)}`}>{STATUS_LABELS[campaign.status as CampaignStatus]}</span>
            <span className="text-xs text-surface-400">{CAMPAIGN_TYPE_LABELS[campaign.campaignTypeCode as CampaignTypeCode]}</span>
            {campaign.parentId && (
              <span className="badge badge-default text-[10px] flex items-center gap-1">
                <Link2 className="w-2.5 h-2.5" /> Child campaign
              </span>
            )}
          </div>
          {editing ? (
            <div className="space-y-2 mt-2">
              <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="input-field text-lg font-semibold" />
              <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="input-field text-sm" />
              <div className="flex gap-2">
                <button onClick={() => isDemo ? setEditing(false) : updateMutation.mutate()} className="btn-primary text-xs"><Check className="w-3 h-3" /> Save</button>
                <button onClick={() => setEditing(false)} className="btn-ghost text-xs"><X className="w-3 h-3" /> Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">{campaign.title}</h1>
              {campaign.description && <p className="text-sm text-surface-500 mt-1.5 max-w-xl">{campaign.description}</p>}
            </>
          )}
        </div>
        {!editing && (
          <div className="flex gap-2 shrink-0 ml-4">
            {canEdit && (
              <button onClick={startEdit} className="btn-secondary text-xs"><Pencil className="w-3.5 h-3.5" /> Edit</button>
            )}
            <button onClick={() => setShowDuplicateModal(true)} className="btn-secondary text-xs"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
            {!isDemo && (
              <button onClick={() => deleteMutation.mutate()} className="btn-danger text-xs"><Trash2 className="w-3.5 h-3.5" /></button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Metadata */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {([
                ['Campaign Type', CAMPAIGN_TYPE_LABELS[campaign.campaignTypeCode as CampaignTypeCode]],
                ['Channel', channel],
                ['Wholesaler', campaign.branchName],
                ['Created by', campaign.createdByName],
                campaign.assignedToName ? ['Assigned to', campaign.assignedToName] : null,
                ['Created', fmtDate(campaign.createdAt)],
                campaign.scheduledStart ? ['Starts', fmtDateTime(campaign.scheduledStart)] : null,
                campaign.scheduledEnd ? ['Ends', fmtDateTime(campaign.scheduledEnd)] : null,
              ] as ([string, string] | null)[]).filter((x): x is [string, string] => x !== null).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-surface-400 mb-0.5">{label}</dt>
                  <dd className="text-sm text-surface-900 font-medium">{value}</dd>
                </div>
              ))}
            </div>

            {campaign.brazeCampaignId && (
              <div className="mt-5 pt-4 border-t border-surface-100">
                <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Braze Integration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-surface-400 mb-0.5">Campaign ID</dt>
                    <dd className="text-xs font-mono text-surface-600 bg-surface-50 px-2 py-1 rounded inline-block">{campaign.brazeCampaignId}</dd>
                  </div>
                  {campaign.brazeStatus && (
                    <div>
                      <dt className="text-xs text-surface-400 mb-0.5">Status</dt>
                      <dd className="text-sm text-surface-900 font-medium capitalize">{campaign.brazeStatus}</dd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Performance Stats — active/completed campaigns only */}
          {(campaign.status === 'active' || campaign.status === 'completed') && (
            <div className="card p-5">
              <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Performance</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sent', value: '4,820' },
                  { label: 'Open Rate', value: '39.8%', good: true },
                  { label: 'CTR', value: '13.5%', good: true },
                  { label: 'Clicks', value: '643' },
                  { label: 'Revenue', value: '$28,450' },
                  { label: 'ROI', value: '8,029%', good: true },
                ].map((m) => (
                  <div key={m.label} className="text-center py-2">
                    <div className={`text-lg font-semibold tabular-nums ${m.good ? 'text-success-600' : 'text-surface-900'}`}>{m.value}</div>
                    <div className="text-[11px] text-surface-400">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Preview */}
          {campaign.contentJson && (
            <div className="card overflow-hidden">
              {/* Banner image if available */}
              {campaign.id === 'demo-stpat' && (
                <div className="w-full">
                  <img src="/assets/st-patricks-banner.webp" alt="St. Patrick's Day Campaign Banner" className="w-full h-auto" />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Content Preview</h2>
                <div className="bg-surface-50 rounded-xl p-5 border border-surface-100">
                  {campaign.contentJson.headline && <h3 className="text-lg font-semibold text-surface-900 mb-2">{campaign.contentJson.headline}</h3>}
                  {campaign.contentJson.body && <p className="text-sm text-surface-600 leading-relaxed mb-4">{campaign.contentJson.body}</p>}
                  {campaign.contentJson.cta && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-900 text-white text-sm font-medium rounded-lg">
                      {campaign.contentJson.cta} <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Version History */}
          {campaign.contentJson && (
            <div className="card p-5">
              <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Content Version History</h2>
              <div className="space-y-3">
                {[
                  { version: 'v3 (Current)', author: 'Carmen Rodriguez', date: 'Mar 21, 2:00 PM', change: 'Updated CTA from "Learn More" to "Order Now"' },
                  { version: 'v2', author: 'Carmen Rodriguez', date: 'Mar 21, 10:30 AM', change: 'Revised body copy — shortened for push notification' },
                  { version: 'v1', author: 'Walter Smith', date: 'Mar 20, 10:00 AM', change: 'Initial content submitted' },
                ].map((v) => (
                  <div key={v.version} className="flex items-start gap-3 p-3 rounded-lg border border-surface-100 hover:bg-surface-50 transition-colors">
                    <span className={`badge text-[10px] shrink-0 ${v.version.includes('Current') ? 'badge-success' : 'badge-default'}`}>{v.version}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-surface-700">{v.change}</div>
                      <div className="text-[11px] text-surface-400 mt-0.5">{v.author} &middot; {v.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval Review */}
          <ApprovalReview
            campaignTitle={campaign.title}
            headline={campaign.contentJson?.headline}
            body={campaign.contentJson?.body}
            cta={campaign.contentJson?.cta}
            status={campaign.status}
          />

          {/* Child Campaigns (Phase 6) */}
          {children.length > 0 && (
            <div className="card p-5">
              <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" /> Child Campaigns
              </h2>
              <div className="space-y-2">
                {children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => navigate(`/campaigns/${child.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border border-surface-100 hover:bg-surface-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-surface-900">{child.title}</div>
                      <div className="text-xs text-surface-400">{child.branchName}</div>
                    </div>
                    <span className={`badge ${getStatusStyle(child.status)}`}>{STATUS_LABELS[child.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <CampaignComments />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions */}
          {campaign.status !== 'completed' && campaign.status !== 'cancelled' && (
            <div className="card p-4">
              <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-2">
                {isActive && (
                  <button
                    onClick={() => !isDemo && transitionMutation.mutate('needs_attention')}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-warn-600 bg-warn-50 border border-warn-500/20 rounded-lg hover:bg-warn-50/80 transition-all"
                  >
                    <Pause className="w-4 h-4" /> Pause Campaign
                  </button>
                )}
                <button
                  onClick={() => !isDemo && transitionMutation.mutate('cancelled')}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-danger-600 bg-danger-50 border border-danger-200/50 rounded-lg hover:bg-danger-50/80 transition-all"
                >
                  <X className="w-4 h-4" /> Cancel Campaign
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card p-4">
            <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Timeline
            </h3>
            <div className="space-y-0">
              {history?.map((entry: { id: string; toStatus: CampaignStatus; changedByName: string; createdAt: string; notes: string | null }, i: number) => (
                <div key={entry.id} className="relative pl-5 pb-4 last:pb-0">
                  {i < (history?.length ?? 0) - 1 && <div className="absolute left-[7px] top-3 bottom-0 w-px bg-surface-200" />}
                  <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface-300 bg-white" />
                  <div>
                    <span className={`badge text-[10px] ${getStatusStyle(entry.toStatus)}`}>{STATUS_LABELS[entry.toStatus]}</span>
                    <div className="text-[11px] text-surface-400 mt-1">{entry.changedByName} &middot; {fmtDateTime(entry.createdAt)}</div>
                    {entry.notes && <p className="text-[11px] text-surface-500 mt-0.5">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Modal (Phase 6 — cross-branch) */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDuplicateModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-surface-900">Duplicate Campaign</h3>
              <button onClick={() => setShowDuplicateModal(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-surface-500 mb-4">Create a copy of this campaign. Optionally select a different branch.</p>
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Target Branch</label>
              <select value={dupBranchId} onChange={(e) => setDupBranchId(e.target.value)} className="input-field">
                <option value="">Same branch ({campaign.branchName})</option>
                {MOCK_BRANCHES.filter((b) => b.id !== campaign.branchId).map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="linkParent" className="rounded border-surface-300" defaultChecked />
              <label htmlFor="linkParent" className="text-sm text-surface-600">Link as child campaign</label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowDuplicateModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => isDemo ? (() => { setShowDuplicateModal(false); navigate('/campaigns'); })() : dupMutation.mutate()}
                className="btn-primary"
              >
                <Copy className="w-4 h-4" /> Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
