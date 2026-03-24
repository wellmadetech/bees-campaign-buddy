import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Megaphone, MessageSquare, AlertTriangle, Check } from 'lucide-react';

interface Notification {
  id: string;
  type: 'status_change' | 'comment' | 'alert' | 'approval';
  title: string;
  message: string;
  campaignId?: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'status_change', title: 'Campaign Launched', message: 'Spring Beer Promo — Bud Light is now live', campaignId: 'demo-1', time: '5 min ago', read: false },
  { id: 'n2', type: 'comment', title: 'New Comment', message: 'Carmen Rodriguez commented on Holiday Closure Notice', campaignId: 'demo-2', time: '23 min ago', read: false },
  { id: 'n3', type: 'alert', title: 'Feedback Needed', message: 'Delivery Reroute — I-95 needs your attention', campaignId: 'demo-5', time: '1 hr ago', read: false },
  { id: 'n4', type: 'approval', title: 'Approved for Launch', message: 'New IPA Launch — Goose Island passed QA', campaignId: 'demo-3', time: '2 hrs ago', read: true },
  { id: 'n5', type: 'status_change', title: 'Campaign Submitted', message: 'Edge Recommendation — Stella Artois entered pipeline', campaignId: 'demo-8', time: '3 hrs ago', read: true },
  { id: 'n6', type: 'comment', title: 'New Comment', message: 'Dana Campbell replied on Cinco de Mayo campaign', campaignId: 'demo-4', time: '5 hrs ago', read: true },
];

const TYPE_ICONS = { status_change: Megaphone, comment: MessageSquare, alert: AlertTriangle, approval: Check };
const TYPE_COLORS = { status_change: 'text-info-600 bg-info-50', comment: 'text-brand-600 bg-brand-100', alert: 'text-danger-600 bg-danger-50', approval: 'text-success-600 bg-success-50' };

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (n: Notification) => {
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    if (n.campaignId) {
      setOpen(false);
      navigate(`/campaigns/${n.campaignId}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative btn-ghost p-2"
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl border border-surface-200 shadow-[--shadow-modal] z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <h3 className="text-[13px] font-semibold text-surface-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-brand-600 font-medium hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="btn-ghost p-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-surface-400">No notifications</div>
              ) : (
                notifications.map((n) => {
                  const Icon = TYPE_ICONS[n.type];
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-50 border-b border-surface-100/60 last:border-0 ${
                        !n.read ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLORS[n.type]}`}>
                        <Icon className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-surface-900">{n.title}</span>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5 truncate">{n.message}</p>
                        <span className="text-[11px] text-surface-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
