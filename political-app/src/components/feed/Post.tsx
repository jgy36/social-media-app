// components/feed/Post.tsx
import { useState } from "react";
import { PostType } from "@/types/post";
import { likePost } from "@/api/posts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import CommentModal from "@/components/comments/CommentModal";
import SaveButton from "@/components/feed/SaveButton";
import ShareButton from "@/components/feed/ShareButton";
import RepostButton from "@/components/feed/RepostButton";
import { PostProps } from "@/types/componentProps";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";
import AuthorAvatar from "@/components/shared/AuthorAvatar";

// Function to safely render content with clickable hashtags
const renderContentWithHashtags = (
  content: string,
  onHashtagClick: (hashtag: string) => void
) => {
  if (!content) return content;

  // Regular expression to match hashtags
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;

  // Split content by hashtags
  const parts = content.split(hashtagRegex);

  return parts.map((part, index) => {
    // Check if this part is a hashtag
    if (part.match(hashtagRegex)) {
      return (
        <span
          key={index}
          className="text-primary hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigating to post details
            onHashtagClick(part);
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

// Helper function to safely get hashtags as an array of strings
const safeGetHashtags = (post: PostType): string[] => {
  if (!post.hashtags) return [];

  // If hashtags is already a string array, return it
  if (
    Array.isArray(post.hashtags) &&
    post.hashtags.every((tag) => typeof tag === "string")
  ) {
    return post.hashtags;
  }

  // If hashtags is an array but contains objects, extract the tag property
  if (Array.isArray(post.hashtags)) {
    return post.hashtags
      .map((tag) => {
        if (typeof tag === "string") return tag;
        if (
          tag &&
          typeof tag === "object" &&
          "tag" in (tag as Record<string, unknown>)
        ) {
          return (tag as Record<string, unknown>).tag as string;
        }
        return "";
      })
      .filter((tag) => tag !== "");
  }

  // If hashtags is a single object with a tag property
  if (
    post.hashtags &&
    typeof post.hashtags === "object" &&
    "tag" in post.hashtags
  ) {
    const tag = (post.hashtags as any).tag;
    return typeof tag === "string" ? [tag] : [];
  }

  // Fallback to empty array
  return [];
};

const Post: React.FC<PostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
}) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);

  // Make sure post.author and post.content are strings, not objects
  const authorName =
    typeof post.author === "string"
      ? post.author
      : post.author &&
        typeof post.author === "object" &&
        "username" in (post.author as any)
      ? String((post.author as any).username)
      : "Unknown User";

  // Extract profile image URL if available
  const profileImageUrl = 
    typeof post.author === "object" && 
    post.author && 
    "profileImageUrl" in (post.author as any)
      ? (post.author as any).profileImageUrl
      : null;
      
  // If authorDetails is available as a separate field, use that
  const authorDetails = (post as any).authorDetails || null;
  const authorDetailsImageUrl = 
    authorDetails && 
    typeof authorDetails === "object" && 
    "profileImageUrl" in authorDetails
      ? authorDetails.profileImageUrl
      : null;
      
  // Final image URL to use
  const finalImageUrl = profileImageUrl || authorDetailsImageUrl;
  
  const postContent =
    typeof post.content === "string"
      ? post.content
      : post.content
      ? JSON.stringify(post.content)
      : "";

  // Function to handle hashtag click
  const handleHashtagClick = (hashtag: string) => {
    // Remove the # prefix for URL
    const tag = hashtag.startsWith("#") ? hashtag.substring(1) : hashtag;
    router.push(`/hashtag/${tag}`);
  };

  const handleLike = async () => {
    if (!user.token || isLiking) return;
    setIsLiking(true);

    try {
      const response = await likePost(post.id);

      // Toggle the liked state
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);

      // Update likes count - increment if liked, decrement if unliked
      setLikesCount((prevCount) =>
        newIsLiked ? prevCount + 1 : Math.max(0, prevCount - 1)
      );

      console.log("Like response:", response);
    } catch (error) {
      console.error("Error liking post:", error);
    }

    setIsLiking(false);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to post details
    router.push(`/profile/${post.author}`);
  };

  // Safely get hashtags as an array of strings
  const safeHashtags = safeGetHashtags(post);

  return (
    <Card className="overflow-hidden bg-card dark:bg-card/95 shadow-md hover:shadow-lg border-2 border-black/70 dark:border-white/70 outline outline-1 outline-black/30 dark:outline-white/30 transition-all duration-200 mb-5 rounded-xl">
      {/* Post header with author info and community badge */}
      <div className="p-4 flex items-center justify-between border-b border-border/10 dark:border-border/5 bg-muted/20 dark:bg-muted/10">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={handleAuthorClick}
        >
          {/* User avatar with profile image - using specialized component that fetches profile */}
          <AuthorAvatar 
            username={authorName} 
            size={32}
            className="cursor-pointer"
            onClick={handleAuthorClick}
          />
          <h3 className="font-semibold text-foreground hover:text-primary hover:underline transition-colors">
            {authorName}
          </h3>
        </div>

        {post.communityName && (
          <Badge
            variant="outline"
            className="hover:bg-primary/10 cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/community/${post.communityId}`);
            }}
          >
            {post.communityName}
          </Badge>
        )}
      </div>

      {/* Post Content - Clickable to view full post */}
      <div
        onClick={() => router.push(`/post/${post.id}`)}
        className="p-4 cursor-pointer"
      >
        {/* Check if this is a repost and show original post info if it is */}
        {post.isRepost && post.originalPostId && (
          <div className="mb-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                <path d="M17 1l4 4-4 4"></path>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <path d="M7 23l-4-4 4-4"></path>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              </svg>
              Reposted
            </span>
          </div>
        )}

        {/* Post content with clickable hashtags */}
        <p className="text-foreground leading-relaxed">
          {renderContentWithHashtags(postContent, handleHashtagClick)}
        </p>

        {/* Display hashtags as badges */}
        {safeHashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {safeHashtags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs py-1 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleHashtagClick(tag);
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-2 py-2 flex items-center justify-between text-sm text-muted-foreground border-t border-border/10 dark:border-border/5 bg-muted/10 dark:bg-muted/5">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigating to post details
            handleLike();
          }}
          disabled={isLiking}
          className={`flex items-center gap-1 rounded-full ${
            isLiked ? "text-red-500 dark:text-red-400" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span className="ml-1">{likesCount}</span>
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigating to post details
            setCommentModalOpen(true);
          }}
          className="flex items-center gap-1 rounded-full hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="ml-1">{post.commentsCount || 0}</span>
        </Button>

        {/* Save Button */}
        <SaveButton postId={post.id} isSaved={post.isSaved ?? false} />
        
        {/* Repost Button - NEW */}
        <RepostButton 
          postId={post.id} 
          author={authorName} 
          content={postContent}
          repostsCount={post.repostsCount || 0}
        />

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