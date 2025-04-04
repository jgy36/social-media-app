// Updated post.ts with more explicit repost fields
export interface PostType {
  id: number;
  author: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  sharesCount?: number;
  commentsCount?: number;
  createdAt: string;
  hashtags?: string[];
  communityId?: string;
  communityName?: string;
  
  // Repost-related fields
  isRepost?: boolean;
  originalPostId?: number;
  repostsCount?: number;
  originalAuthor?: string;
  
  // Original post content (for API responses that include the full original post)
  originalPost?: PostType;
}