import type { FunnelSequence } from '@campaignbuddy/shared';
import ChannelBadge, { channelLabel } from './ChannelBadge';
import { ArrowRight, Crown, TrendingUp, Zap } from 'lucide-react';

interface Props {
  data: FunnelSequence[];
  isLoading?: boolean;
}

const CHANNEL_COLORS: Record<string, string> = {
  push: 'bg-blue-500',
  email: 'bg-green-500',
  in_app: 'bg-purple-500',
  content_card: 'bg-indigo-500',
  sms: 'bg-orange-500',
  whatsapp: 'bg-teal-500',
};

const CHANNEL_LIGHT_COLORS: Record<string, string> = {
  push: 'bg-blue-100 text-blue-700 border-blue-200',
  email: 'bg-green-100 text-green-700 border-green-200',
  in_app: 'bg-purple-100 text-purple-700 border-purple-200',
  content_card: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  sms: 'bg-orange-100 text-orange-700 border-orange-200',
  whatsapp: 'bg-teal-100 text-teal-700 border-teal-200',
};

export default function FunnelVisualization({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="card p-6 animate-pulse"><div className="h-64 bg-surface-secondary rounded" /></div>;
  }

  if (!data.length) {
    return <div className="card p-6 text-center text-surface-secondary">No journey data available</div>;
  }

  // Sort: highest conversion rate first for the highlight, but show by volume for the list
  const byConvRate = [...data].sort((a, b) => b.conversionRate - a.conversionRate);
  const bestJourney = byConvRate[0]!;
  const biggestReach = [...data].sort((a, b) => b.pocCount - a.pocCount)[0]!;
  const maxRate = Math.max(...data.map((d) => d.conversionRate));

  return (
    <div className="space-y-5">
      {/* Header + headline stats */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-surface-primary mb-1">Customer Journey Analysis</h3>
        <p className="text-xs text-surface-secondary mb-5">
          How do customers move through channels before converting? Discover the most effective sequences.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Highest converting journey */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={14} className="text-amber-500" />
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Highest Conversion</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {bestJourney.sequence.map((ch, j) => (
                <div key={j} className="flex items-center gap-1.5">
                  <ChannelBadge channel={ch} />
                  {j < bestJourney.sequence.length - 1 && (
                    <ArrowRight size={12} className="text-green-400" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-3xl font-bold text-green-700 tabular-nums">
              {(bestJourney.conversionRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-green-600 mt-1">
              {bestJourney.conversions} conversions from {bestJourney.pocCount} POCs
            </div>
          </div>

          {/* Biggest reach journey */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-blue-500" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Widest Reach</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {biggestReach.sequence.map((ch, j) => (
                <div key={j} className="flex items-center gap-1.5">
                  <ChannelBadge channel={ch} />
                  {j < biggestReach.sequence.length - 1 && (
                    <ArrowRight size={12} className="text-blue-400" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-3xl font-bold text-blue-700 tabular-nums">
              {biggestReach.pocCount.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              POCs reached · {(biggestReach.conversionRate * 100).toFixed(1)}% conversion rate
            </div>
          </div>
        </div>
      </div>

      {/* Insight — up top */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Sequencing Insight:</strong>{' '}
          {bestJourney.sequence.length > 1 ? (
            <>
              The <strong>{bestJourney.sequenceLabel}</strong> journey has the highest conversion rate at{' '}
              <strong>{(bestJourney.conversionRate * 100).toFixed(1)}%</strong>.
              {biggestReach !== bestJourney && (
                <> The <strong>{biggestReach.sequenceLabel}</strong> path reaches the most POCs ({biggestReach.pocCount.toLocaleString()}) but converts at {(biggestReach.conversionRate * 100).toFixed(1)}%.
                Consider shifting high-value campaigns toward the higher-converting sequence.</>
              )}
            </>
          ) : (
            <>
              Single-channel journeys dominate by volume but multi-step sequences convert better.
              Test adding a follow-up channel to your highest-volume campaigns.
            </>
          )}
        </p>
      </div>

      {/* Journey cards */}
      <div className="card p-6">
        <h4 className="text-sm font-semibold text-surface-primary mb-1">All Journey Sequences</h4>
        <p className="text-xs text-surface-secondary mb-4">
          Ranked by conversion rate — each row shows the channel flow and how POCs progress through it
        </p>

        <div className="space-y-4">
          {byConvRate.map((seq, i) => {
            const isTop = i === 0;

            // Build per-channel funnel steps from the step data
            const channelSteps: Array<{
              channel: string;
              sent: number;
              delivered: number;
              opened: number;
              clicked: number;
            }> = [];

            for (const ch of seq.sequence) {
              const entry = { channel: ch, sent: 0, delivered: 0, opened: 0, clicked: 0 };
              for (const step of seq.steps) {
                if (step.channel === ch) {
                  entry[step.eventType as keyof Omit<typeof entry, 'channel'>] = step.count;
                }
              }
              channelSteps.push(entry);
            }

            return (
              <div
                key={i}
                className={`rounded-xl border p-5 transition-all ${
                  isTop
                    ? 'border-green-200 bg-green-50/30 ring-1 ring-green-100'
                    : 'border-surface-200 bg-white'
                }`}
              >
                {/* Top row: sequence + conversion rate */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-surface-400 w-5">#{i + 1}</span>
                    <div className="flex items-center gap-1.5">
                      {seq.sequence.map((ch, j) => (
                        <div key={j} className="flex items-center gap-1.5">
                          <ChannelBadge channel={ch} />
                          {j < seq.sequence.length - 1 && (
                            <ArrowRight size={12} className="text-surface-300" />
                          )}
                        </div>
                      ))}
                    </div>
                    {isTop && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-1">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-lg font-bold tabular-nums ${isTop ? 'text-green-700' : 'text-surface-900'}`}>
                        {(seq.conversionRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-surface-400">conversion</div>
                    </div>
                  </div>
                </div>

                {/* Visual funnel bar */}
                <div className="mb-4">
                  <div className="flex h-3 rounded-full overflow-hidden bg-surface-100">
                    <div
                      className={`${isTop ? 'bg-green-500' : 'bg-blue-500'} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.max((seq.conversionRate / maxRate) * 100, 4)}%` }}
                    />
                  </div>
                </div>

                {/* Channel step breakdown */}
                <div className="flex items-stretch gap-2 overflow-x-auto">
                  {channelSteps.map((step, j) => (
                    <div key={j} className="flex items-stretch gap-2">
                      <div className={`flex-shrink-0 rounded-lg border px-3 py-2.5 min-w-[120px] ${CHANNEL_LIGHT_COLORS[step.channel] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        <div className="text-[11px] font-semibold mb-1.5">{channelLabel(step.channel as any)}</div>
                        <div className="space-y-0.5">
                          {step.sent > 0 && (
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="opacity-70">Sent</span>
                              <span className="font-medium tabular-nums">{step.sent.toLocaleString()}</span>
                            </div>
                          )}
                          {step.opened > 0 && (
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="opacity-70">Opened</span>
                              <span className="font-medium tabular-nums">
                                {step.opened.toLocaleString()}
                                <span className="opacity-60 ml-0.5">({step.sent > 0 ? ((step.opened / step.sent) * 100).toFixed(0) : 0}%)</span>
                              </span>
                            </div>
                          )}
                          {step.clicked > 0 && (
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="opacity-70">Clicked</span>
                              <span className="font-medium tabular-nums">
                                {step.clicked.toLocaleString()}
                                <span className="opacity-60 ml-0.5">({step.opened > 0 ? ((step.clicked / step.opened) * 100).toFixed(0) : 0}%)</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {j < channelSteps.length - 1 && (
                        <div className="flex items-center flex-shrink-0">
                          <ArrowRight size={14} className="text-surface-300" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Conversion outcome */}
                  <div className="flex items-stretch">
                    <div className="flex items-center flex-shrink-0 mr-2">
                      <ArrowRight size={14} className="text-surface-300" />
                    </div>
                    <div className={`flex-shrink-0 rounded-lg border px-3 py-2.5 min-w-[100px] flex flex-col justify-center ${
                      isTop ? 'bg-green-100 border-green-200' : 'bg-surface-50 border-surface-200'
                    }`}>
                      <div className="text-[11px] font-semibold text-surface-500 mb-0.5">Converted</div>
                      <div className={`text-lg font-bold tabular-nums ${isTop ? 'text-green-700' : 'text-surface-900'}`}>
                        {seq.conversions}
                      </div>
                      <div className="text-[10px] text-surface-400">of {seq.pocCount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Summary stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-100">
                  <div className="text-xs text-surface-500">
                    <span className="font-medium text-surface-700">{seq.pocCount.toLocaleString()}</span> POCs reached
                  </div>
                  <div className="text-xs text-surface-500">
                    <span className="font-medium text-surface-700">{seq.avgTouchpoints}</span> touchpoint{seq.avgTouchpoints !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-surface-500">
                    <span className="font-medium text-surface-700">{seq.conversions}</span> conversion{seq.conversions !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
