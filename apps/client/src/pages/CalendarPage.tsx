import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { STATUS_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarCampaign {
  id: string;
  title: string;
  status: CampaignStatus;
  startDay: number;
  endDay: number;
  color: string;
}

const MONTH_CAMPAIGNS: Record<string, CalendarCampaign[]> = {
  '2026-3': [
    { id: 'demo-1', title: 'Spring Beer Promo — Bud Light', status: 'active', startDay: 20, endDay: 31, color: 'bg-success-500' },
    { id: 'demo-2', title: 'Holiday Closure — Memorial Day', status: 'in_progress', startDay: 15, endDay: 25, color: 'bg-brand-500' },
    { id: 'demo-5', title: 'Delivery Reroute — I-95', status: 'needs_attention', startDay: 24, endDay: 28, color: 'bg-danger-500' },
    { id: 'demo-8', title: 'Edge Rec — Stella Artois', status: 'in_progress', startDay: 10, endDay: 18, color: 'bg-info-500' },
  ],
  '2026-4': [
    { id: 'demo-1', title: 'Spring Beer Promo — Bud Light', status: 'active', startDay: 1, endDay: 15, color: 'bg-success-500' },
    { id: 'demo-3', title: 'New IPA Launch — Goose Island', status: 'scheduled', startDay: 1, endDay: 14, color: 'bg-warn-500' },
    { id: 'demo-4', title: 'Cinco de Mayo — Corona Bundle', status: 'in_progress', startDay: 28, endDay: 30, color: 'bg-surface-400' },
    { id: 'c-new1', title: 'Spring Seltzer Push', status: 'in_progress', startDay: 7, endDay: 20, color: 'bg-surface-400' },
  ],
  '2026-5': [
    { id: 'demo-4', title: 'Cinco de Mayo — Corona Bundle', status: 'in_progress', startDay: 1, endDay: 5, color: 'bg-surface-400' },
    { id: 'demo-2', title: 'Holiday Closure — Memorial Day', status: 'in_progress', startDay: 20, endDay: 26, color: 'bg-brand-500' },
    { id: 'c-new2', title: 'Summer Kickoff Campaign', status: 'in_progress', startDay: 15, endDay: 31, color: 'bg-surface-400' },
  ],
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // March (0-indexed)
  const [hoveredCampaign, setHoveredCampaign] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const key = `${year}-${month + 1}`;
  const campaigns = MONTH_CAMPAIGNS[key] ?? [];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const getCampaignsForDay = (day: number) => campaigns.filter((c) => day >= c.startDay && day <= c.endDay);

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Campaign Calendar</h1>
          <p className="text-sm text-surface-500 mt-1">Visualize your campaign schedule</p>
        </div>
        {user?.role !== 'content_creator' && (
          <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        )}
      </div>

      {/* Month navigation */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
          <h2 className="text-[15px] font-semibold text-surface-900">{MONTH_NAMES[month]} {year}</h2>
          <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-surface-100">
          {DAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayCampaigns = day ? getCampaignsForDay(day) : [];
            return (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r border-surface-100/60 p-1.5 ${
                  !day ? 'bg-surface-50/50' : 'bg-white hover:bg-surface-50/50'
                } ${i % 7 === 0 ? 'border-l-0' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday(day) ? 'bg-brand-500 text-white' : 'text-surface-500'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayCampaigns.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                          onMouseEnter={() => setHoveredCampaign(c.id)}
                          onMouseLeave={() => setHoveredCampaign(null)}
                          className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded cursor-pointer transition-opacity truncate ${c.color} ${
                            hoveredCampaign && hoveredCampaign !== c.id ? 'opacity-40' : 'opacity-90 hover:opacity-100'
                          }`}
                          title={c.title}
                        >
                          {day === c.startDay ? c.title : ''}
                        </div>
                      ))}
                      {dayCampaigns.length > 3 && (
                        <div className="text-[10px] text-surface-400 px-1">+{dayCampaigns.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 px-1">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-2 text-xs cursor-pointer transition-opacity ${
              hoveredCampaign && hoveredCampaign !== c.id ? 'opacity-40' : ''
            }`}
            onMouseEnter={() => setHoveredCampaign(c.id)}
            onMouseLeave={() => setHoveredCampaign(null)}
            onClick={() => navigate(`/campaigns/${c.id}`)}
          >
            <div className={`w-2.5 h-2.5 rounded-sm ${c.color}`} />
            <span className="text-surface-600 truncate max-w-[180px]">{c.title}</span>
            <span className={`badge text-[9px] ${getStatusStyle(c.status)}`}>{STATUS_LABELS[c.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
