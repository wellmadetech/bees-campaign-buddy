import apiClient from './client';

export async function listBranches() {
  const { data } = await apiClient.get('/branches');
  return data.data;
}
