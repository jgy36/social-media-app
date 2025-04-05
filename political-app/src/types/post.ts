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
  originalPostContent?: string; // Add this field

}