import { useState, useEffect } from "react";
import { PostType } from "@/types/post";
import { getPostById } from "@/api/posts";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/router";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import { apiClient } from "@/api/apiClient";

interface NestedOriginalPostProps {
  postId: number;
}

const NestedOriginalPost: React.FC<NestedOriginalPostProps> = ({ postId }) => {
  const [originalPost, setOriginalPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Direct API fetch function with improved error handling
  const directFetchPost = async (id: number): Promise<PostType | null> => {
    try {
      console.log(`NestedOriginalPost - Direct API call to fetch post ${id}`);
      
      // Make sure we add a cache-busting parameter to avoid cached responses
      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/posts/${id}?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log("NestedOriginalPost - Direct API response:", response.data);
      
      // Validate the response data
      if (!response.data || !response.data.id) {
        console.error("NestedOriginalPost - Invalid response data:", response.data);
        return null;
      }
      
      return response.data;
    } catch (err) {
      console.error("NestedOriginalPost - Direct API error:", err);
      return null;
    }
  };

  useEffect(() => {
    // Log when the component mounts with the postId
    console.log(`NestedOriginalPost - Component mounted with postId: ${postId}, type: ${typeof postId}`);
    
    // Validate postId - enhanced validation logic
    if (!postId || isNaN(Number(postId)) || postId <= 0) {
      console.error(`NestedOriginalPost - Invalid postId: ${postId}`);
      setError(`Invalid post ID: ${postId}`);
      setLoading(false);
      return;
    }

    const fetchOriginalPost = async () => {
      console.log(`NestedOriginalPost - Starting to fetch original post with ID: ${postId}`);
      setLoading(true);
      setError(null);
      
      try {
        // Try standard API call first with more detailed logging
        console.log("NestedOriginalPost - Attempting standard API call");
        let post = await getPostById(Number(postId));
        
        // If that fails, try direct API call as fallback
        if (!post) {
          console.log("NestedOriginalPost - Standard API call failed, trying direct fetch");
          post = await directFetchPost(Number(postId));
        }

        console.log("NestedOriginalPost - Fetch result:", post);
        
        if (post) {
          setOriginalPost(post);
          console.log("NestedOriginalPost - Successfully set original post data");
        } else {
          console.error(`NestedOriginalPost - Could not fetch original post with ID: ${postId}`);
          throw new Error("Failed to retrieve original post");
        }
      } catch (err) {
        console.error(`NestedOriginalPost - Error fetching post ${postId}:`, err);
        setError(`Could not load the original post: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOriginalPost();
  }, [postId]);

  // Display loading state
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

  // Display error state
  if (error || !originalPost) {
    return (
      <div className="p-3 border rounded-md border-border/30 bg-muted/20 dark:bg-muted/10">
        <p className="text-sm text-muted-foreground">
          {error || "The original post could not be loaded"}
        </p>
      </div>
    );
  }

  // Extract author name safely
  const authorName =
    typeof originalPost.author === "string"
      ? originalPost.author
      : originalPost.author &&
        typeof originalPost.author === "object" &&
        "username" in (originalPost.author as any)
      ? String((originalPost.author as any).username)
      : "Unknown User";

  // Extract content safely
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

  const handlePostClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling to parent elements
    router.push(`/post/${originalPost.id}`);
  };

  // Finally, render the original post in nested format
  return (
    <div 
      className="border rounded-md border-border/30 bg-muted/20 dark:bg-muted/10 p-3 mt-2 text-sm hover:bg-muted/30 transition-colors"
      onClick={handlePostClick}
    >
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

export default NestedOriginalPost;