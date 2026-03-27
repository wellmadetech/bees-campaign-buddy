import type {
  AnalyticsFilters,
  ChannelMixResult,
  FunnelSequence,
  ChannelAttribution,
  AnalyticsOverview,
  CampaignMetricsTimeSeries,
  TouchpointChannel,
  FunnelStep,
  EventType,
} from '@campaignbuddy/shared';
import type { AnalyticsDataProvider, ConversionRow } from './analyticsDataProvider.js';
import { DbAnalyticsProvider } from './dbAnalyticsProvider.js';
import { BrazeAnalyticsProvider } from './brazeAnalyticsProvider.js';

function getProvider(): AnalyticsDataProvider {
  const source = process.env.ANALYTICS_SOURCE || 'db';
  if (source === 'braze') {
    return new BrazeAnalyticsProvider();
  }
  return new DbAnalyticsProvider();
}

const CHANNEL_LABELS: Record<string, string> = {
  push: 'Push',
  email: 'Email',
  in_app: 'In-App',
  content_card: 'Content Card',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
};

function formatChannelCombo(channels: string[]): string {
  return channels
    .map((ch) => CHANNEL_LABELS[ch] || ch)
    .sort()
    .join(' + ');
}

// --- Channel Mix ---

export async function getChannelMix(filters: AnalyticsFilters): Promise<ChannelMixResult[]> {
  const provider = getProvider();
  const events = await provider.getTouchpointEvents(filters);
  const allConversions = await provider.getConversions(filters);

  // Group events by POC → set of unique channels they were touched by
  const pocChannels = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.eventType === 'sent') {
      if (!pocChannels.has(event.pocId)) {
        pocChannels.set(event.pocId, new Set());
      }
      pocChannels.get(event.pocId)!.add(event.channel);
    }
  }

  // Build conversion lookup by POC
  const pocConversions = new Map<string, ConversionRow[]>();
  for (const conv of allConversions) {
    if (!pocConversions.has(conv.pocId)) {
      pocConversions.set(conv.pocId, []);
    }
    pocConversions.get(conv.pocId)!.push(conv);
  }

  // Group POCs by channel combo
  const comboMap = new Map<
    string,
    { channels: TouchpointChannel[]; pocs: Set<string>; conversions: number; revenue: number }
  >();

  for (const [pocId, channelSet] of pocChannels) {
    const sorted = Array.from(channelSet).sort();
    const key = sorted.join(',');

    if (!comboMap.has(key)) {
      comboMap.set(key, {
        channels: sorted as TouchpointChannel[],
        pocs: new Set(),
        conversions: 0,
        revenue: 0,
      });
    }

    const combo = comboMap.get(key)!;
    combo.pocs.add(pocId);

    const convs = pocConversions.get(pocId) || [];
    for (const conv of convs) {
      combo.conversions++;
      combo.revenue += parseFloat(conv.revenue || '0');
    }
  }

  const results: ChannelMixResult[] = Array.from(comboMap.values())
    .map((combo) => ({
      channelCombo: combo.channels,
      comboLabel: formatChannelCombo(combo.channels),
      pocCount: combo.pocs.size,
      conversions: combo.conversions,
      conversionRate: combo.pocs.size > 0 ? combo.conversions / combo.pocs.size : 0,
      avgRevenue: combo.conversions > 0 ? combo.revenue / combo.conversions : 0,
      totalRevenue: Math.round(combo.revenue * 100) / 100,
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate);

  return results;
}

// --- Funnel / Journey Analysis ---

export async function getFunnel(filters: AnalyticsFilters): Promise<FunnelSequence[]> {
  const provider = getProvider();
  const events = await provider.getTouchpointEvents(filters);
  const allConversions = await provider.getConversions(filters);

  // Build POC journeys: ordered sequence of (channel, eventType)
  const pocJourneys = new Map<string, Array<{ channel: string; eventType: string; occurredAt: Date }>>();
  for (const event of events) {
    if (!pocJourneys.has(event.pocId)) {
      pocJourneys.set(event.pocId, []);
    }
    pocJourneys.get(event.pocId)!.push({
      channel: event.channel,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
    });
  }

  // Sort each journey by time
  for (const journey of pocJourneys.values()) {
    journey.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  }

  // Extract unique channel sequence per POC (order of first "sent" per channel)
  const pocSequences = new Map<string, string[]>();
  for (const [pocId, journey] of pocJourneys) {
    const seen = new Set<string>();
    const seq: string[] = [];
    for (const step of journey) {
      if (step.eventType === 'sent' && !seen.has(step.channel)) {
        seen.add(step.channel);
        seq.push(step.channel);
      }
    }
    if (seq.length > 0) {
      pocSequences.set(pocId, seq);
    }
  }

  // Conversion lookup
  const convertedPocs = new Set<string>();
  for (const conv of allConversions) {
    convertedPocs.add(conv.pocId);
  }

  // Group by sequence pattern
  const sequenceMap = new Map<
    string,
    { sequence: string[]; pocs: string[]; conversions: number }
  >();

  for (const [pocId, seq] of pocSequences) {
    const key = seq.join(' → ');
    if (!sequenceMap.has(key)) {
      sequenceMap.set(key, { sequence: seq, pocs: [], conversions: 0 });
    }
    const entry = sequenceMap.get(key)!;
    entry.pocs.push(pocId);
    if (convertedPocs.has(pocId)) {
      entry.conversions++;
    }
  }

  // Build funnel steps for each sequence
  const results: FunnelSequence[] = Array.from(sequenceMap.values())
    .filter((s) => s.pocs.length >= 5) // only show sequences with meaningful sample size
    .map((entry) => {
      // Calculate step-by-step drop-off using actual event data
      const steps: FunnelStep[] = [];
      for (const channel of entry.sequence) {
        const eventCounts = { sent: 0, delivered: 0, opened: 0, clicked: 0 };
        for (const pocId of entry.pocs) {
          const journey = pocJourneys.get(pocId) || [];
          for (const step of journey) {
            if (step.channel === channel && step.eventType in eventCounts) {
              eventCounts[step.eventType as keyof typeof eventCounts]++;
            }
          }
        }

        // Add a step for the most relevant event (clicked > opened > delivered > sent)
        const eventOrder: EventType[] = ['sent', 'delivered', 'opened', 'clicked'];
        for (const et of eventOrder) {
          const count = eventCounts[et as keyof typeof eventCounts];
          if (count > 0) {
            const prevCount = steps.length > 0 ? steps[steps.length - 1]!.count : entry.pocs.length;
            steps.push({
              channel: channel as TouchpointChannel,
              eventType: et,
              count,
              dropOffRate: prevCount > 0 ? 1 - count / prevCount : 0,
            });
          }
        }
      }

      return {
        sequence: entry.sequence as TouchpointChannel[],
        sequenceLabel: entry.sequence.map((ch) => CHANNEL_LABELS[ch] || ch).join(' → '),
        pocCount: entry.pocs.length,
        conversions: entry.conversions,
        conversionRate: entry.pocs.length > 0 ? entry.conversions / entry.pocs.length : 0,
        avgTouchpoints: entry.sequence.length,
        steps,
      };
    })
    .sort((a, b) => b.pocCount - a.pocCount)
    .slice(0, 10); // top 10 sequences

  return results;
}

// --- Attribution ---

export async function getAttribution(filters: AnalyticsFilters): Promise<ChannelAttribution[]> {
  const provider = getProvider();
  const allConversions = await provider.getConversions(filters);
  const events = await provider.getTouchpointEvents(filters);
  const model = filters.model || 'position';

  // Build per-POC channel touch list for re-computation
  const pocTouches = new Map<string, string[]>();
  for (const event of events) {
    if (event.eventType === 'sent') {
      if (!pocTouches.has(event.pocId)) {
        pocTouches.set(event.pocId, []);
      }
      pocTouches.get(event.pocId)!.push(event.channel);
    }
  }

  const channelAttribution = new Map<
    string,
    { conversions: number; revenue: number; totalTouches: number }
  >();

  for (const conv of allConversions) {
    const revenue = parseFloat(conv.revenue || '0');
    let attribution: Record<string, number>;

    if (model === 'position' && conv.attributionJson) {
      // Use pre-computed position-based attribution
      attribution = conv.attributionJson as Record<string, number>;
    } else {
      // Compute on the fly based on model
      const touches = pocTouches.get(conv.pocId) || [];
      if (touches.length === 0) continue;

      attribution = {};
      const uniqueChannels = [...new Set(touches)];

      if (model === 'first_touch') {
        attribution[touches[0]!] = 1.0;
      } else if (model === 'last_touch') {
        attribution[touches[touches.length - 1]!] = 1.0;
      } else if (model === 'linear') {
        const weight = 1.0 / uniqueChannels.length;
        for (const ch of uniqueChannels) {
          attribution[ch] = weight;
        }
      } else {
        // position-based fallback
        if (touches.length === 1) {
          attribution[touches[0]!] = 1.0;
        } else {
          attribution[touches[0]!] = (attribution[touches[0]!] || 0) + 0.4;
          attribution[touches[touches.length - 1]!] = (attribution[touches[touches.length - 1]!] || 0) + 0.4;
          if (touches.length > 2) {
            const middleWeight = 0.2 / (touches.length - 2);
            for (let i = 1; i < touches.length - 1; i++) {
              attribution[touches[i]!] = (attribution[touches[i]!] || 0) + middleWeight;
            }
          }
        }
      }
    }

    // Accumulate attribution
    for (const [channel, weight] of Object.entries(attribution)) {
      if (!channelAttribution.has(channel)) {
        channelAttribution.set(channel, { conversions: 0, revenue: 0, totalTouches: 0 });
      }
      const entry = channelAttribution.get(channel)!;
      entry.conversions += weight;
      entry.revenue += revenue * weight;
    }
  }

  // Count total touches per channel
  for (const event of events) {
    if (event.eventType === 'sent') {
      if (!channelAttribution.has(event.channel)) {
        channelAttribution.set(event.channel, { conversions: 0, revenue: 0, totalTouches: 0 });
      }
      channelAttribution.get(event.channel)!.totalTouches++;
    }
  }

  const totalConversions = Array.from(channelAttribution.values()).reduce(
    (sum, e) => sum + e.conversions,
    0
  );

  const results: ChannelAttribution[] = Array.from(channelAttribution.entries())
    .map(([channel, data]) => ({
      channel: channel as TouchpointChannel,
      attributedConversions: Math.round(data.conversions * 100) / 100,
      attributedRevenue: Math.round(data.revenue * 100) / 100,
      percentOfTotal: totalConversions > 0 ? Math.round((data.conversions / totalConversions) * 10000) / 100 : 0,
      avgTouchesBeforeConversion:
        data.conversions > 0 ? Math.round((data.totalTouches / data.conversions) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.attributedRevenue - a.attributedRevenue);

  return results;
}

// --- Campaign Metrics ---

export async function getCampaignMetricsAggregated(
  filters: AnalyticsFilters
): Promise<CampaignMetricsTimeSeries[]> {
  const provider = getProvider();
  const metrics = await provider.getCampaignMetrics(filters);
  const granularity = filters.granularity || 'daily';

  // Group by date bucket + channel
  const bucketMap = new Map<
    string,
    {
      date: string;
      channel: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      conversions: number;
      revenue: number;
    }
  >();

  for (const row of metrics) {
    let bucketDate: string;
    const d = new Date(row.date);

    if (granularity === 'weekly') {
      // Round to start of week (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      bucketDate = monday.toISOString().split('T')[0]!;
    } else if (granularity === 'monthly') {
      bucketDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    } else {
      bucketDate = row.date;
    }

    const key = `${bucketDate}:${row.channel}`;
    if (!bucketMap.has(key)) {
      bucketMap.set(key, {
        date: bucketDate,
        channel: row.channel,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        conversions: 0,
        revenue: 0,
      });
    }

    const bucket = bucketMap.get(key)!;
    bucket.sent += row.sent;
    bucket.delivered += row.delivered;
    bucket.opened += row.opened;
    bucket.clicked += row.clicked;
    bucket.conversions += row.conversions;
    bucket.revenue += parseFloat(row.revenue);
  }

  return Array.from(bucketMap.values())
    .map((b) => ({
      date: b.date,
      channel: b.channel as TouchpointChannel,
      sent: b.sent,
      delivered: b.delivered,
      opened: b.opened,
      clicked: b.clicked,
      conversions: b.conversions,
      revenue: Math.round(b.revenue * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// --- Overview ---

export async function getOverview(filters: AnalyticsFilters): Promise<AnalyticsOverview> {
  const provider = getProvider();
  const metrics = await provider.getCampaignMetrics(filters);
  const allConversions = await provider.getConversions(filters);

  let totalSent = 0;
  let totalConversions = 0;
  let totalRevenue = 0;

  const channelSent = new Map<string, number>();
  const channelConversions = new Map<string, number>();

  for (const row of metrics) {
    totalSent += row.sent;
    totalConversions += row.conversions;
    totalRevenue += parseFloat(row.revenue);

    channelSent.set(row.channel, (channelSent.get(row.channel) || 0) + row.sent);
    channelConversions.set(
      row.channel,
      (channelConversions.get(row.channel) || 0) + row.conversions
    );
  }

  // Find unique POCs from conversions
  const uniquePocs = new Set(allConversions.map((c) => c.pocId));

  // Find top channel by conversion rate
  let topChannel: TouchpointChannel = 'push';
  let topRate = 0;
  for (const [channel, sent] of channelSent) {
    const convs = channelConversions.get(channel) || 0;
    const rate = sent > 0 ? convs / sent : 0;
    if (rate > topRate) {
      topRate = rate;
      topChannel = channel as TouchpointChannel;
    }
  }

  // Period comparison: split data in half by date to estimate trend
  const dates = metrics.map((m) => m.date).sort();
  const midpoint = dates[Math.floor(dates.length / 2)] || '';

  let firstHalfSent = 0,
    secondHalfSent = 0;
  let firstHalfConv = 0,
    secondHalfConv = 0;
  let firstHalfRev = 0,
    secondHalfRev = 0;

  for (const row of metrics) {
    if (row.date <= midpoint) {
      firstHalfSent += row.sent;
      firstHalfConv += row.conversions;
      firstHalfRev += parseFloat(row.revenue);
    } else {
      secondHalfSent += row.sent;
      secondHalfConv += row.conversions;
      secondHalfRev += parseFloat(row.revenue);
    }
  }

  const delta = (current: number, previous: number) =>
    previous > 0 ? Math.round(((current - previous) / previous) * 10000) / 100 : 0;

  return {
    totalTouchpoints: totalSent,
    totalConversions,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    avgConversionRate: totalSent > 0 ? Math.round((totalConversions / totalSent) * 10000) / 100 : 0,
    uniquePocs: uniquePocs.size,
    topChannel,
    topChannelConversionRate: Math.round(topRate * 10000) / 100,
    periodComparison: {
      touchpointsDelta: delta(secondHalfSent, firstHalfSent),
      conversionsDelta: delta(secondHalfConv, firstHalfConv),
      revenueDelta: delta(secondHalfRev, firstHalfRev),
    },
  };
}
