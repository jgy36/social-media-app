// src/utils/sessionUtils.ts

/**
 * Check if code is running in browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Set an item in sessionStorage with proper user isolation
 * @param key The key to set
 * @param value The value to store
 */
export function setSessionItem(key: string, value: string): void {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    // Get current user ID for isolation
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      // Store with user prefix for isolation
      sessionStorage.setItem(`user_${currentUserId}_${key}`, value);
    } else {
      // Fallback to regular storage if no user context
      sessionStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Error setting session item ${key}:`, error);
  }
}

/**
 * Get an item from sessionStorage with proper user isolation
 * @param key The key to retrieve
 * @param defaultValue Optional default value if not found
 */
export function getSessionItem(key: string, defaultValue: string | null = null): string | null {
  if (!isBrowser) return defaultValue; // Return default if not in browser
  
  try {
    // Get current user ID for isolation
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      // Try to get with user prefix first
      const value = sessionStorage.getItem(`user_${currentUserId}_${key}`);
      return value !== null ? value : defaultValue;
    }
    // Fallback to regular retrieval if no user context
    const value = sessionStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Error getting session item ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Remove an item from sessionStorage with proper user isolation
 * @param key The key to remove
 */
export function removeSessionItem(key: string): void {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    // Get current user ID for isolation
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      // Remove with user prefix
      sessionStorage.removeItem(`user_${currentUserId}_${key}`);
    } else {
      // Fallback to regular removal
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing session item ${key}:`, error);
  }
}

/**
 * Get user-specific data from localStorage with proper isolation
 * @param key The data key to retrieve
 * @param defaultValue Optional default value if not found
 */
export function getUserData(key: string, defaultValue: string | null = null): string | null {
  if (!isBrowser) return defaultValue; // Return default if not in browser
  
  try {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) return defaultValue;
    
    const value = localStorage.getItem(`user_${currentUserId}_${key}`);
    return value || defaultValue;
  } catch (error) {
    console.error(`Error getting user data for key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Store user-specific data in localStorage with proper isolation
 * @param key The data key to store
 * @param value The value to store
 */
export function setUserData(key: string, value: string): void {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
      console.error("No current user ID found, data not saved");
      return;
    }
    
    localStorage.setItem(`user_${currentUserId}_${key}`, value);
  } catch (error) {
    console.error(`Error setting user data for key ${key}:`, error);
  }
}

/**
 * Clear all data for the current user
 */
export function clearCurrentUserData(): void {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) return;
    
    // Find all keys belonging to this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`user_${currentUserId}_`)) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear current user
    localStorage.removeItem("currentUserId");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
}