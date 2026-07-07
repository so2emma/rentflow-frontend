import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { SignUpRequest, SignUpResponse, LoginRequest, LoginResponse } from '@/types/api';

/**
 * Register a new user (tenant, landlord, or admin).
 */
export async function signUp(
  data: SignUpRequest,
  config?: AxiosRequestConfig
): Promise<SignUpResponse> {
  const response = await apiClient.post<SignUpResponse>('/api/auth/signup', data, config);
  return response.data;
}

/**
 * Authenticate a user and receive a JWT token.
 */
export async function login(
  data: LoginRequest,
  config?: AxiosRequestConfig
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', data, config);
  return response.data;
}

/**
 * Logout the user, expiring their session cookie.
 */
export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout', {});
}
