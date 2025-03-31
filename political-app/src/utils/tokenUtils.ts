// src/utils/tokenUtils.ts - Fixed for TypeScript null/undefined issues
import { 
  setSessionItem, 
  getSessionItem, 
  removeSessionItem 
} from './sessionUtils';

// Check if code is running in browser environment
const isBrowser = typeof window !== 'undefined';

// Keys for token storage
const TOKEN_KEY = 'token';
const USER_ID_KEY = 'userId';
const USERNAME_KEY = 'username';
const EMAIL_KEY = 'email';
const DISPLAY_NAME_KEY = 'displayName';
const BIO_KEY = 'bio';
const PROFILE_IMAGE_KEY = 'profileImageUrl';
const IS_AUTHENTICATED_KEY = 'isAuthenticated'; // New key for auth status

// Store token in session-specific storage
export const setToken = (token: string) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    setSessionItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get token from session-specific storage
export const getToken = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    return getSessionItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Set authentication status (without storing an invalid token)
export const setAuthenticated = (status: boolean) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    setSessionItem(IS_AUTHENTICATED_KEY, status ? 'true' : 'false');
  } catch (error) {
    console.error('Error storing auth status:', error);
  }
};

// Check if authenticated (without relying on token)
export const isAuthenticated = (): boolean => {
  if (!isBrowser) return false; // Return false if not in browser
  
  try {
    return getSessionItem(IS_AUTHENTICATED_KEY) === 'true';
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

// Remove token from session-specific storage
export const removeToken = () => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    removeSessionItem(TOKEN_KEY);
    removeSessionItem(IS_AUTHENTICATED_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Check if token exists
export const hasToken = (): boolean => {
  return getToken() !== null;
};

// Store user ID
export const setUserId = (userId: string) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    localStorage.setItem('currentUserId', userId);
    setSessionItem(USER_ID_KEY, userId);
  } catch (error) {
    console.error('Error storing user ID:', error);
  }
};

// Get user ID
export const getUserId = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    // First try from localStorage (more persistent)
    const userIdFromLocalStorage = localStorage.getItem('currentUserId');
    if (userIdFromLocalStorage) {
      return userIdFromLocalStorage;
    }
    
    // Fall back to session storage
    return getSessionItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    return null;
  }
};

// Store username
export const setUsername = (username: string) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    const userId = getUserId();
    if (userId) {
      localStorage.setItem(`user_${userId}_username`, username);
    }
    setSessionItem(USERNAME_KEY, username);
  } catch (error) {
    console.error('Error storing username:', error);
  }
};

// Get username
export const getUsername = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    // First try from user-specific localStorage
    const userId = getUserId();
    if (userId) {
      const username = localStorage.getItem(`user_${userId}_username`);
      if (username) {
        return username;
      }
    }
    
    // Fall back to session storage
    return getSessionItem(USERNAME_KEY);
  } catch (error) {
    console.error('Error retrieving username:', error);
    return null;
  }
};

// Store email
export const setEmail = (email: string) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    const userId = getUserId();
    if (userId) {
      localStorage.setItem(`user_${userId}_email`, email);
    }
    setSessionItem(EMAIL_KEY, email);
  } catch (error) {
    console.error('Error storing email:', error);
  }
};

// Get email
export const getEmail = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    // First try from user-specific localStorage
    const userId = getUserId();
    if (userId) {
      const email = localStorage.getItem(`user_${userId}_email`);
      if (email) {
        return email;
      }
    }
    
    // Fall back to session storage
    return getSessionItem(EMAIL_KEY);
  } catch (error) {
    console.error('Error retrieving email:', error);
    return null;
  }
};

// Store display name
export const setDisplayName = (displayName: string) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    const userId = getUserId();
    if (userId) {
      localStorage.setItem(`user_${userId}_displayName`, displayName);
    }
    setSessionItem(DISPLAY_NAME_KEY, displayName);
  } catch (error) {
    console.error('Error storing display name:', error);
  }
};

// Get display name
export const getDisplayName = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    // First try from user-specific localStorage
    const userId = getUserId();
    if (userId) {
      const displayName = localStorage.getItem(`user_${userId}_displayName`);
      if (displayName) {
        return displayName;
      }
    }
    
    // Fall back to session storage
    return getSessionItem(DISPLAY_NAME_KEY);
  } catch (error) {
    console.error('Error retrieving display name:', error);
    return null;
  }
};

