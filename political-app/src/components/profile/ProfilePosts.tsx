// Updated code for ProfilePosts.tsx - user-specific post count storage
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getPostsByUsername } from "@/api/users";
import { PostType } from "@/types/post";
import { apiClient } from "@/api/apiClient";
import { getUserId } from "@/utils/tokenUtils"; // Add this import

// Import the post component directly
import Post from "@/components/feed/Post";

const ProfilePosts = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.username) return;

      setLoading(true);
      setError(null);

      try {
        // Get posts using the API
        const userPostsResponse = await getPostsByUsername(user.username);
        
        // Ensure userPosts is an array before proceeding
        let userPosts: any[] = [];
        
        if (Array.isArray(userPostsResponse)) {
          userPosts = userPostsResponse;
        } else if (userPostsResponse && typeof userPostsResponse === 'object' && Array.isArray(userPostsResponse.data)) {
          userPosts = userPostsResponse.data;
        } else {
          console.warn("Posts response is not an array:", userPostsResponse);
          userPosts = [];
        }

        // Process the posts as before
        const formattedPosts = userPosts.map(post => {
          // Make sure hashtags is an array of strings or undefined
          if (post.hashtags && !Array.isArray(post.hashtags)) {
            // Create a shallow copy to avoid modifying the original
            return {
              ...post,
              // Handle if hashtags is an object or other non-array type
              hashtags: Array.isArray(post.hashtags) ? post.hashtags 
                      : post.hashtags === null ? undefined 
                      : typeof post.hashtags === 'object' ? [] 
                      : undefined
            };
          }
          return post;
        });
        
        // Sort posts by date (newest first)
        const sortedPosts = [...formattedPosts].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setPosts(sortedPosts);
        
        // Update post count in localStorage with user-specific key
        if (user.id) {
          // Store with user-specific key
          localStorage.setItem(`user_${user.id}_userPostsCount`, String(userPosts.length));
          
          // Dispatch a custom event that ProfileHeader can listen for
          window.dispatchEvent(new CustomEvent('userPostsCountUpdated', { 
            detail: { count: userPosts.length, userId: user.id } 
          }));
          
          console.log(`User ${user.id} posts count updated:`, userPosts.length);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setError("Failed to load your posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user?.username, user?.id]);

  const handlePostClick = (postId: number) => {
    router.push(`/post/${postId}`);
  };

  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">Your Posts</h2>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">Your Posts</h2>
        <Card className="p-4 text-destructive">
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">Your Posts</h2>
      {posts.length === 0 ? (
        <Card className="p-4 text-center text-muted-foreground">
          <p>You haven&apos;t posted anything yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="cursor-pointer" 
              onClick={() => handlePostClick(post.id)}
            >
              {/* Render Post component directly */}
              <Post post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;