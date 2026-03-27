import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { STATUS_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import {
  Package, Check, Calendar, Users, Megaphone, Star, ChevronRight, X,
  ArrowRight, Plus, Pencil, Trash2, Search, Mail, Smartphone, Layout,
  MessageCircle, Phone, Bell, Upload,
} from 'lucide-react';

// --- Types ---

interface KitChannel {
  type: 'push' | 'email' | 'in_app' | 'banner' | 'sms' | 'whatsapp';
  label: string;
  dynamicFields: string[];
  preview?: string;
}

interface KitCampaign {
  id: string;
  title: string;
  type: string;
  channel: string;
  status: CampaignStatus;
  scheduledDate: string;
}

interface CampaignKit {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'upcoming' | 'completed';
  featured?: boolean;
  version: string;
  scheduledPeriod: string;
  subscribedCount: number;
  totalBranches: number;
  channels: KitChannel[];
  campaigns: KitCampaign[];
  businessLogic?: string[];
}

// --- Channel config ---

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  push: Smartphone, email: Mail, in_app: Layout, banner: Bell,
  sms: Phone, whatsapp: MessageCircle,
};

const CHANNEL_COLORS: Record<string, string> = {
  push: 'text-blue-600 bg-blue-50 border-blue-200',
  email: 'text-green-600 bg-green-50 border-green-200',
  in_app: 'text-purple-600 bg-purple-50 border-purple-200',
  banner: 'text-orange-600 bg-orange-50 border-orange-200',
  sms: 'text-teal-600 bg-teal-50 border-teal-200',
  whatsapp: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

// --- Mock Data ---

const KITS: CampaignKit[] = [
  {
    id: 'kit-1',
    name: 'New Items Drive Sales',
    description: 'Edge-influenced product recommendation kit — automatically surfaces top 5 new items each POC hasn\'t ordered yet. Multi-channel creative with dynamic product swap.',
    imageUrl: 'https://placehold.co/600x300/FFF3D6/B86E08?text=New+Items+Drive+Sales',
    status: 'active',
    featured: true,
    version: 'V3',
    scheduledPeriod: 'Recurring — every 2 weeks',
    subscribedCount: 342,
    totalBranches: 400,
    channels: [
      { type: 'push', label: 'Push Notification', dynamicFields: ['Product Name', 'Brand'], preview: 'New items drive sales! Stock {{Product Name}} today.' },
      { type: 'email', label: 'Email', dynamicFields: ['Product Name', 'Brand', 'Product Image', 'Price'], preview: 'New products for you! Check out 3 items that are a great fit for a business like yours.' },
      { type: 'in_app', label: 'In-App Slider', dynamicFields: ['Product Name', 'Brand', 'SKU Image'], preview: 'Checkout {{Brand}} Packs — Order {{Product Name}} for your business.' },
      { type: 'banner', label: 'Banner', dynamicFields: ['Product Name', 'Product Image'], preview: 'NEW ITEMS DRIVE SALES! Click to view details and stock up!' },
    ],
    campaigns: [
      { id: 'nids-1', title: 'New Items — Push Wave 1', type: 'Edge-Algo', channel: 'Push', status: 'active', scheduledDate: 'Every 2 weeks' },
      { id: 'nids-2', title: 'New Items — Email Digest', type: 'Edge-Algo', channel: 'Email', status: 'active', scheduledDate: 'Every 2 weeks' },
      { id: 'nids-3', title: 'New Items — In-App Slider', type: 'Edge-Algo', channel: 'In-App', status: 'active', scheduledDate: 'Continuous' },
      { id: 'nids-4', title: 'New Items — Banner', type: 'Edge-Algo', channel: 'Banner', status: 'active', scheduledDate: 'Continuous' },
    ],
    businessLogic: [
      'Edge refreshes top 5 reco products every 2 weeks',
      'Braze skips if same reco repeats two cycles in a row',
      'Auto-launches across all 5 touchpoint types',
      'V3: Includes wholesaler PTR pricing + promo details',
    ],
  },
  {
    id: 'kit-2',
    name: 'Cinco de Mayo Fiesta',
    description: 'Coordinated campaign kit for Cinco de Mayo — Corona, Modelo, and Pacifico promotions with festive creative and special bundle pricing.',
    imageUrl: 'https://placehold.co/600x300/78350F/FFFFFF?text=Cinco+de+Mayo',
    status: 'active',
    version: 'V2',
    scheduledPeriod: 'Apr 28 – May 5, 2026',
    subscribedCount: 312,
    totalBranches: 400,
    channels: [
      { type: 'push', label: 'Push Notification', dynamicFields: ['Retailer Name', 'Deal'], preview: 'Cinco de Mayo is coming! Stock up on Corona & Modelo.' },
      { type: 'email', label: 'Email', dynamicFields: ['Retailer Name', 'Deal', 'Bundle Image', 'Price'], preview: 'Get ready for Cinco de Mayo — exclusive bundle deals inside.' },
      { type: 'whatsapp', label: 'WhatsApp', dynamicFields: ['Retailer Name', 'Deal'], preview: 'Hey {{Retailer Name}}! Cinco de Mayo deals are live on BEES.' },
    ],
    campaigns: [
      { id: 'cm-1', title: 'Early Bird — Stock Up Push', type: 'Ad-hoc Sales', channel: 'Push', status: 'active', scheduledDate: 'Apr 28' },
      { id: 'cm-2', title: 'Corona Bundle Spotlight Email', type: 'Ad-hoc Sales', channel: 'Email', status: 'active', scheduledDate: 'May 1' },
      { id: 'cm-3', title: 'Last Chance Delivery Cutoff', type: 'Ad-hoc Ops', channel: 'Push', status: 'scheduled', scheduledDate: 'May 3' },
      { id: 'cm-4', title: 'Day-of Celebration Push', type: 'Ad-hoc Sales', channel: 'Push', status: 'scheduled', scheduledDate: 'May 5' },
    ],
  },
  {
    id: 'kit-3',
    name: 'FIFA World Cup 2026',
    description: 'Multi-week campaign kit for the World Cup — daily match-day promos, branded content across all channels, and special edition packs.',
    imageUrl: 'https://placehold.co/600x300/064E3B/FFFFFF?text=World+Cup+2026',
    status: 'upcoming',
    version: 'V2',
    scheduledPeriod: 'Jun 11 – Jul 19, 2026',
    subscribedCount: 198,
    totalBranches: 400,
    channels: [
      { type: 'push', label: 'Push Notification', dynamicFields: ['Match', 'Deal'], preview: 'Game day! Order beer for tonight\'s match.' },
      { type: 'email', label: 'Email', dynamicFields: ['Match', 'Deal', 'Schedule'], preview: 'This week\'s World Cup matches + exclusive deals.' },
      { type: 'in_app', label: 'In-App Banner', dynamicFields: ['Match', 'Team'], preview: 'Watch Party Pack — order now for game day delivery.' },
      { type: 'sms', label: 'SMS', dynamicFields: ['Deal'], preview: 'BEES: World Cup deals are live! Order by 2pm for same-day delivery.' },
      { type: 'whatsapp', label: 'WhatsApp', dynamicFields: ['Retailer Name', 'Deal'], preview: 'Hey {{Retailer Name}}! World Cup specials just dropped.' },
    ],
    campaigns: [
      { id: 'wc-1', title: 'Kickoff Day Deals', type: 'Ad-hoc Sales', channel: 'Push', status: 'scheduled', scheduledDate: 'Jun 11' },
      { id: 'wc-2', title: 'Group Stage Weekly Digest', type: 'Ad-hoc Sales', channel: 'Email', status: 'scheduled', scheduledDate: 'Weekly' },
      { id: 'wc-3', title: 'Match Day In-App Banner', type: 'Ad-hoc Sales', channel: 'In-App', status: 'scheduled', scheduledDate: 'Match days' },
      { id: 'wc-4', title: 'Knockout Round SMS Blast', type: 'Ad-hoc Sales', channel: 'SMS', status: 'scheduled', scheduledDate: 'Jun 28' },
      { id: 'wc-5', title: 'Semi-Final Watch Party Pack', type: 'Ad-hoc Sales', channel: 'Email', status: 'scheduled', scheduledDate: 'Jul 8' },
      { id: 'wc-6', title: 'Final Weekend Blowout', type: 'Ad-hoc Sales', channel: 'Push', status: 'scheduled', scheduledDate: 'Jul 18' },
    ],
  },
  {
    id: 'kit-4',
    name: 'Holiday Season Bundle',
    description: 'End-of-year holiday campaign kit — festive promotions, holiday hours notices, and New Year celebration deals across all channels.',
    imageUrl: 'https://placehold.co/600x300/991B1B/FFFFFF?text=Holiday+Season',
    status: 'upcoming',
    version: 'V1',
    scheduledPeriod: 'Dec 1 – Jan 2, 2027',
    subscribedCount: 356,
    totalBranches: 400,
    channels: [
      { type: 'push', label: 'Push Notification', dynamicFields: ['Deal', 'Holiday'], preview: 'Holiday deals are here! Stock up for the season.' },
      { type: 'email', label: 'Email', dynamicFields: ['Deal', 'Holiday', 'Hours'], preview: 'Holiday hours + seasonal deals inside.' },
      { type: 'in_app', label: 'In-App Message', dynamicFields: ['Deal'], preview: 'Holiday Gift Sets — order now!' },
      { type: 'sms', label: 'SMS', dynamicFields: ['Holiday', 'Cutoff'], preview: 'BEES: Last order before Christmas is Dec 20. Order now!' },
    ],
    campaigns: [
      { id: 'hol-1', title: 'Holiday Season Kickoff', type: 'Ad-hoc Sales', channel: 'Push', status: 'scheduled', scheduledDate: 'Dec 1' },
      { id: 'hol-2', title: 'Holiday Hours Notice', type: 'Ad-hoc Ops', channel: 'Email', status: 'scheduled', scheduledDate: 'Dec 15' },
      { id: 'hol-3', title: 'Last Order Before Christmas', type: 'Ad-hoc Ops', channel: 'Push + SMS', status: 'scheduled', scheduledDate: 'Dec 20' },
      { id: 'hol-4', title: 'New Year Party Pack', type: 'Ad-hoc Sales', channel: 'Email + In-App', status: 'scheduled', scheduledDate: 'Dec 29' },
    ],
  },
];

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-success',
  upcoming: 'badge-info',
  completed: 'badge-default',
};

