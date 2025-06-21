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
  activeTab: "for-you" | "following" | "communities";
}

const PostList: React.FC<PostListProps> = ({ activeTab }) => {
  const [postData, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [notFollowingAnyone, setNotFollowingAnyone] = useState<boolean>(false);
  const [noJoinedCommunities, setNoJoinedCommunities] = useState<boolean>(false);
  
  const router = useRouter();
  const token = useSelector((state: RootState) => state.user.token);
  
  // Get joined communities from Redux
  const joinedCommunities = useSelector((state: RootState) => state.communities.joinedCommunities);

  // Use a callback to avoid recreation of this function on each render
  const loadPosts = useCallback(async () => {
    // If we're on protected tabs with no auth, just return early without setting loading
    if ((!token && activeTab === "following") || (!token && activeTab === "communities")) return;

    setLoading(true);
    setError(null);
    setIsRetrying(false);

    // Properly format endpoints with leading slash
    let endpoint;
    if (activeTab === "for-you") {
      endpoint = "/posts/for-you";
    } else if (activeTab === "following") {
      endpoint = "/posts/following";
    } else {
      endpoint = "/posts/communities";
    }

    try {
      console.log(`Fetching posts from endpoint: ${endpoint}`);
      // Use our new API function
      const data = await posts.getPosts(endpoint);

      // Check if we received fallback data vs actual data
      const isFallbackData =
        data.length > 0 && data.some((post) => post.author === "NetworkIssue");

      if (isFallbackData) {
        // Show connection issue warning but still display fallback data
        setError("Connection issue detected. Showing cached content.");
      }

      // Set states for empty feed messages based on the active tab
      if (activeTab === "following" && data.length === 0) {
        setNotFollowingAnyone(joinedCommunities.length === 0);
      } else {
        setNotFollowingAnyone(false);
      }

      if (activeTab === "communities" && data.length === 0) {
        setNoJoinedCommunities(joinedCommunities.length === 0);
      } else {
        setNoJoinedCommunities(false);
      }

      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, joinedCommunities]);

  // Trigger post loading when tab changes or on component mount
  useEffect(() => {
    // Redirect to landing page if not authenticated for protected tabs
    if (!token && (activeTab === "following" || activeTab === "communities")) {
      console.warn("No auth token found! Redirecting to landing page...");
      router.push("/"); 
      return;
    }

    loadPosts();
  }, [activeTab, token, router, loadPosts]);

  // Listen for refreshFeed events
  useEffect(() => {
    const handleRefreshFeed = () => {
      console.log("🔄 refreshFeed event received - reloading posts");
      loadPosts();
    };

    // Add event listener
    window.addEventListener("refreshFeed", handleRefreshFeed);

    // Clean up on unmount
    return () => {
      window.removeEventListener("refreshFeed", handleRefreshFeed);
    };
  }, [loadPosts]); // Make sure loadPosts is in the dependency array

  // Handle retry action
  const handleRetry = () => {
    setIsRetrying(true);
    loadPosts();
  };

  if (!token && (activeTab === "following" || activeTab === "communities")) return null; // Prevent rendering before redirecting

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
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
            />
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
          <p className="text-muted-foreground mb-4">
            {activeTab === "following" && notFollowingAnyone 
              ? "Follow a user or join a community to see posts here" 
              : activeTab === "communities" && noJoinedCommunities
                ? "Join a community to see posts here"
                : "No posts available in your feed."}
          </p>
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