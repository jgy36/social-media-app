// src/api/apiClient.ts - React Native version
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config'; // Add this import
import { getToken, isAuthenticated, setToken } from "@/utils/tokenUtils";
import {
  getErrorMessage,
  ApiError,
  hasResponseProperty,
  isNetworkError,
} from "@/utils/apiErrorHandler";
import { store } from "@/redux/store";

// API configuration - using React Native environment variables
export const API_BASE_URL = Config.API_BASE_URL || "http://localhost:8080/api";
export const BASE_URL = Config.BASE_URL || "http://localhost:8080";

// Interface for token refresh (unchanged)
export interface TokenRefreshResponse {
  token: string;
}

// Options for creating an API client (unchanged)
export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
  autoRefreshToken?: boolean;
  retry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

// Extended request config with retry flag (unchanged)
interface ExtendedRequestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  _retry?: boolean;
  [key: string]: unknown;
}

// Token refresh state tracking (unchanged)
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}[] = [];

// Process the queue of failed requests (unchanged)
const processQueue = (error: Error | null, value: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(value);
    }
  });

  failedQueue = [];
};

/**
 * Validate authentication state - React Native version
 * @returns {boolean} Whether authentication is valid
 */
export const validateAuthState = async (): Promise<boolean> => {
  const token = await getToken(); // Now async
  const isAuthInRedux = store.getState().user.isAuthenticated;
  
  // Log mismatch for debugging
  if (isAuthInRedux && !token) {
    console.warn('Authentication state mismatch: Redux shows authenticated but token is missing');
  }
  
  return !!token;
};

/**
 * Create a configured axios instance for API requests - React Native version
 */
export const createApiClient = (options: ApiClientOptions = {}) => {
  const defaultOptions: ApiClientOptions = {
    baseURL: API_BASE_URL,
    withCredentials: false, // Note: Changed to false for React Native
    autoRefreshToken: true,
    retry: false,
    retryDelay: 1000,
    maxRetries: 1,
  };

  const config: ApiClientOptions = { ...defaultOptions, ...options };

  // Create the axios instance
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout || 30000, // Default 30s timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor - add auth token if available
  instance.interceptors.request.use(
    async (config) => {
      const token = await getToken(); // Now async
      
      // Enhanced logging for problematic endpoints
      if (config.url?.includes('notifications/toggle')) {
        console.log('Making notifications toggle request:');
        console.log('- Token exists:', !!token);
        console.log('- Auth headers:', config.headers?.Authorization ? 'present' : 'missing');
        console.log('- Redux auth state:', store.getState().user.isAuthenticated);
      }
      
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      } else if (config.url?.includes('notifications/toggle') || 
                 config.url?.includes('/communities/') && config.method?.toUpperCase() === 'POST') {
        console.warn(`Making authenticated request to ${config.url} without token`);
      }
      
      // Add cache busting headers
      config.headers = config.headers || {};
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token refresh and auth errors
  if (config.autoRefreshToken) {
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const errorWithResponse = hasResponseProperty(error) && error.response;
        const originalRequest = error.config as ExtendedRequestConfig;

        // Log authentication errors for sensitive endpoints
        if (
          errorWithResponse && 
          error.response?.status === 401 &&
          (originalRequest.url?.includes('notifications/toggle') ||
           originalRequest.url?.includes('/communities/') && originalRequest.method?.toUpperCase() === 'POST')
        ) {
          console.error(`Authentication failed for ${originalRequest.url}`, {
            hasToken: !!(await getToken()),
            isAuthenticated: await isAuthenticated(),
            reduxAuthState: store.getState().user.isAuthenticated
          });
        }

        // Only attempt refresh on 401 errors with a config and no _retry flag
        if (
          errorWithResponse &&
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          (await isAuthenticated())
        ) {
          if (isRefreshing) {
            // If already refreshing, add to queue
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            console.log('Attempting to refresh token...');
            
            // For React Native, we don't rely on cookies
            // We'll need to store refresh tokens differently
            const refreshResponse = await axios.post<TokenRefreshResponse>(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { 
                headers: { 
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                }
                // Note: No withCredentials in React Native
              }
            );

            if (refreshResponse.data && refreshResponse.data.token) {
              console.log('Token refresh successful - updating token');
              const newToken = refreshResponse.data.token;
              await setToken(newToken); // Now async
              
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            }

            processQueue(null);
            return instance(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            processQueue(
              refreshError instanceof Error
                ? refreshError
                : new Error("Unknown refresh error")
            );
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        // Add retry logic for network issues
        const networkError = error instanceof Error && isNetworkError(error);
        const serverError =
          errorWithResponse &&
          error.response?.status &&
          error.response.status >= 500;
        const shouldRetry =
          config.retry &&
          !originalRequest._retry &&
          (networkError || serverError);

        if (shouldRetry) {
          originalRequest._retry = true;

          return new Promise((resolve) => {
            setTimeout(
              () => resolve(instance(originalRequest)),
              config.retryDelay
            );
          });
        }

        return Promise.reject(error);
      }
    );
  }

  return instance;
};

// Re-export error handling functions
export {
  getErrorMessage,
  ApiError,
  safeApiCall,
} from "@/utils/apiErrorHandler";

// Create default API clients
export const apiClient = createApiClient();

// Create a more resilient client for non-critical operations
export const resilientApiClient = createApiClient({
  timeout: 30000,
  retry: true,
  retryDelay: 1000,
  maxRetries: 2,
});

// Explicitly validate tokens before making authenticated requests
export const ensureAuthenticatedRequest = async (
  endpoint: string,
  method = "GET",
  body?: unknown
) => {
  const token = await getToken(); // Now async
  if (!token) {
    throw new ApiError("Authentication required. Please log in again.");
  }
  
  const config: ExtendedRequestConfig = {
    method,
    url: endpoint,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };

  if (body) {
    config.data = body;
  }

  return apiClient(config);
};

// Simplified fetch with token function
export const fetchWithToken = async (
  endpoint: string,
  method = "GET",
  body?: unknown,
  expectTextResponse = false
) => {
  try {
    const token = await getToken(); // Now async
    const config: ExtendedRequestConfig = {
      method,
      url: endpoint,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    if (body) {
      config.data = body;
    }

    const response = await apiClient(config);
    return expectTextResponse ? response.data : response.data;
  } catch (error) {
    console.error("API request failed:", error);
    throw new ApiError(getErrorMessage(error));
  }
};