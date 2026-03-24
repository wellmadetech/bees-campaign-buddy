import apiClient from './client';

export async function listTemplates(filters?: { campaignTypeId?: string; channel?: string }) {
  const { data } = await apiClient.get('/templates', { params: filters });
  return data.data;
}

export async function getTemplate(id: string) {
  const { data } = await apiClient.get(`/templates/${id}`);
  return data.data;
}

export async function createTemplate(input: {
  name: string;
  channel: string;
  contentJson: Record<string, unknown>;
  campaignTypeId?: string;
  brazeTemplateId?: string;
  thumbnailUrl?: string;
}) {
  const { data } = await apiClient.post('/templates', input);
  return data.data;
}

export async function updateTemplate(id: string, input: Record<string, unknown>) {
  const { data } = await apiClient.patch(`/templates/${id}`, input);
  return data.data;
}

export async function deleteTemplate(id: string) {
  await apiClient.delete(`/templates/${id}`);
}
