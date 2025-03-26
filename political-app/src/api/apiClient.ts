/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/apiClient.ts
import axios from 'axios';
import { getToken, setToken } from '@/utils/tokenUtils';

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

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
  retry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

// Extended request config with retry flag
interface ExtendedRequestConfig {
  url: string;  // Make url required, not optional
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  _retry?: boolean;
  [key: string]: any;
}

// Token refresh state tracking
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: Error) => void }[] = [];

// Process the queue of failed requests
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
    autoRefreshToken: true,
    retry: false,
    retryDelay: 1000,
    maxRetries: 1
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
    (config) => {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
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
      async (error) => {
        // Check if error has a response
        const errorWithResponse = error && error.response;
        const originalRequest = error.config as ExtendedRequestConfig;
        
        // Only attempt refresh on 401 errors with a config and no _retry flag
        if (errorWithResponse?.status === 401 && originalRequest && !originalRequest._retry) {
          if (isRefreshing) {
            // If already refreshing, add to queue
            return new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return instance(originalRequest);
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
            setToken(newToken);
            
            // Update header for the original request
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // Process queued requests with new token
            processQueue(null, newToken);
            
            return instance(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError instanceof Error ? refreshError : new Error('Unknown refresh error'));
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        // Add retry logic for network issues
        const isNetworkOrServerError = 
          error.code === 'ECONNABORTED' || 
          (error.message && (
            error.message.includes('timeout') || 
            error.message.includes('Network Error')
          )) || 
          (errorWithResponse && errorWithResponse.status >= 500);
            
        if (config.retry && !originalRequest._retry && isNetworkOrServerError) {
          
          originalRequest._retry = true;
          
          return new Promise((resolve) => {
            setTimeout(() => resolve(instance(originalRequest)), config.retryDelay);
          });
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  return instance;
};

/**
 * Helper function to extract error messages from API errors
 */
export const getErrorMessage = (error: unknown): string => {
  // Type guard for error with response
  const hasResponse = (err: unknown): err is { 
    response?: { 
      data?: { message?: string },
      status?: number,
      statusText?: string
    },
    message?: string
  } => {
    return typeof err === 'object' && 
           err !== null && 
           'response' in err;
  };

  if (hasResponse(error)) {
    // Handle errors with response
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response) {
      return `Request failed with status ${error.response.status || 'unknown'}: ${error.response.statusText || 'Unknown error'}`;
    }
    
    if (error.message) {
      if (typeof error.message === 'string') {
        if (error.message.includes('timeout')) {
          return 'Request timed out. Please try again.';
        }
        
        if (error.message.includes('Network Error')) {
          return 'Network error. Please check your connection.';
        }
        
        return error.message;
      }
    }
  }
  
  // Handle non-response errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Create default API clients
export const apiClient = createApiClient();

// Create a more resilient client for non-critical operations
export const resilientApiClient = createApiClient({
  timeout: 30000,
  retry: true,
  retryDelay: 1000,
  maxRetries: 2
});

// Simplified fetch with token function (for backward compatibility if needed)
export const fetchWithToken = async (
  endpoint: string,
  method = "GET",
  body?: unknown,
  expectTextResponse = false
) => {
  try {
    const config: ExtendedRequestConfig = {
      method,
      url: endpoint
    };
    
    if (body) {
      config.data = body;
    }
    
    const response = await apiClient(config);
    return expectTextResponse ? response.data : response.data;
  } catch (error) {
    console.error("API request failed:", error);
    return null;
  }
};