// src/api/communities.ts - Updated with more robust error handling
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
    const response = await apiClient.get<Community[]>('/communities', {
      withCredentials: true
    });
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
    const response = await apiClient.get<Community>(`/communities/${slug}`, {
      withCredentials: true
    });
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
    const response = await apiClient.get<Community[]>(`/communities/popular?limit=${limit}`, {
      withCredentials: true
    });
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
    const response = await apiClient.post<Community>('/communities', data, {
      withCredentials: true
    });
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
    const response = await apiClient.post<CommunityMembershipResponse>(`/communities/${slug}/join`, {}, {
      withCredentials: true
    });
    
    // Save to local storage for persistence
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId) {
        // Get existing joined communities
        const joinedCommunitiesJson = localStorage.getItem(`user_${currentUserId}_joinedCommunities`);
        const joinedCommunities = joinedCommunitiesJson ? JSON.parse(joinedCommunitiesJson) : [];
        
        // Add this community if not already present
        if (!joinedCommunities.includes(slug)) {
          joinedCommunities.push(slug);
          localStorage.setItem(`user_${currentUserId}_joinedCommunities`, JSON.stringify(joinedCommunities));
        }
      }
    } catch (storageError) {
      console.error('Error updating local storage after joining community:', storageError);
    }
    
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
    const response = await apiClient.delete<CommunityMembershipResponse>(`/communities/${slug}/leave`, {
      withCredentials: true
    });
    
    // Update local storage
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId) {
        // Get existing joined communities
        const joinedCommunitiesJson = localStorage.getItem(`user_${currentUserId}_joinedCommunities`);
        if (joinedCommunitiesJson) {
          const joinedCommunities = JSON.parse(joinedCommunitiesJson);
          
          // Remove this community
          const updatedCommunities = joinedCommunities.filter((id: string) => id !== slug);
          localStorage.setItem(`user_${currentUserId}_joinedCommunities`, JSON.stringify(updatedCommunities));
          
          // Also update featured communities if needed
          const featuredCommunitiesJson = localStorage.getItem(`user_${currentUserId}_featuredCommunities`);
          if (featuredCommunitiesJson) {
            const featuredCommunities = JSON.parse(featuredCommunitiesJson);
            const updatedFeatured = featuredCommunities.filter((id: string) => id !== slug);
            localStorage.setItem(`user_${currentUserId}_featuredCommunities`, JSON.stringify(updatedFeatured));
          }
        }
      }
    } catch (storageError) {
      console.error('Error updating local storage after leaving community:', storageError);
    }
    
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
    const response = await apiClient.get<PostResponse[]>(`/communities/${slug}/posts`, {
      withCredentials: true
    });
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
    const response = await apiClient.post<PostResponse>(`/communities/${slug}/posts`, postData, {
      withCredentials: true
    });
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
    const response = await apiClient.get<Community[]>(`/communities/search?query=${encodeURIComponent(query)}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching communities with query ${query}:`, error);
    return [];
  }
};

/**
 * Get user's joined communities
 */
export const getUserCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>('/communities/user', {
      withCredentials: true
    });
    
    // Save to local storage for persistence
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId && response.data.length > 0) {
        // Extract just the community IDs/slugs
        const communityIds = response.data.map(community => community.id);
        localStorage.setItem(`user_${currentUserId}_joinedCommunities`, JSON.stringify(communityIds));
        
        // Also update featured communities if we don't have any yet
        const featuredCommunitiesJson = localStorage.getItem(`user_${currentUserId}_featuredCommunities`);
        if (!featuredCommunitiesJson || featuredCommunitiesJson === '[]') {
          const featuredIds = communityIds.slice(0, 5); // Take up to 5
          localStorage.setItem(`user_${currentUserId}_featuredCommunities`, JSON.stringify(featuredIds));
        }
      }
    } catch (storageError) {
      console.error('Error updating local storage after fetching user communities:', storageError);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching user communities:`, error);
    return [];
  }
};

/**
 * Check if user is a member of a community
 */
export const checkCommunityMembership = async (slug: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<{isMember: boolean}>(`/communities/${slug}/membership`, {
      withCredentials: true
    });
    return response.data.isMember;
  } catch (error) {
    console.error(`Error checking membership for community ${slug}:`, error);
    return false;
  }
};