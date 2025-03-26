/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { ApiError } from '@/utils/apiErrorHandler';
import { login, register } from '@/api/auth';
import { createPost } from '@/api/posts';
import { searchHashtags, getUnifiedSearchResults } from '@/api/search';
import { searchCommunities } from '@/api/communities';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, PostResponse, CreatePostRequest } from '@/api/types';

/**
 * Type for the executing function that can take parameters and return a result
 */
type ExecuteFunction<T, P extends any[]> = (...args: P) => Promise<T | null>;

/**
 * Hook for handling API calls with loading and error states
 * @param apiFunction The API function to call
 * @param initialLoading Initial loading state
 * @returns Object with data, loading, error, and execute function
 */
export function useApi<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>,
  initialLoading: boolean = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Execute the API call
   */
  const execute: ExecuteFunction<T, P> = useCallback(
    async (...args: P): Promise<T | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        // Use ApiError if it's already that type, otherwise create a new one
        const typedError = err instanceof ApiError 
          ? err 
          : new ApiError(err instanceof Error ? err.message : String(err));
        
        setError(typedError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

// Create hooks for specific API functions that can be imported directly

/**
 * Hook for user login
 */
export const useLogin = () => {
  const { loading, error, execute } = useApi<AuthResponse, [LoginRequest]>(login);
  return { loading, error, execute };
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const { loading, error, execute } = useApi<ApiResponse<AuthResponse>, [RegisterRequest]>(register);
  return { loading, error, execute };
};

/**
 * Hook for creating posts
 */
export const useCreatePost = () => {
  const { loading, error, execute } = useApi<PostResponse, [CreatePostRequest]>(createPost);
  return { loading, error, execute };
};

/**
 * Hook for searching hashtags
 */
export const useSearchHashtags = () => {
  const { loading, error, execute } = useApi<any[], [string]>(searchHashtags);
  return { loading, error, execute };
};

/**
 * Hook for searching communities
 */
export const useSearchCommunities = () => {
  const { loading, error, execute } = useApi<any[], [string]>(searchCommunities);
  return { loading, error, execute };
};

/**
 * Hook for unified search across all content types
 */
export const useSearchAll = () => {
  const { loading, error, execute } = useApi<any[], [string, string?]>(
    (query: string, type?: string) => getUnifiedSearchResults(query, type as any)
  );
  return { loading, error, execute };
};