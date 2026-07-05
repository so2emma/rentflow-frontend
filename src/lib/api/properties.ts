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
 * Get a specific property.
 */
export async function getProperty(
  propertyId: string,
  config?: AxiosRequestConfig
): Promise<PropertyResponse> {
  const response = await apiClient.get<PropertyResponse>(`/api/v1/properties/${propertyId}`, config);
  return response.data;
}

/**
 * Update an existing property
 */
export async function updateProperty(
  id: string, 
  data: PropertyRequest,
  config?: AxiosRequestConfig
): Promise<PropertyResponse> {
  const response = await apiClient.put<PropertyResponse>(`/api/v1/properties/${id}`, data, config);
  return response.data;
}

/**
 * Get inbound transactions for a property
 */
export async function getPropertyTransactions(
  propertyId: string,
  config?: AxiosRequestConfig
): Promise<import('@/types/api').InboundTransactionDTO[]> {
  const response = await apiClient.get<import('@/types/api').InboundTransactionDTO[]>(
    `/api/v1/properties/${propertyId}/transactions`,
    config
  );
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

/**
 * Get a specific unit.
 */
export async function getUnit(
  unitId: string,
  config?: AxiosRequestConfig
): Promise<UnitResponse> {
  const response = await apiClient.get<UnitResponse>(`/api/v1/properties/units/${unitId}`, config);
  return response.data;
}

/**
 * Update an existing unit. Only vacant units can be updated.
 */
export async function updateUnit(
  unitId: string,
  data: UnitRequest,
  config?: AxiosRequestConfig
): Promise<UnitResponse> {
  const response = await apiClient.put<UnitResponse>(
    `/api/v1/properties/units/${unitId}`,
    data,
    config
  );
  return response.data;
}

/**
 * Get all ledger entries for a specific property (for landlords).
 */
export async function getPropertyLedgers(
  propertyId: string,
  config?: AxiosRequestConfig
): Promise<import('@/types/api').LedgerEntryResponse[]> {
  const response = await apiClient.get<import('@/types/api').LedgerEntryResponse[]>(
    `/api/v1/properties/${propertyId}/ledgers`,
    config
  );
  return response.data;
}
