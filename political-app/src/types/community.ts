// src/types/community.ts

/**
 * Interface for community data displayed in the application
 */
export interface CommunityData {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  rules: string[];
  moderators: string[];
  banner?: string;
  color?: string;
  isJoined: boolean;
  isNotificationsOn: boolean;
}

/**
 * Response for community membership operations
 */
export interface CommunityMembershipResponse {
  success: boolean;
  message?: string;
}