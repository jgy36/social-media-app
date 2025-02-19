import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPostComments, getPostById } from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommentModal from "@/components/comments/CommentModal";
import { MessageCircle } from "lucide-react";
import { PostType } from "@/types/post";
import { CommentType } from "@/types/comment"; // ✅ Make sure this exists

const PostDetail = () => {
  const router = useRouter();
  const { postId } = router.query;
  
  const [post, setPost] = useState<PostType | null>(null); // ✅ Define type
  const [comments, setComments] = useState<CommentType[]>([]); // ✅ Define type
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);

  useEffect(() => {
    if (postId) {
      const numericPostId = Array.isArray(postId) ? parseInt(postId[0]) : parseInt(postId); // ✅ Convert to number safely
      if (!isNaN(numericPostId)) {
        getPostById(numericPostId).then(setPost);
        getPostComments(numericPostId).then(setComments);
      }
    }
  }, [postId]);

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
