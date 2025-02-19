export interface CommentType {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
  };
  createdAt: string; // ✅ Java LocalDateTime comes as a string
  parentCommentId?: number; // ✅ Optional for replies
}
