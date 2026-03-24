import apiClient from './client';
import type { CreateUserRequest, UpdateUserRequest } from '@campaignbuddy/shared';

export async function listUsers() {
  const { data } = await apiClient.get('/users');
  return data.data;
}

export async function createUser(input: CreateUserRequest) {
  const { data } = await apiClient.post('/users', input);
  return data.data;
}

export async function updateUser(id: string, input: UpdateUserRequest) {
  const { data } = await apiClient.patch(`/users/${id}`, input);
  return data.data;
}

export async function deactivateUser(id: string) {
  await apiClient.delete(`/users/${id}`);
}
