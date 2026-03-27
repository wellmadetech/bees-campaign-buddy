import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { CAMPAIGN_TYPE_LABELS } from '@campaignbuddy/shared';
import type { CampaignTypeCode } from '@campaignbuddy/shared';
import { Sparkles, Send, ArrowLeft, Smartphone, Mail, MessageCircle, Image, Upload, Check, Clock, AlertCircle, RefreshCw, ChevronRight, X } from 'lucide-react';

interface AssignedCampaign {
  id: string;
  title: string;
  campaignTypeCode: CampaignTypeCode;
  channel: string;
  wholesaler: string;
  branch: string;
  scheduledStart: string;
  brief: string;
  products?: string[];
  status: 'todo' | 'in_progress' | 'review';
  content?: { headline: string; body: string; cta: string };
  imageUrl?: string;
}

const ASSIGNED_CAMPAIGNS: AssignedCampaign[] = [
  { id: 'cs-1', title: 'Summer Seltzer Push — Michelob Ultra', campaignTypeCode: 'ad_hoc_sales', channel: 'Push Notification', wholesaler: 'Walter Smith', branch: 'Southeast Distribution', scheduledStart: '2026-04-15', brief: 'Push notification promoting Michelob Ultra seltzer lineup for summer. Emphasize low calorie and refreshing taste. Target bars and restaurants.', products: ['Michelob Ultra Seltzer', 'Michelob Ultra Infusions'], status: 'todo' },
  { id: 'cs-2', title: "St. Patrick's Day — Email Blast", campaignTypeCode: 'opt_in', channel: 'Email', wholesaler: 'Dana Campbell', branch: 'Northeast Distribution', scheduledStart: '2026-03-10', brief: "Email campaign for St. Patrick's Day opt-in selections. Highlight Irish stouts and ales. Include key dates for selection window.", products: ['Guinness', 'Smithwicks', 'Harp Lager'], status: 'in_progress', content: { headline: "St. Patrick's Day Selections Are Live!", body: 'Your curated Irish beer selections are now available. Order before March 20 to stock up for the holiday rush.', cta: 'View Selections' }, imageUrl: '/assets/st-patricks-banner.webp' },
  { id: 'cs-3', title: 'Price Adjustment Notice — April', campaignTypeCode: 'ad_hoc_operational', channel: 'SMS / MMS', wholesaler: 'Maria Johnson', branch: 'Southeast Distribution', scheduledStart: '2026-04-01', brief: 'SMS notification about upcoming price adjustments effective April 1. Keep it short and direct. Link to full price list.', status: 'in_progress', content: { headline: 'Price Update', body: 'BEES: Price adjustments take effect Apr 1. Review updated pricing for your account.', cta: 'View Prices' } },
  { id: 'cs-4', title: 'Corona Cinco de Mayo — WhatsApp', campaignTypeCode: 'ad_hoc_sales', channel: 'WhatsApp', wholesaler: 'Robert Chen', branch: 'West Coast Distribution', scheduledStart: '2026-04-28', brief: 'WhatsApp message for Cinco de Mayo Corona promotions. Festive tone. Include bundle deals and ordering deadline.', products: ['Corona Extra', 'Corona Light', 'Modelo Especial'], status: 'review', content: { headline: 'Cinco de Mayo Deals!', body: "Stock up for Cinco de Mayo! Corona Extra & Modelo bundles at special pricing. Order by Apr 25 for guaranteed delivery.", cta: 'Order Bundles' } },
  { id: 'cs-5', title: 'NPS Survey — Q2', campaignTypeCode: 'lifecycle', channel: 'In-App Message', wholesaler: 'Dana Campbell', branch: 'All Branches', scheduledStart: '2026-04-15', brief: 'In-app NPS survey for Q2. Keep it short — one question with follow-up. Friendly tone.', status: 'todo' },
];

