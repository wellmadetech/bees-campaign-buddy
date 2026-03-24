import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Award, Clock } from 'lucide-react';

interface WholesalerScore {
  id: string;
  name: string;
  branch: string;
  campaignsThisMonth: number;
  campaignsLastMonth: number;
  avgCycleTime: number;
  openRate: number;
  lastActive: string;
  daysInactive: number;
  score: number; // 0-100
}

const WHOLESALERS: WholesalerScore[] = [
  { id: 'w1', name: 'Walter Smith', branch: 'Northeast Distribution', campaignsThisMonth: 12, campaignsLastMonth: 10, avgCycleTime: 2.1, openRate: 42.3, lastActive: '2026-03-24', daysInactive: 0, score: 94 },
  { id: 'w2', name: 'Maria Johnson', branch: 'Southeast Distribution', campaignsThisMonth: 9, campaignsLastMonth: 11, avgCycleTime: 2.8, openRate: 38.7, lastActive: '2026-03-23', daysInactive: 1, score: 82 },
  { id: 'w3', name: 'Robert Chen', branch: 'West Coast Distribution', campaignsThisMonth: 15, campaignsLastMonth: 12, avgCycleTime: 1.9, openRate: 45.1, lastActive: '2026-03-24', daysInactive: 0, score: 97 },
  { id: 'w4', name: 'Sarah Davis', branch: 'Midwest Distribution', campaignsThisMonth: 7, campaignsLastMonth: 8, avgCycleTime: 3.4, openRate: 35.2, lastActive: '2026-03-22', daysInactive: 2, score: 68 },
  { id: 'w5', name: 'James Wilson', branch: 'Southwest Distribution', campaignsThisMonth: 4, campaignsLastMonth: 6, avgCycleTime: 4.1, openRate: 31.8, lastActive: '2026-03-20', daysInactive: 4, score: 52 },
  { id: 'w6', name: 'Lisa Thompson', branch: 'Northeast Distribution', campaignsThisMonth: 11, campaignsLastMonth: 9, avgCycleTime: 2.3, openRate: 41.0, lastActive: '2026-03-24', daysInactive: 0, score: 89 },
  { id: 'w7', name: 'Mike Brown', branch: 'Southeast Distribution', campaignsThisMonth: 3, campaignsLastMonth: 7, avgCycleTime: 5.2, openRate: 28.4, lastActive: '2026-03-12', daysInactive: 12, score: 35 },
  { id: 'w8', name: 'Emily Park', branch: 'West Coast Distribution', campaignsThisMonth: 8, campaignsLastMonth: 8, avgCycleTime: 2.6, openRate: 39.9, lastActive: '2026-03-23', daysInactive: 1, score: 78 },
  { id: 'w9', name: 'David Martinez', branch: 'Midwest Distribution', campaignsThisMonth: 0, campaignsLastMonth: 3, avgCycleTime: 0, openRate: 0, lastActive: '2026-02-28', daysInactive: 24, score: 12 },
  { id: 'w10', name: 'Jennifer Lee', branch: 'Southwest Distribution', campaignsThisMonth: 6, campaignsLastMonth: 5, avgCycleTime: 3.0, openRate: 36.5, lastActive: '2026-03-21', daysInactive: 3, score: 65 },
];

