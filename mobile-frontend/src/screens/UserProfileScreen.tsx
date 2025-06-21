// src/screens/UserProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import FollowButton from "@/components/profile/FollowButton";
import MessageButton from "@/components/profile/MessageButton";
import UserStats from "@/components/profile/UserStats";
import UserBadges from "@/components/profile/UserBadges";
import {
  getFollowStatus,
  getPostsByUsername,
  checkAccountPrivacy,
} from "@/api/users";
import { getUserProfile } from "@/api/users";
import axios from "axios";

interface UserProfile {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isPrivate?: boolean;
}

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.137.1:8080/api";

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username } = route.params as { username: string };
  const dispatch = useDispatch();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;

  // Check if this is the current user's profile
  const isCurrentUserProfile = profile?.username === currentUser.username;

  const fetchProfileData = async (isRefresh = false) => {
    if (!username) return;

    if (!isRefresh) setIsLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const profileResponse = await axios.get<UserProfile>(
        `${API_BASE_URL}/users/profile/${username}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      let userProfile = profileResponse.data;

      // If profile found, also get follow status
      if (userProfile && userProfile.id) {
        try {
          // Get follow status
          const followStatusResponse = await getFollowStatus(userProfile.id);

          // Check if account is private
          const isPrivate = await checkAccountPrivacy(userProfile.id);

          // Update profile with follow status, counts and privacy
          userProfile = {
            ...userProfile,
            isFollowing: followStatusResponse.isFollowing,
            followersCount: followStatusResponse.followersCount,
            followingCount: followStatusResponse.followingCount,
            isPrivate: isPrivate,
          };
        } catch (followErr) {
          console.warn("Could not fetch follow status or privacy:", followErr);
        }
      }

      setProfile(userProfile);

      // Fetch user posts
      try {
        const userPosts = await getPostsByUsername(username);

        if (Array.isArray(userPosts)) {
          // Sort posts by date (newest first)
          const sortedPosts = [...userPosts].sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          setPosts(sortedPosts);
        } else {
          setPosts([]);
        }
      } catch (postsError) {
        console.error("Could not fetch posts:", postsError);
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load user profile");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  // Handle follow/unfollow profile update
  const handleFollowChange = (
    isFollowing: boolean,
    followerCount: number,
    followingCount: number
  ) => {
    if (profile) {
      setProfile({
        ...profile,
        isFollowing,
        followersCount: followerCount,
        followingCount: followingCount,
      });
    }
  };

  // Handle stats update
  const handleStatsChange = (
    newFollowersCount: number,
    newFollowingCount: number
  ) => {
    if (profile) {
      setProfile({
        ...profile,
        followersCount: newFollowersCount,
        followingCount: newFollowingCount,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfileData(true);
  };

  const renderPost = ({ item }: { item: PostType }) => (
    <Post key={item.id} post={item} />
  );

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(id)}
      className={`flex-1 py-3 items-center ${
        activeTab === id ? "border-b-2 border-blue-500" : ""
      }`}
    >
      <Text
        className={`font-medium ${
          activeTab === id
            ? "text-blue-500"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          Loading profile...
        </Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Profile</Text>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 text-center">
            {error || "User not found"}
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {profile.displayName || profile.username}
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="bg-white dark:bg-gray-900 p-6">
          <View className="flex-row items-start">
            {/* Avatar */}
            <View className="mr-4">
              <Image
                source={{
                  uri:
                    profile.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                }}
                className="w-20 h-20 rounded-full"
              />
            </View>

            {/* User Info */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.displayName || profile.username}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 dark:text-gray-400">
                      @{profile.username}
                    </Text>
                    {profile.isPrivate && (
                      <View className="ml-2 flex-row items-center bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        <MaterialIcons name="lock" size={12} color="#6B7280" />
                        <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                          Private
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                {!isAuthenticated ? (
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate("Login")}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">Log in</Text>
                  </TouchableOpacity>
                ) : isCurrentUserProfile ? (
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate("Settings")}
                    className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-medium">
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row space-x-2">
                    <FollowButton
                      userId={profile.id}
                      initialIsFollowing={profile.isFollowing}
                      onFollowChange={handleFollowChange}
                    />
                    <MessageButton
                      username={profile.username}
                      userId={profile.id}
                    />
                  </View>
                )}
              </View>

              {/* Bio */}
              {profile.bio && (
                <Text className="text-gray-700 dark:text-gray-300 mt-3">
                  {profile.bio}
                </Text>
              )}

              {/* User Badges */}
              <UserBadges
                userId={profile.id}
                isCurrentUser={isCurrentUserProfile}
              />

              {/* Stats */}
              <UserStats
                userId={profile.id}
                postsCount={profile.postsCount}
                followersCount={profile.followersCount}
                followingCount={profile.followingCount}
                className="mt-4"
                onFollowChange={handleStatsChange}
              />

              {/* Join Date */}
              {profile.joinDate && (
                <View className="flex-row items-center mt-3">
                  <MaterialIcons
                    name="calendar-today"
                    size={16}
                    color="#6B7280"
                  />
                  <Text className="ml-1 text-gray-500 dark:text-gray-400 text-sm">
                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row">
            <TabButton id="posts" label="Posts" />
            <TabButton id="comments" label="Comments" />
            <TabButton id="followers" label="Followers" />
            <TabButton id="following" label="Following" />
          </View>
        </View>

        {/* Tab Content */}
        <View className="bg-gray-50 dark:bg-gray-900">
          {activeTab === "posts" &&
            (isAuthenticated ? (
              posts.length > 0 ? (
                posts.map((post) => (
                  <View key={post.id} className="mb-4">
                    <Post post={post} />
                  </View>
                ))
              ) : (
                <View className="p-8 items-center">
                  {profile.isPrivate &&
                  !profile.isFollowing &&
                  !isCurrentUserProfile ? (
                    <>
                      <MaterialIcons name="lock" size={48} color="#6B7280" />
                      <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                        Private Account
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                        Follow this user to see their posts.
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="article" size={48} color="#6B7280" />
                      <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                        No posts yet
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                        This user hasn't posted anything.
                      </Text>
                    </>
                  )}
                </View>
              )
            ) : (
              <View className="p-8 items-center">
                <MaterialIcons name="login" size={48} color="#6B7280" />
                <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                  Login Required
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                  You need to be logged in to view this user's posts.
                </Text>
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate("Login")}
                  className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
                >
                  <Text className="text-white font-medium">Log In</Text>
                </TouchableOpacity>
              </View>
            ))}

          {activeTab !== "posts" && (
            <View className="p-8 items-center">
              <Text className="text-lg font-medium text-gray-900 dark:text-white">
                {activeTab === "comments"
                  ? "Comments Coming Soon"
                  : activeTab === "followers"
                  ? "Followers"
                  : "Following"}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                {activeTab === "comments"
                  ? "This feature is being developed."
                  : "Click on the count in the stats to see the complete list."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserProfileScreen;
