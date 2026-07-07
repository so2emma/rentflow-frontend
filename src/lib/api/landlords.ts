import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { LandlordResponse, LandlordProfileRequest } from '@/types/api';

/**
 * Fetch the current landlord's profile.
 */
export async function getLandlordProfile(config?: AxiosRequestConfig): Promise<LandlordResponse> {
  const response = await apiClient.get<LandlordResponse>('/api/v1/landlords/profile', config);
  return response.data;
}

/**
 * Update the current landlord's profile details.
 */
export async function updateLandlordProfile(
  payload: LandlordProfileRequest,
  config?: AxiosRequestConfig
): Promise<LandlordResponse> {
  const response = await apiClient.put<LandlordResponse>('/api/v1/landlords/profile', payload, config);
  return response.data;
}
