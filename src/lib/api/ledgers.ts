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

/**
 * Get inbound transactions associated with a ledger entry.
 */
export async function getLedgerTransactions(
  ledgerId: string,
  config?: AxiosRequestConfig
): Promise<import('@/types/api').InboundTransactionDTO[]> {
  const response = await apiClient.get<import('@/types/api').InboundTransactionDTO[]>(
    `/api/v1/ledgers/${ledgerId}/transactions`,
    config
  );
  return response.data;
}
