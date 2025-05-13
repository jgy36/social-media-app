// src/utils/imageUtils.ts - React Native version

/**
 * Get a properly formatted URL for an image from the backend
 * This function ensures all image URLs from the backend are properly handled
 */
export const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return ''; // Return empty string for null/undefined values
  }
  
  // Skip processing for data URLs (Base64)
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // For React Native, we need to handle backend URLs differently
  // Since we don't have a proxy, we need to handle CORS and auth at the API level
  if (imageUrl.includes('localhost:8080') || imageUrl.startsWith('http://localhost:8080')) {
    // In development, use the direct URL but ensure it's absolute
    return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
  }
  
  // If the URL is a relative path from our backend (starts with /uploads/)
  if (imageUrl.startsWith('/uploads/')) {
    // In React Native, we need to use the full backend URL
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // For external URLs (like Dicebear), keep them as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, assume it's a relative backend URL
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  return `${API_BASE_URL}${imageUrl}`;
};

/**
 * Get a default avatar URL for a username
 */
export const getDefaultAvatarUrl = (username: string | null | undefined): string => {
  if (!username) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
};

/**
 * Get a profile image URL, falling back to a default avatar
 * Will properly route through the backend when needed
 */
export const getProfileImageUrl = (
  profileImageUrl: string | null | undefined, 
  username: string | null | undefined
): string => {
  console.log(`getProfileImageUrl called with:`, { profileImageUrl, username });
  
  if (profileImageUrl) {
    // Remove any existing timestamp parameters
    let cleanUrl = profileImageUrl;
    if (cleanUrl.includes('?t=')) {
      cleanUrl = cleanUrl.split('?t=')[0];
    }
    
    // Process the URL to ensure it's properly formatted
    const processedUrl = getFullImageUrl(cleanUrl);
    
    // Add a fresh timestamp for cache busting
    const timestamp = Date.now();
    const finalUrl = processedUrl.includes('?') 
      ? `${processedUrl}&t=${timestamp}` 
      : `${processedUrl}?t=${timestamp}`;
    
    console.log(`Processed profile image URL: ${finalUrl}`);
    return finalUrl;
  }
  
  // Default avatar as fallback
  const defaultUrl = getDefaultAvatarUrl(username);
  console.log(`Using default URL: ${defaultUrl}`);
  return defaultUrl;
};

/**
 * Get the API base URL for the current environment
 */
export const getApiBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};