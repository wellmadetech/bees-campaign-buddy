import { brazeClient } from './brazeClient.js';
import type {
  BrazeCampaignCreateParams,
  BrazeCampaignResponse,
  BrazeCampaignDetails,
  BrazeSegmentCreateParams,
  BrazeSegmentResponse,
  BrazeTemplateInfo,
} from './types.js';

export async function createCampaign(
  params: BrazeCampaignCreateParams,
): Promise<BrazeCampaignResponse> {
  const { data } = await brazeClient.post('/campaigns/create', params);
  return data;
}

export async function updateCampaign(
  campaignId: string,
  params: Partial<BrazeCampaignCreateParams>,
): Promise<void> {
  await brazeClient.post('/campaigns/update', { campaign_id: campaignId, ...params });
}

export async function getCampaignDetails(
  campaignId: string,
): Promise<BrazeCampaignDetails> {
  const { data } = await brazeClient.get('/campaigns/details', {
    params: { campaign_id: campaignId },
  });
  return data;
}

export async function stopCampaign(campaignId: string): Promise<void> {
  await brazeClient.post('/campaigns/trigger/send', {
    campaign_id: campaignId,
    send_to_existing_only: false,
    trigger_properties: { __stop: true },
  });
}

export async function createSegment(
  params: BrazeSegmentCreateParams,
): Promise<BrazeSegmentResponse> {
  const { data } = await brazeClient.post('/segments/create', params);
  return data;
}

export async function listTemplates(): Promise<BrazeTemplateInfo[]> {
  const { data } = await brazeClient.get('/templates/email/list');
  return data.templates ?? [];
}

export async function getTemplateInfo(
  templateId: string,
): Promise<BrazeTemplateInfo> {
  const { data } = await brazeClient.get('/templates/email/info', {
    params: { template_id: templateId },
  });
  return data;
}

export async function triggerCampaignSend(
  campaignId: string,
  segmentId?: string,
): Promise<void> {
  await brazeClient.post('/campaigns/trigger/send', {
    campaign_id: campaignId,
    ...(segmentId ? { segment_id: segmentId } : {}),
  });
}

export async function getCampaignAnalytics(campaignId: string) {
  const { data } = await brazeClient.get('/campaigns/data_series', {
    params: { campaign_id: campaignId, length: 30 },
  });
  return data;
}
