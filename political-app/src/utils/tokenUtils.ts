// src/utils/tokenUtils.ts - Updated version with SSR support
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

// Remove token from session-specific storage
export const removeToken = () => {
  if (!isBrowser) return; // Skip if not in browser
  
  try {
    removeSessionItem(TOKEN_KEY);
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
    setSessionItem(USER_ID_KEY, userId);
  } catch (error) {
    console.error('Error storing user ID:', error);
  }
};

// Get user ID
export const getUserId = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
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
    setSessionItem(USERNAME_KEY, username);
  } catch (error) {
    console.error('Error storing username:', error);
  }
};

// Get username
export const getUsername = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
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
    setSessionItem(EMAIL_KEY, email);
  } catch (error) {
    console.error('Error storing email:', error);
  }
};

// Get email
export const getEmail = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
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
    setSessionItem(DISPLAY_NAME_KEY, displayName);
  } catch (error) {
    console.error('Error storing display name:', error);
  }
};

// Get display name
export const getDisplayName = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
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
    setSessionItem(BIO_KEY, bio);
  } catch (error) {
    console.error('Error storing bio:', error);
  }
};

// Get bio
export const getBio = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
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
    setSessionItem(PROFILE_IMAGE_KEY, profileImageUrl);
  } catch (error) {
    console.error('Error storing profile image URL:', error);
  }
};

// Get profile image URL
export const getProfileImageUrl = (): string | null => {
  if (!isBrowser) return null; // Return null if not in browser
  
  try {
    return getSessionItem(PROFILE_IMAGE_KEY);
  } catch (error) {
    console.error('Error retrieving profile image URL:', error);
    return null;
  }
};

// Set all user data at once
export const setUserData = (userData: {
  id: number | string,
  username: string,
  email: string,
  displayName?: string,
  bio?: string,
  profileImageUrl?: string
}) => {
  if (!isBrowser) return; // Skip if not in browser
  
  setUserId(String(userData.id));
  setUsername(userData.username);
  setEmail(userData.email);
  
  if (userData.displayName) {
    setDisplayName(userData.displayName);
  }
  
  if (userData.bio) {
    setBio(userData.bio);
  }
  
  if (userData.profileImageUrl) {
    setProfileImageUrl(userData.profileImageUrl);
  }
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
  
  return {
    id: getUserId(),
    username: getUsername(),
    email: getEmail(),
    displayName: getDisplayName(),
    bio: getBio(),
    profileImageUrl: getProfileImageUrl()
  };
};

// Clear all user data
export const clearUserData = () => {
  if (!isBrowser) return; // Skip if not in browser
  
  removeSessionItem(USER_ID_KEY);
  removeSessionItem(USERNAME_KEY);
  removeSessionItem(EMAIL_KEY);
  removeSessionItem(DISPLAY_NAME_KEY);
  removeSessionItem(BIO_KEY);
  removeSessionItem(PROFILE_IMAGE_KEY);
  removeToken();
};