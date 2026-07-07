import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { SplitPayoutResponse } from '@/types/api';

/**
 * Get the history of split payouts for the logged-in landlord.
 */
export async function getPayouts(config?: AxiosRequestConfig): Promise<SplitPayoutResponse[]> {
  const response = await apiClient.get<SplitPayoutResponse[]>('/api/landlords/payouts', config);
  return response.data;
}

/**
 * Download landlord statement as a CSV blob.
 */
export async function downloadLandlordStatement(
  startDate: string,
  endDate: string,
  config?: AxiosRequestConfig
): Promise<Blob> {
  const response = await apiClient.get<Blob>('/api/landlords/statements/download', {
    ...config,
    params: { startDate, endDate, ...config?.params },
    responseType: 'blob',
  });
  return response.data;
}

