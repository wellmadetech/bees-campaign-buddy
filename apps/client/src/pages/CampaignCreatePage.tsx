import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCampaign, submitCampaign } from '../api/campaigns';
import { listBranches } from '../api/branches';
import { AICopyAssistant } from '../components/campaigns/AICopyAssistant';
import { useAuthStore } from '../store/authStore';
import {
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPE_DESCRIPTIONS,
  CampaignTypeCode,
} from '@campaignbuddy/shared';
import type { CreateCampaignRequest } from '@campaignbuddy/shared';
import { AudienceBuilder } from '../components/campaigns/AudienceBuilder';
import { CampaignPreview } from '../components/campaigns/CampaignPreview';
import { ArrowLeft, ArrowRight, Check, Megaphone, Truck, Mail, Cpu, BarChart3, Eye } from 'lucide-react';

const STEPS = ['Type', 'Details', 'Content', 'Audience', 'Schedule', 'Review'];

const MOCK_BRANCHES = [
  { id: 'branch-1', name: 'Northeast Distribution', code: 'NE-001' },
  { id: 'branch-2', name: 'Southeast Distribution', code: 'SE-001' },
  { id: 'branch-3', name: 'West Coast Distribution', code: 'WC-001' },
];

const TYPE_ICONS: Record<string, typeof Megaphone> = {
  ad_hoc_sales: Megaphone,
  ad_hoc_operational: Truck,
  opt_in: Mail,
  edge_algo: Cpu,
  lifecycle: BarChart3,
};

