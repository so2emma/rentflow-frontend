import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { LedgerEntryResponse } from '@/types/api';

/**
 * Get all ledger entries for the active lease of a tenant.
 */
export async function getActiveLeaseLedgers(
  config?: AxiosRequestConfig
): Promise<LedgerEntryResponse[]> {
  const response = await apiClient.get<LedgerEntryResponse[]>(
    '/api/v1/leases/active/ledgers',
    config
  );
  return response.data;
}

/**
 * Get all ledger entries for a specific lease (for landlords).
 */
export async function getLedgersForLease(
  leaseId: string,
  config?: AxiosRequestConfig
): Promise<LedgerEntryResponse[]> {
  const response = await apiClient.get<LedgerEntryResponse[]>(
    `/api/v1/leases/${leaseId}/ledgers`,
    config
  );
  return response.data;
}
