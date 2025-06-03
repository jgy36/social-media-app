import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import {
  getPostsByUsername,
  checkAccountPrivacy,
  getFollowStatus,
} from "@/api/users";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";

const ProfilePosts = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const currentUser = useSelector((state: RootState) => state.user);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    isRequested: false,
    followersCount: 0,
    followingCount: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastPrivacyCheck, setLastPrivacyCheck] = useState<number>(0);

  // Function to check privacy status - separated to keep code clean
  const checkPrivacyAndAccess = useCallback(async () => {
    if (!user?.id) {
      console.log(
        "[ProfilePosts] No user ID available, skipping privacy check"
      );
      return;
    }

    console.log(
      `[ProfilePosts] 🔒 PRIVACY CHECK for user ID: ${user.id} (${
        user.username || "unknown"
      })`
    );
    console.log(
      `[ProfilePosts] Current user ID: ${currentUser?.id || "not logged in"}`
    );

    try {
      // Check if this is the user's own profile
      const isOwnProfile = currentUser?.id === user.id;
      console.log(`[ProfilePosts] Is own profile? ${isOwnProfile}`);

      if (isOwnProfile) {
        console.log(
          "[ProfilePosts] User viewing own profile - always show posts"
        );
        setIsPrivate(false);
        setIsFollowing(true);
        return;
      }

      // Check if the profile is private
      console.log(`[ProfilePosts] Checking privacy for profile ID: ${user.id}`);
      const privacyResponse = await checkAccountPrivacy(user.id);
      console.log(
        `[ProfilePosts] 🔒 Privacy check result: isPrivate=${privacyResponse}`
      );
      setIsPrivate(privacyResponse);
      setLastPrivacyCheck(Date.now());

      // If private, check if current user is following
      if (privacyResponse) {
        console.log(
          `[ProfilePosts] Account is private, checking follow status`
        );

        if (!currentUser?.id) {
          console.log(
            "[ProfilePosts] Not authenticated, can't see private profile posts"
          );
          setIsFollowing(false);
          setIsRequested(false);
          return;
        }

        const followStatusResponse = await getFollowStatus(user.id);
        console.log(`[ProfilePosts] 👥 Follow status:`, followStatusResponse);

        // Fix the type error by ensuring all properties are defined
        setFollowStatus({
          isFollowing: followStatusResponse.isFollowing || false,
          isRequested: followStatusResponse.isRequested || false,
          followersCount: followStatusResponse.followersCount || 0,
          followingCount: followStatusResponse.followingCount || 0,
        });

        setIsFollowing(followStatusResponse.isFollowing || false);
        setIsRequested(followStatusResponse.isRequested || false);

        console.log(
          `[ProfilePosts] Updated follow state: isFollowing=${
            followStatusResponse.isFollowing
          }, isRequested=${followStatusResponse.isRequested || false}`
        );
      } else {
        console.log("[ProfilePosts] Account is public, showing posts");
      }
    } catch (error) {
      console.error("[ProfilePosts] ❌ Error checking profile privacy:", error);
    }
  }, [user?.id, user?.username, currentUser?.id]);

  // Listen for follow status change events
  useEffect(() => {
    const handleFollowStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(
        "[ProfilePosts] 👂 Received followStatusChanged event:",
        customEvent.detail
      );

      if (customEvent.detail && customEvent.detail.targetUserId === user?.id) {
        console.log(
          `[ProfilePosts] Follow status changed for current profile: isFollowing=${customEvent.detail.isFollowing}, isRequested=${customEvent.detail.isRequested}`
        );

        setIsFollowing(customEvent.detail.isFollowing);
        setIsRequested(customEvent.detail.isRequested || false);

        // Trigger a refresh of posts if following status changed to true
        if (customEvent.detail.isFollowing && !isFollowing) {
          console.log(
            "[ProfilePosts] 🔄 Follow status changed to following, refreshing posts"
          );
          setRefreshTrigger((prev) => prev + 1);
        }
      }
    };

    console.log("[ProfilePosts] Adding followStatusChanged event listener");
    window.addEventListener("followStatusChanged", handleFollowStatusChange);

    return () => {
      console.log("[ProfilePosts] Removing followStatusChanged event listener");
      window.removeEventListener(
        "followStatusChanged",
        handleFollowStatusChange
      );
    };
  }, [user?.id, isFollowing]);

  // Check privacy and follow status on component mount or user ID change
  useEffect(() => {
    console.log(
      `[ProfilePosts] User ID changed or component mounted, checking privacy: ${user?.id}`
    );
    checkPrivacyAndAccess();
  }, [user?.id, currentUser?.id, checkPrivacyAndAccess]);

  // Fetch posts when needed
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.username) {
        console.log("[ProfilePosts] No username available, can't fetch posts");
        return;
      }

      console.log(
        `[ProfilePosts] 📥 Fetching posts for username: ${user.username}`
      );
      console.log(
        `[ProfilePosts] isPrivate=${isPrivate}, isFollowing=${isFollowing}, isOwnProfile=${
          currentUser?.id === user.id
        }`
      );

      // If the account is private and we're not following and not the owner, don't fetch posts
      if (isPrivate && !isFollowing && currentUser?.id !== user.id) {
        console.log(
          "[ProfilePosts] 🚫 Private account, not following, skipping post fetch"
        );
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          `[ProfilePosts] Calling getPostsByUsername for: ${user.username}`
        );
        const postsData = await getPostsByUsername(user.username);
        console.log(
          `[ProfilePosts] Received ${postsData.length} posts from API`
        );

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

        console.log(
          `[ProfilePosts] Setting ${sortedPosts.length} sorted posts`
        );
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
            `[ProfilePosts] User ${user.id} posts count updated: ${formattedPosts.length}`
          );
        }
      } catch (err) {
        console.error("[ProfilePosts] ❌ Error fetching user posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [
    user?.username,
    user?.id,
    isPrivate,
    isFollowing,
    currentUser?.id,
    refreshTrigger,
  ]);

  // Force privacy check every 30 seconds if viewing someone else's profile
  useEffect(() => {
    if (user?.id && user.id !== currentUser?.id) {
      const intervalId = setInterval(() => {
        const now = Date.now();
        const timeSinceLastCheck = now - lastPrivacyCheck;

        // If it's been more than 30 seconds since last check
        if (timeSinceLastCheck > 30000) {
          console.log("[ProfilePosts] 🔄 Performing periodic privacy check");
          checkPrivacyAndAccess();
        }
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [user?.id, currentUser?.id, lastPrivacyCheck, checkPrivacyAndAccess]);

  const handlePostClick = (postId: number) => {
    console.log(`[ProfilePosts] Post clicked: ${postId}`);
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
    const requestMessage = isRequested
      ? "Follow request sent. You'll be able to see posts once approved."
      : "This account is private. Follow this user to see their posts.";

    console.log(
      `[ProfilePosts] 🔒 Showing private account message: ${requestMessage}`
    );

    return (
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">Posts</h2>
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">{requestMessage}</p>
        </Card>
      </div>
    );
  }

  // Changed "Your Posts" to just "Posts" for better user experience
  const isOwnProfile = currentUser?.id === user.id;
  const headerText = isOwnProfile ? "Your Posts" : "Posts";

  console.log(
    `[ProfilePosts] Rendering ${posts.length} posts for ${
      isOwnProfile ? "current user" : "other user"
    }`
  );

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">{headerText}</h2>
      {posts.length === 0 ? (
        <Card className="p-4 text-center text-muted-foreground">
          <p>
            {isPrivate && !isFollowing && !isOwnProfile ? (
              <>
                <Lock className="h-4 w-4 mx-auto mb-2" />
                This account is private. You need to follow this user to see
                their posts.
              </>
            ) : isOwnProfile ? (
              "You haven't posted anything yet."
            ) : (
              "No posts yet."
            )}
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
