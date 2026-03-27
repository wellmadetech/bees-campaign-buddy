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

      {/* Revenue share visualization + table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-sm font-semibold text-surface-primary mb-0.5">Revenue Attribution by Channel</h4>
            <p className="text-xs text-surface-secondary">
              Total: <span className="font-semibold text-surface-700">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> across {data.length} channels
            </p>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="flex h-10 rounded-xl overflow-hidden shadow-sm mb-4">
          {data.map((item) => {
            const colors = CHANNEL_COLORS[item.channel] || DEFAULT_COLORS;
            return (
              <div
                key={item.channel}
                className={`${colors.bar} flex items-center justify-center transition-all duration-500`}
                style={{ width: `${Math.max(item.percentOfTotal, 3)}%` }}
              >
                {item.percentOfTotal >= 10 && (
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-white">{item.percentOfTotal}%</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact table — replaces the big channel cards */}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Channel</th>
              <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Share</th>
              <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Revenue</th>
              <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Conversions</th>
              <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Avg Touches</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => {
              const colors = CHANNEL_COLORS[item.channel] || DEFAULT_COLORS;
              return (
                <tr key={item.channel} className="border-b border-surface-100 last:border-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-sm ${colors.bar}`} />
                      <ChannelBadge channel={item.channel} />
                      {i === 0 && <span className="text-[9px] font-semibold text-green-600 uppercase">Top</span>}
                    </div>
                  </td>
                  <td className={`text-right py-2.5 font-semibold tabular-nums ${i === 0 ? 'text-green-600' : 'text-surface-900'}`}>
                    {item.percentOfTotal}%
                  </td>
                  <td className="text-right py-2.5 font-medium text-surface-900 tabular-nums">
                    ${item.attributedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right py-2.5 text-surface-600 tabular-nums">
                    {item.attributedConversions.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="text-right py-2.5 text-surface-400 tabular-nums">
                    {item.avgTouchesBeforeConversion}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-200">
              <td className="py-2.5 font-semibold text-surface-500">Total</td>
              <td className="text-right py-2.5 font-semibold text-surface-900">100%</td>
              <td className="text-right py-2.5 font-bold text-surface-900 tabular-nums">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              <td className="text-right py-2.5 font-medium text-surface-600 tabular-nums">{totalConversions.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
              <td className="text-right py-2.5 text-surface-400">—</td>
            </tr>
          </tfoot>
        </table>

        {/* Insight */}
        <div className="mt-4 pt-3 border-t border-surface-100">
          <p className="text-xs text-surface-500">
            <strong className="text-surface-700">Insight:</strong>{' '}
            <strong>{channelLabel(topChannel.channel)}</strong> drives {topChannel.percentOfTotal}% of attributed revenue.
            {data.length >= 2 && <> Switch models above to see how credit shifts between channels.</>}
          </p>
        </div>
      </div>
    </div>
  );
}
