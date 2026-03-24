import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  authorInitials: string;
  role: string;
  text: string;
  time: string;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', author: 'Walter Smith', authorInitials: 'WS', role: 'Wholesaler Manager', text: 'Can we add the Bud Light Platinum SKU to this campaign as well?', time: 'Mar 20, 10:15 AM' },
  { id: 'c2', author: 'Carmen Rodriguez', authorInitials: 'CR', role: 'Content Creator', text: 'Sure! I\'ll add it to the product selection. Also, the hero image has been updated — check the creative section.', time: 'Mar 20, 2:30 PM' },
  { id: 'c3', author: 'Dana Campbell', authorInitials: 'DC', role: 'DC Manager', text: 'Looks good. Let\'s make sure we hit the March 25 launch date. Approved from my end.', time: 'Mar 21, 9:00 AM' },
];

export function CampaignComments() {
  const user = useAuthStore((s) => s.user);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `new-${Date.now()}`,
      author: user?.displayName ?? 'You',
      authorInitials: (user?.displayName ?? 'Y').split(' ').map((n) => n[0]).join(''),
      role: user?.role?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '',
      text: newComment.trim(),
      time: 'Just now',
    };
    setComments((prev) => [...prev, comment]);
    setNewComment('');
  };

  return (
    <div className="card p-5">
      <h2 className="text-[13px] font-semibold text-surface-400 uppercase tracking-wider mb-4">Comments</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-surface-400 mb-4">No comments yet. Start the conversation.</p>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center text-[10px] font-semibold text-surface-600 shrink-0 mt-0.5">
                {c.authorInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-surface-900">{c.author}</span>
                  <span className="text-[10px] text-surface-400">{c.role}</span>
                  <span className="text-[10px] text-surface-300">&middot;</span>
                  <span className="text-[10px] text-surface-400">{c.time}</span>
                </div>
                <p className="text-sm text-surface-600 mt-0.5 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full bg-surface-900 flex items-center justify-center text-[10px] font-semibold text-white shrink-0 mt-0.5">
          {(user?.displayName ?? 'Y').split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Write a comment..."
            className="input-field text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="btn-primary px-3"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
