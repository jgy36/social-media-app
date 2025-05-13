// src/types/search.ts - Updated for React Native

/**
 * Interface for search results coming from the API
 */
export interface ApiSearchResult {
  id?: string | number;
  type: 'user' | 'community' | 'hashtag' | 'post';
  name?: string;
  username?: string;
  bio?: string;
  tag?: string;
  description?: string;
  content?: string;
  author?: string;
  createdAt?: string;
  followersCount?: number;
  members?: number;
  count?: number;
  postCount?: number;
}

/**
 * Interface for formatted search results used in UI components
 */
export interface SearchResult {
  id: string | number;
  type: 'user' | 'community' | 'hashtag' | 'post';
  name: string;
  username?: string; // Include username
  description?: string;
  content?: string;
  author?: string;
  timestamp?: string;
  followers?: number;
  members?: number;
  postCount?: number;
}

/**
 * Helper function to convert API search results to UI search results
 */
export const formatApiSearchResult = (apiResult: ApiSearchResult): SearchResult => {
  return {
    id: apiResult.id || '',
    type: apiResult.type,
    name: apiResult.name || apiResult.username || apiResult.tag || '',
    username: apiResult.username, // Preserve username
    description: apiResult.description || apiResult.bio || '',
    content: apiResult.content || '',
    author: apiResult.author || '',
    timestamp: apiResult.createdAt || '',
    followers: apiResult.followersCount,
    members: apiResult.members,
    postCount: apiResult.postCount || apiResult.count
  };
};