// Store bio
export const setBio = (bio: string) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    const userId = getUserId();
    if (userId) {
      localStorage.setItem(`user_${userId}_bio`, bio);
    }
    setSessionItem(BIO_KEY, bio);
  } catch (error) {
    console.error('Error storing bio:', error);
  }
};

// Get bio
export const getBio = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    // First try from user-specific localStorage
    const userId = getUserId();
    if (userId) {
      const bio = localStorage.getItem(`user_${userId}_bio`);
      if (bio) {
        return bio;
      }
    }
    
    // Fall back to session storage
    return getSessionItem(BIO_KEY);
  } catch (error) {
    console.error('Error retrieving bio:', error);
    return null;
  }
};

// Store profile image URL
export const setProfileImageUrl = (profileImageUrl: string) => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    const userId = getUserId();
    if (userId) {
      localStorage.setItem(`user_${userId}_profileImageUrl`, profileImageUrl);
    }
    setSessionItem(PROFILE_IMAGE_KEY, profileImageUrl);
  } catch (error) {
    console.error('Error storing profile image URL:', error);
  }
};

// Get profile image URL
export const getProfileImageUrl = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    // First try from user-specific localStorage
    const userId = getUserId();
    if (userId) {
      const profileImageUrl = localStorage.getItem(`user_${userId}_profileImageUrl`);
      if (profileImageUrl) {
        return profileImageUrl;
      }
    }
    
    // Fall back to session storage
    return getSessionItem(PROFILE_IMAGE_KEY);
  } catch (error) {
    console.error('Error retrieving profile image URL:', error);
    return null;
  }
};

// Set all user data at once - Fixed to handle null values correctly
export const setUserData = (userData: {
  id: number | string,
  username: string,
  email: string,
  displayName?: string | null,
  bio?: string | null,
  profileImageUrl?: string | null
}) => {
  if (!isBrowser) return; // Skip if not in browser
  
  const userId = String(userData.id);
  
  // Set current user ID
  localStorage.setItem('currentUserId', userId);
  
  // Store each piece with a unique key
  localStorage.setItem(`user_${userId}_username`, userData.username);
  localStorage.setItem(`user_${userId}_userId`, userId);
  localStorage.setItem(`user_${userId}_email`, userData.email);
  
  if (userData.displayName) {
    localStorage.setItem(`user_${userId}_displayName`, userData.displayName);
  }
  
  if (userData.bio) {
    localStorage.setItem(`user_${userId}_bio`, userData.bio);
  }
  
  if (userData.profileImageUrl) {
    localStorage.setItem(`user_${userId}_profileImageUrl`, userData.profileImageUrl);
  }
  
  // Also set in session storage
  setUserId(userId);
  setUsername(userData.username);
  setEmail(userData.email);
  if (userData.displayName) setDisplayName(userData.displayName);
  if (userData.bio) setBio(userData.bio);
  if (userData.profileImageUrl) setProfileImageUrl(userData.profileImageUrl);
  
  // Mark as authenticated
  setAuthenticated(true);
};

// Get all user data at once
export const getUserData = () => {
  if (!isBrowser) {
    // Return empty data if not in browser
    return {
      id: null,
      username: null,
      email: null,
      displayName: null,
      bio: null,
      profileImageUrl: null
    };
  }
  
  const userId = getUserId();
  
  if (!userId) {
    return {
      id: null,
      username: null,
      email: null,
      displayName: null,
      bio: null,
      profileImageUrl: null
    };
  }
  
  return {
    id: userId,
    username: localStorage.getItem(`user_${userId}_username`),
    email: localStorage.getItem(`user_${userId}_email`),
    displayName: localStorage.getItem(`user_${userId}_displayName`),
    bio: localStorage.getItem(`user_${userId}_bio`),
    profileImageUrl: localStorage.getItem(`user_${userId}_profileImageUrl`)
  };
};

// Clear all user data
export const clearUserData = () => {
  if (!isBrowser) return; // Skip if not in browser
  
  const userId = getUserId();
  
  if (userId) {
    // Remove all localStorage items for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`user_${userId}_`)) {
        localStorage.removeItem(key);
      }
    }
  }
  
  // Remove session storage items
  removeSessionItem(USER_ID_KEY);
  removeSessionItem(USERNAME_KEY);
  removeSessionItem(EMAIL_KEY);
  removeSessionItem(DISPLAY_NAME_KEY);
  removeSessionItem(BIO_KEY);
  removeSessionItem(PROFILE_IMAGE_KEY);
  removeToken();
  
  // Clear authentication status
  setAuthenticated(false);
  
  // Clear current user ID
  localStorage.removeItem('currentUserId');
};