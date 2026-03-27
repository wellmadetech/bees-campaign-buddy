// --- Enums / Union Types ---

export type TouchpointChannel = 'push' | 'email' | 'in_app' | 'content_card' | 'sms' | 'whatsapp';

export type ConversionType = 'page_visit' | 'add_to_cart' | 'order';

export type EventType = 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed';

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'position';

// --- Query Filters ---

export interface AnalyticsFilters {
  branchId?: string;
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
  channels?: TouchpointChannel[];
  model?: AttributionModel;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

// --- Channel Mix ---

export interface ChannelMixResult {
  channelCombo: TouchpointChannel[];
  comboLabel: string;
  pocCount: number;
  conversions: number;
  conversionRate: number;
  avgRevenue: number;
  totalRevenue: number;
}

// --- Funnel / Journey ---

export interface FunnelStep {
  channel: TouchpointChannel;
  eventType: EventType;
  count: number;
  dropOffRate: number;
}

export interface FunnelSequence {
  sequence: TouchpointChannel[];
  sequenceLabel: string;
  pocCount: number;
  conversions: number;
  conversionRate: number;
  avgTouchpoints: number;
  steps: FunnelStep[];
}

// --- Attribution ---

export interface ChannelAttribution {
  channel: TouchpointChannel;
  attributedConversions: number;
  attributedRevenue: number;
  percentOfTotal: number;
  avgTouchesBeforeConversion: number;
}

// --- Campaign Metrics ---

export interface CampaignMetricsSummary {
  campaignId: string;
  campaignTitle: string;
  channel: TouchpointChannel;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
  openRate: number;
  ctr: number;
}

export interface CampaignMetricsTimeSeries {
  date: string;
  channel: TouchpointChannel;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
}

// --- Overview ---

export interface AnalyticsOverview {
  totalTouchpoints: number;
  totalConversions: number;
  totalRevenue: number;
  avgConversionRate: number;
  uniquePocs: number;
  topChannel: TouchpointChannel;
  topChannelConversionRate: number;
  periodComparison: {
    touchpointsDelta: number;
    conversionsDelta: number;
    revenueDelta: number;
  };
}
