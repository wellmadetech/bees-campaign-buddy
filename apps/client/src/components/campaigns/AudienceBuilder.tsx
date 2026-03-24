import { useState } from 'react';
import { Plus, Trash2, Users, Filter } from 'lucide-react';

interface AudienceFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface Props {
  onSave?: (filters: AudienceFilter[], logic: 'AND' | 'OR', estimatedSize: number) => void;
}

const AVAILABLE_FIELDS = [
  { value: 'region', label: 'Region', type: 'select', options: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast'] },
  { value: 'account_type', label: 'Account Type', type: 'select', options: ['Bar', 'Restaurant', 'Liquor Store', 'Convenience Store', 'Grocery', 'Hotel'] },
  { value: 'order_frequency', label: 'Order Frequency', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'] },
  { value: 'avg_order_value', label: 'Avg Order Value', type: 'number', options: [] },
  { value: 'last_order_days', label: 'Days Since Last Order', type: 'number', options: [] },
  { value: 'product_category', label: 'Product Category', type: 'select', options: ['Beer', 'Seltzer', 'Spirits', 'Wine', 'Non-Alcoholic'] },
  { value: 'brand_affinity', label: 'Brand Affinity', type: 'select', options: ['Bud Light', 'Corona', 'Michelob Ultra', 'Stella Artois', 'Goose Island'] },
  { value: 'city', label: 'City', type: 'text', options: [] },
  { value: 'state', label: 'State', type: 'select', options: ['NY', 'NJ', 'CT', 'MA', 'FL', 'GA', 'TX', 'CA', 'IL', 'OH', 'PA'] },
  { value: 'opted_in_push', label: 'Push Opt-in', type: 'select', options: ['Yes', 'No'] },
  { value: 'opted_in_email', label: 'Email Opt-in', type: 'select', options: ['Yes', 'No'] },
];

const OPERATORS: Record<string, { value: string; label: string }[]> = {
  select: [{ value: 'equals', label: 'is' }, { value: 'not_equals', label: 'is not' }],
  number: [{ value: 'equals', label: 'equals' }, { value: 'gt', label: 'greater than' }, { value: 'lt', label: 'less than' }],
  text: [{ value: 'equals', label: 'is' }, { value: 'contains', label: 'contains' }, { value: 'not_equals', label: 'is not' }],
};

function estimateSize(filters: AudienceFilter[]): number {
  const base = 15420;
  let size = base;
  for (const f of filters) {
    if (!f.field || !f.value) continue;
    const field = AVAILABLE_FIELDS.find(af => af.value === f.field);
    if (field?.type === 'select') size = Math.round(size * 0.6);
    else if (field?.type === 'number') size = Math.round(size * 0.45);
    else size = Math.round(size * 0.5);
    if (f.operator === 'not_equals') size = Math.round(base - size);
  }
  return Math.max(size, 120);
}

export function AudienceBuilder({ onSave }: Props) {
  const [filters, setFilters] = useState<AudienceFilter[]>([
    { id: '1', field: '', operator: 'equals', value: '' },
  ]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');

  const addFilter = () => {
    setFilters(prev => [...prev, { id: `${Date.now()}`, field: '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (id: string) => {
    if (filters.length <= 1) return;
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<AudienceFilter>) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const activeFilters = filters.filter(f => f.field && f.value);
  const estimated = estimateSize(activeFilters);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-500" />
          <h3 className="text-[13px] font-semibold text-surface-700">Audience Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-surface-400">Match</span>
          {(['AND', 'OR'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLogic(l)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                logic === l ? 'bg-surface-900 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
              }`}
            >
              {l}
            </button>
          ))}
          <span className="text-[11px] text-surface-400">filters</span>
        </div>
      </div>

      <div className="space-y-2">
        {filters.map((filter, i) => {
          const fieldDef = AVAILABLE_FIELDS.find(f => f.value === filter.field);
          const ops = OPERATORS[fieldDef?.type ?? 'select'] ?? OPERATORS['select'];

          return (
            <div key={filter.id} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-[10px] font-bold text-surface-400 w-8 text-center shrink-0">{logic}</span>
              )}
              {i === 0 && <span className="w-8 shrink-0" />}

              <select
                value={filter.field}
                onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: '' })}
                className="input-field text-[13px] min-w-[160px]"
              >
                <option value="">Select field...</option>
                {AVAILABLE_FIELDS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                className="input-field text-[13px] w-[130px]"
              >
                {ops.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              {fieldDef?.type === 'select' ? (
                <select
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  className="input-field text-[13px] flex-1"
                >
                  <option value="">Select value...</option>
                  {fieldDef.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={fieldDef?.type === 'number' ? 'number' : 'text'}
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  placeholder={fieldDef?.type === 'number' ? '0' : 'Enter value...'}
                  className="input-field text-[13px] flex-1"
                />
              )}

              <button
                onClick={() => removeFilter(filter.id)}
                disabled={filters.length <= 1}
                className="btn-ghost p-1.5 text-surface-400 hover:text-danger-600 disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={addFilter} className="btn-ghost text-xs mt-2">
        <Plus className="w-3.5 h-3.5" /> Add filter
      </button>

      {/* Estimate */}
      <div className="mt-4 p-3 bg-surface-50 rounded-lg border border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-surface-500" />
          <span className="text-sm text-surface-600">Estimated audience:</span>
          <span className="text-sm font-semibold text-surface-900 tabular-nums">{estimated.toLocaleString()} accounts</span>
        </div>
        {onSave && (
          <button
            onClick={() => onSave(activeFilters, logic, estimated)}
            disabled={activeFilters.length === 0}
            className="btn-primary text-xs"
          >
            Save Audience
          </button>
        )}
      </div>
    </div>
  );
}
