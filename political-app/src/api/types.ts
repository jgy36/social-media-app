// src/api/types.ts
import { PostType } from '@/types/post';
import { CommentType } from '@/types/comment';
import { Politician } from '@/types/politician';


// Re-export these types from follow.ts
export type { FollowResponse, FollowUser } from '@/types/follow';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// User Types
export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  bio?: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateUsernameResponse {
  success: boolean;
  message?: string;
}

// Post Types
export interface CreatePostRequest {
  content: string;
  communityId?: string;
}

// Instead of extending with an empty interface, directly export the type
export type PostResponse = PostType;

export interface SavePostResponse {
  isSaved: boolean;
}

// Community Types
export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  rules?: string[];
  moderators?: string[];
  banner?: string;
  color?: string;
  isJoined: boolean;
  isNotificationsOn?: boolean;
}

export interface CreateCommunityRequest {
  id: string;
  name: string;
  description: string;
  rules?: string[];
  color?: string;
}

export interface CommunityMembershipResponse {
  success: boolean;
  message?: string;
}

// Comment Types
export interface CreateCommentRequest {
  content: string;
}

// Instead of extending with an empty interface, directly export the type
export type CommentResponse = CommentType;

// Search Types
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

// Hashtag Types
export interface HashtagInfo {
  tag: string;
  useCount: number;
  postCount?: number;
}

// Instead of extending with an empty interface, directly export the type
export type PoliticianResponse = Politician;

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Generic API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface HashtagInfo {
  tag: string;
  useCount: number;
  postCount?: number;
}