export function CampaignCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((s) => s.token === 'demo-token');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<CreateCampaignRequest>>({});
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: apiBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: listBranches,
    enabled: !isDemo,
  });

  const branches = isDemo ? MOCK_BRANCHES : apiBranches;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (isDemo) { setDemoSubmitted(true); return; }
      const campaign = await createCampaign(form as CreateCampaignRequest);
      await submitCampaign(campaign.id);
      return campaign;
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        navigate('/campaigns');
      }
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (isDemo) { setDemoSubmitted(true); return; }
      return createCampaign(form as CreateCampaignRequest);
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        navigate('/campaigns');
      }
    },
  });

  const updateForm = (updates: Partial<CreateCampaignRequest>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.campaignTypeCode;
      case 1: return !!form.title && !!form.branchId;
      default: return true;
    }
  };

  if (demoSubmitted) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="card p-10 text-center">
          <div className="w-14 h-14 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-success-600" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Campaign Submitted</h2>
          <p className="text-sm text-surface-500 mb-8 max-w-sm mx-auto">
            In production, this would trigger the orchestration pipeline and push a draft to Braze.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setDemoSubmitted(false); setStep(0); setForm({}); }}
              className="btn-secondary"
            >
              Create Another
            </button>
            <button onClick={() => navigate('/campaigns')} className="btn-primary">
              View Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/campaigns')}
        className="btn-ghost text-xs mb-4 -ml-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight mb-8">Create Campaign</h1>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                i === step
                  ? 'bg-surface-900 text-white'
                  : i < step
                    ? 'bg-surface-200 text-surface-600 hover:bg-surface-300 cursor-pointer'
                    : 'bg-surface-100 text-surface-400'
              }`}
            >
              {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
              {label}
            </button>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-surface-200" />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Step 0: Campaign Type */}
        {step === 0 && (
          <div>
            <h2 className="text-[15px] font-semibold text-surface-900 mb-1">Select Campaign Type</h2>
            <p className="text-sm text-surface-400 mb-5">Choose the type that best matches your campaign goal</p>
            <div className="grid grid-cols-1 gap-2.5">
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([code, label]) => {
                const Icon = TYPE_ICONS[code] ?? Megaphone;
                return (
                  <button
                    key={code}
                    onClick={() => updateForm({ campaignTypeCode: code as CreateCampaignRequest['campaignTypeCode'] })}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      form.campaignTypeCode === code
                        ? 'border-surface-900 bg-surface-50'
                        : 'border-surface-200/80 hover:border-surface-300 hover:bg-surface-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        form.campaignTypeCode === code ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-500'
                      }`}>
                        <Icon className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-surface-900">{label}</div>
                        <div className="text-xs text-surface-400 mt-0.5">
                          {CAMPAIGN_TYPE_DESCRIPTIONS[code as CampaignTypeCode]}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div>
            <h2 className="text-[15px] font-semibold text-surface-900 mb-1">Campaign Details</h2>
            <p className="text-sm text-surface-400 mb-5">Name your campaign and select the target branch</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title ?? ''}
                  onChange={(e) => updateForm({ title: e.target.value })}
                  placeholder="e.g., Spring Beer Promo — Bud Light"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the campaign purpose and target"
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Branch</label>
                <select
                  value={form.branchId ?? ''}
                  onChange={(e) => updateForm({ branchId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a branch</option>
                  {branches?.map((b: { id: string; name: string; code: string }) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-surface-900">Content & Creative</h2>
              <AICopyAssistant
                campaignType={form.campaignTypeCode}
                onApply={(content) => updateForm({ contentJson: content })}
              />
            </div>
            <p className="text-sm text-surface-400 mb-5">Define the campaign messaging and creative</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Headline</label>
                <input
                  type="text"
                  value={form.contentJson?.headline ?? ''}
                  onChange={(e) => updateForm({ contentJson: { ...form.contentJson, headline: e.target.value } })}
                  placeholder="Attention-grabbing headline"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Body Copy</label>
                <textarea
                  value={form.contentJson?.body ?? ''}
                  onChange={(e) => updateForm({ contentJson: { ...form.contentJson, body: e.target.value } })}
                  rows={4}
                  placeholder="The main message content"
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Call to Action</label>
                <input
                  type="text"
                  value={form.contentJson?.cta ?? ''}
                  onChange={(e) => updateForm({ contentJson: { ...form.contentJson, cta: e.target.value } })}
                  placeholder="e.g., Shop Now, Learn More, Order Today"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Audience */}
        {step === 3 && (
          <div>
            <h2 className="text-[15px] font-semibold text-surface-900 mb-1">Target Audience</h2>
            <p className="text-sm text-surface-400 mb-5">Define who should receive this campaign</p>
            <AudienceBuilder />
          </div>
        )}

        {/* Step 4: Schedule */}
        {step === 4 && (
          <div>
            <h2 className="text-[15px] font-semibold text-surface-900 mb-1">Schedule</h2>
            <p className="text-sm text-surface-400 mb-5">Set the campaign start and end dates</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Start Date</label>
                <input
                  type="datetime-local"
                  value={form.scheduledStart?.slice(0, 16) ?? ''}
                  onChange={(e) => updateForm({ scheduledStart: new Date(e.target.value).toISOString() })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">End Date</label>
                <input
                  type="datetime-local"
                  value={form.scheduledEnd?.slice(0, 16) ?? ''}
                  onChange={(e) => updateForm({ scheduledEnd: new Date(e.target.value).toISOString() })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[15px] font-semibold text-surface-900">Review & Submit</h2>
              <button onClick={() => setShowPreview(true)} className="btn-secondary text-xs">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
            <p className="text-sm text-surface-400 mb-5">Confirm the details before submitting</p>
            <div className="space-y-0 divide-y divide-surface-100">
              {[
                ['Type', form.campaignTypeCode ? CAMPAIGN_TYPE_LABELS[form.campaignTypeCode] : '—'],
                ['Title', form.title ?? '—'],
                ['Branch', branches?.find((b: { id: string }) => b.id === form.branchId)?.name ?? '—'],
                ['Headline', form.contentJson?.headline ?? '—'],
                ['Body', form.contentJson?.body ?? '—'],
                ['CTA', form.contentJson?.cta ?? '—'],
                ['Start', form.scheduledStart ? new Date(form.scheduledStart).toLocaleString() : 'Not set'],
                ['End', form.scheduledEnd ? new Date(form.scheduledEnd).toLocaleString() : 'Not set'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 text-sm">
                  <span className="text-surface-500">{label}</span>
                  <span className="text-surface-900 font-medium text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="btn-ghost disabled:invisible"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex gap-3">
          {step === STEPS.length - 1 ? (
            <>
              <button
                onClick={() => saveDraftMutation.mutate()}
                disabled={saveDraftMutation.isPending}
                className="btn-secondary"
              >
                Save as Draft
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="btn-primary"
              >
                <Check className="w-4 h-4" />
                Submit Campaign
              </button>
            </>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Campaign Preview Modal */}
      <CampaignPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        headline={form.contentJson?.headline}
        body={form.contentJson?.body}
        cta={form.contentJson?.cta}
        channel="push"
      />
    </div>
  );
}
