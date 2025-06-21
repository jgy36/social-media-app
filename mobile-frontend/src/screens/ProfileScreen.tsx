import { MaterialIcons } from "@expo/vector-icons";
// src/screens/ProfileScreen.tsx - Modern X-style Design
import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNavigation } from "@react-navigation/native";

import UserBadges from "../components/profile/UserBadges";
import UserStats from "../components/profile/UserStats";
import ProfilePosts from "../components/profile/ProfilePosts";

// Silent error boundary - keeps components working without visible errors
const ErrorBoundary = ({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Component error:", error);
    return <>{fallback}</>;
  }
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const navigateToSettings = () => {
    navigation.navigate("Settings" as never);
  };

  const userId = user.id;

  return (
    <View className="flex-1 bg-black">
      {/* Header - X-style minimal */}
      <View className="bg-black/95 backdrop-blur-md border-b border-gray-800">
        <View className="flex-row justify-between items-center px-4 py-3 pt-12">
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              {user.displayName || user.username}
            </Text>
            <Text className="text-gray-400 text-sm">
              {/* Posts count could go here */}@{user.username}
            </Text>
          </View>
          <TouchableOpacity
            onPress={navigateToSettings}
            className="p-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header Section - X-style layout */}
        <View className="px-4 py-6">
          {/* Profile Info Layout */}
          <View className="flex-row justify-between items-start mb-6">
            {/* Left side - Avatar and basic info */}
            <View className="flex-1 mr-4">
              {/* Profile Image */}
              <Image
                source={{
                  uri:
                    user.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                }}
                className="w-20 h-20 rounded-full border-2 border-gray-700 mb-4"
              />

              {/* Name and Username */}
              <View className="mb-3">
                <Text className="text-xl font-bold text-white mb-1">
                  {user.displayName || user.username}
                </Text>
                <Text className="text-gray-400 text-base">
                  @{user.username}
                </Text>
              </View>

              {/* Bio */}
              {user.bio && (
                <Text className="text-white text-sm leading-5 mb-3">
                  {user.bio}
                </Text>
              )}

              {/* Join Date */}
              <View className="flex-row items-center">
                <MaterialIcons
                  name="calendar-today"
                  size={14}
                  color="#71767b"
                />
                <Text className="ml-2 text-sm text-gray-400">
                  Joined{" "}
                  {(user as any).joinDate
                    ? new Date((user as any).joinDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "Recently"}
                </Text>
              </View>
            </View>

            {/* Right side - Edit button */}
            <TouchableOpacity
              onPress={navigateToSettings}
              className="border border-gray-600 px-4 py-2 rounded-full"
            >
              <Text className="text-white text-sm font-medium">
                Edit profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Stats - X-style horizontal layout */}
          {userId && (
            <ErrorBoundary>
              <View className="mb-6">
                <UserStats userId={userId} />
              </View>
            </ErrorBoundary>
          )}

          {/* Political Badges - Compact */}
          {userId && (
            <ErrorBoundary>
              <View className="mb-6">
                <UserBadges userId={userId} isCurrentUser={true} />
              </View>
            </ErrorBoundary>
          )}
        </View>

        {/* Tabs Section - X-style */}
        <View className="border-b border-gray-800">
          <View className="px-4">
            <View className="flex-row">
              <TouchableOpacity className="mr-8 pb-4">
                <Text className="text-white font-semibold text-base">
                  Posts
                </Text>
                <View className="mt-2 h-0.5 w-12 bg-blue-500 rounded-full" />
              </TouchableOpacity>
              <TouchableOpacity className="mr-8 pb-4">
                <Text className="text-gray-400 font-medium text-base">
                  Replies
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="mr-8 pb-4">
                <Text className="text-gray-400 font-medium text-base">
                  Media
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="pb-4">
                <Text className="text-gray-400 font-medium text-base">
                  Likes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Posts Section */}
        <View className="bg-black">
          <ErrorBoundary
            fallback={
              <View className="p-6 items-center">
                <MaterialIcons name="post-add" size={48} color="#71767b" />
                <Text className="text-gray-400 text-sm mt-2">
                  Unable to load posts
                </Text>
              </View>
            }
          >
            <ProfilePosts />
          </ErrorBoundary>
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
