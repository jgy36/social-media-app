// src/api/users.ts - Updated with profile update functionality
import { apiClient, getErrorMessage } from './apiClient';
import { 
  UserProfile, 
  UpdateUsernameRequest, 
  UpdateUsernameResponse,
  UpdateProfileRequest,
  UpdateProfileResponse
} from './types';
// Import directly from the types directory
import { FollowResponse, FollowUser } from '@/types/follow';
import { PostType } from '@/types/post';

/**
 * Get the current user's profile
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get<UserProfile>('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Get a user's profile by username
 */
export const getUserProfile = async (username: string): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get<UserProfile>(`/users/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    return null;
  }
};

/**
 * Update the current user's username
 */
export const updateUsername = async (newUsername: string): Promise<UpdateUsernameResponse> => {
  try {
    // Validate the username format on client-side
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
      return {
        success: false,
        message: 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.'
      };
    }

    const request: UpdateUsernameRequest = { username: newUsername };
    const response = await apiClient.put<UpdateUsernameResponse>('/users/update-username', request);

    // If successful, update localStorage for better UX
    if (response.data.success) {
      localStorage.setItem('username', newUsername);
    }

    return response.data;
  } catch (error) {
    console.error('Error updating username:', error);
    return { success: false, message: getErrorMessage(error) };
  }
};

/**
 * Update the current user's profile information
 */
export const updateProfile = async (
  profile: {
    displayName?: string;
    bio?: string;
    profileImage?: File;
  }
): Promise<UpdateProfileResponse> => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    if (profile.displayName) {
      formData.append('displayName', profile.displayName);
    }
    
    if (profile.bio !== undefined) {
      formData.append('bio', profile.bio);
    }
    
    if (profile.profileImage) {
      formData.append('profileImage', profile.profileImage);
    }
    
    // Use FormData for multipart/form-data request (necessary for file upload)
    const response = await apiClient.put<UpdateProfileResponse>(
      '/users/update-profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Update localStorage for better UX
    if (response.data.success) {
      if (profile.displayName) {
        localStorage.setItem('displayName', profile.displayName);
      }
      
      if (profile.bio) {
        localStorage.setItem('bio', profile.bio);
      }
      
      if (response.data.profileImageUrl) {
        localStorage.setItem('profileImageUrl', response.data.profileImageUrl);
      }
      
      // Dispatch a custom event for components that need to update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('userProfileUpdated', { detail: response.data.user })
        );
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      message: getErrorMessage(error)
    };
  }
};

/**
 * Search for users
 */
export const searchUsers = async (query: string): Promise<UserProfile[]> => {
  try {
    const response = await apiClient.get<UserProfile[]>(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching users with query ${query}:`, error);
    return [];
  }
};

/**
 * Follow a user
 */
export const followUser = async (userId: number): Promise<FollowResponse> => {
  try {
    const response = await apiClient.post<FollowResponse>(`/follow/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error following user ${userId}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId: number): Promise<FollowResponse> => {
  try {
    const response = await apiClient.delete<FollowResponse>(`/follow/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unfollowing user ${userId}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get follow status and counts
 */
export const getFollowStatus = async (userId: number): Promise<FollowResponse> => {
  try {
    const response = await apiClient.get<FollowResponse>(`/follow/status/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting follow status for user ${userId}:`, error);
    // Return a default value with the correct type
    return {
      isFollowing: false,
      followersCount: 0,
      followingCount: 0
    };
  }
};

/**
 * Get a user's followers
 */
export const getUserFollowers = async (userId: number, page: number = 1): Promise<FollowUser[]> => {
  try {
    const response = await apiClient.get<FollowUser[]>(`/follow/followers/${userId}?page=${page}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting followers for user ${userId}:`, error);
    return [];
  }
};

/**
 * Get users that a user follows
 */
export const getUserFollowing = async (userId: number, page: number = 1): Promise<FollowUser[]> => {
  try {
    const response = await apiClient.get<FollowUser[]>(`/follow/following/${userId}?page=${page}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting following for user ${userId}:`, error);
    return [];
  }
};

/**
 * Refresh the current user's profile data
 * Used after making changes to ensure all components show latest data
 */
export const refreshUserProfile = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<UserProfile>('/users/me');
    
    if (response.data) {
      // Update local storage with updated data
      if (response.data.username) {
        localStorage.setItem('username', response.data.username);
      }
      
      if (response.data.displayName) {
        localStorage.setItem('displayName', response.data.displayName);
      }
      
      if (response.data.bio) {
        localStorage.setItem('bio', response.data.bio);
      }
      
      if (response.data.profileImageUrl) {
        localStorage.setItem('profileImageUrl', response.data.profileImageUrl);
      }
      
      // Dispatch a custom event for components that need to update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('userProfileUpdated', { detail: response.data })
        );
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing user profile:', error);
    return false;
  }
};

export const getPostsByUsername = async (
  username: string
): Promise<PostType[]> => {
  try {
    const response = await apiClient.get<PostType[]>(
      `/users/profile/${username}/posts`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for user ${username}:`, error);
    return [];
  }
};