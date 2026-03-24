import apiClient from './client';
import type {
  CreateCampaignRequest,
  UpdateCampaignRequest,
  TransitionCampaignRequest,
  CampaignListFilters,
} from '@campaignbuddy/shared';

export async function listCampaigns(filters?: CampaignListFilters) {
  const { data } = await apiClient.get('/campaigns', { params: filters });
  return data;
}

export async function getCampaign(id: string) {
  const { data } = await apiClient.get(`/campaigns/${id}`);
  return data.data;
}

export async function createCampaign(input: CreateCampaignRequest) {
  const { data } = await apiClient.post('/campaigns', input);
  return data.data;
}

export async function updateCampaign(id: string, input: UpdateCampaignRequest) {
  const { data } = await apiClient.patch(`/campaigns/${id}`, input);
  return data.data;
}

export async function submitCampaign(id: string) {
  const { data } = await apiClient.post(`/campaigns/${id}/submit`);
  return data.data;
}

export async function transitionCampaign(id: string, input: TransitionCampaignRequest) {
  const { data } = await apiClient.post(`/campaigns/${id}/transition`, input);
  return data.data;
}

export async function duplicateCampaign(id: string, targetBranchId?: string) {
  const { data } = await apiClient.post(`/campaigns/${id}/duplicate`, { targetBranchId });
  return data.data;
}

export async function deleteCampaign(id: string) {
  await apiClient.delete(`/campaigns/${id}`);
}

export async function getCampaignHistory(id: string) {
  const { data } = await apiClient.get(`/campaigns/${id}/history`);
  return data.data;
}

export async function getOrchestrationStatus(id: string) {
  const { data } = await apiClient.get(`/campaigns/${id}/orchestration`);
  return data.data;
}
