import { useState } from "react";
import { PostType } from "@/types/post";
import { likePost } from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import CommentModal from "@/components/comments/CommentModal";
import SaveButton from "@/components/feed/SaveButton";
import ShareButton from "@/components/feed/ShareButton";

interface PostProps {
  post: PostType;
}

const Post = ({ post }: PostProps) => {
  const user = useSelector((state: RootState) => state.user);
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const router = useRouter();

  const handleLike = async () => {
    if (!user.token || isLiking) return;
    setIsLiking(true);

    try {
      const updatedPost = await likePost(post.id);
      setIsLiked(!isLiked);
      setLikes(updatedPost.likes || likes);
    } catch (error) {
      console.error("Error liking post:", error);
    }

    setIsLiking(false);
  };

  return (
    <Card className="p-4 shadow-md border border-border transition-all hover:shadow-lg">
      {/* ✅ Clicking opens full post view */}
      <div
        onClick={() => router.push(`/post/${post.id}`)}
        className="cursor-pointer"
      >
        <h3 className="font-semibold text-lg">{post.author}</h3>
        <p className="text-sm text-muted-foreground">{post.content}</p>
      </div>

      {/* ✅ Post Actions */}
      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
        {/* 🔥 Like Button */}
        <Button
          variant="ghost"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
        >
          <Heart className="h-4 w-4" />
          {likes}
        </Button>

        {/* 💬 Comment Button */}
        <Button
          variant="ghost"
          onClick={() => setCommentModalOpen(true)}
          className="flex items-center gap-1 hover:text-blue-500 transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          {post.commentsCount || 0}
        </Button>

        {/* 🔖 Save Button */}
        <SaveButton postId={post.id} isSaved={post.isSaved ?? false} />

        {/* 🔁 Share Button */}
        <ShareButton postId={post.id} sharesCount={post.sharesCount ?? 0} />
      </div>

      {/* ✅ Comment Modal */}
      <CommentModal
        postId={post.id}
        isOpen={isCommentModalOpen}
        onClose={() => setCommentModalOpen(false)}
      />
    </Card>
  );
};

export default Post;