const AI_DRAFTS: Record<string, { headline: string; body: string; cta: string }[]> = {
  'ad_hoc_sales': [
    { headline: 'Summer Just Got Better', body: 'Refresh your shelves with the latest seltzer lineup. Light, crisp, and perfect for the season. Order now on BEES.', cta: 'Shop Now' },
    { headline: 'New Season, New Flavors', body: 'Michelob Ultra Seltzer is here. Low calorie, big flavor. Your customers will love it.', cta: 'Order Today' },
  ],
  'ad_hoc_operational': [
    { headline: 'Important Price Update', body: 'Heads up — pricing changes take effect soon. Review your updated pricing on BEES to plan ahead.', cta: 'View Changes' },
  ],
  'opt_in': [
    { headline: 'Your Seasonal Picks Are Ready', body: 'Curated selections for the season are now live. Browse and add to your next order before the window closes.', cta: 'Browse Now' },
  ],
  'lifecycle': [
    { headline: 'Quick Question', body: "How's your BEES experience? Take 30 seconds to share your feedback and help us improve.", cta: 'Start Survey' },
  ],
  'edge_algo': [
    { headline: 'Recommended For You', body: 'Based on your ordering patterns, these products are trending in your area. Check them out.', cta: 'View Picks' },
  ],
};

const ASSET_SUGGESTIONS = [
  { name: 'michelob-ultra-banner.jpg', url: 'https://placehold.co/400x200/E0E7FF/4338CA?text=Michelob+Ultra' },
  { name: 'corona-cinco-banner.jpg', url: 'https://placehold.co/400x200/FDE68A/78350F?text=Cinco+de+Mayo' },
  { name: 'bees-logo-dark.svg', url: 'https://placehold.co/400x200/FEF9C3/854D0E?text=BEES+Logo' },
];

const STATUS_CONFIG = {
  todo: { label: 'To Do', style: 'badge-default', icon: Clock },
  in_progress: { label: 'In Progress', style: 'badge-brand', icon: AlertCircle },
  review: { label: 'Ready for Review', style: 'badge-info', icon: Send },
};

