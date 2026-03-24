import { useState } from 'react';
import { Sparkles, RefreshCw, Check, X } from 'lucide-react';

interface Props {
  campaignType?: string;
  onApply: (content: { headline: string; body: string; cta: string }) => void;
}

const AI_SUGGESTIONS: Record<string, { headline: string; body: string; cta: string }[]> = {
  ad_hoc_sales: [
    { headline: 'Don\'t Miss This Deal!', body: 'Exclusive pricing on select products this week only. Stock up now and save on your next order through BEES.', cta: 'Shop Deals' },
    { headline: 'Limited Time Offer', body: 'Get the best prices of the season on top-selling brands. Order before Friday to lock in savings for your store.', cta: 'Order Now' },
    { headline: 'New Arrivals Are Here', body: 'Fresh products just landed. Be the first to stock the latest trending items your customers are looking for.', cta: 'Browse New' },
  ],
  ad_hoc_operational: [
    { headline: 'Important Delivery Update', body: 'Please be aware of upcoming changes to your delivery schedule. Check the details below and plan your inventory accordingly.', cta: 'View Details' },
    { headline: 'Schedule Change Notice', body: 'We\'re adjusting operations in your area. Here\'s what you need to know to keep your orders on track.', cta: 'Learn More' },
    { headline: 'Action Required', body: 'An update affecting your account requires your attention. Review the changes and confirm your preferences.', cta: 'Review Now' },
  ],
  opt_in: [
    { headline: 'You\'re Invited!', body: 'Join this exclusive campaign and get access to special promotions, curated content, and early product launches.', cta: 'Opt In' },
    { headline: 'Unlock Exclusive Benefits', body: 'Subscribe to receive targeted offers, seasonal promotions, and insights tailored to your business.', cta: 'Subscribe' },
  ],
  edge_algo: [
    { headline: 'Recommended For You', body: 'Based on your ordering patterns, we think these products would be a great fit for your store. Check them out!', cta: 'View Picks' },
    { headline: 'Smart Suggestion', body: 'Our data shows high demand for these items in your area. Stock up now to meet customer expectations.', cta: 'Add to Cart' },
  ],
  lifecycle: [
    { headline: 'We Value Your Feedback', body: 'Take a quick 2-minute survey to help us improve your BEES experience. Your input makes a difference.', cta: 'Start Survey' },
    { headline: 'Welcome to BEES!', body: 'We\'re excited to have you on board. Here\'s a quick guide to getting the most out of your account.', cta: 'Get Started' },
  ],
};

export function AICopyAssistant({ campaignType, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{ headline: string; body: string; cta: string }[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const generate = () => {
    setGenerating(true);
    setSelectedIdx(null);
    // Simulate AI generation delay
    setTimeout(() => {
      const pool = AI_SUGGESTIONS[campaignType ?? 'ad_hoc_sales'] ?? AI_SUGGESTIONS['ad_hoc_sales'];
      // Shuffle and pick 2-3
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setSuggestions(shuffled.slice(0, Math.min(3, shuffled.length)));
      setGenerating(false);
    }, 1200);
  };

  const handleOpen = () => {
    setOpen(true);
    if (suggestions.length === 0) generate();
  };

  return (
    <>
      <button onClick={handleOpen} className="btn-secondary text-xs">
        <Sparkles className="w-3.5 h-3.5" /> AI Assist
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-surface-900">AI Copy Assistant</h3>
                  <p className="text-[11px] text-surface-400">Generated suggestions based on campaign type</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {generating ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-surface-500">Generating copy suggestions...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIdx(i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedIdx === i
                          ? 'border-purple-500 bg-purple-50/50'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-semibold text-surface-900">{s.headline}</h4>
                        {selectedIdx === i && <Check className="w-4 h-4 text-purple-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-surface-500 leading-relaxed mb-2">{s.body}</p>
                      <span className="inline-block text-[11px] font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                        {s.cta}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-surface-100 shrink-0">
              <button onClick={generate} disabled={generating} className="btn-ghost text-xs">
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} /> Regenerate
              </button>
              <button
                onClick={() => { if (selectedIdx !== null) { onApply(suggestions[selectedIdx]); setOpen(false); } }}
                disabled={selectedIdx === null}
                className="btn-primary"
              >
                <Check className="w-4 h-4" /> Use This Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
