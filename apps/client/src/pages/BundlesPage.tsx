import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getStatusStyle } from '../utils/statusHelpers';
import { STATUS_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus } from '@campaignbuddy/shared';
import { Package, Check, Calendar, Users, Megaphone, Star, ChevronRight, X, ArrowRight } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  campaignCount: number;
  channels: string[];
  scheduledPeriod: string;
  subscribedCount: number;
  totalBranches: number;
  status: 'active' | 'upcoming' | 'completed';
  featured?: boolean;
  campaigns: { id: string; title: string; type: string; status: CampaignStatus; scheduledDate: string }[];
}

const BUNDLES: Bundle[] = [
  {
    id: 'b1',
    name: 'Super Bowl LX Bundle',
    description: 'Complete campaign package for Super Bowl weekend — push notifications, email blasts, and in-app promotions for beer and snack combos.',
    imageUrl: 'https://placehold.co/600x300/1E293B/FFFFFF?text=Super+Bowl+LX',
    campaignCount: 5,
    channels: ['Push', 'Email', 'In-App'],
    scheduledPeriod: 'Feb 1 – Feb 10, 2027',
    subscribedCount: 287,
    totalBranches: 400,
    status: 'upcoming',
    featured: true,
    campaigns: [
      { id: 'sb-1', title: 'Game Day Beer Deals — Pre-game Push', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Feb 1' },
      { id: 'sb-2', title: 'Super Bowl Party Pack Email', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Feb 3' },
      { id: 'sb-3', title: 'Last Call — Order by Thursday', type: 'Ad-hoc Operational', status: 'in_progress', scheduledDate: 'Feb 6' },
      { id: 'sb-4', title: 'Game Day In-App Banner', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Feb 9' },
      { id: 'sb-5', title: 'Post-Game Thank You + Reorder', type: 'Lifecycle', status: 'in_progress', scheduledDate: 'Feb 10' },
    ],
  },
  {
    id: 'b2',
    name: 'Cinco de Mayo Fiesta',
    description: 'Coordinated campaign series for Cinco de Mayo — Corona, Modelo, and Pacifico promotions with festive creative.',
    imageUrl: 'https://placehold.co/600x300/78350F/FFFFFF?text=Cinco+de+Mayo',
    campaignCount: 4,
    channels: ['Push', 'Email'],
    scheduledPeriod: 'Apr 28 – May 5, 2026',
    subscribedCount: 312,
    totalBranches: 400,
    status: 'active',
    campaigns: [
      { id: 'cm-1', title: 'Early Bird — Cinco de Mayo Stock Up', type: 'Ad-hoc Sales', status: 'active', scheduledDate: 'Apr 28' },
      { id: 'cm-2', title: 'Corona Bundle Spotlight', type: 'Ad-hoc Sales', status: 'active', scheduledDate: 'May 1' },
      { id: 'cm-3', title: 'Last Chance Delivery Cutoff', type: 'Ad-hoc Operational', status: 'in_progress', scheduledDate: 'May 3' },
      { id: 'cm-4', title: 'Cinco de Mayo Day-of Push', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'May 5' },
    ],
  },
  {
    id: 'b3',
    name: 'FIFA World Cup 2026',
    description: 'Multi-week campaign bundle for the World Cup — daily match-day promos, branded content, and special edition packs.',
    imageUrl: 'https://placehold.co/600x300/064E3B/FFFFFF?text=World+Cup+2026',
    campaignCount: 8,
    channels: ['Push', 'Email', 'In-App', 'Content Card'],
    scheduledPeriod: 'Jun 11 – Jul 19, 2026',
    subscribedCount: 198,
    totalBranches: 400,
    status: 'upcoming',
    campaigns: [
      { id: 'wc-1', title: 'World Cup Kickoff — Opening Day Deals', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Jun 11' },
      { id: 'wc-2', title: 'Match Day Bundle — Group Stage', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Jun 14' },
      { id: 'wc-3', title: 'Weekly Scorecard + Reorder Reminder', type: 'Lifecycle', status: 'in_progress', scheduledDate: 'Jun 18' },
      { id: 'wc-4', title: 'Round of 16 Special', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Jun 28' },
      { id: 'wc-5', title: 'Quarter-Final Watch Party Pack', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Jul 4' },
      { id: 'wc-6', title: 'Semi-Final Countdown', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Jul 8' },
      { id: 'wc-7', title: 'Final Weekend Blowout', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Jul 18' },
      { id: 'wc-8', title: 'Post-Tournament Thank You', type: 'Lifecycle', status: 'in_progress', scheduledDate: 'Jul 19' },
    ],
  },
  {
    id: 'b4',
    name: 'Christmas & New Year Bundle',
    description: 'Holiday season campaign series — festive promotions, holiday hours, and New Year celebration deals.',
    imageUrl: 'https://placehold.co/600x300/991B1B/FFFFFF?text=Holiday+Season',
    campaignCount: 6,
    channels: ['Push', 'Email', 'In-App'],
    scheduledPeriod: 'Dec 1 – Jan 2, 2027',
    subscribedCount: 356,
    totalBranches: 400,
    status: 'upcoming',
    campaigns: [
      { id: 'xm-1', title: 'Holiday Season Kickoff', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Dec 1' },
      { id: 'xm-2', title: 'Holiday Hours Notice', type: 'Ad-hoc Operational', status: 'in_progress', scheduledDate: 'Dec 15' },
      { id: 'xm-3', title: 'Last Order Before Christmas', type: 'Ad-hoc Operational', status: 'in_progress', scheduledDate: 'Dec 20' },
      { id: 'xm-4', title: 'Christmas Week Celebration Deals', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Dec 23' },
      { id: 'xm-5', title: 'New Year Eve Party Pack', type: 'Ad-hoc Sales', status: 'in_progress', scheduledDate: 'Dec 29' },
      { id: 'xm-6', title: 'Happy New Year — Start 2027 Right', type: 'Lifecycle', status: 'in_progress', scheduledDate: 'Jan 2' },
    ],
  },
];

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-success',
  upcoming: 'badge-info',
  completed: 'badge-default',
};

export function BundlesPage() {
  const user = useAuthStore((s) => s.user);
  const isWholesaler = user?.role === 'wholesaler_manager';
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set(['b2']));
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = statusFilter ? BUNDLES.filter((b) => b.status === statusFilter) : BUNDLES;

  const handleSubscribe = (bundleId: string) => {
    setSubscribed((prev) => {
      const next = new Set(prev);
      if (next.has(bundleId)) next.delete(bundleId);
      else next.add(bundleId);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Campaign Bundles</h1>
          <p className="text-sm text-surface-500 mt-1">Pre-designed campaign packages for major events and holidays</p>
        </div>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto min-w-[140px]">
            <option value="">All bundles</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Featured banner */}
      {!statusFilter && (
        <div
          className="relative overflow-hidden rounded-2xl bg-surface-900 p-6 mb-6 cursor-pointer group"
          onClick={() => setSelectedBundle(BUNDLES[0])}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-surface-900 via-surface-900/90 to-transparent z-10" />
          <img src={BUNDLES[0].imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
          <div className="relative z-20 max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-brand-400" fill="currentColor" />
              <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Featured Bundle</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{BUNDLES[0].name}</h2>
            <p className="text-sm text-surface-300 mb-4">{BUNDLES[0].description}</p>
            <div className="flex items-center gap-4 text-xs text-surface-400">
              <span className="flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" /> {BUNDLES[0].campaignCount} campaigns</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {BUNDLES[0].scheduledPeriod}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {BUNDLES[0].subscribedCount}/{BUNDLES[0].totalBranches} subscribed</span>
            </div>
          </div>
        </div>
      )}

      {/* Bundle cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.filter((b) => statusFilter || !b.featured).map((bundle) => (
          <div key={bundle.id} className="card overflow-hidden group hover:shadow-[--shadow-elevated] transition-shadow duration-200">
            <div className="relative h-36 bg-surface-100">
              <img src={bundle.imageUrl} alt={bundle.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`badge text-[10px] ${STATUS_BADGE[bundle.status]} bg-white/90 backdrop-blur-sm`}>
                  {bundle.status.charAt(0).toUpperCase() + bundle.status.slice(1)}
                </span>
                {subscribed.has(bundle.id) && (
                  <span className="badge text-[10px] badge-success bg-white/90 backdrop-blur-sm flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Subscribed
                  </span>
                )}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-[15px] font-semibold text-surface-900 mb-1">{bundle.name}</h3>
              <p className="text-xs text-surface-400 leading-relaxed mb-3 line-clamp-2">{bundle.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-surface-400 mb-4">
                <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" /> {bundle.campaignCount} campaigns</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {bundle.scheduledPeriod}</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] text-surface-400 mb-1">
                    <span>{bundle.subscribedCount} subscribed</span>
                    <span>{Math.round((bundle.subscribedCount / bundle.totalBranches) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(bundle.subscribedCount / bundle.totalBranches) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {bundle.channels.map((ch) => (
                  <span key={ch} className="badge badge-default text-[10px]">{ch}</span>
                ))}
              </div>
              <div className="flex gap-2">
                {isWholesaler && (
                  <button
                    onClick={() => handleSubscribe(bundle.id)}
                    className={subscribed.has(bundle.id) ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                  >
                    {subscribed.has(bundle.id) ? (
                      <><Check className="w-4 h-4" /> Subscribed</>
                    ) : (
                      <><Package className="w-4 h-4" /> Subscribe</>
                    )}
                  </button>
                )}
                <button onClick={() => setSelectedBundle(bundle)} className="btn-secondary">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bundle Detail Modal */}
      {selectedBundle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedBundle(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header image */}
            <div className="relative h-40 bg-surface-100 shrink-0">
              <img src={selectedBundle.imageUrl} alt={selectedBundle.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedBundle(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-5">
                <span className={`badge text-[10px] ${STATUS_BADGE[selectedBundle.status]} mb-2`}>
                  {selectedBundle.status.charAt(0).toUpperCase() + selectedBundle.status.slice(1)}
                </span>
                <h2 className="text-lg font-semibold text-white">{selectedBundle.name}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <p className="text-sm text-surface-500 mb-4">{selectedBundle.description}</p>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-surface-900">{selectedBundle.campaignCount}</div>
                  <div className="text-[11px] text-surface-400">Campaigns</div>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-surface-900">{selectedBundle.channels.length}</div>
                  <div className="text-[11px] text-surface-400">Channels</div>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-surface-900">{selectedBundle.subscribedCount}</div>
                  <div className="text-[11px] text-surface-400">Subscribed</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1">
                  <Calendar className="w-3 h-3" /> {selectedBundle.scheduledPeriod}
                </div>
              </div>

              {/* Campaign list */}
              <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Included Campaigns</h3>
              <div className="space-y-2">
                {selectedBundle.campaigns.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-100 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-surface-300 w-5">{i + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-surface-900">{c.title}</div>
                        <div className="text-[11px] text-surface-400">{c.type} &middot; {c.scheduledDate}</div>
                      </div>
                    </div>
                    <span className={`badge text-[10px] ${getStatusStyle(c.status)}`}>{STATUS_LABELS[c.status]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            {isWholesaler && (
              <div className="p-5 border-t border-surface-100 shrink-0">
                <button
                  onClick={() => { handleSubscribe(selectedBundle.id); setSelectedBundle(null); }}
                  className={subscribed.has(selectedBundle.id) ? 'btn-secondary w-full' : 'btn-primary w-full'}
                >
                  {subscribed.has(selectedBundle.id) ? (
                    <><Check className="w-4 h-4" /> Subscribed — Click to Unsubscribe</>
                  ) : (
                    <><Package className="w-4 h-4" /> Subscribe to Bundle <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
