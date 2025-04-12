// src/api/badges.ts
import { apiClient } from "@/api/apiClient";
import { getUserId } from "@/utils/tokenUtils";

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

    const response = await apiClient.get(`/users/${targetUserId}/badges`);
    
    if (response.data && Array.isArray(response.data.badges)) {
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

    // Real API call
    const response = await apiClient.put(`/users/${userId}/badges`, badges);
    
    // Also save to localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem(`user_${userId}_userBadges`, JSON.stringify(badges));
    }
    
    return { success: response.data?.success || true };
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
    
    // Real API call
    const response = await apiClient.delete(`/users/${userId}/badges`);
    
    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`user_${userId}_userBadges`);
    }
    
    return { success: response.data?.success || true };
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