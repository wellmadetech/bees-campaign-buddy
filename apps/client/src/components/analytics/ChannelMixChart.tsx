import type { ChannelMixResult } from '@campaignbuddy/shared';
import ChannelBadge from './ChannelBadge';
import { TrendingUp, Crown } from 'lucide-react';

interface Props {
  data: ChannelMixResult[];
  isLoading?: boolean;
}

export default function ChannelMixChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="card p-6 animate-pulse"><div className="h-64 bg-surface-secondary rounded" /></div>;
  }

  if (!data.length) {
    return <div className="card p-6 text-center text-surface-secondary">No channel mix data available</div>;
  }

  const multiChannel = data.filter((d) => d.channelCombo.length > 1);
  const singleChannel = data.filter((d) => d.channelCombo.length === 1);
  const best = data[0]!;
  const avgSingleRate = singleChannel.length > 0
    ? singleChannel.reduce((s, d) => s + d.conversionRate, 0) / singleChannel.length
    : 0;

  return (
    <div className="space-y-5">
      {/* Header + headline stat */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-surface-primary mb-1">Channel Mix Performance</h3>
        <p className="text-xs text-surface-secondary mb-5">
          Which channel combinations drive the most conversions?
        </p>

        {/* Headline comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700 tabular-nums">
              {(best.conversionRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-green-600 mt-1 font-medium">Best Combo Rate</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {best.channelCombo.map((ch) => (
                <ChannelBadge key={ch} channel={ch} />
              ))}
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-surface-700 tabular-nums">
              {(avgSingleRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-surface-500 mt-1 font-medium">Avg. Single Channel Rate</div>
            <div className="text-[11px] text-surface-400 mt-2">
              Across {singleChannel.length} channel{singleChannel.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700 tabular-nums">
              {avgSingleRate > 0 ? `${((best.conversionRate / avgSingleRate - 1) * 100).toFixed(0)}%` : '—'}
            </div>
            <div className="text-xs text-blue-600 mt-1 font-medium">Multi-Channel Lift</div>
            <div className="text-[11px] text-blue-500 mt-2 flex items-center justify-center gap-1">
              <TrendingUp size={12} /> vs single channel avg
            </div>
          </div>
        </div>
      </div>

      {/* Insight — up top so the team sees the takeaway first */}
      {multiChannel.length > 0 && singleChannel.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-800">
            <strong>Key Takeaway:</strong> Adding channels increases conversion rates.{' '}
            The best-performing combo (<strong>{best.comboLabel}</strong>) converts at{' '}
            <strong>{(best.conversionRate * 100).toFixed(1)}%</strong> — that's{' '}
            <strong>{avgSingleRate > 0 ? `${((best.conversionRate / avgSingleRate - 1) * 100).toFixed(0)}%` : '—'} higher</strong>{' '}
            than the single-channel average. Consider using multi-channel strategies for your highest-value campaigns.
          </p>
        </div>
      )}

      {/* Multi-channel combos */}
      {multiChannel.length > 0 && (
        <div className="card p-6">
          <h4 className="text-sm font-semibold text-surface-primary mb-1 flex items-center gap-2">
            <Crown size={14} className="text-amber-500" />
            Multi-Channel Combinations
          </h4>
          <p className="text-xs text-surface-secondary mb-4">
            Campaigns using multiple channels together
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {multiChannel.map((item, i) => {
              const isTop = i === 0;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-all ${
                    isTop
                      ? 'border-green-200 bg-green-50/50 ring-1 ring-green-100'
                      : 'border-surface-200 bg-white hover:border-surface-300'
                  }`}
                >
                  {/* Channel badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap gap-1">
                      {item.channelCombo.map((ch) => (
                        <ChannelBadge key={ch} channel={ch} />
                      ))}
                    </div>
                    {isTop && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Best
                      </span>
                    )}
                  </div>

                  {/* Conversion rate — prominent */}
                  <div className="mb-3">
                    <div className={`text-2xl font-bold tabular-nums ${isTop ? 'text-green-700' : 'text-surface-900'}`}>
                      {(item.conversionRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-[11px] text-surface-400">conversion rate</div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-lg px-2 py-1.5 border border-surface-100">
                      <div className="text-xs font-semibold text-surface-900 tabular-nums">{item.pocCount.toLocaleString()}</div>
                      <div className="text-[10px] text-surface-400">POCs</div>
                    </div>
                    <div className="bg-white rounded-lg px-2 py-1.5 border border-surface-100">
                      <div className="text-xs font-semibold text-surface-900 tabular-nums">{item.conversions.toLocaleString()}</div>
                      <div className="text-[10px] text-surface-400">Conversions</div>
                    </div>
                    <div className="bg-white rounded-lg px-2 py-1.5 border border-surface-100">
                      <div className="text-xs font-semibold text-surface-900 tabular-nums">${item.totalRevenue.toLocaleString()}</div>
                      <div className="text-[10px] text-surface-400">Revenue</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Single channel baseline */}
      {singleChannel.length > 0 && (
        <div className="card p-6">
          <h4 className="text-sm font-semibold text-surface-primary mb-1">Single Channel Baseline</h4>
          <p className="text-xs text-surface-secondary mb-4">
            Performance when only one channel is used — the baseline that multi-channel combos beat
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Channel</th>
                  <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Conv. Rate</th>
                  <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">POCs</th>
                  <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Conversions</th>
                  <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">Revenue</th>
                  <th className="text-right py-2.5 font-semibold text-surface-500 uppercase tracking-wider text-[11px]">vs Best Combo</th>
                </tr>
              </thead>
              <tbody>
                {singleChannel.map((item) => {
                  const gap = best.conversionRate - item.conversionRate;
                  return (
                    <tr key={item.comboLabel} className="border-b border-surface-100 last:border-0">
                      <td className="py-3">
                        <ChannelBadge channel={item.channelCombo[0]!} />
                      </td>
                      <td className="text-right py-3 font-semibold text-surface-900 tabular-nums">
                        {(item.conversionRate * 100).toFixed(1)}%
                      </td>
                      <td className="text-right py-3 text-surface-600 tabular-nums">{item.pocCount.toLocaleString()}</td>
                      <td className="text-right py-3 text-surface-600 tabular-nums">{item.conversions.toLocaleString()}</td>
                      <td className="text-right py-3 font-medium text-surface-900 tabular-nums">${item.totalRevenue.toLocaleString()}</td>
                      <td className="text-right py-3">
                        <span className="text-danger-600 font-medium tabular-nums">
                          −{(gap * 100).toFixed(1)}pp
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
