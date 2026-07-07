import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { LeaseRequest, LeaseResponse, InboundTransactionDTO } from '@/types/api';

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
 * Get inbound transactions associated with the tenant's active lease.
 */
export async function getActiveLeaseTransactions(
  config?: AxiosRequestConfig
): Promise<InboundTransactionDTO[]> {
  const response = await apiClient.get<InboundTransactionDTO[]>(
    '/api/v1/leases/active/transactions',
    config
  );
  return response.data;
}

/**
 * Get a specific lease by its ID (for landlords).
 */
export async function getLeaseById(id: string, config?: AxiosRequestConfig): Promise<LeaseResponse> {
  const response = await apiClient.get<LeaseResponse>(`/api/v1/leases/${id}`, config);
  return response.data;
}

/**
 * Approve a pending lease by its ID (for tenants).
 */
export async function approveLease(id: string, config?: AxiosRequestConfig): Promise<LeaseResponse> {
  const response = await apiClient.post<LeaseResponse>(`/api/v1/leases/${id}/approve`, null, config);
  return response.data;
}

/**
 * Reject a pending lease by its ID (for tenants).
 */
export async function rejectLease(id: string, config?: AxiosRequestConfig): Promise<void> {
  await apiClient.post(`/api/v1/leases/${id}/reject`, null, config);
}

/**
 * Contest a pending lease by its ID (for tenants).
 */
export async function contestLease(id: string, reason: string, config?: AxiosRequestConfig): Promise<void> {
  await apiClient.post(`/api/v1/leases/${id}/contest`, { reason }, config);
}

/**
 * Resubmit a contested lease with new ledgers (for landlords).
 */
export async function resubmitLease(id: string, ledgers: import('@/types/api').LedgerEntryRequest[], config?: AxiosRequestConfig): Promise<void> {
  await apiClient.put(`/api/v1/leases/${id}/resubmit`, ledgers, config);
}

/**
 * Download tenant statement for active lease as a CSV blob.
 */
export async function downloadTenantStatement(
  startDate: string,
  endDate: string,
  config?: AxiosRequestConfig
): Promise<Blob> {
  const response = await apiClient.get<Blob>('/api/v1/leases/active/statements/download', {
    ...config,
    params: { startDate, endDate, ...config?.params },
    responseType: 'blob',
  });
  return response.data;
}

