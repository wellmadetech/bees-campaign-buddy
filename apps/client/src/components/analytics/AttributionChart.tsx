import type { ChannelAttribution, AttributionModel } from '@campaignbuddy/shared';
import ChannelBadge, { channelLabel } from './ChannelBadge';
import { Info } from 'lucide-react';

interface Props {
  data: ChannelAttribution[];
  isLoading?: boolean;
  onModelChange?: (model: AttributionModel) => void;
  currentModel?: AttributionModel;
}

const MODELS: { value: AttributionModel; label: string; description: string; detail: string }[] = [
  { value: 'position', label: 'Position-Based', description: '40% first touch, 40% last touch, 20% split across middle', detail: 'Best for understanding the full journey — credits the channels that introduce and close, while still acknowledging the middle.' },
  { value: 'first_touch', label: 'First Touch', description: '100% credit to the first channel', detail: 'Best for measuring awareness — which channel brings new customers in?' },
  { value: 'last_touch', label: 'Last Touch', description: '100% credit to the last channel before conversion', detail: 'Best for measuring closers — which channel seals the deal?' },
  { value: 'linear', label: 'Linear', description: 'Equal credit across all channels', detail: 'Fair split — useful when you believe every touchpoint contributes equally.' },
];

const CHANNEL_COLORS: Record<string, { bar: string; bg: string; border: string; text: string; ring: string }> = {
  push: { bar: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'ring-blue-100' },
  email: { bar: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', ring: 'ring-green-100' },
  in_app: { bar: 'bg-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'ring-purple-100' },
  content_card: { bar: 'bg-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: 'ring-indigo-100' },
  sms: { bar: 'bg-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', ring: 'ring-orange-100' },
  whatsapp: { bar: 'bg-teal-500', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', ring: 'ring-teal-100' },
};

const DEFAULT_COLORS = { bar: 'bg-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', ring: 'ring-gray-100' };

export default function AttributionChart({ data, isLoading, onModelChange, currentModel = 'position' }: Props) {
  if (isLoading) {
    return <div className="card p-6 animate-pulse"><div className="h-64 bg-surface-secondary rounded" /></div>;
  }

  if (!data.length) {
    return <div className="card p-6 text-center text-surface-secondary">No attribution data available</div>;
  }

  const totalRevenue = data.reduce((sum, d) => sum + d.attributedRevenue, 0);
  const totalConversions = data.reduce((sum, d) => sum + d.attributedConversions, 0);
  const topChannel = data[0]!;
  const activeModel = MODELS.find((m) => m.value === currentModel) || MODELS[0]!;
  const maxRevenue = Math.max(...data.map((d) => d.attributedRevenue));

  return (
    <div className="space-y-5">
      {/* Header + model selector */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-surface-primary mb-1">Touchpoint Attribution</h3>
            <p className="text-xs text-surface-secondary">
              How much credit does each channel deserve for driving conversions?
            </p>
          </div>
        </div>

        {/* Model selector as cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
          {MODELS.map((model) => (
            <button
              key={model.value}
              onClick={() => onModelChange?.(model.value)}
              className={`text-left rounded-lg border p-3 transition-all ${
                currentModel === model.value
                  ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                  : 'border-surface-200 bg-white hover:border-surface-300'
              }`}
            >
              <div className={`text-xs font-semibold mb-0.5 ${currentModel === model.value ? 'text-brand-700' : 'text-surface-900'}`}>
                {model.label}
              </div>
              <div className="text-[10px] text-surface-400 leading-snug">{model.description}</div>
            </button>
          ))}
        </div>

        {/* Model explanation */}
        <div className="flex items-start gap-2 px-3 py-2.5 bg-surface-50 rounded-lg border border-surface-100">
          <Info size={14} className="text-surface-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-surface-500">{activeModel.detail}</p>
        </div>
      </div>

      {/* Revenue share visualization */}
      <div className="card p-6">
        <h4 className="text-sm font-semibold text-surface-primary mb-1">Revenue Attribution by Channel</h4>
        <p className="text-xs text-surface-secondary mb-5">
          Total attributed revenue: <span className="font-semibold text-surface-700">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </p>

        {/* Stacked bar */}
        <div className="mb-5">
          <div className="flex h-12 rounded-xl overflow-hidden shadow-sm">
            {data.map((item) => {
              const colors = CHANNEL_COLORS[item.channel] || DEFAULT_COLORS;
              return (
                <div
                  key={item.channel}
                  className={`${colors.bar} flex items-center justify-center transition-all duration-500 relative group`}
                  style={{ width: `${Math.max(item.percentOfTotal, 3)}%` }}
                >
                  {item.percentOfTotal >= 10 && (
                    <div className="text-center">
                      <div className="text-xs font-bold text-white">{item.percentOfTotal}%</div>
                      <div className="text-[9px] text-white/80">{channelLabel(item.channel)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend for small segments */}
          <div className="flex flex-wrap gap-3 mt-2">
            {data.map((item) => {
              const colors = CHANNEL_COLORS[item.channel] || DEFAULT_COLORS;
              return (
                <div key={item.channel} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${colors.bar}`} />
                  <span className="text-xs text-surface-500">{channelLabel(item.channel)}</span>
                  <span className="text-xs font-semibold text-surface-700">{item.percentOfTotal}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight — right after the visual so the team sees it before the details */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-5">
          <p className="text-sm text-purple-800">
            <strong>Attribution Insight:</strong>{' '}
            <strong>{channelLabel(topChannel.channel)}</strong> drives the most attributed revenue at{' '}
            <strong>${topChannel.attributedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> ({topChannel.percentOfTotal}% of total).
            {data.length >= 2 && (
              <>{' '}Try switching between attribution models above to see how credit shifts — if a channel
              ranks high in First Touch but low in Last Touch, it's great at awareness but not closing.
              Use this to decide where to invest for each goal.</>
            )}
          </p>
        </div>

        {/* Channel cards */}
        <div className="space-y-3">
          {data.map((item, i) => {
            const colors = CHANNEL_COLORS[item.channel] || DEFAULT_COLORS;
            const isTop = i === 0;

            return (
              <div
                key={item.channel}
                className={`rounded-xl border p-4 transition-all ${
                  isTop
                    ? `${colors.border} ${colors.bg} ring-1 ${colors.ring}`
                    : 'border-surface-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ChannelBadge channel={item.channel} />
                    {isTop && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full`}>
                        Top Channel
                      </span>
                    )}
                  </div>
                  <div className={`text-xl font-bold tabular-nums ${isTop ? colors.text : 'text-surface-900'}`}>
                    {item.percentOfTotal}%
                  </div>
                </div>

                {/* Revenue bar */}
                <div className="mb-3">
                  <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                      style={{ width: `${(item.attributedRevenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-sm font-semibold text-surface-900 tabular-nums">
                      ${item.attributedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[10px] text-surface-400">Attributed Revenue</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-surface-900 tabular-nums">
                      {item.attributedConversions.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </div>
                    <div className="text-[10px] text-surface-400">Attributed Conversions</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-surface-900 tabular-nums">
                      {item.avgTouchesBeforeConversion}
                    </div>
                    <div className="text-[10px] text-surface-400">Avg Touches to Convert</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t-2 border-surface-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total</span>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-bold text-surface-900 tabular-nums">
                ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-surface-400">Revenue</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-surface-900 tabular-nums">
                {totalConversions.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </div>
              <div className="text-[10px] text-surface-400">Conversions</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
