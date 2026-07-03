import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';


const isServer = typeof window === 'undefined';
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

import { useAuthStore } from '@/store/authStore';
import {ApiErrorResponse} from "@/types/api";

// Request Interceptor: Attach JWT Token if present (client-side only)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!isServer) {
      const token = useAuthStore.getState().token;
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to normalize errors into strict ApiErrorResponse shape
export function normalizeError(error: any): ApiErrorResponse {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<any>;
    const response = axiosError.response;
    if (response) {
      const status = response.status;
      const data = response.data;

      // Case 1: Body is a string (e.g. invalid credentials)
      if (typeof data === 'string') {
        return { status, message: data };
      }

      // Case 2: Body is an object
      if (data && typeof data === 'object') {
        // If it has "error" key
        if ('error' in data && typeof data.error === 'string') {
          return { status, message: data.error };
        }
        // If it has "message" key
        if ('message' in data && typeof data.message === 'string') {
          return { status, message: data.message };
        }
        // If it is field-level validation errors Map<String, String>
        const keys = Object.keys(data);
        const isValidationMap = keys.length > 0 && keys.every(k => typeof data[k] === 'string');
        if (isValidationMap) {
          return {
            status,
            message: 'Validation failed',
            errors: data as Record<string, string>,
          };
        }
      }

      return { status, message: axiosError.message || 'An error occurred' };
    }
  }

  // Handle request setup or network failure
  return {
    status: 500,
    message: error.message || 'Network error or server unreachable',
  };
}
// Response Interceptor: Normalize errors and handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized handling on client-side
    if (error.response && error.response.status === 401) {
      if (!isServer) {
        useAuthStore.getState().clearSession();

        // Prevent redirect loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }

    // Always reject with normalized error shape
    return Promise.reject(normalizeError(error));
  }
);
