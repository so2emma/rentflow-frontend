import { AxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import {SignUpRequest} from "@/model/request/auth/SignUpRequest";
import {SignUpResponse} from "@/model/response/auth/SignUpResponse";
import {LoginRequest} from "@/model/request/auth/LoginRequest";
import {LoginResponse} from "@/model/response/auth/LoginResponse";

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
