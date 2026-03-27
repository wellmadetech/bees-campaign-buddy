import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { STATUS_LABELS } from '@campaignbuddy/shared';
import type { CampaignStatus } from '@campaignbuddy/shared';
import { getStatusStyle } from '../utils/statusHelpers';
import { Plus, Search } from 'lucide-react';

interface TimelineCampaign {
  id: string;
  title: string;
  status: CampaignStatus;
  startDay: number;
  endDay: number;
  type: string;
}

interface WholesalerTimeline {
  name: string;
  code: string;
  campaigns: TimelineCampaign[];
}

const TIMELINE_DATA: Record<string, WholesalerTimeline[]> = {
  '2026-3': [
    {
      name: 'Northeast Distribution', code: 'NE-001',
      campaigns: [
        { id: 'ne-1', title: "St. Patrick's Day Promo", status: 'completed', startDay: 10, endDay: 20, type: 'Opt-in' },
        { id: 'ne-2', title: 'Bud Light Spring Push', status: 'active', startDay: 22, endDay: 31, type: 'Ad-hoc Sales' },
        { id: 'ne-3', title: 'Stella Artois Recommendation', status: 'completed', startDay: 3, endDay: 9, type: 'Edge-Algo' },
      ],
    },
    {
      name: 'Southeast Distribution', code: 'SE-001',
      campaigns: [
        { id: 'se-1', title: 'NPS Survey — Q1', status: 'completed', startDay: 1, endDay: 7, type: 'Lifecycle' },
        { id: 'se-2', title: 'Memorial Day Closure', status: 'completed', startDay: 18, endDay: 26, type: 'Ad-hoc Ops' },
      ],
    },
    {
      name: 'West Coast Distribution', code: 'WC-001',
      campaigns: [
        { id: 'wc-1', title: 'Delivery Reroute — I-5', status: 'needs_attention', startDay: 24, endDay: 28, type: 'Ad-hoc Ops' },
      ],
    },
    {
      name: 'Midwest Distribution', code: 'MW-001',
      campaigns: [
        { id: 'mw-1', title: 'Michelob Ultra Fitness', status: 'completed', startDay: 8, endDay: 22, type: 'Ad-hoc Sales' },
        { id: 'mw-2', title: 'Price Increase Notice', status: 'completed', startDay: 1, endDay: 4, type: 'Ad-hoc Ops' },
        { id: 'mw-3', title: 'Goose Island Craft Week', status: 'in_progress', startDay: 24, endDay: 31, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Southwest Distribution', code: 'SW-001',
      campaigns: [
        { id: 'sw-1', title: 'BEES Rewards Enrollment', status: 'completed', startDay: 5, endDay: 18, type: 'Opt-in' },
        { id: 'sw-2', title: 'Cinco de Mayo Prep — Corona', status: 'in_progress', startDay: 25, endDay: 31, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Pacific Northwest', code: 'PNW-001',
      campaigns: [
        { id: 'pnw-1', title: 'Craft Beer Week — Elysian', status: 'completed', startDay: 14, endDay: 21, type: 'Ad-hoc Sales' },
        { id: 'pnw-2', title: 'Rainy Season Seltzer Push', status: 'completed', startDay: 1, endDay: 10, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Great Lakes Region', code: 'GL-001',
      campaigns: [
        { id: 'gl-1', title: 'March Madness Bundle', status: 'active', startDay: 15, endDay: 31, type: 'Ad-hoc Sales' },
        { id: 'gl-2', title: 'Inventory Clearance — Winter SKUs', status: 'completed', startDay: 1, endDay: 8, type: 'Ad-hoc Ops' },
      ],
    },
    {
      name: 'Central Plains', code: 'CP-001',
      campaigns: [
        { id: 'cp-1', title: 'Natural Light 30pk Promo', status: 'completed', startDay: 10, endDay: 24, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Mountain West', code: 'MTN-001',
      campaigns: [
        { id: 'mtn-1', title: 'Ski Season Closeout', status: 'completed', startDay: 1, endDay: 15, type: 'Ad-hoc Sales' },
        { id: 'mtn-2', title: 'Spring Hiking Bundle', status: 'active', startDay: 20, endDay: 31, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Mid-Atlantic', code: 'MA-001',
      campaigns: [
        { id: 'ma-1', title: 'Bud Light Seltzer Variety', status: 'completed', startDay: 6, endDay: 19, type: 'Ad-hoc Sales' },
        { id: 'ma-2', title: 'Delivery Day Change Notice', status: 'completed', startDay: 20, endDay: 23, type: 'Ad-hoc Ops' },
        { id: 'ma-3', title: 'Corona Spring Promo', status: 'in_progress', startDay: 25, endDay: 31, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Gulf Coast', code: 'GC-001',
      campaigns: [
        { id: 'gc-1', title: 'Spring Break Party Packs', status: 'completed', startDay: 8, endDay: 22, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'New England', code: 'NEN-001',
      campaigns: [
        { id: 'nen-1', title: "St. Patrick's Day — Boston", status: 'completed', startDay: 10, endDay: 18, type: 'Opt-in' },
        { id: 'nen-2', title: 'Sam Adams Spring Lager', status: 'active', startDay: 22, endDay: 31, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Carolinas', code: 'CAR-001',
      campaigns: [
        { id: 'car-1', title: 'NASCAR Weekend Promo', status: 'active', startDay: 20, endDay: 28, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Florida Distribution', code: 'FL-001',
      campaigns: [
        { id: 'fl-1', title: 'Spring Break Seltzer Blitz', status: 'completed', startDay: 1, endDay: 14, type: 'Ad-hoc Sales' },
        { id: 'fl-2', title: 'Corona Beach Campaign', status: 'in_progress', startDay: 16, endDay: 28, type: 'Ad-hoc Sales' },
        { id: 'fl-3', title: 'Route Change — Miami', status: 'needs_attention', startDay: 28, endDay: 31, type: 'Ad-hoc Ops' },
      ],
    },
    {
      name: 'Texas Distribution', code: 'TX-001',
      campaigns: [
        { id: 'tx-1', title: 'Rodeo Season Bundle', status: 'completed', startDay: 1, endDay: 10, type: 'Ad-hoc Sales' },
        { id: 'tx-2', title: 'Lone Star Bud Light Promo', status: 'completed', startDay: 12, endDay: 25, type: 'Ad-hoc Sales' },
        { id: 'tx-3', title: 'Price Update Q2', status: 'scheduled', startDay: 29, endDay: 31, type: 'Ad-hoc Ops' },
      ],
    },
  ],
  '2026-4': [
    {
      name: 'Northeast Distribution', code: 'NE-001',
      campaigns: [
        { id: 'ne-a1', title: 'Bud Light Spring Push', status: 'active', startDay: 1, endDay: 8, type: 'Ad-hoc Sales' },
        { id: 'ne-a2', title: 'Easter Weekend Bundle', status: 'scheduled', startDay: 10, endDay: 14, type: 'Ad-hoc Sales' },
        { id: 'ne-a3', title: 'New IPA Launch — Goose Island', status: 'scheduled', startDay: 18, endDay: 30, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Southeast Distribution', code: 'SE-001',
      campaigns: [
        { id: 'se-a1', title: 'Cinco de Mayo Prep — Corona', status: 'scheduled', startDay: 20, endDay: 30, type: 'Ad-hoc Sales' },
        { id: 'se-a2', title: 'Spring Rewards Enrollment', status: 'scheduled', startDay: 5, endDay: 18, type: 'Opt-in' },
      ],
    },
    {
      name: 'West Coast Distribution', code: 'WC-001',
      campaigns: [
        { id: 'wc-a1', title: 'Corona Summer Push', status: 'scheduled', startDay: 1, endDay: 12, type: 'Ad-hoc Sales' },
        { id: 'wc-a2', title: 'Summer Kickoff Campaign', status: 'scheduled', startDay: 15, endDay: 30, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Midwest Distribution', code: 'MW-001',
      campaigns: [
        { id: 'mw-a1', title: 'Goose Island Craft Week', status: 'scheduled', startDay: 1, endDay: 5, type: 'Ad-hoc Sales' },
        { id: 'mw-a2', title: 'Bud Light Summer Teaser', status: 'scheduled', startDay: 14, endDay: 28, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Southwest Distribution', code: 'SW-001',
      campaigns: [
        { id: 'sw-a1', title: 'Cinco de Mayo — Corona Bundle', status: 'scheduled', startDay: 1, endDay: 5, type: 'Ad-hoc Sales' },
        { id: 'sw-a2', title: 'Tequila Pairing Promo', status: 'scheduled', startDay: 8, endDay: 20, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Pacific Northwest', code: 'PNW-001',
      campaigns: [
        { id: 'pnw-a1', title: 'Spring Seltzer Refresh', status: 'scheduled', startDay: 6, endDay: 18, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Great Lakes Region', code: 'GL-001',
      campaigns: [
        { id: 'gl-a1', title: 'MLB Opening Day Bundle', status: 'scheduled', startDay: 1, endDay: 7, type: 'Ad-hoc Sales' },
        { id: 'gl-a2', title: 'Earth Day Sustainability Push', status: 'scheduled', startDay: 20, endDay: 24, type: 'Lifecycle' },
      ],
    },
    {
      name: 'Mid-Atlantic', code: 'MA-001',
      campaigns: [
        { id: 'ma-a1', title: 'Corona Spring Promo', status: 'scheduled', startDay: 1, endDay: 10, type: 'Ad-hoc Sales' },
        { id: 'ma-a2', title: 'Cherry Blossom Festival Packs', status: 'scheduled', startDay: 12, endDay: 22, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Florida Distribution', code: 'FL-001',
      campaigns: [
        { id: 'fl-a1', title: 'Beach Season Seltzer Launch', status: 'scheduled', startDay: 1, endDay: 15, type: 'Ad-hoc Sales' },
        { id: 'fl-a2', title: 'Key West Bar Week', status: 'scheduled', startDay: 18, endDay: 25, type: 'Ad-hoc Sales' },
      ],
    },
    {
      name: 'Texas Distribution', code: 'TX-001',
      campaigns: [
        { id: 'tx-a1', title: 'Price Update Q2', status: 'scheduled', startDay: 1, endDay: 3, type: 'Ad-hoc Ops' },
        { id: 'tx-a2', title: 'Fiesta San Antonio Promo', status: 'scheduled', startDay: 10, endDay: 22, type: 'Ad-hoc Sales' },
        { id: 'tx-a3', title: 'Cinco de Mayo — Corona', status: 'scheduled', startDay: 25, endDay: 30, type: 'Ad-hoc Sales' },
      ],
    },
  ],
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_COLORS: Record<CampaignStatus, string> = {
  active: 'bg-success-500',
  in_progress: 'bg-brand-500',
  scheduled: 'bg-purple-500',
  completed: 'bg-surface-400',
  needs_attention: 'bg-danger-500',
  cancelled: 'bg-surface-300',
};

const STATUS_COLORS_LIGHT: Record<CampaignStatus, string> = {
  active: 'bg-success-50 border-success-200 text-success-700',
  in_progress: 'bg-brand-50 border-brand-200 text-brand-700',
  scheduled: 'bg-purple-50 border-purple-200 text-purple-700',
  completed: 'bg-surface-50 border-surface-200 text-surface-500',
  needs_attention: 'bg-danger-50 border-danger-200 text-danger-700',
  cancelled: 'bg-surface-50 border-surface-200 text-surface-400',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const DAY_WIDTH = 36; // px per day column

interface MonthDays {
  year: number;
  month: number;
  days: number;
  label: string;
}

function buildMonthRange(centerYear: number, centerMonth: number, range: number): MonthDays[] {
  const months: MonthDays[] = [];
  for (let offset = -range; offset <= range; offset++) {
    let y = centerYear;
    let m = centerMonth + offset;
    while (m < 0) { m += 12; y--; }
    while (m > 11) { m -= 12; y++; }
    months.push({
      year: y,
      month: m,
      days: getDaysInMonth(y, m),
      label: `${MONTH_NAMES[m]} ${y}`,
    });
  }
  return months;
}

function getWholesalersForMonth(year: number, month: number): WholesalerTimeline[] {
  const key = `${year}-${month + 1}`;
  return TIMELINE_DATA[key] ?? [];
}

// Merge wholesaler data across months into a single list with absolute day offsets
function mergeWholesalers(months: MonthDays[]) {
  const wholesalerMap = new Map<string, { name: string; code: string; campaigns: Array<TimelineCampaign & { absStart: number; absEnd: number }> }>();

  let dayOffset = 0;
  for (const m of months) {
    const wholesalers = getWholesalersForMonth(m.year, m.month);
    for (const w of wholesalers) {
      if (!wholesalerMap.has(w.code)) {
        wholesalerMap.set(w.code, { name: w.name, code: w.code, campaigns: [] });
      }
      const entry = wholesalerMap.get(w.code)!;
      for (const c of w.campaigns) {
        entry.campaigns.push({
          ...c,
          id: `${c.id}-${m.year}-${m.month}`,
          absStart: dayOffset + c.startDay - 1,
          absEnd: dayOffset + c.endDay - 1,
        });
      }
    }
    dayOffset += m.days;
  }

  return Array.from(wholesalerMap.values());
}

export function CalendarPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [hoveredCampaign, setHoveredCampaign] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const centerYear = 2026;
  const centerMonth = 2; // March
  const RANGE = 2; // 2 months before and after = 5 months total

  const months = buildMonthRange(centerYear, centerMonth, RANGE);
  const totalDays = months.reduce((s, m) => s + m.days, 0);
  const totalWidth = totalDays * DAY_WIDTH;

  const merged = mergeWholesalers(months);
  const filtered = merged.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate today's absolute position
  let todayAbsDay: number | null = null;
  {
    let offset = 0;
    for (const m of months) {
      if (m.year === today.getFullYear() && m.month === today.getMonth()) {
        todayAbsDay = offset + today.getDate() - 1;
        break;
      }
      offset += m.days;
    }
  }

  // Scroll to today on mount
  useEffect(() => {
    if (todayAbsDay !== null && scrollRef.current) {
      const scrollTo = todayAbsDay * DAY_WIDTH - scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollLeft = Math.max(0, scrollTo);
    }
  }, []);

  // Sync header scroll + update visible month label
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Sync header
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = el.scrollLeft;
    }

    // Determine visible month from center of viewport
    const centerX = el.scrollLeft + el.clientWidth / 2;
    const centerDay = Math.floor(centerX / DAY_WIDTH);
    let accum = 0;
    for (const m of months) {
      if (centerDay < accum + m.days) {
        setVisibleMonth(m.label);
        return;
      }
      accum += m.days;
    }
    setVisibleMonth(months[months.length - 1]?.label ?? '');
  }, [months]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  // Stack campaigns into lanes per wholesaler
  function buildLanes(campaigns: Array<TimelineCampaign & { absStart: number; absEnd: number }>) {
    const lanes: Array<Array<TimelineCampaign & { absStart: number; absEnd: number }>> = [];
    const sorted = [...campaigns].sort((a, b) => a.absStart - b.absStart);
    for (const campaign of sorted) {
      let placed = false;
      for (const lane of lanes) {
        if (campaign.absStart > lane[lane.length - 1]!.absEnd) {
          lane.push(campaign);
          placed = true;
          break;
        }
      }
      if (!placed) lanes.push([campaign]);
    }
    return lanes;
  }

  // Build day headers with month separators
  const dayHeaders: Array<{ day: number; isFirstOfMonth: boolean; monthLabel: string; isToday: boolean; isWeekend: boolean; absDay: number }> = [];
  {
    let absDay = 0;
    for (const m of months) {
      for (let d = 1; d <= m.days; d++) {
        const dow = new Date(m.year, m.month, d).getDay();
        dayHeaders.push({
          day: d,
          isFirstOfMonth: d === 1,
          monthLabel: MONTH_NAMES[m.month]!.slice(0, 3),
          isToday: absDay === todayAbsDay,
          isWeekend: dow === 0 || dow === 6,
          absDay,
        });
        absDay++;
      }
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-surface-900 tracking-tight">Campaign Timeline</h1>
          <p className="text-sm text-surface-500 mt-1">Scroll to navigate — see what's running across all wholesalers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search wholesaler..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs border border-surface-200 rounded-lg pl-8 pr-3 py-2 w-48 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          {user?.role !== 'content_creator' && (
            <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Sticky month label */}
        <div className="px-5 py-3 border-b border-surface-100 text-center">
          <h2 className="text-[15px] font-semibold text-surface-900">{visibleMonth}</h2>
        </div>

        {/* Day header row */}
        <div className="flex border-b border-surface-100">
          <div className="w-52 flex-shrink-0 px-4 py-2 border-r border-surface-100 bg-white">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Wholesaler</span>
          </div>
          <div
            ref={headerScrollRef}
            className="flex-1 overflow-hidden"
            style={{ pointerEvents: 'none' }}
          >
            <div className="flex" style={{ width: totalWidth }}>
              {dayHeaders.map((dh) => (
                <div
                  key={dh.absDay}
                  className={`text-center py-2 text-[10px] font-medium tabular-nums border-r ${
                    dh.isFirstOfMonth ? 'border-r-surface-300' : 'border-r-surface-100/40'
                  } ${
                    dh.isToday
                      ? 'bg-brand-50 font-bold text-brand-700'
                      : dh.isWeekend
                        ? 'text-surface-300'
                        : 'text-surface-400'
                  }`}
                  style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                >
                  {dh.isFirstOfMonth && (
                    <div className="text-[9px] font-semibold text-surface-500 uppercase">{dh.monthLabel}</div>
                  )}
                  {dh.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex">
          {/* Fixed wholesaler column */}
          <div className="w-52 flex-shrink-0 border-r border-surface-100 bg-white z-10">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-surface-400">
                {search ? `No match for "${search}"` : 'No campaigns'}
              </div>
            )}
            {filtered.map((wholesaler, wi) => {
              const lanes = buildLanes(wholesaler.campaigns);
              return (
                <div
                  key={wholesaler.code}
                  className={`px-4 py-3 flex flex-col justify-center ${wi < filtered.length - 1 ? 'border-b border-surface-100' : ''}`}
                  style={{ minHeight: Math.max(lanes.length * 28 + 8, 44) }}
                >
                  <div className="text-sm font-medium text-surface-900">{wholesaler.name}</div>
                  <div className="text-[11px] text-surface-400">{wholesaler.code} · {wholesaler.campaigns.length} campaign{wholesaler.campaigns.length !== 1 ? 's' : ''}</div>
                </div>
              );
            })}
          </div>

          {/* Scrollable timeline */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto"
            onScroll={handleScroll}
          >
            <div style={{ width: totalWidth }}>
              {filtered.map((wholesaler, wi) => {
                const lanes = buildLanes(wholesaler.campaigns);
                return (
                  <div
                    key={wholesaler.code}
                    className={`relative py-2 ${wi < filtered.length - 1 ? 'border-b border-surface-100' : ''}`}
                    style={{ minHeight: Math.max(lanes.length * 28 + 8, 44) }}
                  >
                    {/* Month separator lines */}
                    {(() => {
                      let offset = 0;
                      return months.slice(0, -1).map((m) => {
                        offset += m.days;
                        return (
                          <div
                            key={`sep-${m.year}-${m.month}`}
                            className="absolute top-0 bottom-0 w-px bg-surface-200"
                            style={{ left: offset * DAY_WIDTH }}
                          />
                        );
                      });
                    })()}

                    {/* Today marker */}
                    {todayAbsDay !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-brand-400 z-10"
                        style={{ left: (todayAbsDay + 0.5) * DAY_WIDTH }}
                      />
                    )}

                    {/* Campaign bars */}
                    {lanes.map((lane, laneIdx) =>
                      lane.map((campaign) => {
                        const left = campaign.absStart * DAY_WIDTH;
                        const width = (campaign.absEnd - campaign.absStart + 1) * DAY_WIDTH;
                        const isHovered = hoveredCampaign === campaign.id;
                        const isDimmed = hoveredCampaign && !isHovered;

                        return (
                          <div
                            key={campaign.id}
                            className={`absolute rounded-md cursor-pointer transition-all duration-150 flex items-center overflow-hidden ${STATUS_COLORS[campaign.status]} ${
                              isDimmed ? 'opacity-30' : isHovered ? 'opacity-100 ring-2 ring-surface-900/20' : 'opacity-80 hover:opacity-100'
                            }`}
                            style={{
                              left,
                              width: Math.max(width, DAY_WIDTH),
                              top: laneIdx * 28 + 4,
                              height: 22,
                            }}
                            title={`${campaign.title}\n${campaign.type} · ${STATUS_LABELS[campaign.status]}`}
                            onClick={() => navigate(`/campaigns/${campaign.id}`)}
                            onMouseEnter={() => setHoveredCampaign(campaign.id)}
                            onMouseLeave={() => setHoveredCampaign(null)}
                          >
                            <span className="text-[10px] font-medium text-white px-2 truncate">
                              {campaign.title}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4 px-1">
        {(['active', 'in_progress', 'scheduled', 'needs_attention', 'completed'] as CampaignStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_COLORS[status]}`} />
            <span className="text-xs text-surface-500">{STATUS_LABELS[status]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-px h-3 bg-brand-400" />
          <span className="text-xs text-surface-500">Today</span>
        </div>
      </div>
    </div>
  );
}
