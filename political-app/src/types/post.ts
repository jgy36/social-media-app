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
  hashtags?: string[];
  communityId?: string;
  communityName?: string;
  
  // Repost-related fields - support both property names
  isRepost?: boolean;
  repost?: boolean;  // Add this for backward compatibility
  originalPostId?: number;
  originalAuthor?: string;
  originalPostContent?: string;
}