// src/types/follow.ts

/**
 * Interface representing a follow relationship user object
 */
export interface FollowUser {
  id: number;
  username: string;
  isFollowing?: boolean;
  profileImage?: string;
  displayName?: string;
  bio?: string;
}

/**
 * Interface for the response from follow/unfollow operations
 */
export interface FollowResponse {
  isFollowing: boolean;
  isRequested?: boolean; // Add this property to fix the error
  followersCount: number;
  followingCount: number;
  success?: boolean;
  message?: string;
}

/**
 * Interface for follow status, counts and related information
 */
export interface FollowStatus {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

/**
 * Interface for followers/following list response
 */
export interface FollowListResponse {
  users: FollowUser[];
  hasMore: boolean;
  nextPage?: number;
}

export interface FollowRequestType {
  id: number;
  user: FollowUser;
  createdAt: string;
}
