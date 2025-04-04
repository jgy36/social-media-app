// src/components/feed/PostList.tsx
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Post from "./Post";
import { PostType } from "@/types/post";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

// Import our new API
import { posts } from "@/api";

interface PostListProps {
  activeTab: "for-you" | "following";
}

const PostList: React.FC<PostListProps> = ({ activeTab }) => {
  const [postData, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const router = useRouter();
  const token = useSelector((state: RootState) => state.user.token);

  // Use a callback to avoid recreation of this function on each render
  const loadPosts = useCallback(async () => {
    // If we're already on "following" tab with no auth, just return early without setting loading
    if (!token && activeTab === "following") return;

    setLoading(true);
    setError(null);
    setIsRetrying(false);
    
    // Properly format endpoints with leading slash
    const endpoint = activeTab === "for-you" ? "/posts/for-you" : "/posts/following";

    try {
      console.log(`Fetching posts from endpoint: ${endpoint}`);
      // Use our new API function
      const data = await posts.getPosts(endpoint);
      
      // Check if we received fallback data vs actual data
      const isFallbackData = data.length > 0 && data.some(post => post.author === "NetworkIssue");
      
      if (isFallbackData) {
        // Show connection issue warning but still display fallback data
        setError("Connection issue detected. Showing cached content.");
      }
      
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  // Trigger post loading when tab changes or on component mount
  useEffect(() => {
    if (!token && activeTab === "following") {
      console.warn("No auth token found! Redirecting to landing page...");
      router.push("/"); // ✅ Redirects to landing page if no token
      return;
    }

    loadPosts();
  }, [activeTab, token, router, loadPosts]);

  // Handle retry action
  const handleRetry = () => {
    setIsRetrying(true);
    loadPosts();
  };

  if (!token && activeTab === "following") return null; // ✅ Prevent rendering before redirecting
  
  if (loading) {
    return (
      <div className="my-6">
        <LoadingState message="Loading posts..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show warning but still display posts if we have them */}
      {error && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-xl mb-4 flex items-start">
          <div className="flex-1">{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            disabled={isRetrying}
            className="ml-2 whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}
      
      {postData.length > 0 ? (
        <div className="space-y-5">
          {postData.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-muted/20 dark:bg-muted/10 rounded-xl py-12 my-8">
          <p className="text-muted-foreground mb-4">No posts available in your feed.</p>
          <Button onClick={handleRetry} variant="outline" className="px-6">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Feed
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostList;