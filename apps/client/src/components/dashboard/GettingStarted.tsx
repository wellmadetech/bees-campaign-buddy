import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, X, Megaphone, Package, FileText, BarChart3, Users } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Megaphone;
  href: string;
  completed: boolean;
}

const INITIAL_ITEMS: ChecklistItem[] = [
  { id: 'profile', label: 'Complete your profile', description: 'Set your timezone and notification preferences', icon: Users, href: '/onboarding', completed: true },
  { id: 'first-campaign', label: 'Create your first campaign', description: 'Use the wizard to build and submit a campaign', icon: Megaphone, href: '/campaigns/new', completed: false },
  { id: 'explore-bundles', label: 'Explore campaign bundles', description: 'Subscribe to pre-built campaign packages for major events', icon: Package, href: '/bundles', completed: false },
  { id: 'browse-templates', label: 'Browse templates', description: 'See the available campaign templates for each channel', icon: FileText, href: '/templates', completed: false },
  { id: 'view-reporting', label: 'Check your performance', description: 'View campaign metrics and track your results', icon: BarChart3, href: '/reporting', completed: false },
];

export function GettingStarted() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const completedCount = items.filter(i => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  const handleToggle = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  return (
    <div className="card overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-surface-900">Getting Started</h2>
          <span className="text-xs text-surface-400">{completedCount}/{items.length} complete</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div className="h-full bg-success-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <button onClick={() => setDismissed(true)} className="btn-ghost p-1 text-surface-400"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div>
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 px-5 py-3.5 ${i < items.length - 1 ? 'border-b border-surface-100/60' : ''} ${
              item.completed ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => handleToggle(item.id)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                item.completed ? 'bg-success-500 border-success-500' : 'border-surface-300 hover:border-surface-400'
              }`}
            >
              {item.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${item.completed ? 'text-surface-400 line-through' : 'text-surface-900'}`}>{item.label}</div>
              <div className="text-xs text-surface-400">{item.description}</div>
            </div>
            {!item.completed && (
              <button onClick={() => navigate(item.href)} className="btn-ghost text-[11px]">
                Start <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