// --- Component ---

const CHANNEL_OPTIONS = [
  { type: 'push' as const, label: 'Push Notification' },
  { type: 'email' as const, label: 'Email' },
  { type: 'in_app' as const, label: 'In-App' },
  { type: 'banner' as const, label: 'Banner' },
  { type: 'sms' as const, label: 'SMS' },
  { type: 'whatsapp' as const, label: 'WhatsApp' },
];

const CAMPAIGN_TYPES = ['Ad-hoc Sales', 'Ad-hoc Ops', 'Opt-in', 'Edge-Algo', 'Lifecycle'];

interface FormCampaign {
  title: string;
  type: string;
  channel: string;
  scheduledDate: string;
}

interface FormChannel {
  type: KitChannel['type'];
  preview: string;
  dynamicFields: string;
}

// --- Kit Details Step (selection-first, auto-generates description) ---

const EVENT_OPTIONS = [
  'Holiday / Seasonal', 'Product Launch', 'Sports Event', 'Cultural Event',
  'Operational Notice', 'Recurring Promotion', 'Brand Campaign', 'Loyalty / Rewards',
];

const SCHEDULE_OPTIONS = [
  { label: 'One-time', value: '' },
  { label: 'Every 2 weeks', value: 'Recurring — every 2 weeks' },
  { label: 'Monthly', value: 'Recurring — monthly' },
];

