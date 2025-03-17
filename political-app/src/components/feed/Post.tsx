/* eslint-disable @typescript-eslint/no-explicit-any */
// components/feed/Post.tsx - Updated with clickable hashtags
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

// Function to parse and render content with clickable hashtags
const renderContentWithHashtags = (content: string, router: any) => {
  // Regular expression to match hashtags
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
  
  // Split content by hashtags
  const parts = content.split(hashtagRegex);
  
  return parts.map((part, index) => {
    // Check if this part is a hashtag
    if (part.match(hashtagRegex)) {
      const hashtag = part.substring(1); // Remove the # symbol
      return (
        <span 
          key={index}
          className="text-primary hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigating to post details
            router.push(`/hashtag/${hashtag}`);
          }}
        >
          {part}
        </span>
      );
    }
    
    // Return regular text
    return <span key={index}>{part}</span>;
  });
};

const Post = ({ post }: PostProps) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);

  const handleLike = async () => {
    if (!user.token || isLiking) return;
    setIsLiking(true);

    try {
      const response = await likePost(post.id);
      
      // Toggle the liked state
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      
      // Update likes count - increment if liked, decrement if unliked
      setLikesCount(prevCount => newIsLiked ? prevCount + 1 : Math.max(0, prevCount - 1));
      
      console.log('Like response:', response);
    } catch (error) {
      console.error("Error liking post:", error);
    }

    setIsLiking(false);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to post details
    router.push(`/profile/${post.author}`);
  };

  return (
    <Card className="p-4 shadow-md border border-border transition-all hover:shadow-lg mb-4">
      {/* Post Content - Clickable to view full post */}
      <div
        onClick={() => router.push(`/post/${post.id}`)}
        className="cursor-pointer"
      >
        {/* Author with link to profile */}
        <h3 
          className="font-semibold text-lg hover:text-primary hover:underline"
          onClick={handleAuthorClick}
        >
          {post.author}
        </h3>
        
        {/* Post content with clickable hashtags */}
        <p className="text-sm text-muted-foreground mt-1">
          {renderContentWithHashtags(post.content, router)}
        </p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
        {/* Like Button */}
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigating to post details
            handleLike();
          }}
          disabled={isLiking}
          className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          {likesCount}
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigating to post details
            setCommentModalOpen(true);
          }}
          className="flex items-center gap-1 hover:text-blue-500 transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          {post.commentsCount || 0}
        </Button>

        {/* Save Button */}
        <SaveButton postId={post.id} isSaved={post.isSaved ?? false} />

        {/* Share Button */}
        <ShareButton postId={post.id} sharesCount={post.sharesCount ?? 0} />
      </div>

      {/* Comment Modal */}
      <CommentModal
        postId={post.id}
        isOpen={isCommentModalOpen}
        onClose={() => setCommentModalOpen(false)}
      />
    </Card>
  );
};

export default Post;