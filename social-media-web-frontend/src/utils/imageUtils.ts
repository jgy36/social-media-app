// src/utils/imageUtils.ts - Fixed version

/**
 * Get a properly formatted URL for an image from the backend
 * This function ensures all image URLs from the backend go through the image proxy
 */
export const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return ''; // Return empty string for null/undefined values
  }
  
  // Skip processing for data URLs (Base64)
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Create the image proxy URL for any backend image
  // This ensures authentication and CORS issues are handled
  if (imageUrl.includes('localhost:8080') || imageUrl.startsWith('http://localhost:8080')) {
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  }
  
  // If the URL is a relative path from our backend (starts with /uploads/)
  if (imageUrl.startsWith('/uploads/')) {
    // Route through our proxy with the complete backend URL
    const backendUrl = `http://localhost:8080${imageUrl}`;
    return `/api/image-proxy?url=${encodeURIComponent(backendUrl)}`;
  }
  
  // For external URLs (like Dicebear), keep them as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
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
 * Will properly route through the image proxy when needed
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
    
    // Process the URL through our proxy if it's a backend URL
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