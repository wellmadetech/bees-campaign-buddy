import { useState } from 'react';
import { Check, X, MessageSquare, Eye, Smartphone } from 'lucide-react';

interface Props {
  campaignTitle: string;
  headline?: string;
  body?: string;
  cta?: string;
  status: string;
  onApprove?: () => void;
  onRequestChanges?: (feedback: string) => void;
}

export function ApprovalReview({ campaignTitle, headline, body, cta, status, onApprove, onRequestChanges }: Props) {
  const [showReview, setShowReview] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState<'approved' | 'changes' | null>(null);

  const needsReview = status === 'in_qa' || status === 'approved';

  if (!needsReview) return null;

  if (submitted) {
    return (
      <div className="card p-5">
        <div className={`flex items-center gap-3 p-4 rounded-xl ${submitted === 'approved' ? 'bg-success-50' : 'bg-warn-50'}`}>
          {submitted === 'approved' ? (
            <Check className="w-5 h-5 text-success-600" />
          ) : (
            <MessageSquare className="w-5 h-5 text-warn-600" />
          )}
          <div>
            <div className="text-sm font-medium text-surface-900">
              {submitted === 'approved' ? 'Approved for Launch' : 'Changes Requested'}
            </div>
            <div className="text-xs text-surface-500 mt-0.5">
              {submitted === 'approved' ? 'This campaign is ready to go live' : 'Feedback sent to the content team'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Review & Approve
        </h2>
        {!showReview && (
          <button onClick={() => setShowReview(true)} className="btn-secondary text-xs">
            Start Review
          </button>
        )}
      </div>

      {!showReview ? (
        <p className="text-sm text-surface-500">This campaign is ready for your review. Preview the content and approve or request changes.</p>
      ) : (
        <div>
          {/* Side-by-side: preview + actions */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Mini push preview */}
            <div className="bg-surface-900 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-3.5 h-3.5 text-surface-400" />
                <span className="text-[10px] text-surface-400 font-medium">Push Preview</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-4 rounded bg-brand-500 flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">B</span>
                  </div>
                  <span className="text-[9px] text-white/50">BEES · now</span>
                </div>
                {headline && <div className="text-[11px] font-semibold text-white mb-0.5">{headline}</div>}
                {body && <div className="text-[10px] text-white/60 line-clamp-2">{body}</div>}
              </div>
            </div>

            {/* Email preview */}
            <div className="bg-white rounded-xl border border-surface-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-surface-400" />
                <span className="text-[10px] text-surface-400 font-medium">Email Preview</span>
              </div>
              {headline && <div className="text-sm font-bold text-surface-900 mb-1">{headline}</div>}
              {body && <div className="text-[11px] text-surface-500 line-clamp-3 mb-2">{body}</div>}
              {cta && <span className="inline-block text-[10px] font-medium bg-brand-500 text-white px-3 py-1 rounded">{cta}</span>}
            </div>
          </div>

          {/* Feedback input */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Feedback (optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              placeholder="Any changes needed? Leave feedback for the content team..."
              className="input-field resize-none text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSubmitted('approved');
                onApprove?.();
              }}
              className="btn-primary flex-1"
            >
              <Check className="w-4 h-4" /> Approve for Launch
            </button>
            <button
              onClick={() => {
                setSubmitted('changes');
                onRequestChanges?.(feedback);
              }}
              className="btn-secondary flex-1"
            >
              <X className="w-4 h-4" /> Request Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
