import { MaterialIcons } from '@expo/vector-icons';
// src/components/profile/ProfilePosts.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Import the shared navigation types
import type { RootStackParamList } from '@/types/navigation';

import {
  getPostsByUsername,
  checkAccountPrivacy,
  getFollowStatus,
} from "@/api/users";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";

const ProfilePosts = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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

  // Function to check privacy status
  const checkPrivacyAndAccess = useCallback(async () => {
    if (!user?.id) {
      console.log("[ProfilePosts] No user ID available, skipping privacy check");
      return;
    }

    console.log(`[ProfilePosts] 🔒 PRIVACY CHECK for user ID: ${user.id} (${user.username || "unknown"})`);
    console.log(`[ProfilePosts] Current user ID: ${currentUser?.id || "not logged in"}`);

    try {
      // Check if this is the user's own profile
      const isOwnProfile = currentUser?.id === user.id;
      console.log(`[ProfilePosts] Is own profile? ${isOwnProfile}`);

      if (isOwnProfile) {
        console.log("[ProfilePosts] User viewing own profile - always show posts");
        setIsPrivate(false);
        setIsFollowing(true);
        return;
      }

      // Check if the profile is private
      console.log(`[ProfilePosts] Checking privacy for profile ID: ${user.id}`);
      const privacyResponse = await checkAccountPrivacy(user.id);
      console.log(`[ProfilePosts] 🔒 Privacy check result: isPrivate=${privacyResponse}`);
      setIsPrivate(privacyResponse);
      setLastPrivacyCheck(Date.now());

      // If private, check if current user is following
      if (privacyResponse) {
        console.log(`[ProfilePosts] Account is private, checking follow status`);

        if (!currentUser?.id) {
          console.log("[ProfilePosts] Not authenticated, can't see private profile posts");
          setIsFollowing(false);
          setIsRequested(false);
          return;
        }

        const followStatusResponse = await getFollowStatus(user.id);
        console.log(`[ProfilePosts] 👥 Follow status:`, followStatusResponse);

        setFollowStatus({
          isFollowing: followStatusResponse.isFollowing || false,
          isRequested: followStatusResponse.isRequested || false,
          followersCount: followStatusResponse.followersCount || 0,
          followingCount: followStatusResponse.followingCount || 0,
        });

        setIsFollowing(followStatusResponse.isFollowing || false);
        setIsRequested(followStatusResponse.isRequested || false);

        console.log(`[ProfilePosts] Updated follow state: isFollowing=${followStatusResponse.isFollowing}, isRequested=${followStatusResponse.isRequested || false}`);
      } else {
        console.log("[ProfilePosts] Account is public, showing posts");
      }
    } catch (error) {
      console.error("[ProfilePosts] ❌ Error checking profile privacy:", error);
    }
  }, [user?.id, user?.username, currentUser?.id]);

  // Check privacy and follow status on component mount or user ID change
  useEffect(() => {
    console.log(`[ProfilePosts] User ID changed or component mounted, checking privacy: ${user?.id}`);
    checkPrivacyAndAccess();
  }, [user?.id, currentUser?.id, checkPrivacyAndAccess]);

  // Fetch posts when needed
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.username) {
        console.log("[ProfilePosts] No username available, can't fetch posts");
        return;
      }

      console.log(`[ProfilePosts] 📥 Fetching posts for username: ${user.username}`);
      console.log(`[ProfilePosts] isPrivate=${isPrivate}, isFollowing=${isFollowing}, isOwnProfile=${currentUser?.id === user.id}`);

      // If the account is private and we're not following and not the owner, don't fetch posts
      if (isPrivate && !isFollowing && currentUser?.id !== user.id) {
        console.log("[ProfilePosts] 🚫 Private account, not following, skipping post fetch");
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`[ProfilePosts] Calling getPostsByUsername for: ${user.username}`);
        const postsData = await getPostsByUsername(user.username);
        console.log(`[ProfilePosts] Received ${postsData.length} posts from API`);

        // Process the posts
        const formattedPosts = postsData.map((post) => {
          // Make sure hashtags is an array of strings or undefined
          if (post.hashtags && !Array.isArray(post.hashtags)) {
            return {
              ...post,
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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        console.log(`[ProfilePosts] Setting ${sortedPosts.length} sorted posts`);
        setPosts(sortedPosts);

        // Update post count in localStorage with user-specific key
        if (user.id) {
          // Store with user-specific key
          localStorage.setItem(`user_${user.id}_userPostsCount`, String(formattedPosts.length));

          // Dispatch a custom event that ProfileHeader can listen for
          window.dispatchEvent(
            new CustomEvent("userPostsCountUpdated", {
              detail: { count: formattedPosts.length, userId: user.id },
            })
          );

          console.log(`[ProfilePosts] User ${user.id} posts count updated: ${formattedPosts.length}`);
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

  const handlePostPress = (postId: number) => {
    console.log(`[ProfilePosts] Post pressed: ${postId}`);
    navigation.navigate('PostDetail', { postId });
  };

  const renderPost = ({ item: post }: { item: PostType }) => {
    // Ensure all required fields have the correct types for the Post component
    const postWithDefaults = {
      ...post,
      isLiked: post.isLiked ?? false, // Use false as default if undefined
      commentsCount: post.commentsCount ?? 0, // Use 0 as default if undefined
    };

    return (
      <Pressable onPress={() => handlePostPress(post.id)} className="mb-4">
        <Post post={postWithDefaults} />
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="mt-6">
        <Text className="text-lg font-bold mb-4 text-black dark:text-white">Posts</Text>
        <View className="flex-row items-center justify-center py-4">
          <MaterialIcons name="refresh" size={32} color="#6b7280" />
          <Text className="ml-2 text-gray-600 dark:text-gray-400">Loading posts...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-6">
        <Text className="text-lg font-bold mb-4 text-black dark:text-white">Posts</Text>
        <View className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <Text className="text-red-700 dark:text-red-300">{error}</Text>
        </View>
      </View>
    );
  }

  // Add the privacy check right here, before returning the normal post list
  if (isPrivate && !isFollowing && currentUser?.id !== user.id) {
    const requestMessage = isRequested
      ? "Follow request sent. You'll be able to see posts once approved."
      : "This account is private. Follow this user to see their posts.";

    console.log(`[ProfilePosts] 🔒 Showing private account message: ${requestMessage}`);

    return (
      <View className="mt-6">
        <Text className="text-lg font-bold mb-4 text-black dark:text-white">Posts</Text>
        <View className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="text-gray-600 dark:text-gray-400 text-center">{requestMessage}</Text>
        </View>
      </View>
    );
  }

  // Changed "Your Posts" to just "Posts" for better user experience
  const isOwnProfile = currentUser?.id === user.id;
  const headerText = isOwnProfile ? "Your Posts" : "Posts";

  console.log(`[ProfilePosts] Rendering ${posts.length} posts for ${isOwnProfile ? "current user" : "other user"}`);

  return (
    <View className="mt-6">
      <Text className="text-lg font-bold mb-4 text-black dark:text-white">{headerText}</Text>
      {posts.length === 0 ? (
        <View className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <View className="items-center justify-center">
            {isPrivate && !isFollowing && !isOwnProfile ? (
              <>
                <MaterialIcons name="lock" size={24} color="#6b7280" />
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  This account is private. You need to follow this user to see their posts.
                </Text>
              </>
            ) : isOwnProfile ? (
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                You haven't posted anything yet.
              </Text>
            ) : (
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                No posts yet.
              </Text>
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

export default ProfilePosts;