import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { LeaseRequest, LeaseResponse } from '@/types/api';

/**
 * Get all leases associated with the landlord.
 */
export async function getLeases(config?: AxiosRequestConfig): Promise<LeaseResponse[]> {
  const response = await apiClient.get<LeaseResponse[]>('/api/v1/leases', config);
  return response.data;
}

/**
 * Create a new lease contract.
 */
export async function createLease(
  data: LeaseRequest,
  config?: AxiosRequestConfig
): Promise<LeaseResponse> {
  const response = await apiClient.post<LeaseResponse>('/api/v1/leases', data, config);
  return response.data;
}

/**
 * Get the current active lease of a tenant.
 */
export async function getActiveLease(config?: AxiosRequestConfig): Promise<LeaseResponse> {
  const response = await apiClient.get<LeaseResponse>('/api/v1/leases/active', config);
  return response.data;
}

/**
 * Get a specific lease by its ID (for landlords).
 */
export async function getLeaseById(id: string, config?: AxiosRequestConfig): Promise<LeaseResponse> {
  const response = await apiClient.get<LeaseResponse>(`/api/v1/leases/${id}`, config);
  return response.data;
}
