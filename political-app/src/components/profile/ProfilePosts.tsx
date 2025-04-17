import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  getPostsByUsername,
  checkAccountPrivacy,
  getFollowStatus,
} from "@/api/users";
import { PostType } from "@/types/post";
// Removed unused imports
// import { apiClient } from "@/api/apiClient";
// import { getUserId } from "@/utils/tokenUtils";

// Import the post component directly
import Post from "@/components/feed/Post";

const ProfilePosts = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const currentUser = useSelector((state: RootState) => state.user); // Added currentUser
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    followersCount: 0,
    followingCount: 0,
  });

  // Add this effect to check privacy status
  useEffect(() => {
    const checkPrivacyAndAccess = async () => {
      if (!user?.id) return;

      try {
        // Check if the profile is private
        const privacyResponse = await checkAccountPrivacy(user.id);
        setIsPrivate(privacyResponse);

        // If private, we need to check if current user is following
        if (privacyResponse && currentUser?.id !== user.id) {
          const followStatusResponse = await getFollowStatus(user.id);
          setFollowStatus(followStatusResponse);
          setIsFollowing(followStatusResponse.isFollowing);
        }
      } catch (error) {
        console.error("Error checking profile privacy:", error);
      }
    };

    checkPrivacyAndAccess();
  }, [user?.id, currentUser?.id]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.username) return;

      setLoading(true);
      setError(null);

      try {
        // Get posts using the API
        const postsData = await getPostsByUsername(user.username);

        // Process the posts
        const formattedPosts = postsData.map((post) => {
          // Make sure hashtags is an array of strings or undefined
          if (post.hashtags && !Array.isArray(post.hashtags)) {
            // Create a shallow copy to avoid modifying the original
            return {
              ...post,
              // Handle if hashtags is an object or other non-array type
              hashtags: Array.isArray(post.hashtags)
                ? post.hashtags
                : post.hashtags === null
                ? undefined
                : typeof post.hashtags === "object"
                ? []
                : undefined,
            };
          }
          return post;
        });

        // Sort posts by date (newest first)
        const sortedPosts = [...formattedPosts].sort((a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setPosts(sortedPosts);

        // Update post count in localStorage with user-specific key
        if (user.id) {
          // Store with user-specific key
          localStorage.setItem(
            `user_${user.id}_userPostsCount`,
            String(formattedPosts.length)
          );

          // Dispatch a custom event that ProfileHeader can listen for
          window.dispatchEvent(
            new CustomEvent("userPostsCountUpdated", {
              detail: { count: formattedPosts.length, userId: user.id },
            })
          );

          console.log(
            `User ${user.id} posts count updated:`,
            formattedPosts.length
          );
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setError("Failed to load posts");
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
        <h2 className="text-lg font-bold mb-4">Posts</h2>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">Posts</h2>
        <Card className="p-4 text-destructive">
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  // Add the privacy check right here, before returning the normal post list
  if (isPrivate && !isFollowing && currentUser?.id !== user.id) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">Posts</h2>
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">
            This account is private. Follow this user to see their posts.
          </p>
        </Card>
      </div>
    );
  }

  // Changed "Your Posts" to just "Posts" for better user experience
  const isOwnProfile = currentUser?.id === user.id;
  const headerText = isOwnProfile ? "Your Posts" : "Posts";

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">{headerText}</h2>
      {posts.length === 0 ? (
        <Card className="p-4 text-center text-muted-foreground">
          <p>
            {isOwnProfile
              ? "You haven't posted anything yet."
              : "No posts yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            >
              <Post post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;
