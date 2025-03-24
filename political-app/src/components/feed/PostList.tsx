// src/components/feed/PostList.tsx
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Post from "./Post";
import { PostType } from "@/types/post";
import { fetchPostsWithFallback } from "@/utils/apiErrorHandler";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PostListProps {
  activeTab: "for-you" | "following";
}

const PostList: React.FC<PostListProps> = ({ activeTab }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
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
      const data = await fetchPostsWithFallback(endpoint);
      
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
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show warning but still display posts if we have them */}
      {error && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-md mb-4 flex items-start">
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
      
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post key={post.id} post={post} />
        ))
      ) : (
        <div className="p-4 text-center bg-muted/20 rounded-lg py-8">
          <p className="text-muted-foreground">No posts available.</p>
          <Button onClick={handleRetry} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostList;