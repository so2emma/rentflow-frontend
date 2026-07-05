import { apiClient } from './client';
import type { RevenueDashboardDTO } from '@/types/api';

export async function getRevenueDashboard(): Promise<RevenueDashboardDTO> {
  const response = await apiClient.get<RevenueDashboardDTO>('/api/dashboard/revenue');
  return response.data;
}
