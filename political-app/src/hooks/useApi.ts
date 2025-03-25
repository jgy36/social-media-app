/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import api from '@/api';

/**
 * Hook for handling API calls with loading and error states
 */
export function useApi<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>,
  initialLoading: boolean = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Execute the API call
   */
  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (error) {
        const typedError = error instanceof Error ? error : new Error(String(error));
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

/**
 * Create hooks for specific API functions
 */

// Auth hooks
export const useLogin = () => useApi(api.auth.login);
export const useRegister = () => useApi(api.auth.register);
export const useLogout = () => useApi(api.auth.logout);

// Posts hooks
export const useCreatePost = () => useApi(api.posts.createPost);
export const useLikePost = () => useApi(api.posts.likePost);
export const useSavePost = () => useApi(api.posts.savePost);
export const useGetPostById = () => useApi(api.posts.getPostById);
export const useGetPostComments = () => useApi(api.posts.getPostComments);
export const useAddComment = () => useApi(api.posts.addComment);

// Communities hooks
export const useGetCommunities = () => useApi(api.communities.getAllCommunities);
export const useGetCommunityBySlug = () => useApi(api.communities.getCommunityBySlug);
export const useCreateCommunity = () => useApi(api.communities.createCommunity);
export const useJoinCommunity = () => useApi(api.communities.joinCommunity);
export const useLeaveCommunity = () => useApi(api.communities.leaveCommunity);

// Users hooks
export const useGetCurrentUser = () => useApi(api.users.getCurrentUser);
export const useGetUserProfile = () => useApi(api.users.getUserProfile);
export const useUpdateUsername = () => useApi(api.users.updateUsername);
export const useFollowUser = () => useApi(api.users.followUser);
export const useUnfollowUser = () => useApi(api.users.unfollowUser);

// Search hooks
export const useSearchAll = () => useApi(api.search.getUnifiedSearchResults);