function ScoreBadge({ score }: { score: number }) {
  const style = score >= 80 ? 'bg-success-50 text-success-600 border-success-200' : score >= 60 ? 'bg-brand-100 text-brand-700 border-brand-200' : score >= 40 ? 'bg-warn-50 text-warn-600 border-warn-200' : 'bg-danger-50 text-danger-600 border-danger-200';
  return <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-bold tabular-nums ${style}`}>{score}</span>;
}

function Trend({ current, previous }: { current: number; previous: number }) {
  if (current > previous) return <span className="flex items-center gap-0.5 text-success-600 text-xs font-medium"><TrendingUp className="w-3 h-3" />{current - previous}</span>;
  if (current < previous) return <span className="flex items-center gap-0.5 text-danger-600 text-xs font-medium"><TrendingDown className="w-3 h-3" />{previous - current}</span>;
  return <span className="flex items-center gap-0.5 text-surface-400 text-xs font-medium"><Minus className="w-3 h-3" />0</span>;
}

export function ScorecardPage() {
  const [sortBy, setSortBy] = useState<'score' | 'campaigns' | 'inactive'>('score');

  const sorted = [...WHOLESALERS].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'campaigns') return b.campaignsThisMonth - a.campaignsThisMonth;
    return b.daysInactive - a.daysInactive;
  });

  const atRisk = WHOLESALERS.filter((w) => w.daysInactive >= 7);
  const topPerformers = WHOLESALERS.filter((w) => w.score >= 80);
  const avgScore = Math.round(WHOLESALERS.reduce((s, w) => s + w.score, 0) / WHOLESALERS.length);

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Wholesaler Scorecard</h1>
          <p className="text-sm text-surface-500 mt-1">Adoption and performance metrics per wholesaler</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-surface-500">Avg. Score</span>
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center"><Award className="w-4 h-4 text-brand-600" /></div>
          </div>
          <div className="text-2xl font-semibold text-surface-900 tabular-nums">{avgScore}<span className="text-sm text-surface-400 font-normal">/100</span></div>
        </div>
        <div className="card px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-surface-500">Top Performers</span>
            <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-success-600" /></div>
          </div>
          <div className="text-2xl font-semibold text-surface-900 tabular-nums">{topPerformers.length}<span className="text-sm text-surface-400 font-normal">/{WHOLESALERS.length}</span></div>
        </div>
        <div className="card px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-surface-500">At Risk</span>
            <div className="w-8 h-8 rounded-lg bg-danger-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-danger-600" /></div>
          </div>
          <div className="text-2xl font-semibold text-danger-600 tabular-nums">{atRisk.length}</div>
          {atRisk.length > 0 && <p className="text-[11px] text-surface-400 mt-1">Inactive 7+ days</p>}
        </div>
      </div>

      {/* At-risk alert */}
      {atRisk.length > 0 && (
        <div className="bg-danger-50 border border-danger-200/50 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-danger-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-danger-800">Inactive wholesalers</h3>
            <p className="text-xs text-danger-600 mt-0.5">
              {atRisk.map((w) => w.name).join(', ')} — {atRisk.length === 1 ? 'has' : 'have'} not submitted campaigns in 7+ days. Consider reaching out.
            </p>
          </div>
        </div>
      )}

      {/* Sort controls */}
      <div className="flex gap-2 mb-4">
        {([['score', 'By Score'], ['campaigns', 'By Volume'], ['inactive', 'By Inactivity']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortBy === key ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Scorecard table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Score</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Wholesaler</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Branch</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Campaigns</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Trend</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Cycle Time</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Open Rate</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((w, i) => (
              <tr key={w.id} className={`hover:bg-surface-50 transition-colors ${i < sorted.length - 1 ? 'border-b border-surface-100/60' : ''}`}>
                <td className="px-5 py-3"><ScoreBadge score={w.score} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-xs font-medium text-surface-600">
                      {w.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-surface-900">{w.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[13px] text-surface-500">{w.branch}</td>
                <td className="px-5 py-3 text-sm font-medium text-surface-900 text-right tabular-nums">{w.campaignsThisMonth}</td>
                <td className="px-5 py-3 text-right"><Trend current={w.campaignsThisMonth} previous={w.campaignsLastMonth} /></td>
                <td className="px-5 py-3 text-sm text-surface-600 text-right tabular-nums">{w.avgCycleTime > 0 ? `${w.avgCycleTime}d` : '—'}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`text-sm font-medium tabular-nums ${w.openRate >= 40 ? 'text-success-600' : w.openRate >= 30 ? 'text-surface-600' : w.openRate > 0 ? 'text-danger-600' : 'text-surface-300'}`}>
                    {w.openRate > 0 ? `${w.openRate}%` : '—'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {w.daysInactive >= 7 ? (
                    <span className="flex items-center justify-end gap-1 text-xs font-medium text-danger-600"><Clock className="w-3 h-3" />{w.daysInactive}d ago</span>
                  ) : w.daysInactive >= 3 ? (
                    <span className="text-xs text-warn-600 font-medium">{w.daysInactive}d ago</span>
                  ) : (
                    <span className="text-xs text-surface-400">{w.daysInactive === 0 ? 'Today' : `${w.daysInactive}d ago`}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
