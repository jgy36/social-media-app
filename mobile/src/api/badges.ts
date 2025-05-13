// src/api/badges.ts - React Native version
import { apiClient } from "@/api/apiClient";
import { getUserId } from "@/utils/tokenUtils";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define interfaces for our API responses
interface UserBadgeResponse {
  userId: number;
  badges: string[];
}

/**
 * Get user badges from the server - React Native version
 * @param userId ID of the user to get badges for (defaults to current user)
 * @returns Array of badge IDs
 */
export const getUserBadges = async (userId?: number): Promise<string[]> => {
  try {
    const targetUserIdString = userId?.toString() || await getUserId();
    const targetUserId = targetUserIdString ? parseInt(targetUserIdString) : null;
    
    if (!targetUserId) {
      return [];
    }

    console.log(`Fetching badges for user ${targetUserId} from API`);
    const response = await apiClient.get<UserBadgeResponse>(`/users/${targetUserId}/badges`);
    
    if (response.data && Array.isArray(response.data.badges)) {
      // Store in AsyncStorage for this user if it's the current user
      const currentUserId = await getUserId();
      if (targetUserId.toString() === currentUserId) {
        await AsyncStorage.setItem(
          `user_${targetUserId}_userBadges`, 
          JSON.stringify(response.data.badges)
        );
      }
      
      return response.data.badges;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching user badges:", error);
    
    // Fallback to AsyncStorage if API fails
    const fallbackUserId = userId?.toString() || await getUserId();
    if (fallbackUserId) {
      try {
        const localBadges = await AsyncStorage.getItem(`user_${fallbackUserId}_userBadges`);
        if (localBadges) {
          const parsed = JSON.parse(localBadges);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) {
        console.error("Error parsing local badges:", e);
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
 * Save user badges to the server - React Native version
 * @param badges Array of badge IDs to save
 * @returns Success status
 */
export const saveUserBadges = async (badges: string[]): Promise<{ success: boolean }> => {
  try {
    const userIdString = await getUserId();
    const userId = userIdString ? parseInt(userIdString) : null;
    
    if (!userId) {
      return { success: false };
    }

    console.log(`Saving badges for user ${userId} to API:`, badges);
    
    // Real API call
    const response = await apiClient.put<SuccessResponse>(`/users/${userId}/badges`, badges);
    
    // Also save to AsyncStorage as fallback
    await AsyncStorage.setItem(`user_${userId}_userBadges`, JSON.stringify(badges));
    
    return { success: response.data?.success || response.status === 200 };
  } catch (error) {
    console.error("Error saving user badges:", error);
    
    // Fallback to AsyncStorage only if API fails
    const userIdString = await getUserId();
    if (userIdString) {
      try {
        await AsyncStorage.setItem(`user_${userIdString}_userBadges`, JSON.stringify(badges));
        return { success: true };
      } catch (storageError) {
        console.error("Error saving to AsyncStorage:", storageError);
      }
    }
    
    return { success: false };
  }
};

/**
 * Clear all badges for the current user - React Native version
 * @returns Success status
 */
export const clearUserBadges = async (): Promise<{ success: boolean }> => {
  try {
    const userIdString = await getUserId();
    const userId = userIdString ? parseInt(userIdString) : null;
    
    if (!userId) {
      return { success: false };
    }
    
    console.log(`Clearing badges for user ${userId}`);
    
    // Real API call
    const response = await apiClient.delete<SuccessResponse>(`/users/${userId}/badges`);
    
    // Also clear from AsyncStorage
    await AsyncStorage.removeItem(`user_${userId}_userBadges`);
    
    return { success: response.data?.success || response.status === 200 };
  } catch (error) {
    console.error("Error clearing user badges:", error);
    
    // Fallback to AsyncStorage if API fails
    const userIdString = await getUserId();
    if (userIdString) {
      try {
        await AsyncStorage.removeItem(`user_${userIdString}_userBadges`);
        return { success: true };
      } catch (storageError) {
        console.error("Error clearing from AsyncStorage:", storageError);
      }
    }
    
    return { success: false };
  }
};