function generateDescription(
  name: string,
  eventType: string,
  version: string,
  channels: FormChannel[],
): string {
  if (!name) return '';
  const channelNames = channels
    .filter((ch) => ch.type)
    .map((ch) => CHANNEL_OPTIONS.find((o) => o.type === ch.type)?.label || ch.type);

  const channelStr = channelNames.length > 0
    ? channelNames.length === 1
      ? channelNames[0]
      : `${channelNames.slice(0, -1).join(', ')} and ${channelNames[channelNames.length - 1]}`
    : 'multi-channel';

  const eventStr = eventType
    ? eventType.toLowerCase()
    : 'campaign';

  return `${eventStr.charAt(0).toUpperCase() + eventStr.slice(1)} kit for ${name} — coordinated ${channelStr} campaigns across all subscribed branches.`;
}

function KitDetailsStep({
  form, setForm, selectedChannels, setSelectedChannels,
}: {
  form: { name: string; description: string; imageUrl: string; scheduledPeriod: string; status: CampaignKit['status']; version: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  selectedChannels: FormChannel[];
  setSelectedChannels: React.Dispatch<React.SetStateAction<FormChannel[]>>;
}) {
  const [eventType, setEventType] = useState('');
  const [scheduleMode, setScheduleMode] = useState(form.scheduledPeriod ? (SCHEDULE_OPTIONS.find((s) => s.value === form.scheduledPeriod) ? form.scheduledPeriod : 'custom') : '');
  const [descriptionEdited, setDescriptionEdited] = useState(false);

  const toggleChannel = (type: FormChannel['type']) => {
    const exists = selectedChannels.some((ch) => ch.type === type);
    if (exists) {
      if (selectedChannels.length > 1) {
        setSelectedChannels((prev) => prev.filter((ch) => ch.type !== type));
      }
    } else {
      setSelectedChannels((prev) => [...prev, { type, preview: '', dynamicFields: '' }]);
    }
  };

  // Auto-generate description when selections change
  const autoDesc = generateDescription(form.name, eventType, form.version, selectedChannels);

  return (
    <div className="max-w-xl space-y-5">
      {/* Kit name */}
      <div>
        <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Kit Name</label>
        <input
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            if (!descriptionEdited) setForm((f) => ({ ...f, description: '' }));
          }}
          placeholder="e.g., Halloween Special, Cinco de Mayo Fiesta"
          className="input-field"
        />
      </div>

      {/* Event type */}
      <div>
        <label className="block text-[13px] font-medium text-surface-700 mb-1.5">What type of campaign is this?</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_OPTIONS.map((evt) => (
            <button
              key={evt}
              onClick={() => setEventType(eventType === evt ? '' : evt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                eventType === evt
                  ? 'bg-brand-50 border-brand-500 text-brand-700'
                  : 'bg-white border-surface-200 text-surface-500 hover:border-surface-300'
              }`}
            >
              {evt}
            </button>
          ))}
        </div>
      </div>

      {/* Channel selection */}

      {/* Channel selection with inline preview */}
      <div>
        <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Which channels should this kit use?</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {CHANNEL_OPTIONS.map((ch) => {
            const Icon = CHANNEL_ICONS[ch.type] || Mail;
            const isSelected = selectedChannels.some((sc) => sc.type === ch.type);
            const colors = CHANNEL_COLORS[ch.type] || 'text-surface-500 bg-surface-50 border-surface-200';
            return (
              <button
                key={ch.type}
                onClick={() => toggleChannel(ch.type)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? `${colors} ring-1 ring-current/20`
                    : 'bg-white border-surface-200 text-surface-400 hover:border-surface-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {ch.label}
                {isSelected && <Check className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </div>
        {/* Preview text for selected channels — fix #6 */}
        {selectedChannels.length > 0 && (
          <div className="space-y-2 mt-3">
            <label className="block text-[11px] text-surface-400">Preview message per channel <span className="text-surface-300">(optional — what the POC sees)</span></label>
            {selectedChannels.map((ch, i) => {
              const Icon = CHANNEL_ICONS[ch.type] || Mail;
              const colors = CHANNEL_COLORS[ch.type] || 'text-surface-500 bg-surface-50 border-surface-200';
              return (
                <div key={ch.type} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${colors}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    value={ch.preview}
                    onChange={(e) => setSelectedChannels((prev) => prev.map((c, j) => j === i ? { ...c, preview: e.target.value } : c))}
                    placeholder={`e.g., ${form.name ? form.name : 'Your kit'} — order now on BEES!`}
                    className="input-field text-xs flex-1"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Schedule</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {SCHEDULE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                setScheduleMode(opt.value);
                if (opt.value !== 'custom' && opt.value !== '') setForm((f) => ({ ...f, scheduledPeriod: opt.value }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                scheduleMode === opt.value
                  ? 'bg-brand-50 border-brand-500 text-brand-700'
                  : 'bg-white border-surface-200 text-surface-500 hover:border-surface-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {(() => {
          const needsEnd = scheduleMode === '';
          const startVal = form.scheduledPeriod.includes('|') ? form.scheduledPeriod.split('|')[0]! : '';
          const endVal = form.scheduledPeriod.includes('|') ? form.scheduledPeriod.split('|')[1]! : '';
          return (
            <div className={`grid gap-3 ${needsEnd ? 'grid-cols-2' : 'grid-cols-1 max-w-[200px]'}`}>
              <div>
                <label className="block text-[11px] text-surface-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startVal}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledPeriod: `${e.target.value}|${endVal}` }))}
                  className="input-field"
                />
              </div>
              {needsEnd && (
                <div>
                  <label className="block text-[11px] text-surface-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endVal}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledPeriod: `${startVal}|${e.target.value}` }))}
                    className="input-field"
                  />
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Auto-generated description */}
      <div>
        <label className="block text-[13px] font-medium text-surface-700 mb-1.5">
          Description
          {!descriptionEdited && autoDesc && (
            <span className="text-surface-400 font-normal ml-2">auto-generated — edit if needed</span>
          )}
        </label>
        <textarea
          value={descriptionEdited ? form.description : autoDesc}
          onChange={(e) => {
            setDescriptionEdited(true);
            setForm((f) => ({ ...f, description: e.target.value }));
          }}
          onFocus={() => {
            if (!descriptionEdited && autoDesc) {
              setDescriptionEdited(true);
              setForm((f) => ({ ...f, description: autoDesc }));
            }
          }}
          rows={2}
          placeholder="Will auto-fill based on your selections above"
          className={`input-field resize-none ${!descriptionEdited && autoDesc ? 'text-surface-500 italic' : ''}`}
        />
      </div>

      {/* Cover image upload (optional) */}
      <div>
        <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Cover Image <span className="text-surface-400 font-normal">(optional)</span></label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setForm((f) => ({ ...f, imageUrl: URL.createObjectURL(file) }));
          }}
          className="hidden"
          id="kit-cover-upload"
        />
        {form.imageUrl ? (
          <div className="relative group rounded-xl overflow-hidden border border-surface-200">
            <img src={form.imageUrl} alt="Cover" className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label htmlFor="kit-cover-upload" className="px-3 py-1.5 bg-white text-surface-900 text-xs font-medium rounded-lg cursor-pointer hover:bg-surface-50">
                Replace
              </label>
              <button onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} className="px-3 py-1.5 bg-white text-danger-600 text-xs font-medium rounded-lg hover:bg-surface-50">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="kit-cover-upload"
            className="flex flex-col items-center justify-center gap-1.5 w-full h-28 border-2 border-dashed border-surface-200 rounded-xl text-surface-400 hover:border-surface-300 hover:text-surface-500 transition-colors cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">Upload cover image</span>
          </label>
        )}
      </div>
    </div>
  );
}

// --- Wizard Component ---

function KitWizard({
  editingId, form, setForm, formChannels, setFormChannels, formCampaigns, setFormCampaigns, onSave, onCancel,
}: {
  editingId: string | null;
  form: { name: string; description: string; imageUrl: string; scheduledPeriod: string; status: CampaignKit['status']; version: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  formChannels: FormChannel[];
  setFormChannels: React.Dispatch<React.SetStateAction<FormChannel[]>>;
  formCampaigns: FormCampaign[];
  setFormCampaigns: React.Dispatch<React.SetStateAction<FormCampaign[]>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Kit Details', description: 'Name, channels, and schedule' },
    { label: 'Touchpoint Sequence', description: 'When does each channel fire?' },
    { label: 'Review', description: 'Confirm and create' },
  ];

  // Parse start/end dates from scheduledPeriod
  const startDate = form.scheduledPeriod.includes('|') ? form.scheduledPeriod.split('|')[0]! : '';
  const endDate = form.scheduledPeriod.includes('|') ? form.scheduledPeriod.split('|')[1]! : '';

  // Auto-generate campaign sequence from selected channels with dates spread across range (fix #3)
  const ensureSequence = () => {
    if (formCampaigns.length <= 1 && !formCampaigns[0]?.title.trim()) {
      const auto: FormCampaign[] = formChannels.map((ch, i) => {
        const label = CHANNEL_OPTIONS.find((o) => o.type === ch.type)?.label || ch.type;
        let date = '';
        if (startDate) {
          const start = new Date(startDate);
          const spacing = endDate ? Math.floor((new Date(endDate).getTime() - start.getTime()) / (formChannels.length || 1) / 86400000) : 2;
          const d = new Date(start);
          d.setDate(d.getDate() + i * Math.max(spacing, 1));
          date = d.toISOString().split('T')[0]!;
        }
        return { title: `${form.name} — ${label}`, type: 'Ad-hoc Sales', channel: label, scheduledDate: date };
      });
      if (auto.length > 0) setFormCampaigns(auto);
    }
  };

  const canNext =
    step === 0 ? form.name.trim().length > 0 && formChannels.length > 0 :
    step === 1 ? formCampaigns.some((c) => c.title.trim() && c.scheduledDate) :
    true;

  return (
    <div className="card overflow-hidden mb-6">
      {/* Wizard header */}
      <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-surface-900">{editingId ? 'Edit Campaign Kit' : 'New Campaign Kit'}</h2>
          <p className="text-xs text-surface-400 mt-0.5">Step {step + 1} of {steps.length} — {steps[step]!.label}</p>
        </div>
        <button onClick={onCancel} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
      </div>

      {/* Step indicator */}
      <div className="px-5 py-3 border-b border-surface-100 bg-surface-50">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => { if (i < step || canNext) setStep(i); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  i === step
                    ? 'bg-brand-500 text-white'
                    : i < step
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-surface-200 text-surface-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <ArrowRight size={12} className="text-surface-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5">
        {/* Step 1: Kit Details */}
        {step === 0 && (
          <KitDetailsStep form={form} setForm={setForm} selectedChannels={formChannels} setSelectedChannels={setFormChannels} />
        )}

        {/* Step 2: Touchpoint Sequence */}
        {step === 1 && (
          <div>
            <p className="text-sm text-surface-500 mb-1">Pick a date for each touchpoint. We've pre-filled one per channel you selected.</p>
            {startDate && endDate && (
              <p className="text-xs text-surface-400 mb-4">Dates should be between <strong>{startDate}</strong> and <strong>{endDate}</strong></p>
            )}
            {startDate && !endDate && (
              <p className="text-xs text-surface-400 mb-4">Starting from <strong>{startDate}</strong></p>
            )}

            <div className="space-y-2">
              {formCampaigns.map((c, i) => {
                const channelType = CHANNEL_OPTIONS.find((o) => o.label === c.channel)?.type;
                const Icon = channelType ? (CHANNEL_ICONS[channelType] || Mail) : Mail;
                const colors = channelType ? (CHANNEL_COLORS[channelType] || 'text-surface-500 bg-surface-50 border-surface-200') : 'text-surface-500 bg-surface-50 border-surface-200';
                const outOfRange = c.scheduledDate && ((startDate && c.scheduledDate < startDate) || (endDate && c.scheduledDate > endDate));

                return (
                  <div key={i} className={`flex items-center gap-3 rounded-xl border p-3 bg-white ${outOfRange ? 'border-danger-300 bg-danger-50/30' : 'border-surface-200'}`}>
                    <input
                      type="date"
                      value={c.scheduledDate}
                      min={startDate || undefined}
                      max={endDate || undefined}
                      onChange={(e) => setFormCampaigns((prev) => prev.map((r, j) => j === i ? { ...r, scheduledDate: e.target.value } : r))}
                      className="input-field text-[13px] w-[140px] flex-shrink-0"
                    />
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${colors}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {c.channel}
                    </div>
                    <div className="flex-1 text-sm text-surface-700 truncate">
                      {form.name} — {c.channel}
                    </div>
                    {outOfRange && <span className="text-[10px] text-danger-600 flex-shrink-0">Outside range</span>}
                    <button
                      onClick={() => { if (formCampaigns.length > 1) setFormCampaigns((prev) => prev.filter((_, j) => j !== i)); }}
                      disabled={formCampaigns.length <= 1}
                      className="btn-ghost p-1.5 text-surface-400 hover:text-danger-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Fix #4: only allow adding channels that were selected in step 1 */}
            {(() => {
              const selectedLabels = formChannels.map((ch) => CHANNEL_OPTIONS.find((o) => o.type === ch.type)?.label || ch.type);
              return (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-surface-400">Add:</span>
                  {selectedLabels.map((label) => {
                    const chType = CHANNEL_OPTIONS.find((o) => o.label === label)?.type;
                    const Icon = chType ? (CHANNEL_ICONS[chType] || Mail) : Mail;
                    const colors = chType ? (CHANNEL_COLORS[chType] || '') : '';
                    return (
                      <button
                        key={label}
                        onClick={() => setFormCampaigns((prev) => [...prev, {
                          title: `${form.name} — ${label}`,
                          type: 'Ad-hoc Sales',
                          channel: label,
                          scheduledDate: '',
                        }])}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors hover:ring-1 hover:ring-current/20 ${colors || 'text-surface-500 bg-surface-50 border-surface-200'}`}
                      >
                        <Icon className="w-3 h-3" />
                        <Plus className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Step 3: Review — fix #5 */}
        {step === 2 && (
          <div>
            <p className="text-sm text-surface-500 mb-5">Review your campaign kit before creating it.</p>

            <div className="space-y-4">
              {/* Kit summary */}
              <div className="bg-surface-50 rounded-xl p-4">
                <div className="text-lg font-semibold text-surface-900 mb-1">{form.name}</div>
                <p className="text-xs text-surface-500 mb-3">{form.description || generateDescription(form.name, '', form.version, formChannels)}</p>
                <div className="flex items-center gap-3 text-xs text-surface-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {startDate && endDate ? `${startDate} → ${endDate}` : form.scheduledPeriod || 'No dates set'}</span>
                  <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" /> {formCampaigns.filter((c) => c.title.trim()).length} touchpoints</span>
                </div>
              </div>

              {/* Channels */}
              <div>
                <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Channels</div>
                <div className="flex flex-wrap gap-2">
                  {formChannels.map((ch) => {
                    const Icon = CHANNEL_ICONS[ch.type] || Mail;
                    const colors = CHANNEL_COLORS[ch.type] || 'text-surface-500 bg-surface-50 border-surface-200';
                    return (
                      <div key={ch.type} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${colors}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {CHANNEL_OPTIONS.find((o) => o.type === ch.type)?.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sequence */}
              <div>
                <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Touchpoint Sequence</div>
                <div className="space-y-1.5">
                  {formCampaigns.filter((c) => c.title.trim()).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).map((c, i) => {
                    const channelType = CHANNEL_OPTIONS.find((o) => o.label === c.channel)?.type;
                    const Icon = channelType ? (CHANNEL_ICONS[channelType] || Mail) : Mail;
                    const colors = channelType ? (CHANNEL_COLORS[channelType] || '') : '';
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-surface-100">
                        <span className="text-xs font-medium text-surface-500 tabular-nums w-24 flex-shrink-0">{c.scheduledDate || 'No date'}</span>
                        <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${colors || 'bg-surface-50 text-surface-400'}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-surface-700">{c.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="px-5 py-4 border-t border-surface-100 flex items-center justify-between">
        <button onClick={step === 0 ? onCancel : () => setStep(step - 1)} className="btn-secondary">
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-brand-500' : i < step ? 'bg-brand-300' : 'bg-surface-200'}`} />
          ))}
        </div>
        {step < steps.length - 1 ? (
          <button onClick={() => { if (step === 0) ensureSequence(); setStep(step + 1); }} disabled={!canNext} className="btn-primary">
            {step === steps.length - 2 ? 'Review' : 'Next'} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={onSave} className="btn-primary">
            {editingId ? 'Save Changes' : 'Create Kit'} <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function CampaignKitsPage() {
  const user = useAuthStore((s) => s.user);
  const isWholesaler = user?.role === 'wholesaler_manager';
  const isDigicomm = user?.role === 'dc_manager';
  const [kits, setKits] = useState(KITS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedKit, setSelectedKit] = useState<CampaignKit | null>(null);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set(['kit-1', 'kit-2']));

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', scheduledPeriod: '', status: 'upcoming' as CampaignKit['status'], version: 'V1' });
  const [formChannels, setFormChannels] = useState<FormChannel[]>([{ type: 'push', preview: '', dynamicFields: '' }]);
  const [formCampaigns, setFormCampaigns] = useState<FormCampaign[]>([{ title: '', type: CAMPAIGN_TYPES[0]!, channel: 'Push', scheduledDate: '' }]);

  const filtered = kits
    .filter((k) => !statusFilter || k.status === statusFilter)
    .filter((k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.description.toLowerCase().includes(search.toLowerCase())
    );

  const featuredKit = !statusFilter && !search && !showForm ? kits.find((k) => k.featured) : null;

  const handleSubscribe = (kitId: string) => {
    setSubscribed((prev) => {
      const next = new Set(prev);
      if (next.has(kitId)) next.delete(kitId);
      else next.add(kitId);
      return next;
    });
  };

  const openCreate = () => {
    setForm({ name: '', description: '', imageUrl: '', scheduledPeriod: '', status: 'upcoming' as CampaignKit['status'], version: 'V1' });
    setFormChannels([{ type: 'push', preview: '', dynamicFields: '' }]);
    setFormCampaigns([{ title: '', type: CAMPAIGN_TYPES[0]!, channel: 'Push', scheduledDate: '' }]);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (kit: CampaignKit) => {
    setForm({ name: kit.name, description: kit.description, imageUrl: kit.imageUrl, scheduledPeriod: kit.scheduledPeriod, status: kit.status, version: kit.version });
    setFormChannels(kit.channels.map((ch) => ({ type: ch.type, preview: ch.preview || '', dynamicFields: ch.dynamicFields.join(', ') })));
    setFormCampaigns(kit.campaigns.map((c) => ({ title: c.title, type: c.type, channel: c.channel, scheduledDate: c.scheduledDate })));
    setEditingId(kit.id);
    setSelectedKit(null);
    setShowForm(true);
  };

  const handleSave = () => {
    const channels: KitChannel[] = formChannels.map((ch) => ({
      type: ch.type,
      label: CHANNEL_OPTIONS.find((o) => o.type === ch.type)?.label || ch.type,
      dynamicFields: ch.dynamicFields ? ch.dynamicFields.split(',').map((f) => f.trim()).filter(Boolean) : [],
      preview: ch.preview || undefined,
    }));
    const campaigns: KitCampaign[] = formCampaigns.filter((c) => c.title.trim()).map((c, i) => ({
      ...c, id: `${editingId || 'new'}-${i}`, status: 'scheduled' as CampaignStatus,
    }));
    // Fix #2: always start as upcoming
    form.status = 'upcoming';
    // Fix #1: auto-set version
    form.version = 'V1';

    if (editingId) {
      setKits((prev) => prev.map((k) => k.id === editingId ? { ...k, ...form, channels, campaigns } : k));
    } else {
      setKits((prev) => [...prev, {
        ...form, id: `kit-${Date.now()}`, channels, campaigns,
        subscribedCount: 0, totalBranches: 400,
      }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setKits((prev) => prev.filter((k) => k.id !== id));
    setSelectedKit(null);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Campaign Kits</h1>
          <p className="text-sm text-surface-500 mt-1">Ready-to-launch multi-channel campaign packages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search kits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs border border-surface-200 rounded-lg pl-8 pr-3 py-2 w-44 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-surface-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All kits</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          {isDigicomm && (
            <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Kit</button>
          )}
        </div>
      </div>

      {/* Create/Edit Wizard */}
      {showForm && <KitWizard
        editingId={editingId}
        form={form}
        setForm={setForm}
        formChannels={formChannels}
        setFormChannels={setFormChannels}
        formCampaigns={formCampaigns}
        setFormCampaigns={setFormCampaigns}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
      />}

      {/* Featured banner */}
      {featuredKit && (
        <div
          className="relative overflow-hidden rounded-2xl bg-surface-900 p-6 mb-6 cursor-pointer group"
          onClick={() => setSelectedKit(featuredKit)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-surface-900 via-surface-900/90 to-transparent z-10" />
          <img src={featuredKit.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
          <div className="relative z-20 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-brand-400" fill="currentColor" />
              <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Featured Kit</span>
              <span className="text-[10px] font-semibold text-white/60 bg-white/10 px-2 py-0.5 rounded-full">{featuredKit.version}</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{featuredKit.name}</h2>
            <p className="text-sm text-surface-300 mb-4">{featuredKit.description}</p>
            <div className="flex items-center gap-4 text-xs text-surface-400">
              <span className="flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" /> {featuredKit.campaigns.length} campaigns</span>
              <span className="flex items-center gap-1">{featuredKit.channels.length} channels</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {featuredKit.subscribedCount}/{featuredKit.totalBranches} subscribed</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {featuredKit.channels.map((ch) => {
                const Icon = CHANNEL_ICONS[ch.type] || Mail;
                return (
                  <div key={ch.type} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center" title={ch.label}>
                    <Icon className="w-4 h-4 text-white/70" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Kit cards */}
      {filtered.length === 0 && (
        <div className="card p-8 text-center text-sm text-surface-400">
          {search ? `No kits match "${search}"` : 'No campaign kits available'}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.filter((k) => !featuredKit || k.id !== featuredKit.id).map((kit) => (
          <div key={kit.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
            {/* Image header */}
            <div className="relative h-32 bg-surface-100">
              <img src={kit.imageUrl} alt={kit.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`badge text-[10px] ${STATUS_BADGE[kit.status]} bg-white/90 backdrop-blur-sm`}>
                  {kit.status.charAt(0).toUpperCase() + kit.status.slice(1)}
                </span>
                <span className="badge text-[10px] bg-white/90 backdrop-blur-sm text-surface-600">{kit.version}</span>
                {subscribed.has(kit.id) && (
                  <span className="badge text-[10px] badge-success bg-white/90 backdrop-blur-sm flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Subscribed
                  </span>
                )}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-[15px] font-semibold text-surface-900 mb-1">{kit.name}</h3>
              <p className="text-xs text-surface-400 leading-relaxed mb-3 line-clamp-2">{kit.description}</p>

              {/* Channel icons row */}
              <div className="flex items-center gap-1.5 mb-3">
                {kit.channels.map((ch) => {
                  const Icon = CHANNEL_ICONS[ch.type] || Mail;
                  return (
                    <div
                      key={ch.type}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center ${CHANNEL_COLORS[ch.type] || 'text-surface-500 bg-surface-50 border-surface-200'}`}
                      title={ch.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  );
                })}
                <span className="text-[11px] text-surface-400 ml-1">{kit.channels.length} channels</span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[11px] text-surface-400 mb-4">
                <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" /> {kit.campaigns.length} campaigns</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {kit.scheduledPeriod}</span>
              </div>

              {/* Subscription progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[11px] text-surface-400 mb-1">
                  <span>{kit.subscribedCount} subscribed</span>
                  <span>{Math.round((kit.subscribedCount / kit.totalBranches) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(kit.subscribedCount / kit.totalBranches) * 100}%` }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isWholesaler && (
                  <button
                    onClick={() => handleSubscribe(kit.id)}
                    className={subscribed.has(kit.id) ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                  >
                    {subscribed.has(kit.id) ? <><Check className="w-4 h-4" /> Subscribed</> : <><Package className="w-4 h-4" /> Subscribe</>}
                  </button>
                )}
                <button onClick={() => setSelectedKit(kit)} className="btn-secondary">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kit Detail Modal */}
      {selectedKit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedKit(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="relative h-36 bg-surface-100 shrink-0">
              <img src={selectedKit.imageUrl} alt={selectedKit.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedKit(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-5 flex items-center gap-2">
                <span className={`badge text-[10px] ${STATUS_BADGE[selectedKit.status]}`}>
                  {selectedKit.status.charAt(0).toUpperCase() + selectedKit.status.slice(1)}
                </span>
                <span className="badge text-[10px] bg-white/20 text-white">{selectedKit.version}</span>
                <h2 className="text-lg font-semibold text-white ml-1">{selectedKit.name}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <p className="text-sm text-surface-500 mb-5">{selectedKit.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-surface-900">{selectedKit.campaigns.length}</div>
                  <div className="text-[11px] text-surface-400">Campaigns</div>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-surface-900">{selectedKit.channels.length}</div>
                  <div className="text-[11px] text-surface-400">Channels</div>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-semibold text-surface-900">{selectedKit.subscribedCount}</div>
                  <div className="text-[11px] text-surface-400">Subscribed</div>
                </div>
              </div>

              {/* Channel previews */}
              <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Channel Creatives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {selectedKit.channels.map((ch) => {
                  const Icon = CHANNEL_ICONS[ch.type] || Mail;
                  const colors = CHANNEL_COLORS[ch.type] || 'text-surface-500 bg-surface-50 border-surface-200';
                  return (
                    <div key={ch.type} className={`rounded-xl border p-4 ${colors}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-semibold">{ch.label}</span>
                      </div>
                      {ch.preview && (
                        <p className="text-xs opacity-80 leading-relaxed mb-2">"{ch.preview}"</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {ch.dynamicFields.map((field) => (
                          <span key={field} className="text-[10px] font-mono bg-white/60 rounded px-1.5 py-0.5">
                            {`{{${field}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Business logic */}
              {selectedKit.businessLogic && selectedKit.businessLogic.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Business Logic</h3>
                  <div className="bg-surface-50 rounded-xl border border-surface-100 p-4">
                    <ul className="space-y-1.5">
                      {selectedKit.businessLogic.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-surface-600">
                          <span className="text-brand-500 mt-0.5">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Campaign sequence */}
              <h3 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-3">Campaign Sequence</h3>
              <div className="space-y-2">
                {selectedKit.campaigns.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-100 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-surface-300 w-5">{i + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-surface-900">{c.title}</div>
                        <div className="text-[11px] text-surface-400">{c.type} · {c.channel} · {c.scheduledDate}</div>
                      </div>
                    </div>
                    <span className={`badge text-[10px] ${getStatusStyle(c.status)}`}>{STATUS_LABELS[c.status]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-surface-100 shrink-0">
              {isWholesaler && (
                <button
                  onClick={() => { handleSubscribe(selectedKit.id); setSelectedKit(null); }}
                  className={subscribed.has(selectedKit.id) ? 'btn-secondary w-full' : 'btn-primary w-full'}
                >
                  {subscribed.has(selectedKit.id)
                    ? <><Check className="w-4 h-4" /> Subscribed — Click to Unsubscribe</>
                    : <><Package className="w-4 h-4" /> Subscribe to Kit <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              )}
              {isDigicomm && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(selectedKit)} className="btn-secondary flex-1"><Pencil className="w-4 h-4" /> Edit Kit</button>
                  <button onClick={() => handleDelete(selectedKit.id)} className="btn-danger"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
