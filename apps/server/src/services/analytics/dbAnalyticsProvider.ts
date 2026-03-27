import { eq, and, gte, lte, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { touchpointEvents, conversions, campaignMetrics } from '../../db/schema/analytics.js';
import type { AnalyticsFilters } from '@campaignbuddy/shared';
import type {
  AnalyticsDataProvider,
  TouchpointEventRow,
  ConversionRow,
  CampaignMetricsRow,
} from './analyticsDataProvider.js';

export class DbAnalyticsProvider implements AnalyticsDataProvider {
  async getTouchpointEvents(filters: AnalyticsFilters): Promise<TouchpointEventRow[]> {
    const conditions = [];

    if (filters.branchId) {
      conditions.push(eq(touchpointEvents.branchId, filters.branchId));
    }
    if (filters.campaignId) {
      conditions.push(eq(touchpointEvents.campaignId, filters.campaignId));
    }
    if (filters.dateFrom) {
      conditions.push(gte(touchpointEvents.occurredAt, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
      conditions.push(lte(touchpointEvents.occurredAt, new Date(filters.dateTo)));
    }
    if (filters.channels && filters.channels.length > 0) {
      conditions.push(inArray(touchpointEvents.channel, filters.channels));
    }

    const rows = await db
      .select()
      .from(touchpointEvents)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return rows as TouchpointEventRow[];
  }

  async getConversions(filters: AnalyticsFilters): Promise<ConversionRow[]> {
    const conditions = [];

    if (filters.branchId) {
      conditions.push(eq(conversions.branchId, filters.branchId));
    }
    if (filters.campaignId) {
      conditions.push(eq(conversions.campaignId, filters.campaignId));
    }
    if (filters.dateFrom) {
      conditions.push(gte(conversions.occurredAt, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
      conditions.push(lte(conversions.occurredAt, new Date(filters.dateTo)));
    }

    const rows = await db
      .select()
      .from(conversions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return rows as ConversionRow[];
  }

  async getCampaignMetrics(filters: AnalyticsFilters): Promise<CampaignMetricsRow[]> {
    const conditions = [];

    if (filters.branchId) {
      conditions.push(eq(campaignMetrics.branchId, filters.branchId));
    }
    if (filters.campaignId) {
      conditions.push(eq(campaignMetrics.campaignId, filters.campaignId));
    }
    if (filters.dateFrom) {
      conditions.push(gte(campaignMetrics.date, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(campaignMetrics.date, filters.dateTo));
    }
    if (filters.channels && filters.channels.length > 0) {
      conditions.push(inArray(campaignMetrics.channel, filters.channels));
    }

    const rows = await db
      .select()
      .from(campaignMetrics)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return rows as CampaignMetricsRow[];
  }
}
