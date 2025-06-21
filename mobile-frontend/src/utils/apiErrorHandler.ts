// src/utils/apiErrorHandler.ts - React Native version
import axios from 'axios';

/**
 * Standardized error handling for API requests
 * Extracts meaningful error messages from different error types
 */
export class ApiError extends Error {
  status?: number;
  data?: unknown;
  isNetworkError: boolean;

  constructor(message: string, status?: number, data?: unknown, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Check if an error is likely a network error
 * @param error Any caught error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('timeout') || 
           error.message.includes('Network Error') ||
           error.message.includes('network') ||
           error.message.includes('aborted') ||
           error.message.includes('NETWORK_REQUEST_FAILED');
  }
  return false;
}

/**
 * Type guard to check if an object has a response property like axios errors
 */
export function hasResponseProperty(obj: unknown): obj is { 
  response?: { 
    status?: number;
    statusText?: string; 
    data?: unknown;
  } 
} {
  return typeof obj === 'object' && 
         obj !== null && 
         'response' in obj && 
         typeof (obj as any).response === 'object';
}

/**
 * Extract a user-friendly error message from various error types
 * @param error Any caught error
 * @returns A standardized error message
 */
export const getErrorMessage = (error: unknown): string => {
  // Check if it's an error with a response property (like Axios errors)
  if (hasResponseProperty(error) && error.response) {
    const response = error.response;
    
    // Try to get the most specific error message
    const data = response.data as Record<string, unknown>;
    
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string') {
        return data.message;
      }
      
      if (typeof data.error === 'string') {
        return data.error;
      }
    }
    
    // Fall back to status-based messages
    if (response.status) {
      if (response.status === 401) {
        return 'Authentication failed. Please log in again.';
      } else if (response.status === 403) {
        return 'You do not have permission to perform this action.';
      } else if (response.status === 404) {
        return 'The requested resource was not found.';
      } else if (response.status >= 500) {
        return 'Server error. Please try again later.';
      }
      
      return `Request failed with status ${response.status}: ${response.statusText || 'Unknown error'}`;
    }
  }
  
  // Check for network errors
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please check your connection and try again.';
      }
      
      return 'Network error. Please check your connection.';
    }
    
    // Return the error message for other Error objects
    return error.message;
  }
  
  // Handle unknown errors
  return typeof error === 'string' ? error : 'An unknown error occurred';
};

/**
 * Safe wrapper for API calls with standardized error handling
 * @param apiCall Promise-returning API function
 * @param errorContext Additional context for the error message
 * @returns Result of the API call
 * @throws ApiError with standardized format
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  errorContext?: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const contextMessage = errorContext ? `${errorContext}: ${message}` : message;
    
    // Log the error for debugging
    console.error(contextMessage, error);
    
    // Create a standardized ApiError
    if (hasResponseProperty(error) && error.response) {
      throw new ApiError(
        contextMessage,
        error.response.status,
        error.response.data,
        false
      );
    } 
    
    // Check if it's a network error
    const isNetwork = error instanceof Error && isNetworkError(error);
    throw new ApiError(contextMessage, undefined, undefined, isNetwork);
  }
}

/**
 * Creates a typed API request function with error handling
 * @returns A function that wraps API calls with error handling
 */
export function createSafeApiRequest() {
  return {
    /**
     * Make a GET request with error handling
     */
    async get<T>(url: string, config?: Record<string, unknown>): Promise<T> {
      return safeApiCall(
        async () => {
          const response = await axios.get<T>(url, config);
          return response.data;
        },
        `GET ${url}`
      );
    },
    
    /**
     * Make a POST request with error handling
     */
    async post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
      return safeApiCall(
        async () => {
          const response = await axios.post<T>(url, data, config);
          return response.data;
        },
        `POST ${url}`
      );
    },
    
    /**
     * Make a PUT request with error handling
     */
    async put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
      return safeApiCall(
        async () => {
          const response = await axios.put<T>(url, data, config);
          return response.data;
        },
        `PUT ${url}`
      );
    },
    
    /**
     * Make a DELETE request with error handling
     */
    async delete<T>(url: string, config?: Record<string, unknown>): Promise<T> {
      return safeApiCall(
        async () => {
          const response = await axios.delete<T>(url, config);
          return response.data;
        },
        `DELETE ${url}`
      );
    }
  };
}

// Create a default instance of the API request utility
export const safeApi = createSafeApiRequest();

// Re-export your existing fallback functionality
export { fetchPostsWithFallback, generateFallbackPosts } from './postFallbackHandler';