export interface PostType {
  id: number;
  author: string; // 🔄 Renamed from `username`
  content: string;
  likes: number;
  isLiked?: boolean; // ✅ Added for tracking liked state
  isSaved?: boolean; // ✅ Added for saved state
  sharesCount?: number; // ✅ Optional count of shares
  commentsCount?: number; // ✅ Optional count of comments
  createdAt: string; // 📌 Java LocalDateTime will be a string
  hashtags?: string[]; // ✅ Array of hashtags in the post
  communityId?: string; // ✅ ID/slug of the community the post belongs to
  communityName?: string; // ✅ Name of the community the post belongs to
}