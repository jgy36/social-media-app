// src/api/badges.ts
import { apiClient } from "@/api/apiClient";
import { getUserId } from "@/utils/tokenUtils";

// Define interfaces for our API responses
interface UserBadgeResponse {
  userId: number;
  badges: string[];
}

/**
 * Get user badges from the server
 * @param userId ID of the user to get badges for (defaults to current user)
 * @returns Array of badge IDs
 */
export const getUserBadges = async (userId?: number): Promise<string[]> => {
  try {
    const targetUserId = userId || getUserId();
    if (!targetUserId) {
      return [];
    }

    console.log(`Fetching badges for user ${targetUserId} from API`);
    const response = await apiClient.get<UserBadgeResponse>(`/users/${targetUserId}/badges`);
    
    if (response.data && Array.isArray(response.data.badges)) {
      // Store in localStorage for this user if it's the current user
      if (targetUserId === getUserId() && typeof window !== 'undefined') {
        localStorage.setItem(
          `user_${targetUserId}_userBadges`, 
          JSON.stringify(response.data.badges)
        );
      }
      
      return response.data.badges;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching user badges:", error);
    
    // Fallback to local storage if API fails
    if (typeof window !== 'undefined') {
      const localBadges = localStorage.getItem(`user_${userId || getUserId()}_userBadges`);
      if (localBadges) {
        try {
          const parsed = JSON.parse(localBadges);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error("Error parsing local badges:", e);
        }
      }
    }
    
    return [];
  }
};

// Define success response interface
interface SuccessResponse {
  success: boolean;
  message?: string;
  badges?: string[];
}

/**
 * Save user badges to the server
 * @param badges Array of badge IDs to save
 * @returns Success status
 */
export const saveUserBadges = async (badges: string[]): Promise<{ success: boolean }> => {
  try {
    const userId = getUserId();
    if (!userId) {
      return { success: false };
    }

    console.log(`Saving badges for user ${userId} to API:`, badges);
    
    // Real API call
    const response = await apiClient.put<SuccessResponse>(`/users/${userId}/badges`, badges);
    
    // Also save to localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem(`user_${userId}_userBadges`, JSON.stringify(badges));
    }
    
    return { success: response.data?.success || response.status === 200 };
  } catch (error) {
    console.error("Error saving user badges:", error);
    
    // Fallback to localStorage only if API fails
    if (typeof window !== 'undefined') {
      const userId = getUserId();
      if (userId) {
        localStorage.setItem(`user_${userId}_userBadges`, JSON.stringify(badges));
        return { success: true };
      }
    }
    
    return { success: false };
  }
};

/**
 * Clear all badges for the current user
 * @returns Success status
 */
export const clearUserBadges = async (): Promise<{ success: boolean }> => {
  try {
    const userId = getUserId();
    if (!userId) {
      return { success: false };
    }
    
    console.log(`Clearing badges for user ${userId}`);
    
    // Real API call
    const response = await apiClient.delete<SuccessResponse>(`/users/${userId}/badges`);
    
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`user_${userId}_userBadges`);
    }
    
    return { success: response.data?.success || response.status === 200 };
  } catch (error) {
    console.error("Error clearing user badges:", error);
    
    // Fallback to localStorage if API fails
    if (typeof window !== 'undefined') {
      const userId = getUserId();
      if (userId) {
        localStorage.removeItem(`user_${userId}_userBadges`);
        return { success: true };
      }
    }
    
    return { success: false };
  }
};