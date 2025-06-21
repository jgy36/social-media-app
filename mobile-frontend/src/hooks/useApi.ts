// src/hooks/useApi.ts - React Native version
import { useState, useCallback } from 'react';
import { ApiError } from '@/utils/apiErrorHandler';
import { login, register } from '@/api/auth';
import { createPost } from '@/api/posts';
import { searchHashtags, getUnifiedSearchResults } from '@/api/search';
import { searchCommunities } from '@/api/communities';
import { getNotifications, Notification } from '@/api/notifications';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, PostResponse, CreatePostRequest } from '@/api/types';
import { ApiSearchResult } from '@/types/search';
import { apiClient } from '@/api/apiClient';

// Define React Native media file type
interface MediaFile {
  uri: string;
  type?: string;
  name?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = async (postData: CreatePostRequest): Promise<PostResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      // Check if we have media files
      if (postData.media && postData.media.length > 0) {
        console.log("Using media upload endpoint with", postData.media.length, "files");
        
        // Create FormData for React Native
        const formData = new FormData();
        formData.append("content", postData.content);
        
        // Add other fields if present
        if (postData.originalPostId) {
          formData.append("originalPostId", postData.originalPostId.toString());
        }
        
        if (postData.repost) {
          formData.append("repost", String(postData.repost));
        }
        
        if (postData.communityId) {
          formData.append("communityId", postData.communityId.toString());
        }
        
        // Add media files for React Native
        postData.media.forEach((file, index) => {
          // Type assert the file as MediaFile for React Native
          const mediaFile = file as unknown as MediaFile;
          
          // In React Native, file objects from ImagePicker have uri, type, and name properties
          formData.append("media", {
            uri: mediaFile.uri,
            type: mediaFile.type || 'image/jpeg',
            name: mediaFile.name || `media_${index}.jpg`,
          } as any);
        });
        
        // Add media types if present
        if (postData.mediaTypes) {
          postData.mediaTypes.forEach((type, index) => {
            formData.append("mediaTypes", type);
          });
        }
        
        // Add alt texts if present
        if (postData.altTexts) {
          postData.altTexts.forEach((text, index) => {
            formData.append("altTexts", text || "");
          });
        }
        
        response = await apiClient.post<PostResponse>("/posts/with-media", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // If no media, use regular JSON endpoint
        response = await apiClient.post<PostResponse>("/posts", postData);
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error("Error in useCreatePost:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      return null;
    }
  };
  
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ApiSearchResult[]>([]);
  const [searchInitialized, setSearchInitialized] = useState(false);

  const execute = useCallback(async (query: string, type?: 'user' | 'community' | 'hashtag' | 'post') => {
    if (!query?.trim()) {
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      // Add cache busting
      const timestamp = Date.now();
      const queryWithTimestamp = query.includes('?') 
        ? `${query}&_=${timestamp}` 
        : `${query}?_=${timestamp}`;
      
      // Log first search attempt
      if (!searchInitialized) {
        console.log('First search attempt, query:', query);
      }
      
      // Perform the search
      const results = await getUnifiedSearchResults(queryWithTimestamp, type);
      
      // Mark search as initialized
      if (!searchInitialized) {
        setSearchInitialized(true);
      }
      
      // Update state
      setData(results);
      return results;
    } catch (err) {
      console.error('Search error:', err);
      
      // Special handling for first search attempt
      if (!searchInitialized) {
        console.log('First search failed, will retry on next attempt');
        
        // Schedule a backend "warmup" call
        setTimeout(() => {
          getUnifiedSearchResults('warmup')
            .then(() => console.log('Search API warmup call completed'))
            .catch(() => console.log('Search API warmup call failed'));
        }, 100);
      }
      
      setError(err instanceof Error ? err : new Error('Unknown search error'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [searchInitialized]);

  return { loading, error, data, execute };
};

/**
 * Hook for fetching notifications
 */
export const useNotifications = () => {
  const { data, loading, error, execute } = useApi<Notification[], []>(getNotifications);
  return { notifications: data || [], loading, error, refresh: execute };
};