import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { TenantResponse, UpdateTenantProfileRequest } from '@/types/api';

/**
 * Get all tenants. Exposes a list of TenantResponse.
 */
export async function getTenants(config?: AxiosRequestConfig): Promise<TenantResponse[]> {
  const response = await apiClient.get<TenantResponse[]>('/api/v1/tenants', config);
  return response.data;
}

export async function getTenantProfile(): Promise<TenantResponse> {
  const response = await apiClient.get<TenantResponse>('/api/v1/tenants/profile');
  return response.data;
}

export async function updateTenantProfile(payload: UpdateTenantProfileRequest): Promise<TenantResponse> {
  const response = await apiClient.put<TenantResponse>('/api/v1/tenants/profile', payload);
  return response.data;
}