export function ContentStudioPage() {
  const user = useAuthStore((s) => s.user);
  const [campaigns, setCampaigns] = useState(ASSIGNED_CAMPAIGNS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boardFilter, setBoardFilter] = useState<'all' | 'todo' | 'in_progress' | 'review'>('all');
  const [generating, setGenerating] = useState(false);
  const [previewChannel, setPreviewChannel] = useState<'push' | 'email' | 'sms'>('push');

  const selected = campaigns.find((c) => c.id === selectedId);
  const filtered = boardFilter === 'all' ? campaigns : campaigns.filter((c) => c.status === boardFilter);

  const counts = { todo: campaigns.filter(c => c.status === 'todo').length, in_progress: campaigns.filter(c => c.status === 'in_progress').length, review: campaigns.filter(c => c.status === 'review').length };

  const updateContent = (id: string, content: Partial<AssignedCampaign['content']>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, content: { headline: '', body: '', cta: '', ...c.content, ...content }, status: c.status === 'todo' ? 'in_progress' as const : c.status } : c));
  };

  const generateDraft = (campaign: AssignedCampaign) => {
    setGenerating(true);
    setTimeout(() => {
      const drafts = AI_DRAFTS[campaign.campaignTypeCode] ?? AI_DRAFTS['ad_hoc_sales'];
      const draft = drafts[Math.floor(Math.random() * drafts.length)];
      updateContent(campaign.id, draft);
      setGenerating(false);
    }, 1500);
  };

  const submitForReview = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'review' as const } : c));
  };

  const setImage = (id: string, url: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, imageUrl: url } : c));
  };

  // Board view
  if (!selected) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-[22px] font-semibold text-surface-900 tracking-tight">Content Studio</h1>
            <p className="text-sm text-surface-500 mt-1">{campaigns.length} campaigns assigned to you</p>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-5">
          {([['all', 'All', campaigns.length], ['todo', 'To Do', counts.todo], ['in_progress', 'In Progress', counts.in_progress], ['review', 'Ready for Review', counts.review]] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setBoardFilter(key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                boardFilter === key ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
              }`}
            >
              {label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${boardFilter === key ? 'bg-white/20' : 'bg-surface-200'}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Campaign cards */}
        <div className="space-y-3">
          {filtered.map((campaign) => {
            const config = STATUS_CONFIG[campaign.status];
            return (
              <div
                key={campaign.id}
                onClick={() => setSelectedId(campaign.id)}
                className="card p-5 cursor-pointer hover:shadow-[--shadow-elevated] transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`badge text-[10px] ${config.style}`}>{config.label}</span>
                      <span className="badge badge-default text-[10px]">{campaign.channel}</span>
                      <span className="badge badge-default text-[10px]">{CAMPAIGN_TYPE_LABELS[campaign.campaignTypeCode]}</span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-surface-900 mb-1">{campaign.title}</h3>
                    <p className="text-xs text-surface-400 line-clamp-1">{campaign.brief}</p>
                    <div className="flex items-center gap-3 text-[11px] text-surface-400 mt-2">
                      <span>From: <span className="text-surface-600 font-medium">{campaign.wholesaler}</span></span>
                      <span>&middot; {campaign.branch}</span>
                      <span>&middot; Due: {new Date(campaign.scheduledStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-surface-500 shrink-0 ml-3 mt-1 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Workspace view
  return (
    <div>
      <button onClick={() => setSelectedId(null)} className="btn-ghost text-xs mb-4 -ml-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
      </button>

      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`badge text-[10px] ${STATUS_CONFIG[selected.status].style}`}>{STATUS_CONFIG[selected.status].label}</span>
              <span className="badge badge-default text-[10px]">{selected.channel}</span>
            </div>
            <h1 className="text-lg font-semibold text-surface-900">{selected.title}</h1>
          </div>
          {selected.status !== 'review' && (
            <button
              onClick={() => submitForReview(selected.id)}
              disabled={!selected.content?.headline}
              className="btn-primary text-xs disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Review
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Brief + Editor */}
        <div className="space-y-5">
          {/* Campaign Brief */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Campaign Brief</h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-3">{selected.brief}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-surface-400">Wholesaler:</span> <span className="text-surface-700 font-medium">{selected.wholesaler}</span></div>
              <div><span className="text-surface-400">Branch:</span> <span className="text-surface-700 font-medium">{selected.branch}</span></div>
              <div><span className="text-surface-400">Channel:</span> <span className="text-surface-700 font-medium">{selected.channel}</span></div>
              <div><span className="text-surface-400">Launch:</span> <span className="text-surface-700 font-medium">{new Date(selected.scheduledStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
            </div>
            {selected.products && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selected.products.map(p => <span key={p} className="badge badge-default text-[10px]">{p}</span>)}
              </div>
            )}
          </div>

          {/* Demographic Card */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Audience Demographics</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Languages */}
              <div>
                <div className="text-[11px] font-medium text-surface-400 mb-2">Top Languages</div>
                <div className="space-y-1.5">
                  {[
                    { lang: 'English', pct: 58 },
                    { lang: 'Spanish', pct: 34 },
                    { lang: 'Portuguese', pct: 8 },
                  ].map(l => (
                    <div key={l.lang}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-surface-700">{l.lang}</span>
                        <span className="text-surface-400 tabular-nums">{l.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${l.pct}%`, backgroundColor: l.pct > 50 ? '#3b82f6' : l.pct > 20 ? '#f59e0b' : '#94a3b8' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Account Types */}
              <div>
                <div className="text-[11px] font-medium text-surface-400 mb-2">Account Types</div>
                <div className="space-y-1.5">
                  {[
                    { type: 'Bar / Pub', pct: 32 },
                    { type: 'Liquor Store', pct: 28 },
                    { type: 'Restaurant', pct: 22 },
                    { type: 'Convenience', pct: 18 },
                  ].map(a => (
                    <div key={a.type} className="flex items-center justify-between text-xs">
                      <span className="text-surface-700">{a.type}</span>
                      <span className="text-surface-400 tabular-nums">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-50 rounded-lg p-2.5 text-center">
                <div className="text-sm font-semibold text-surface-900">35–54</div>
                <div className="text-[10px] text-surface-400">Avg Age Range</div>
              </div>
              <div className="bg-surface-50 rounded-lg p-2.5 text-center">
                <div className="text-sm font-semibold text-surface-900">Bi-weekly</div>
                <div className="text-[10px] text-surface-400">Order Frequency</div>
              </div>
              <div className="bg-surface-50 rounded-lg p-2.5 text-center">
                <div className="text-sm font-semibold text-surface-900">$342</div>
                <div className="text-[10px] text-surface-400">Avg Order</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-surface-100">
              <div className="text-[11px] font-medium text-surface-400 mb-1.5">Top Brands Ordered</div>
              <div className="flex flex-wrap gap-1.5">
                {['Bud Light', 'Corona', 'Michelob Ultra', 'Modelo', 'Stella Artois'].map(b => (
                  <span key={b} className="badge badge-default text-[10px]">{b}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider">Content</h2>
              <button onClick={() => generateDraft(selected)} disabled={generating} className="btn-secondary text-xs">
                {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generating ? 'Generating...' : 'AI Draft'}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Headline</label>
                <input
                  value={selected.content?.headline ?? ''}
                  onChange={(e) => updateContent(selected.id, { headline: e.target.value })}
                  placeholder="Write a headline..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Body</label>
                <textarea
                  value={selected.content?.body ?? ''}
                  onChange={(e) => updateContent(selected.id, { body: e.target.value })}
                  rows={4}
                  placeholder="Write the message body..."
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">CTA</label>
                <input
                  value={selected.content?.cta ?? ''}
                  onChange={(e) => updateContent(selected.id, { cta: e.target.value })}
                  placeholder="e.g., Shop Now"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Asset Upload */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Creative Asset</h2>
            {selected.imageUrl ? (
              <div className="relative group">
                <img src={selected.imageUrl} alt="Campaign asset" className="w-full h-40 object-cover rounded-xl border border-surface-200" />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => setImage(selected.id, '')} className="px-3 py-1.5 bg-white text-surface-900 text-xs font-medium rounded-lg">Remove</button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-surface-200 rounded-xl p-6 text-center">
                <Upload className="w-6 h-6 text-surface-300 mx-auto mb-2" />
                <p className="text-xs text-surface-400 mb-3">Drag & drop or click to upload</p>
                <p className="text-[11px] text-surface-300 mb-4">Or pick from the asset library:</p>
                <div className="flex gap-2 justify-center">
                  {ASSET_SUGGESTIONS.map(a => (
                    <button
                      key={a.name}
                      onClick={() => setImage(selected.id, a.url)}
                      className="w-16 h-12 rounded-lg overflow-hidden border border-surface-200 hover:border-brand-500 transition-colors"
                    >
                      <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div>
          <div className="card p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider">Live Preview</h2>
              <div className="flex bg-surface-100 rounded-lg p-0.5">
                {([['push', Smartphone], ['email', Mail], ['sms', MessageCircle]] as const).map(([ch, Icon]) => (
                  <button
                    key={ch}
                    onClick={() => setPreviewChannel(ch)}
                    className={`p-1.5 rounded-md transition-all ${previewChannel === ch ? 'bg-white shadow-sm text-surface-900' : 'text-surface-400'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Push preview */}
            {previewChannel === 'push' && (
              <div className="bg-surface-900 rounded-2xl p-4 mx-auto max-w-[280px]">
                <div className="bg-surface-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-1.5 text-white/50 text-[9px]">
                    <span>9:41</span>
                    <div className="flex gap-1"><div className="w-3 h-1.5 bg-white/30 rounded-sm" /></div>
                  </div>
                  <div className="px-3 pt-4 pb-3">
                    <div className="text-center text-white mb-6">
                      <div className="text-2xl font-light tabular-nums">9:41</div>
                      <div className="text-[9px] text-white/40 mt-0.5">Wednesday, March 26</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-4 h-4 rounded bg-brand-500 flex items-center justify-center">
                          <span className="text-white text-[7px] font-bold">B</span>
                        </div>
                        <span className="text-[9px] text-white/50">BEES &middot; now</span>
                      </div>
                      {selected.content?.headline && <div className="text-[11px] font-semibold text-white mb-0.5">{selected.content.headline}</div>}
                      {selected.content?.body ? (
                        <div className="text-[10px] text-white/60 line-clamp-3">{selected.content.body}</div>
                      ) : (
                        <div className="text-[10px] text-white/30 italic">Start typing to see preview...</div>
                      )}
                      {selected.imageUrl && <img src={selected.imageUrl} alt="" className="mt-2 h-16 w-full object-cover rounded-lg opacity-80" />}
                    </div>
                  </div>
                  <div className="h-8" />
                </div>
              </div>
            )}

            {/* Email preview */}
            {previewChannel === 'email' && (
              <div className="bg-white rounded-xl border border-surface-200 overflow-hidden mx-auto max-w-[320px]">
                <div className="bg-surface-50 px-4 py-2 border-b border-surface-200">
                  <div className="text-[9px] text-surface-400 mb-0.5">From: BEES Campaign Buddy</div>
                  <div className="text-xs font-medium text-surface-900">{selected.content?.headline || 'Subject line...'}</div>
                </div>
                <div className="p-4">
                  {selected.imageUrl && <img src={selected.imageUrl} alt="" className="w-full h-28 object-cover rounded-lg mb-3" />}
                  {selected.content?.headline && <h3 className="text-sm font-bold text-surface-900 mb-1.5">{selected.content.headline}</h3>}
                  {selected.content?.body ? (
                    <p className="text-[11px] text-surface-600 leading-relaxed mb-3">{selected.content.body}</p>
                  ) : (
                    <p className="text-[11px] text-surface-300 italic mb-3">Start typing to see preview...</p>
                  )}
                  {selected.content?.cta && (
                    <div className="text-center">
                      <span className="inline-block px-4 py-1.5 text-[11px] font-semibold text-white rounded-md" style={{ backgroundColor: '#0f172a' }}>{selected.content.cta}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SMS preview */}
            {previewChannel === 'sms' && (
              <div className="bg-surface-100 rounded-2xl p-4 mx-auto max-w-[280px]">
                <div className="text-center text-[10px] text-surface-400 mb-3">BEES &middot; SMS</div>
                <div className="bg-blue-500 text-white rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[12px] leading-relaxed max-w-[85%] ml-auto">
                  {selected.content?.body ? (
                    <>
                      <span>BEES: {selected.content.body}</span>
                      {selected.content.cta && <span className="block mt-1 underline">{selected.content.cta} →</span>}
                    </>
                  ) : (
                    <span className="opacity-50 italic">Start typing to see preview...</span>
                  )}
                </div>
                <div className="text-right text-[9px] text-surface-400 mt-1 mr-1">Delivered</div>
              </div>
            )}

            {/* Empty state hint */}
            {!selected.content?.headline && !selected.content?.body && (
              <div className="mt-4 p-3 bg-brand-50 rounded-lg text-center">
                <Sparkles className="w-4 h-4 text-brand-600 mx-auto mb-1" />
                <p className="text-xs text-brand-700">Click <strong>AI Draft</strong> to auto-generate content from the brief</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
