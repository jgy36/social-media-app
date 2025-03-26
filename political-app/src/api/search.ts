// src/api/search.ts
import { apiClient } from "./apiClient";
import { HashtagInfo } from "./types";
import { ApiSearchResult } from '@/types/search';


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

    // Try one more approach as fallback - try to get posts by hashtag
    try {
      const postsResponse = await apiClient.get(`/posts`, {
        params: { tag: query.replace(/^#/, "") },
      });

      // If we have posts, create a hashtag object
      if (Array.isArray(postsResponse.data) && postsResponse.data.length > 0) {
        return [
          {
            tag: query.startsWith("#") ? query : `#${query}`,
            useCount: postsResponse.data.length,
          },
        ];
      }
    } catch (fallbackError) {
      console.error("Error in hashtag fallback search:", fallbackError);
    }

    return [];
  }
};

/**
 * Get unified search results (users, communities, hashtags)
 */
export const getUnifiedSearchResults = async (
  query: string,
  type?: "user" | "community" | "hashtag" | "post"
): Promise<ApiSearchResult[]> => {
  try {
    // If a specific type is provided, use a more targeted endpoint
    if (type) {
      const response = await apiClient.get<ApiSearchResult[]>(
        `/search?query=${encodeURIComponent(query)}&type=${type}`
      );
      return response.data;
    }

    // Otherwise, use the general search endpoint
    const response = await apiClient.get<ApiSearchResult[]>(
      `/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error in unified search for "${query}":`, error);

    // Manual fallback: Try to search each type individually and combine results
    const results: ApiSearchResult[] = [];

    try {
      // Try to search users
      const userResults = await apiClient.get(
        `/users/search?query=${encodeURIComponent(query)}`
      );
      if (Array.isArray(userResults.data)) {
        results.push(
          ...userResults.data.map((user) => ({
            id: user.id,
            type: "user" as const,
            name: user.username,
            username: user.username,
            bio: user.bio,
            followersCount: user.followersCount,
          }))
        );
      }
    } catch (userError) {
      console.error("Error searching users:", userError);
    }

    try {
      // Try to search communities
      const communityResults = await apiClient.get(
        `/communities/search?query=${encodeURIComponent(query)}`
      );
      if (Array.isArray(communityResults.data)) {
        results.push(
          ...communityResults.data.map((community) => ({
            id: community.id,
            type: "community" as const,
            name: community.name,
            description: community.description,
            members: community.members,
          }))
        );
      }
    } catch (communityError) {
      console.error("Error searching communities:", communityError);
    }

    try {
      // Try to search hashtags
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
    } catch (hashtagError) {
      console.error("Error searching hashtags:", hashtagError);
    }

    return results;
  }
};