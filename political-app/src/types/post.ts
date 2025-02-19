export interface PostType {
  id: number;
  author: string; // 🔄 Renamed from `username`
  content: string;
  likes: number;
  createdAt: string; // 📌 Java LocalDateTime will be a string
  commentsCount?: number; // ✅ Changed to commentsCount
  sharesCount?: number; // ✅ Changed to sharesCount
  isSaved?: boolean; // ✅ Added isSaved to track saved state
}
