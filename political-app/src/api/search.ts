// src/api/search.ts - Fixed with better error handling
import { apiClient, getErrorMessage } from "./apiClient";
import { HashtagInfo } from "./types";
import { ApiSearchResult } from '@/types/search';

// Debug logging for search issues
const DEBUG_SEARCH = true;

/**
 * Get trending hashtags
 */
export const getTrendingHashtags = async (
  limit: number = 10
): Promise<HashtagInfo[]> => {
  try {
    const response = await apiClient.get<HashtagInfo[]>(
      `/hashtags/trending/${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    return [];
  }
};

/**
 * Get hashtag information
 */
export const getHashtagInfo = async (
  tag: string
): Promise<HashtagInfo | null> => {
  try {
    // Ensure clean tag (no # prefix)
    const cleanTag = tag.startsWith("#") ? tag.substring(1) : tag;

    const response = await apiClient.get<HashtagInfo>(
      `/hashtags/info/${cleanTag}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting hashtag info for ${tag}:`, error);
    return null;
  }
};

/**
 * Search for hashtags
 */
export const searchHashtags = async (query: string): Promise<HashtagInfo[]> => {
  try {
    // First try to search using the search endpoint
    const response = await apiClient.get<HashtagInfo[]>(
      `/hashtags/search?query=${encodeURIComponent(query)}`
    );

    // If we get an array directly, use it
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Handle potential response formats for a single hashtag
    if (response.data && typeof response.data === "object") {
      return [response.data];
    }

    return [];
  } catch (error) {
    console.error(`Error searching hashtags with query ${query}:`, error);
    return [];
  }
};

/**
 * Get unified search results (users, communities, hashtags)
 * With improved error handling and automatic retries for first search
 */
export const getUnifiedSearchResults = async (
  query: string,
  type?: "user" | "community" | "hashtag" | "post"
): Promise<ApiSearchResult[]> => {
  // Extract the actual query part from any URL parameters
  const queryString = query.includes('?') 
    ? query.split('?')[0] 
    : query;
  
  // Don't attempt empty searches
  if (!queryString || queryString.trim() === '') {
    return [];
  }
  
  try {
    // Add timestamp to bust potential cache issues
    const timestamp = Date.now();
    
    // Construct URL based on the query and type
    const baseUrl = `/search?query=${encodeURIComponent(queryString)}&t=${timestamp}`;
    const searchUrl = type ? `${baseUrl}&type=${type}` : baseUrl;
    
    if (DEBUG_SEARCH) {
      console.log('🔍 Sending search request to:', searchUrl);
    }
    
    // Make the API request with cache prevention headers
    const response = await apiClient.get<ApiSearchResult[]>(searchUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (DEBUG_SEARCH) {
      console.log('✅ Search API response:', response.data);
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // If response isn't an array, check if it's a JSON object we can convert
    if (response.data && typeof response.data === 'object') {
      try {
        if (DEBUG_SEARCH) {
          console.log('⚠️ Search response is not an array, trying to convert:', response.data);
        }
        // Try to extract results from a container object if present
        if ('results' in (response.data as any) && Array.isArray((response.data as any).results)) {
          return (response.data as any).results;
        }
        
        // If not an array but has properties like 'type', it might be a single result
        if ('type' in (response.data as any)) {
          return [response.data as ApiSearchResult];
        }
      } catch (parseErr) {
        console.error('Failed to parse search response:', parseErr);
      }
    }
    
    // If we couldn't process the response, return empty array
    console.error('Search response format unexpected:', response.data);
    return [];
    
  } catch (error) {
    console.error(`Error in unified search for "${queryString}":`, error);

    // Try fallback search methods
    console.log('🔍 Attempting fallback search...');
    return fallbackSearch(queryString, type);
  }
};

/**
 * Fallback search implementation that searches individual endpoints
 */
const fallbackSearch = async (
  query: string,
  type?: "user" | "community" | "hashtag" | "post"
): Promise<ApiSearchResult[]> => {
  const results: ApiSearchResult[] = [];
  
  // If type is specified, only search that type
  if (type) {
    switch (type) {
      case 'user':
        await searchUsers(query, results);
        break;
      case 'community':
        await searchCommunities(query, results);
        break;
      case 'hashtag':
        await searchHashtagsAndAddToResults(query, results);
        break;
      case 'post':
        await searchPosts(query, results);
        break;
    }
    return results;
  }
  
  // Otherwise search all types
  try {
    await Promise.allSettled([
      searchUsers(query, results),
      searchCommunities(query, results),
      searchHashtagsAndAddToResults(query, results),
      searchPosts(query, results)
    ]);
  } catch (error) {
    console.error('Error in fallback search:', error);
  }
  
  if (DEBUG_SEARCH) {
    console.log('🔄 Fallback search results:', results);
  }
  
  return results;
};

/**
 * Search users and add results to the array
 */
const searchUsers = async (query: string, results: ApiSearchResult[]): Promise<void> => {
  try {
    const response = await apiClient.get(
      `/users/search?query=${encodeURIComponent(query)}`
    );
    
    if (Array.isArray(response.data)) {
      results.push(
        ...response.data.map((user) => ({
          id: user.id,
          type: "user" as const,
          name: user.displayName || user.username,
          username: user.username,
          bio: user.bio,
          followersCount: user.followersCount,
        }))
      );
    }
  } catch (error) {
    console.error("Error searching users:", error);
  }
};

/**
 * Search communities and add results to the array
 */
const searchCommunities = async (query: string, results: ApiSearchResult[]): Promise<void> => {
  try {
    const response = await apiClient.get(
      `/communities/search?query=${encodeURIComponent(query)}`
    );
    
    if (Array.isArray(response.data)) {
      results.push(
        ...response.data.map((community) => ({
          id: community.id,
          type: "community" as const,
          name: community.name,
          description: community.description,
          members: community.members,
        }))
      );
    }
  } catch (error) {
    console.error("Error searching communities:", error);
  }
};

/**
 * Search hashtags and add results to the array
 */
const searchHashtagsAndAddToResults = async (query: string, results: ApiSearchResult[]): Promise<void> => {
  try {
    const hashtagResults = await searchHashtags(query);
    
    results.push(
      ...hashtagResults.map((hashtag) => ({
        id: hashtag.tag.replace(/^#/, ""),
        type: "hashtag" as const,
        name: hashtag.tag,
        tag: hashtag.tag,
        count: hashtag.useCount,
        postCount: hashtag.useCount,
      }))
    );
  } catch (error) {
    console.error("Error searching hashtags:", error);
  }
};

/**
 * Search posts and add results to the array
 */
const searchPosts = async (query: string, results: ApiSearchResult[]): Promise<void> => {
  try {
    const response = await apiClient.get(
      `/posts/search?query=${encodeURIComponent(query)}`
    );
    
    if (Array.isArray(response.data)) {
      results.push(
        ...response.data.map((post) => ({
          id: post.id,
          type: "post" as const,
          content: post.content,
          author: post.author,
          createdAt: post.createdAt,
        }))
      );
    }
  } catch (error) {
    console.error("Error searching posts:", error);
  }
};