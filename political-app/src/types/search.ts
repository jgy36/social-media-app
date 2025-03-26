// src/types/search.ts

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
  description?: string;
  content?: string;
  author?: string;
  timestamp?: string;
  followers?: number;
  members?: number;
  postCount?: number;
}