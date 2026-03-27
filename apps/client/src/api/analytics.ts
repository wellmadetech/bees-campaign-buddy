import apiClient from './client';
import type {
  AnalyticsFilters,
  ChannelMixResult,
  FunnelSequence,
  ChannelAttribution,
  AnalyticsOverview,
  CampaignMetricsTimeSeries,
} from '@campaignbuddy/shared';

export async function getAnalyticsOverview(filters?: AnalyticsFilters) {
  const { data } = await apiClient.get<{ data: AnalyticsOverview }>('/analytics/overview', {
    params: flattenFilters(filters),
  });
  return data.data;
}

export async function getChannelMix(filters?: AnalyticsFilters) {
  const { data } = await apiClient.get<{ data: ChannelMixResult[] }>('/analytics/channel-mix', {
    params: flattenFilters(filters),
  });
  return data.data;
}

export async function getFunnel(filters?: AnalyticsFilters) {
  const { data } = await apiClient.get<{ data: FunnelSequence[] }>('/analytics/funnel', {
    params: flattenFilters(filters),
  });
  return data.data;
}

export async function getAttribution(filters?: AnalyticsFilters) {
  const { data } = await apiClient.get<{ data: ChannelAttribution[] }>('/analytics/attribution', {
    params: flattenFilters(filters),
  });
  return data.data;
}

export async function getCampaignMetrics(filters?: AnalyticsFilters) {
  const { data } = await apiClient.get<{ data: CampaignMetricsTimeSeries[] }>(
    '/analytics/campaign-metrics',
    { params: flattenFilters(filters) }
  );
  return data.data;
}

function flattenFilters(filters?: AnalyticsFilters): Record<string, string> | undefined {
  if (!filters) return undefined;
  const params: Record<string, string> = {};
  if (filters.branchId) params.branchId = filters.branchId;
  if (filters.campaignId) params.campaignId = filters.campaignId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.channels?.length) params.channels = filters.channels.join(',');
  if (filters.model) params.model = filters.model;
  if (filters.granularity) params.granularity = filters.granularity;
  return Object.keys(params).length > 0 ? params : undefined;
}
