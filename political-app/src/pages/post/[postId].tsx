import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPostComments, getPostById } from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommentModal from "@/components/comments/CommentModal";
import { MessageCircle } from "lucide-react";
import { PostType } from "@/types/post";
import { CommentType } from "@/types/comment";
import Navbar from "@/components/navbar/Navbar";
import { useTheme } from "@/hooks/useTheme";

const PostDetail = () => {
  const router = useRouter();
  const { postId } = router.query;
  const { theme } = useTheme();

  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);

  useEffect(() => {
    if (postId) {
      const numericPostId = Array.isArray(postId) ? parseInt(postId[0]) : parseInt(postId);
      if (!isNaN(numericPostId)) {
        getPostById(numericPostId).then(setPost);
        getPostComments(numericPostId).then(setComments);
      }
    }
  }, [postId]);

  if (!post) return <p className="text-center">Loading...</p>;

  return (
    <div className={`${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen`}> 
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card className="p-6 shadow-lg border border-border rounded-lg">
          <h3 className="font-semibold text-lg">{post.author}</h3>
          <p className="mt-2 text-md text-muted-foreground">{post.content}</p>
          <Button onClick={() => setCommentModalOpen(true)} className="mt-4 flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600">
            <MessageCircle className="h-4 w-4" /> Add Comment
          </Button>
        </Card>

        <div className="mt-6 space-y-4">
          {comments.length > 0 ? comments.map((comment) => (
            <Card key={comment.id} className="p-4 bg-gray-800 text-white shadow-md border border-border rounded-lg">
              <p className="text-sm">{comment.content}</p>
            </Card>
          )) : (
            <p className="text-center text-gray-400">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
      <CommentModal postId={post.id} isOpen={isCommentModalOpen} onClose={() => setCommentModalOpen(false)} />
    </div>
  );
};

export default PostDetail;
