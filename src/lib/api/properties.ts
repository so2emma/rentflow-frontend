import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { PropertyRequest, PropertyResponse, UnitRequest, UnitResponse } from '@/types/api';

/**
 * Get all properties associated with the current landlord.
 */
export async function getProperties(config?: AxiosRequestConfig): Promise<PropertyResponse[]> {
  const response = await apiClient.get<PropertyResponse[]>('/api/v1/properties', config);
  return response.data;
}

/**
 * Create a new property.
 */
export async function createProperty(
  data: PropertyRequest,
  config?: AxiosRequestConfig
): Promise<PropertyResponse> {
  const response = await apiClient.post<PropertyResponse>('/api/v1/properties', data, config);
  return response.data;
}

/**
 * Get all units associated with the current landlord.
 */
export async function getUnits(config?: AxiosRequestConfig): Promise<UnitResponse[]> {
  const response = await apiClient.get<UnitResponse[]>('/api/v1/properties/units', config);
  return response.data;
}

/**
 * Create a new unit under a specific property.
 */
export async function createUnit(
  propertyId: string,
  data: UnitRequest,
  config?: AxiosRequestConfig
): Promise<UnitResponse> {
  const response = await apiClient.post<UnitResponse>(
    `/api/v1/properties/${propertyId}/units`,
    data,
    config
  );
  return response.data;
}
