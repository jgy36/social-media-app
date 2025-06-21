import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import FollowListModal from "@/components/profile/FollowListModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFollowStatus } from "@/api/users";

interface UserStatsProps {
  userId: number;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  className?: string;
  onFollowChange?: (
    newFollowersCount: number,
    newFollowingCount: number
  ) => void;
}

const UserStats = ({
  userId,
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  className = "",
  onFollowChange,
}: UserStatsProps) => {
  const [activeModal, setActiveModal] = useState<
    "followers" | "following" | null
  >(null);
  const [currentPostsCount, setCurrentPostsCount] = useState(postsCount);
  const [currentFollowersCount, setCurrentFollowersCount] =
    useState(followersCount);
  const [currentFollowingCount, setCurrentFollowingCount] =
    useState(followingCount);
  const [loading, setLoading] = useState(true);

  // Fetch user stats from API
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        console.log(`[UserStats] Fetching stats for user ${userId}`);

        // Get follow status which includes follower/following counts
        const stats = await getFollowStatus(userId);
        console.log(`[UserStats] Received stats:`, stats);

        setCurrentFollowersCount(stats.followersCount || 0);
        setCurrentFollowingCount(stats.followingCount || 0);

        // Get posts count from AsyncStorage (updated by ProfilePosts component)
        try {
          const storedPostsCount = await AsyncStorage.getItem(
            `user_${userId}_userPostsCount`
          );
          if (storedPostsCount) {
            setCurrentPostsCount(parseInt(storedPostsCount, 10));
          }
        } catch (storageError) {
          console.error(
            "[UserStats] Error reading posts count from storage:",
            storageError
          );
        }
      } catch (error) {
        console.error("[UserStats] Error fetching user stats:", error);
        // Keep the prop values as fallbacks
        setCurrentFollowersCount(followersCount);
        setCurrentFollowingCount(followingCount);
        setCurrentPostsCount(postsCount);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserStats();
    }
  }, [userId, postsCount, followersCount, followingCount]);

  // Listen for post count updates from AsyncStorage
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const userSpecificCount = await AsyncStorage.getItem(
          `user_${userId}_userPostsCount`
        );
        if (userSpecificCount) {
          const count = parseInt(userSpecificCount, 10);
          if (count !== currentPostsCount) {
            console.log(`[UserStats] Post count updated: ${count}`);
            setCurrentPostsCount(count);
          }
        }
      } catch (error) {
        console.error("[UserStats] Error polling post count:", error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [userId, currentPostsCount]);

  // Update counts when follows change within modal
  const handleFollowUpdate = (
    isFollowing: boolean,
    newFollowersCount: number,
    newFollowingCount: number
  ) => {
    setCurrentFollowersCount(newFollowersCount);
    setCurrentFollowingCount(newFollowingCount);

    if (onFollowChange) {
      onFollowChange(newFollowersCount, newFollowingCount);
    }
  };

  if (loading) {
    return (
      <View className={`flex-row items-center justify-around ${className}`}>
        <View className="items-center">
          <View className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </View>
        <View className="items-center">
          <View className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </View>
        <View className="items-center">
          <View className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-row items-center justify-around ${className}`}>
      {/* Posts Count */}
      <View className="items-center">
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="chat-bubble-outline" size={16} color="#6b7280" />
        </View>
        <Text className="text-lg font-bold text-black dark:text-white">
          {currentPostsCount}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">Posts</Text>
      </View>

      {/* Followers Count (Clickable) */}
      <Pressable
        onPress={() => setActiveModal("followers")}
        className="items-center"
      >
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="group" size={16} color="#6b7280" />
        </View>
        <Text className="text-lg font-bold text-black dark:text-white">
          {currentFollowersCount}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Followers
        </Text>
      </Pressable>

      {/* Following Count (Clickable) */}
      <Pressable
        onPress={() => setActiveModal("following")}
        className="items-center"
      >
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="person" size={16} color="#6b7280" />
        </View>
        <Text className="text-lg font-bold text-black dark:text-white">
          {currentFollowingCount}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Following
        </Text>
      </Pressable>

      {/* Followers Modal */}
      <FollowListModal
        userId={userId}
        listType="followers"
        isOpen={activeModal === "followers"}
        onClose={() => setActiveModal(null)}
        title={`Followers (${currentFollowersCount})`}
      />

      {/* Following Modal */}
      <FollowListModal
        userId={userId}
        listType="following"
        isOpen={activeModal === "following"}
        onClose={() => setActiveModal(null)}
        title={`Following (${currentFollowingCount})`}
      />
    </View>
  );
};

export default UserStats;
