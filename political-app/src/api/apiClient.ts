// src/api/apiClient.ts
import axios from "axios";
import { getToken, setToken } from "@/utils/tokenUtils";
import {
  getErrorMessage,
  ApiError,
  hasResponseProperty,
  isNetworkError,
} from "@/utils/apiErrorHandler";

// API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

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
  url: string; // Make url required, not optional
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  _retry?: boolean;
  [key: string]: unknown;
}

// Token refresh state tracking
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

// Process the queue of failed requests
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
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
    withCredentials: true, // Enable cookies for auth
    autoRefreshToken: true,
    retry: false,
    retryDelay: 1000,
    maxRetries: 1,
  };

  const config: ApiClientOptions = { ...defaultOptions, ...options };

  // Create the axios instance
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout || 30000,
    withCredentials: true, // Always enable credentials
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Add cache busting headers
      config.headers = config.headers || {};
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';
      
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
        const errorWithResponse = hasResponseProperty(error) && error.response;
        const originalRequest = error.config as ExtendedRequestConfig;

        // Only attempt refresh on 401 errors with a config and no _retry flag
        if (
          errorWithResponse &&
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          if (isRefreshing) {
            // If already refreshing, add to queue
            return new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                return instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          // Mark request as retried and set refreshing flag
          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const token = getToken();

            if (!token) {
              processQueue(new Error("No token available"));
              return Promise.reject(error);
            }

            const refreshResponse = await axios.post<TokenRefreshResponse>(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { 
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
              }
            );

            const newToken = refreshResponse.data.token;

            if (!newToken) {
              processQueue(new Error("Token refresh failed"));
              return Promise.reject(error);
            }

            // Store the new token
            setToken(newToken);

            // Update header for the original request
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            // Process queued requests with new token
            processQueue(null, newToken);

            return instance(originalRequest);
          } catch (refreshError) {
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

// Re-export error handling functions from the utility
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

// Simplified fetch with token function
export const fetchWithToken = async (
  endpoint: string,
  method = "GET",
  body?: unknown,
  expectTextResponse = false
) => {
  try {
    const config: ExtendedRequestConfig = {
      method,
      url: endpoint,
      withCredentials: true // Always use credentials
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