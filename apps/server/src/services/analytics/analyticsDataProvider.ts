import type { AnalyticsFilters } from '@campaignbuddy/shared';

export interface TouchpointEventRow {
  id: string;
  campaignId: string;
  branchId: string;
  channel: string;
  eventType: string;
  pocId: string;
  sequencePosition: number;
  occurredAt: Date;
}

export interface ConversionRow {
  id: string;
  pocId: string;
  campaignId: string | null;
  branchId: string;
  conversionType: string;
  revenue: string | null;
  productSku: string | null;
  productName: string | null;
  occurredAt: Date;
  attributionJson: Record<string, number> | null;
}

export interface CampaignMetricsRow {
  id: string;
  campaignId: string;
  branchId: string;
  channel: string;
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: string;
}

export interface AnalyticsDataProvider {
  getTouchpointEvents(filters: AnalyticsFilters): Promise<TouchpointEventRow[]>;
  getConversions(filters: AnalyticsFilters): Promise<ConversionRow[]>;
  getCampaignMetrics(filters: AnalyticsFilters): Promise<CampaignMetricsRow[]>;
}
