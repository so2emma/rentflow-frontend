import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { TenantResponse } from '@/types/api';

/**
 * Get all tenants. Exposes a list of TenantResponse.
 */
export async function getTenants(config?: AxiosRequestConfig): Promise<TenantResponse[]> {
  const response = await apiClient.get<TenantResponse[]>('/api/v1/tenants', config);
  return response.data;
}
