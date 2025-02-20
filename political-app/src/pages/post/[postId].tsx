import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getPostById, getPostComments } from "@/utils/api";
import { PostType } from "@/types/post";
import { CommentType } from "@/types/comment";
import { Card } from "@/components/ui/card";
import CommentModal from "@/components/comments/CommentModal";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PostDetail = () => {
  const router = useRouter();
  const { postId } = router.query; // ✅ Get the post ID from the URL
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);

  useEffect(() => {
    if (postId) {
      const numericPostId = Array.isArray(postId) ? parseInt(postId[0]) : parseInt(postId);
      if (!isNaN(numericPostId)) {
        getPostById(numericPostId).then(setPost).catch(() => router.push("/404"));
        getPostComments(numericPostId).then(setComments);
      }
    }
  }, [postId, router]);

  if (!post) return <p>Loading...</p>;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg">{post.author}</h3>
      <p>{post.content}</p>

      <Button onClick={() => setCommentModalOpen(true)} className="mt-4 flex items-center gap-1">
        <MessageCircle className="h-4 w-4" /> Add Comment
      </Button>

      {comments.map((comment) => (
        <Card key={comment.id} className="mt-4 p-3">
          <p className="text-sm">{comment.content}</p>
        </Card>
      ))}

      <CommentModal postId={post.id} isOpen={isCommentModalOpen} onClose={() => setCommentModalOpen(false)} />
    </Card>
  );
};

export default PostDetail;
