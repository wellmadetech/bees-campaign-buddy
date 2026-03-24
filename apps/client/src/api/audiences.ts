import apiClient from './client';
import type { CreateAudienceRequest } from '@campaignbuddy/shared';

export async function getAudience(campaignId: string) {
  const { data } = await apiClient.get(`/audiences/campaigns/${campaignId}`);
  return data.data;
}

export async function saveAudience(campaignId: string, input: CreateAudienceRequest) {
  const { data } = await apiClient.post(`/audiences/campaigns/${campaignId}`, input);
  return data.data;
}

export async function estimateAudience(criteriaJson: unknown) {
  const { data } = await apiClient.post('/audiences/estimate', { criteriaJson });
  return data.data;
}

export async function listSavedAudiences() {
  const { data } = await apiClient.get('/audiences/saved');
  return data.data;
}
