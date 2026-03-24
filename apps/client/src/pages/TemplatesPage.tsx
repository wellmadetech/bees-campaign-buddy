import { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Plus, Mail, Smartphone, Layout, MessageSquare, Pencil, Trash2, X, Eye, Upload, Image } from 'lucide-react';

type Channel = 'push' | 'email' | 'in_app' | 'content_card';

interface MockTemplate {
  id: string;
  name: string;
  channel: Channel;
  description: string;
  status: 'Active' | 'Draft';
  subject?: string;
  body?: string;
  cta?: string;
  previewImageUrl?: string;
}

const INITIAL_TEMPLATES: MockTemplate[] = [
  { id: '1', name: 'Product Promotion — Push', channel: 'push', description: 'Standard push notification for product promotions', status: 'Active', body: 'Check out our latest deals on {{product_name}}!', cta: 'Shop Now', previewImageUrl: 'https://placehold.co/400x260/FFF3D6/B86E08?text=Push+Preview' },
  { id: '2', name: 'Product Promotion — Email', channel: 'email', description: 'HTML email template for product advertising campaigns', status: 'Active', subject: 'New deals on {{product_name}}', body: 'We have exclusive offers waiting for you. Order {{product_name}} today and save.', cta: 'Order Now', previewImageUrl: 'https://placehold.co/400x260/EFF6FF/2563EB?text=Email+Preview' },
  { id: '3', name: 'Operational Notice — Push', channel: 'push', description: 'Operational updates: closures, reroutes, schedule changes', status: 'Active', body: 'Important update: {{notice_text}}', cta: 'View Details' },
  { id: '4', name: 'Operational Notice — Email', channel: 'email', description: 'Email template for operational communications', status: 'Active', subject: 'Important Update from BEES', body: 'Please be aware of the following change: {{notice_text}}', cta: 'Learn More', previewImageUrl: 'https://placehold.co/400x260/EFF6FF/2563EB?text=Ops+Email' },
  { id: '5', name: 'Lifecycle — In-App Message', channel: 'in_app', description: 'In-app messaging for NPS, surveys, and onboarding', status: 'Active', body: "We'd love your feedback! Take a quick survey.", cta: 'Start Survey', previewImageUrl: 'https://placehold.co/400x260/F0FDF4/16A34A?text=In-App+Preview' },
  { id: '6', name: 'Content Card — Featured', channel: 'content_card', description: 'Content card for featured products and promotions', status: 'Draft', body: 'Featured: {{product_name}} — now available for order', cta: 'View Product' },
];

const CHANNEL_ICONS: Record<Channel, typeof Mail> = { push: Smartphone, email: Mail, in_app: Layout, content_card: MessageSquare };
const CHANNEL_STYLES: Record<Channel, string> = { push: 'text-info-600 bg-info-50', email: 'text-brand-600 bg-brand-100', in_app: 'text-success-600 bg-success-50', content_card: 'text-surface-600 bg-surface-100' };
const CHANNEL_LABELS: Record<Channel, string> = { push: 'Push', email: 'Email', in_app: 'In-App', content_card: 'Content Card' };

export function TemplatesPage() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === 'content_creator' || user?.role === 'dc_manager';
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', channel: 'push' as Channel, description: '', subject: '', body: '', cta: '', previewImageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = channelFilter ? templates.filter((t) => t.channel === channelFilter) : templates;
  const previewTemplate = previewId ? templates.find((t) => t.id === previewId) : null;

  const openCreate = () => {
    setForm({ name: '', channel: 'push', description: '', subject: '', body: '', cta: '', previewImageUrl: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (t: MockTemplate) => {
    setForm({ name: t.name, channel: t.channel, description: t.description, subject: t.subject ?? '', body: t.body ?? '', cta: t.cta ?? '', previewImageUrl: t.previewImageUrl ?? '' });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, previewImageUrl: url }));
  };

  const handleSave = () => {
    if (editingId) {
      setTemplates((prev) => prev.map((t) => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setTemplates((prev) => [...prev, { ...form, id: `new-${Date.now()}`, status: 'Draft' as const }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Templates</h1>
          <p className="text-sm text-surface-500 mt-1">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="input-field w-auto min-w-[140px]">
            <option value="">All channels</option>
            {Object.entries(CHANNEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {canManage && (
            <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Template</button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-surface-900">{editingId ? 'Edit Template' : 'New Template'}</h2>
            <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Template name" className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Channel</label>
              <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as Channel }))} className="input-field">
                {Object.entries(CHANNEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Description</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description" className="input-field" />
            </div>
            {form.channel === 'email' && (
              <div className="col-span-2">
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Subject Line</label>
                <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Email subject" className="input-field" />
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Body</label>
              <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={3} placeholder="Template body — use {{variable}} for dynamic content" className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">CTA Button</label>
              <input value={form.cta} onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))} placeholder="e.g., Shop Now" className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Preview Image</label>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
              {form.previewImageUrl ? (
                <div className="relative group">
                  <img src={form.previewImageUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-surface-200" />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1 bg-white text-surface-900 text-[11px] font-medium rounded-md">Replace</button>
                    <button onClick={() => setForm((f) => ({ ...f, previewImageUrl: '' }))} className="px-2 py-1 bg-white text-danger-600 text-[11px] font-medium rounded-md">Remove</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-surface-200 rounded-lg flex flex-col items-center justify-center gap-1.5 text-surface-400 hover:border-surface-300 hover:text-surface-500 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[11px] font-medium">Upload preview image</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-surface-100">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.name} className="btn-primary">{editingId ? 'Save Changes' : 'Create Template'}</button>
          </div>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((template) => {
          const Icon = CHANNEL_ICONS[template.channel];
          return (
            <div key={template.id} className="card p-5 group">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${CHANNEL_STYLES[template.channel]}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-surface-900 truncate">{template.name}</h3>
                    <span className={`badge text-[10px] ${template.status === 'Active' ? 'badge-success' : 'badge-default'}`}>
                      {template.status}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 leading-relaxed">{template.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                      {CHANNEL_LABELS[template.channel]}
                    </span>
                    {template.previewImageUrl && (
                      <span className="text-[10px] text-surface-300 flex items-center gap-1"><Image className="w-2.5 h-2.5" /> Has preview</span>
                    )}
                    <div className="flex-1" />
                    <button onClick={() => setPreviewId(template.id)} className="btn-ghost text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    {canManage && (
                      <>
                        <button onClick={() => openEdit(template)} className="btn-ghost text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(template.id)} className="btn-ghost text-[11px] text-danger-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Preview image in modal */}
            {previewTemplate.previewImageUrl && (
              <div className="h-48 bg-surface-100">
                <img src={previewTemplate.previewImageUrl} alt={previewTemplate.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-surface-900">{previewTemplate.name}</h3>
                <button onClick={() => setPreviewId(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge text-[10px] ${CHANNEL_STYLES[previewTemplate.channel]}`}>
                    {CHANNEL_LABELS[previewTemplate.channel]}
                  </span>
                </div>
                {previewTemplate.subject && (
                  <div className="text-xs text-surface-400 mb-2">Subject: <span className="text-surface-600 font-medium">{previewTemplate.subject}</span></div>
                )}
                {previewTemplate.body && (
                  <p className="text-sm text-surface-700 leading-relaxed mb-3">{previewTemplate.body}</p>
                )}
                {previewTemplate.cta && (
                  <span className="inline-flex items-center px-4 py-2 bg-surface-900 text-white text-sm font-medium rounded-lg">
                    {previewTemplate.cta}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-surface-400 mt-3">Variables like {'{{product_name}}'} are replaced with real data at send time.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
