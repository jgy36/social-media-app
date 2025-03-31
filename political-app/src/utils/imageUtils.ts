// src/utils/imageUtils.ts

// Helper function to get a clean image URL
export const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return ''; // Return empty string for null/undefined values
  }
  
  // Skip processing for data URLs (Base64)
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If the URL is already absolute (starts with http), use our proxy
  if (imageUrl.startsWith('http')) {
    // For backend images (localhost:8080), route through our proxy
    if (imageUrl.includes('localhost:8080') && imageUrl.includes('/uploads/')) {
      // Use image proxy API or direct backend URL
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    }
    // For external URLs (like Dicebear), keep them as is
    return imageUrl;
  }
  
  // If the URL is for an uploaded file from our backend (starts with /uploads/)
  if (imageUrl.startsWith('/uploads/')) {
    // Route through our proxy
    const backendUrl = `http://localhost:8080${imageUrl}`;
    return `/api/image-proxy?url=${encodeURIComponent(backendUrl)}`;
  }
  
  // Otherwise, just return the URL as is
  return imageUrl;
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
 * Debug version with logging
 */
export const getProfileImageUrl = (
  profileImageUrl: string | null | undefined, 
  username: string | null | undefined
): string => {
  // Log for debugging
  console.log(`getProfileImageUrl called with:`, { profileImageUrl, username });
  
  if (profileImageUrl) {
    const result = getFullImageUrl(profileImageUrl);
    console.log(`Processed URL: ${result}`);
    return result;
  }
  
  const defaultUrl = getDefaultAvatarUrl(username);
  console.log(`Using default URL: ${defaultUrl}`);
  return defaultUrl;
};