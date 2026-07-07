import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface ApiErrorResponse {
  status: number;
  code?: string;
  message: string;
  errors?: Record<string, string>;
}

const isServer = typeof window === 'undefined';

export const apiClient = axios.create({
  baseURL: isServer ? (process.env.BACKEND_API_URL || 'http://localhost:8080') : '',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
});

import { useAuthStore } from '@/store/authStore';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

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
  async (error) => {
    const originalRequest = error.config;
    
    // 401 Unauthorized handling on client-side
    if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/login')) {
      if (!isServer) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({resolve, reject});
          }).then(() => {
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(normalizeError(err));
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await axios.post('/api/auth/refresh', {}, { baseURL: apiClient.defaults.baseURL, withCredentials: true });
          isRefreshing = false;
          processQueue(null);
          return apiClient(originalRequest);
        } catch (err) {
          isRefreshing = false;
          processQueue(err);
          useAuthStore.getState().clearSession();
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
          return Promise.reject(normalizeError(error));
        }
      }
    }

    // Always reject with normalized error shape
    return Promise.reject(normalizeError(error));
  }
);
