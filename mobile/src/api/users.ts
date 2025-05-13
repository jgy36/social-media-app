// src/api/users.ts - React Native version
import { apiClient, getErrorMessage } from "./apiClient";
import {
  UserProfile,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
  UpdateProfileResponse,
} from "./types";
import { FollowResponse, FollowUser } from "@/types/follow";
import { PostType } from "@/types/post";
import { getUserId, setUserData, getUserData } from "@/utils/tokenUtils";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get the current user's profile - React Native version
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get<UserProfile>("/users/me");

    // Store user info in AsyncStorage
    if (response.data && response.data.id) {
      const userId = String(response.data.id);
      await AsyncStorage.setItem("currentUserId", userId);

      await setUserData({
        id: userId,
        username: response.data.username || "",
        email: response.data.email || "",
        displayName: response.data.displayName,
        bio: response.data.bio,
        profileImageUrl: response.data.profileImageUrl,
      });
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

/**
 * Get a user's profile by username
 */
export const getUserProfile = async (
  username: string
): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get<UserProfile>(
      `/users/profile/${username}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    return null;
  }
};

/**
 * Update the current user's username - React Native version
 */
export const updateUsername = async (
  newUsername: string
): Promise<UpdateUsernameResponse> => {
  try {
    // Validate the username format on client-side
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
      return {
        success: false,
        message:
          "Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.",
      };
    }

    const request: UpdateUsernameRequest = { username: newUsername };
    const response = await apiClient.put<UpdateUsernameResponse>(
      "/users/update-username",
      request
    );

    // If successful, update AsyncStorage for better UX
    if (response.data.success) {
      const userId = await getUserId();
      if (userId) {
        await setUserData({ id: userId, username: newUsername });
      }

      // You can emit a custom event here if needed for updating UI
      // In React Native, you might use EventEmitter or React context updates
    }

    return response.data;
  } catch (error) {
    console.error("Error updating username:", error);
    return { success: false, message: getErrorMessage(error) };
  }
};

/**
 * React Native specific interface for profile updates
 */
export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  profileImage?: {
    uri: string;
    type: string;
    name: string;
  };
}

/**
 * Update the current user's profile information - React Native version
 */
export const updateProfile = async (profile: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  try {
    console.log("Updating profile with data:", profile);

    // Create FormData for file upload
    const formData = new FormData();

    if (profile.displayName !== undefined) {
      formData.append("displayName", profile.displayName);
    }

    if (profile.bio !== undefined) {
      formData.append("bio", profile.bio);
    }

    if (profile.profileImage) {
      // React Native specific file handling
      formData.append("profileImage", {
        uri: profile.profileImage.uri,
        type: profile.profileImage.type,
        name: profile.profileImage.name,
      } as any);
    }

    console.log("Sending profile update request...");

    // Use FormData for multipart/form-data request
    const response = await apiClient.put<UpdateProfileResponse>(
      "/users/update-profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Profile update response:", response.data);

    // Update AsyncStorage for better UX
    if (response.data.success) {
      const userId = await getUserId();

      if (userId) {
        const currentData = await getUserData();
        const updates: Partial<typeof currentData> = {
          ...currentData,
          id: userId,
        };

        if (profile.displayName !== undefined) {
          updates.displayName = profile.displayName;
        }

        if (profile.bio !== undefined) {
          updates.bio = profile.bio;
        }

        if (response.data.profileImageUrl) {
          updates.profileImageUrl = response.data.profileImageUrl;
        }

        await setUserData(updates);
      }

      // In React Native, you might want to emit a custom event or use React context
      // Example: EventEmitter.emit('userProfileUpdated', response.data.user);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);

    // Extract a meaningful error message
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      const errorObj = error as {
        message?: string;
        response?: {
          data?: {
            message?: string;
          };
          statusText?: string;
        };
        statusText?: string;
      };

      if (errorObj.message) {
        errorMessage = errorObj.message;
      } else if (errorObj.response?.data?.message) {
        errorMessage = errorObj.response.data.message;
      } else if (errorObj.response?.statusText) {
        errorMessage = errorObj.response.statusText;
      } else if (errorObj.statusText) {
        errorMessage = errorObj.statusText;
      }
    }

    return {
      success: false,
      message: `Profile update failed: ${errorMessage}`,
    };
  }
};

/**
 * Search for users
 */
export const searchUsers = async (query: string): Promise<UserProfile[]> => {
  try {
    const response = await apiClient.get<UserProfile[]>(
      `/users/search?query=${encodeURIComponent(query)}`
    );
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
    const response = await apiClient.post<FollowResponse>(
      `/users/follow-by-id/${userId}`,
      {}
    );

    return {
      ...response.data,
      isFollowing:
        response.data.followStatus === "following" || response.data.isFollowing,
      isRequested:
        response.data.followStatus === "requested" || response.data.isRequested,
    };
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
    const response = await apiClient.delete<FollowResponse>(
      `/follow/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error unfollowing user ${userId}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get follow status and counts
 */
export const getFollowStatus = async (
  userId: number
): Promise<FollowResponse> => {
  try {
    const response = await apiClient.get<FollowResponse>(
      `/follow/status/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting follow status for user ${userId}:`, error);
    return {
      isFollowing: false,
      followersCount: 0,
      followingCount: 0,
    };
  }
};

/**
 * Get a user's followers
 */
export const getUserFollowers = async (
  userId: number,
  page: number = 1
): Promise<FollowUser[]> => {
  try {
    const response = await apiClient.get<FollowUser[]>(
      `/follow/followers/${userId}?page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting followers for user ${userId}:`, error);
    return [];
  }
};

/**
 * Get users that a user follows
 */
export const getUserFollowing = async (
  userId: number,
  page: number = 1
): Promise<FollowUser[]> => {
  try {
    const response = await apiClient.get<FollowUser[]>(
      `/follow/following/${userId}?page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting following for user ${userId}:`, error);
    return [];
  }
};

/**
 * Refresh the current user's profile data - React Native version
 */
export const refreshUserProfile = async (): Promise<boolean> => {
  try {
    console.log("Refreshing user profile data...");
    const response = await apiClient.get<UserProfile>("/users/me", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (response.data) {
      const userId = String(response.data.id);
      console.log("Received fresh profile data:", response.data);

      // Update AsyncStorage with updated data
      await setUserData({
        id: userId,
        username: response.data.username || "",
        email: response.data.email || "",
        displayName: response.data.displayName || "",
        bio: response.data.bio || "",
        profileImageUrl: response.data.profileImageUrl,
      });

      console.log("Profile data refreshed successfully");
      return true;
    }

    console.log("Profile refresh failed - empty response data");
    return false;
  } catch (error) {
    console.error("Error refreshing user profile:", error);
    return false;
  }
};

export const getPostsByUsername = async (
  username: string
): Promise<PostType[]> => {
  try {
    console.log(`Fetching posts for username: ${username}`);
    
    const response = await apiClient.get(`/users/profile/${username}/posts`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      responseType: 'json'
    });
    
    console.log("Raw posts response type:", typeof response.data);
    
    // Handle string responses (if still occurring)
    if (typeof response.data === 'string') {
      console.log("Response is string - attempting to parse as JSON");
      try {
        const parsedData = JSON.parse(response.data);
        console.log("Successfully parsed JSON from string response");
        
        if (Array.isArray(parsedData)) {
          return parsedData;
        } else if (parsedData && typeof parsedData === 'object') {
          if (parsedData.id && parsedData.content) {
            return [parsedData as PostType];
          }
        }
        
        console.error("Unknown data structure in parsed JSON:", parsedData);
        return [];
      } catch (parseError) {
        console.error("Failed to parse response string as JSON:", parseError);
        return [];
      }
    }
    
    // Handle array response (expected case)
    if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} posts in array response`);
      return response.data;
    } 
    
    // Handle object response
    if (response.data && typeof response.data === 'object') {
      if ('id' in response.data && 'content' in response.data) {
        console.log("Found single post object, converting to array");
        return [response.data as PostType];
      }
      
      const extractedPosts = Object.values(response.data).filter(item => 
        item && typeof item === 'object' && 'id' in item && 'content' in item
      ) as PostType[];
      
      console.log(`Extracted ${extractedPosts.length} posts from object`);
      return extractedPosts;
    }
    
    console.log("No valid post data found in response");
    return [];
  } catch (error) {
    console.error(`Error fetching posts for user ${username}:`, error);
    return [];
  }
};

/**
 * Check if a user's account is private
 */
export const checkAccountPrivacy = async (userId: number): Promise<boolean> => {
  try {
    console.log("Checking privacy for user:", userId);

    const response = await apiClient.get<{ isPrivate: boolean }>(
      `/users/privacy-settings/status/${userId}`
    );

    console.log("Privacy response:", response.data);
    return response.data.isPrivate;
  } catch (error) {
    console.error(`Error checking privacy status for user ${userId}:`, error);
    throw error;
  }
};

export const checkFollowRequestStatus = async (
  userId: number
): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ hasRequest: boolean }>(
      `/follow/request-status/${userId}`
    );
    return response.data.hasRequest;
  } catch (error) {
    console.error(
      `Error checking follow request status for user ${userId}:`,
      error
    );
    return false;
  }
};