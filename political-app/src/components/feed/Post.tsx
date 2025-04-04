// components/feed/Post.tsx
import { useState, useEffect } from "react";
import { PostType } from "@/types/post";
import { likePost } from "@/api/posts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Repeat } from "lucide-react";
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

// Function to get a post by ID - add this to your posts API or import it
export const getPostById = async (postId: number): Promise<PostType> => {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
};

// This component displays an original post in a nested format inside a repost
const NestedOriginalPost = ({ postId }: { postId: number }) => {
  const [originalPost, setOriginalPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOriginalPost = async () => {
      console.log("Fetching original post with ID:", postId);
      try {
        const post = await getPostById(postId);
        console.log("Original post fetched:", post);
        setOriginalPost(post);
      } catch (err) {
        console.error(`Error fetching original post ${postId}:`, err);
        setError("Could not load the original post");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchOriginalPost();
    } else {
      setError("No original post ID provided");
      setLoading(false);
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="p-3 border rounded-md border-border/30 bg-muted/20 dark:bg-muted/10">
        <div className="animate-pulse flex space-x-3">
          <div className="rounded-full bg-muted h-8 w-8"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted rounded w-1/4"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !originalPost) {
    return (
      <div className="p-3 border rounded-md border-border/30 bg-muted/20 dark:bg-muted/10">
        <p className="text-sm text-muted-foreground">
          {error || "The original post could not be loaded"}
        </p>
      </div>
    );
  }

  const authorName =
    typeof originalPost.author === "string"
      ? originalPost.author
      : originalPost.author &&
        typeof originalPost.author === "object" &&
        "username" in (originalPost.author as any)
      ? String((originalPost.author as any).username)
      : "Unknown User";

  const postContent =
    typeof originalPost.content === "string"
      ? originalPost.content
      : originalPost.content
      ? JSON.stringify(originalPost.content)
      : "";

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling
    router.push(`/profile/${authorName}`);
  };

  return (
    <div className="border rounded-md border-border/30 bg-muted/20 dark:bg-muted/10 p-3 mt-2 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <AuthorAvatar
          username={authorName}
          size={20}
          onClick={handleAuthorClick}
          className="cursor-pointer"
        />
        <span
          className="font-medium cursor-pointer hover:underline"
          onClick={handleAuthorClick}
        >
          @{authorName}
        </span>
      </div>
      <p className="text-foreground">{postContent}</p>

      {/* Simplified stats from original post */}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {originalPost.likes || 0}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {originalPost.commentsCount || 0}
        </span>
      </div>
    </div>
  );
};

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
        {/* Updated repost indicator with icon */}
        {post.isRepost && post.originalPostId && (
          <div className="mb-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center">
              <Repeat className="h-3 w-3 mr-1" />
              Reposted
            </span>
          </div>
        )}

        {/* Post content with clickable hashtags */}
        <p className="text-foreground leading-relaxed">
          {renderContentWithHashtags(postContent, handleHashtagClick)}
        </p>

        {/* Display nested original post if this is a repost */}
        {post.isRepost && post.originalPostId && (
          <NestedOriginalPost postId={post.originalPostId} />
        )}

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

        {/* Repost Button */}
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
