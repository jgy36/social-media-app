// src/api/communities.ts
import { apiClient, getErrorMessage } from './apiClient';
import { 
  Community, 
  CreateCommunityRequest, 
  CommunityMembershipResponse, 
  PostResponse, 
  CreatePostRequest 
} from './types';

/**
 * Get all communities
 */
export const getAllCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>('/communities');
    return response.data;
  } catch (error) {
    console.error('Error fetching communities:', error);
    return [];
  }
};

/**
 * Get a community by slug/id
 */
export const getCommunityBySlug = async (slug: string): Promise<Community | null> => {
  try {
    const response = await apiClient.get<Community>(`/communities/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching community ${slug}:`, error);
    return null;
  }
};

/**
 * Get popular communities
 */
export const getPopularCommunities = async (limit: number = 5): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>(`/communities/popular?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular communities:', error);
    return [];
  }
};

/**
 * Create a new community
 */
export const createCommunity = async (data: CreateCommunityRequest): Promise<Community> => {
  try {
    const response = await apiClient.post<Community>('/communities', data);
    return response.data;
  } catch (error) {
    console.error('Error creating community:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Join a community
 */
export const joinCommunity = async (slug: string): Promise<CommunityMembershipResponse> => {
  try {
    const response = await apiClient.post<CommunityMembershipResponse>(`/communities/${slug}/join`);
    // Spread the response data and add success property if not already present
    return { 
      ...response.data,
      // Only set success to true if it's not already defined in response.data
      ...(response.data.success === undefined ? { success: true } : {})
    };
  } catch (error) {
    console.error(`Error joining community ${slug}:`, error);
    return { success: false, message: getErrorMessage(error) };
  }
};

/**
 * Leave a community
 */
export const leaveCommunity = async (slug: string): Promise<CommunityMembershipResponse> => {
  try {
    const response = await apiClient.delete<CommunityMembershipResponse>(`/communities/${slug}/leave`);
    // Spread the response data and add success property if not already present
    return { 
      ...response.data,
      // Only set success to true if it's not already defined in response.data
      ...(response.data.success === undefined ? { success: true } : {})
    };
  } catch (error) {
    console.error(`Error leaving community ${slug}:`, error);
    return { success: false, message: getErrorMessage(error) };
  }
};

/**
 * Get posts for a community
 */
export const getCommunityPosts = async (slug: string): Promise<PostResponse[]> => {
  try {
    const response = await apiClient.get<PostResponse[]>(`/communities/${slug}/posts`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for community ${slug}:`, error);
    return [];
  }
};

/**
 * Create a post in a community
 */
export const createCommunityPost = async (slug: string, content: string): Promise<PostResponse> => {
  try {
    const postData: CreatePostRequest = { content, communityId: slug };
    const response = await apiClient.post<PostResponse>(`/communities/${slug}/posts`, postData);
    return response.data;
  } catch (error) {
    console.error(`Error creating post in community ${slug}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Search communities
 */
export const searchCommunities = async (query: string): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>(`/communities/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching communities with query ${query}:`, error);
    return [];
  }
};