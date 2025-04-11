export interface PostType {
  id: number;
  author: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  sharesCount?: number;
  repostsCount?: number;
  repostCount?: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt?: string; // New field for tracking when a post was edited
  hashtags?: string[];
  communityId?: string;
  communityName?: string;
  communityColor?: string; // Add community color field

  // Repost-related fields - support both property names
  isRepost?: boolean;
  repost?: boolean; // Add this for backward compatibility
  originalPostId?: number;
  originalAuthor?: string;
  originalPostContent?: string;
}
