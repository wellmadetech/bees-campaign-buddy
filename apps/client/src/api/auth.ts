import apiClient from './client';

export async function loginWithSso(ssoId: string) {
  const { data } = await apiClient.post('/auth/sso/callback', { ssoId });
  return data.data;
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
}
