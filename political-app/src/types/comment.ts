// In src/types/comment.ts, update the CommentType interface:
export interface CommentType {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
  };
  createdAt: string;
  parentCommentId?: number;
  likesCount?: number;
  likedByCurrentUser?: boolean;
}