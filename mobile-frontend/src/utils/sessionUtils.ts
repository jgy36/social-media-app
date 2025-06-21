// src/utils/sessionUtils.ts - React Native version
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Set an item in AsyncStorage with proper user isolation
 * @param key The key to set
 * @param value The value to store
 */
export async function setSessionItem(key: string, value: string): Promise<void> {
  try {
    // Get current user ID for isolation
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    
    // Use a prefixed key for isolation if we have a user ID
    const storageKey = currentUserId ? `user_${currentUserId}_${key}` : key;
    
    // Store in AsyncStorage (session-like behavior in React Native)
    await AsyncStorage.setItem(storageKey, value);
  } catch (error) {
    console.error(`Error setting session item ${key}:`, error);
  }
}

/**
 * Get an item from AsyncStorage with proper user isolation
 * @param key The key to retrieve
 * @param defaultValue Optional default value if not found
 */
export async function getSessionItem(key: string, defaultValue: string | null = null): Promise<string | null> {
  try {
    // Get current user ID for isolation
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    
    // First try with user prefix if we have a user ID
    if (currentUserId) {
      const value = await AsyncStorage.getItem(`user_${currentUserId}_${key}`);
      if (value !== null) {
        return value;
      }
    }
    
    // Fall back to regular key
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Error getting session item ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Remove an item from AsyncStorage with proper user isolation
 * @param key The key to remove
 */
export async function removeSessionItem(key: string): Promise<void> {
  try {
    // Get current user ID for isolation
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    
    // Remove prefixed key if we have a user ID
    if (currentUserId) {
      await AsyncStorage.removeItem(`user_${currentUserId}_${key}`);
    }
    
    // Also remove regular key
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing session item ${key}:`, error);
  }
}

/**
 * Get user-specific data from AsyncStorage with proper isolation
 * @param key The data key to retrieve
 * @param defaultValue Optional default value if not found
 */
export async function getUserData(key: string, defaultValue: string | null = null): Promise<string | null> {
  try {
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    if (!currentUserId) return defaultValue;
    
    const value = await AsyncStorage.getItem(`user_${currentUserId}_${key}`);
    return value || defaultValue;
  } catch (error) {
    console.error(`Error getting user data for key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Store user-specific data in AsyncStorage with proper isolation
 * @param key The data key to store
 * @param value The value to store
 */
export async function setUserData(key: string, value: string): Promise<void> {
  try {
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    if (!currentUserId) {
      console.error("No current user ID found, data not saved");
      return;
    }
    
    await AsyncStorage.setItem(`user_${currentUserId}_${key}`, value);
  } catch (error) {
    console.error(`Error setting user data for key ${key}:`, error);
  }
}

/**
 * Clear all data for the current user
 */
export async function clearCurrentUserData(): Promise<void> {
  try {
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    if (!currentUserId) return;
    
    // Get all keys from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Find all keys that belong to the current user
    const userKeys = allKeys.filter(key => key.startsWith(`user_${currentUserId}_`));
    
    // Remove all user-specific data
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
    }
    
    // Remove current user ID
    await AsyncStorage.removeItem("currentUserId");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
}

/**
 * Get all keys for the current user (for debugging purposes)
 */
export async function getCurrentUserKeys(): Promise<string[]> {
  try {
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    if (!currentUserId) return [];
    
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter(key => key.startsWith(`user_${currentUserId}_`));
  } catch (error) {
    console.error("Error getting current user keys:", error);
    return [];
  }
}