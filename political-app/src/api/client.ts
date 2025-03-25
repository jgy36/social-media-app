/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/client.ts
import axios from 'axios';
import { getToken } from '@/utils/tokenUtils';

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

// Type for API error responses
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

// Interface for token refresh
export interface TokenRefreshResponse {
  token: string;
}

// Options for creating an API client
export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
  autoRefreshToken?: boolean;
}

// Define our own Axios error type since the imported one is causing issues
interface CustomAxiosError extends Error {
  config?: any;
  code?: string;
  request?: any;
  response?: {
    data: any;
    status: number;
    statusText: string;
    headers: any;
    config: any;
  };
  isAxiosError: boolean;
}

// Add _retry property to AxiosRequestConfig
interface ExtendedRequestConfig {
  _retry?: boolean;
  headers?: Record<string, string>;
  [key: string]: any;
}

// Token refresh state tracking
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: Error) => void }[] = [];

/**
 * Process the queue of failed requests
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Create a configured axios instance for API requests
 */
export const createApiClient = (options: ApiClientOptions = {}) => {
  const defaultOptions: ApiClientOptions = {
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: false,
    autoRefreshToken: true
  };
  
  const config: ApiClientOptions = { ...defaultOptions, ...options };
  
  // Create the axios instance
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    withCredentials: config.withCredentials
  });
  
  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config: any) => {
      const token = getToken();
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor - handle token refresh
  if (config.autoRefreshToken) {
    instance.interceptors.response.use(
      (response) => response,
      async (error: any) => {
        const originalRequest = error.config as ExtendedRequestConfig;
        
        // Only attempt refresh on 401 errors with a config and no _retry flag
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (isRefreshing) {
            // If already refreshing, add to queue
            return new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              if (!originalRequest.headers) {
                originalRequest.headers = {};
              }
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return instance(originalRequest as any);
            }).catch(err => {
              return Promise.reject(err);
            });
          }
          
          // Mark request as retried and set refreshing flag
          originalRequest._retry = true;
          isRefreshing = true;
          
          // Attempt to refresh the token
          try {
            const token = getToken();
            
            if (!token) {
              processQueue(new Error('No token available'));
              return Promise.reject(error);
            }
            
            const refreshResponse = await axios.post<TokenRefreshResponse>(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const newToken = refreshResponse.data.token;
            
            if (!newToken) {
              processQueue(new Error('Token refresh failed'));
              return Promise.reject(error);
            }
            
            // Store the new token
            localStorage.setItem('token', newToken);
            
            // Update header for the original request
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // Process queued requests with new token
            processQueue(null, newToken);
            
            return instance(originalRequest as any);
          } catch (refreshError) {
            processQueue(refreshError as Error);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  return instance;
};

// Create default API client
export const apiClient = createApiClient();

// Create a more resilient client for non-critical operations
export const resilientApiClient = createApiClient({
  timeout: 30000
});

/**
 * Helper function to extract error messages from API errors
 */
export const getErrorMessage = (error: unknown): string => {
  // Type guard to check for axios errors
  const isAxiosError = (err: any): err is CustomAxiosError => {
    return err && err.isAxiosError === true;
  };

  if (isAxiosError(error)) {
    // Handle Axios errors
    const axiosError = error as CustomAxiosError;
    
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    if (axiosError.response) {
      return `Request failed with status ${axiosError.response.status}: ${axiosError.response.statusText}`;
    }
    
    if (axiosError.message) {
      if (axiosError.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      
      if (axiosError.message.includes('Network Error')) {
        return 'Network error. Please check your connection.';
      }
      
      return axiosError.message;
    }
  }
  
  // Handle non-Axios errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};