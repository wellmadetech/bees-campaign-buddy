import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Megaphone, FileText, Package, Users, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'campaign' | 'template' | 'bundle' | 'user';
  title: string;
  subtitle: string;
  href: string;
}

const ALL_ITEMS: SearchResult[] = [
  { id: 'demo-1', type: 'campaign', title: 'Spring Beer Promo — Bud Light', subtitle: 'Launched · Northeast Distribution', href: '/campaigns/demo-1' },
  { id: 'demo-2', type: 'campaign', title: 'Holiday Closure Notice — Memorial Day', subtitle: 'In Progress · Southeast Distribution', href: '/campaigns/demo-2' },
  { id: 'demo-3', type: 'campaign', title: 'New IPA Launch — Goose Island', subtitle: 'In QA · Northeast Distribution', href: '/campaigns/demo-3' },
  { id: 'demo-4', type: 'campaign', title: 'Cinco de Mayo — Corona Bundle', subtitle: 'Draft · West Coast Distribution', href: '/campaigns/demo-4' },
  { id: 'demo-5', type: 'campaign', title: 'Delivery Reroute — I-95 Construction', subtitle: 'Feedback Needed · Northeast Distribution', href: '/campaigns/demo-5' },
  { id: 'demo-6', type: 'campaign', title: 'Summer Seltzer Push — Michelob Ultra', subtitle: 'Launched · Southeast Distribution', href: '/campaigns/demo-6' },
  { id: 'demo-7', type: 'campaign', title: 'NPS Survey — Q1 2026', subtitle: 'Completed · West Coast Distribution', href: '/campaigns/demo-7' },
  { id: 'demo-8', type: 'campaign', title: 'Edge Recommendation — Stella Artois', subtitle: 'Submitted · Northeast Distribution', href: '/campaigns/demo-8' },
  { id: 't-1', type: 'template', title: 'Product Promotion — Push', subtitle: 'Push · Active', href: '/templates' },
  { id: 't-2', type: 'template', title: 'Product Promotion — Email', subtitle: 'Email · Active', href: '/templates' },
  { id: 't-3', type: 'template', title: 'Operational Notice — Push', subtitle: 'Push · Active', href: '/templates' },
  { id: 't-4', type: 'template', title: 'Lifecycle — In-App Message', subtitle: 'In-App · Active', href: '/templates' },
  { id: 'b-1', type: 'bundle', title: 'Super Bowl LX Bundle', subtitle: 'Upcoming · 5 campaigns', href: '/bundles' },
  { id: 'b-2', type: 'bundle', title: 'Cinco de Mayo Fiesta', subtitle: 'Active · 4 campaigns', href: '/bundles' },
  { id: 'b-3', type: 'bundle', title: 'FIFA World Cup 2026', subtitle: 'Upcoming · 8 campaigns', href: '/bundles' },
  { id: 'b-4', type: 'bundle', title: 'Christmas & New Year Bundle', subtitle: 'Upcoming · 6 campaigns', href: '/bundles' },
  { id: 'u-1', type: 'user', title: 'Dana Campbell', subtitle: 'DC Manager', href: '/users' },
  { id: 'u-2', type: 'user', title: 'Walter Smith', subtitle: 'Wholesaler Manager', href: '/users' },
  { id: 'u-3', type: 'user', title: 'Carmen Rodriguez', subtitle: 'Content Creator', href: '/users' },
];

const TYPE_ICONS = { campaign: Megaphone, template: FileText, bundle: Package, user: Users };
const TYPE_COLORS = { campaign: 'text-brand-600 bg-brand-100', template: 'text-info-600 bg-info-50', bundle: 'text-success-600 bg-success-50', user: 'text-surface-600 bg-surface-100' };

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = query.length >= 2
    ? ALL_ITEMS.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    navigate(result.href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 rounded-lg text-sm text-surface-400 hover:bg-surface-200 transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline text-[10px] bg-white px-1.5 py-0.5 rounded border border-surface-200 font-mono">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100">
              <Search className="w-5 h-5 text-surface-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns, templates, bundles, users..."
                className="flex-1 text-[15px] text-surface-900 placeholder:text-surface-400 outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery('')} className="btn-ghost p-1"><X className="w-3.5 h-3.5" /></button>
              )}
              <kbd className="text-[10px] text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200 font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-auto">
              {query.length < 2 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-surface-400">Type at least 2 characters to search</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {['Bud Light', 'Corona', 'Memorial Day', 'Push'].map(suggestion => (
                      <button key={suggestion} onClick={() => setQuery(suggestion)} className="text-xs bg-surface-100 text-surface-500 px-2.5 py-1 rounded-full hover:bg-surface-200 transition-colors">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-surface-500">No results for "{query}"</p>
                  <p className="text-xs text-surface-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                Object.entries(grouped).map(([type, items]) => {
                  const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS];
                  return (
                    <div key={type}>
                      <div className="px-4 py-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider bg-surface-50">
                        {type}s
                      </div>
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type]}`}>
                            <Icon className="w-4 h-4" strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-surface-900 truncate">{item.title}</div>
                            <div className="text-[11px] text-surface-400 truncate">{item.subtitle}</div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-surface-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
