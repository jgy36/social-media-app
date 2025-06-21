/* eslint-disable @typescript-eslint/no-unused-vars */
// src/api/types.ts - Updated with profile fields
import { PostType } from "@/types/post";
import { CommentType } from "@/types/comment";
import { CommunityData, CommunityMembershipResponse } from "@/types/community";
import { Politician } from "@/types/politician";
import { FollowResponse, FollowUser } from "@/types/follow";

// Re-export these types from follow.ts
export type { FollowResponse, FollowUser } from "@/types/follow";

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

// Update in src/api/types.ts
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string; // Add this field
}

// User Types
export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
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

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  profileImage?: File;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
  profileImageUrl?: string;
}

// Post Types
export interface CreatePostRequest {
  content: string;
  originalPostId?: number;
  repost?: boolean; // This should be "repost", not "isRepost" to match the backend
  communityId?: string | number; // Note: accepting both string and number types for compatibility
  // Add these new fields for media support:
  media?: File[];
  mediaTypes?: string[];
  altTexts?: string[];
}

// Instead of extending with an empty interface, directly export the type
// In your types.ts file, update the PostResponse interface:

export interface PostResponse {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  hashtags?: string[];
  communityId?: string;
  communityName?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  sharesCount?: number;

  // Repost-related fields
  isRepost?: boolean;
  originalPostId?: number;
  repostsCount?: number;
  repostCount?: number; // Add alias for compatibility
  originalAuthor?: string;
  originalPostContent?: string; // Add this critical missing field
}

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

export type { CommunityData, CommunityMembershipResponse };

// Comment Types
export interface CreateCommentRequest {
  content: string;
}

// Instead of extending with an empty interface, directly export the type
export type CommentResponse = CommentType;

// Search Types
export interface SearchResult {
  id: string | number;
  type: "user" | "community" | "hashtag" | "post";
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

// src/api/types.ts
export interface AuthResponse {
  token?: string;
  requires2FA?: boolean;
  tempToken?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    displayName?: string;
    bio?: string;
    profileImageUrl?: string;
    role?: "USER" | "ADMIN";  // Change from string to specific types
  };
  sessionId?: string;
  success?: boolean;
  message?: string;
}

export interface TwoFAVerificationRequest {
  tempToken: string;
  code: string;
}