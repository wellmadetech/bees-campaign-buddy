import { useState } from 'react';
import { Filter } from 'lucide-react';
import type { AnalyticsFilters as Filters } from '@campaignbuddy/shared';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  branches?: Array<{ id: string; name: string }>;
}

export default function AnalyticsFilters({ filters, onChange, branches }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'All time', days: 0 },
  ];

  function setDateRange(days: number) {
    if (days === 0) {
      onChange({ ...filters, dateFrom: undefined, dateTo: undefined });
    } else {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - days);
      onChange({
        ...filters,
        dateFrom: from.toISOString().split('T')[0],
        dateTo: to.toISOString().split('T')[0],
      });
    }
  }

  function getActivePreset(): number {
    if (!filters.dateFrom) return 0;
    const from = new Date(filters.dateFrom);
    const diff = Math.round((Date.now() - from.getTime()) / (1000 * 60 * 60 * 24));
    return presets.find((p) => p.days === diff)?.days ?? -1;
  }

  const activePreset = getActivePreset();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Date presets */}
      <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-0.5">
        {presets.map((preset) => (
          <button
            key={preset.days}
            onClick={() => setDateRange(preset.days)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activePreset === preset.days
                ? 'bg-white text-surface-primary shadow-sm'
                : 'text-surface-secondary hover:text-surface-primary'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Branch filter */}
      {branches && branches.length > 0 && (
        <select
          value={filters.branchId || ''}
          onChange={(e) => onChange({ ...filters, branchId: e.target.value || undefined })}
          className="text-xs border border-surface-border rounded-md px-2 py-1.5 bg-white"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      {/* Advanced filter toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-surface-secondary hover:text-surface-primary"
      >
        <Filter size={14} />
        Filters
      </button>

      {isOpen && (
        <div className="w-full flex items-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-surface-secondary">From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
              className="text-xs border border-surface-border rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-surface-secondary">To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
              className="text-xs border border-surface-border rounded px-2 py-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
