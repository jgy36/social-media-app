// Update your post.ts file with this enhanced interface
export interface PostType {
  id: number;
  author: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  sharesCount?: number;
  repostsCount?: number; // Keep the original property
  repostCount?: number;  // Add this alias for compatibility
  commentsCount?: number;
  createdAt: string;
  hashtags?: string[];
  communityId?: string;
  communityName?: string;
  
  // Repost-related fields
  isRepost?: boolean;
  originalPostId?: number;
  originalAuthor?: string;
  originalPostContent?: string;
}