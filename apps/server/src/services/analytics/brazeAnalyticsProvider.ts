import type { AnalyticsFilters } from '@campaignbuddy/shared';
import type {
  AnalyticsDataProvider,
  TouchpointEventRow,
  ConversionRow,
  CampaignMetricsRow,
} from './analyticsDataProvider.js';

/**
 * Stub provider for when Braze API access is available.
 * Implement these methods to pull data from Braze's data_series
 * and campaign analytics endpoints.
 */
export class BrazeAnalyticsProvider implements AnalyticsDataProvider {
  async getTouchpointEvents(_filters: AnalyticsFilters): Promise<TouchpointEventRow[]> {
    throw new Error('Braze analytics provider not yet implemented. Set ANALYTICS_SOURCE=db to use local data.');
  }

  async getConversions(_filters: AnalyticsFilters): Promise<ConversionRow[]> {
    throw new Error('Braze analytics provider not yet implemented. Set ANALYTICS_SOURCE=db to use local data.');
  }

  async getCampaignMetrics(_filters: AnalyticsFilters): Promise<CampaignMetricsRow[]> {
    throw new Error('Braze analytics provider not yet implemented. Set ANALYTICS_SOURCE=db to use local data.');
  }
}
