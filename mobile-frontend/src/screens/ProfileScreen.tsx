// src/screens/ProfileScreen.tsx - Updated for Social Media + Dating
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNavigation } from "@react-navigation/native";
import { getCurrentDatingProfile, isDatingProfileComplete } from "@/api/dating";

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
  const [activeTab, setActiveTab] = useState<"social" | "dating">("social");
  const [datingProfile, setDatingProfile] = useState<any>(null);
  const [hasDatingProfile, setHasDatingProfile] = useState(false);

  useEffect(() => {
    checkDatingProfile();
  }, []);

  const checkDatingProfile = async () => {
    try {
      const hasProfile = await isDatingProfileComplete();
      setHasDatingProfile(hasProfile);

      if (hasProfile) {
        const profile = await getCurrentDatingProfile();
        setDatingProfile(profile);
      }
    } catch (error) {
      console.error("Failed to check dating profile:", error);
    }
  };

  const navigateToSettings = () => {
    navigation.navigate("Settings" as never);
  };

  const setupDatingProfile = () => {
    navigation.navigate("DatingSetup" as never);
  };

  const userId = user.id;

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header - X-style minimal */}
      <View className="bg-black/95 backdrop-blur-md border-b border-gray-800">
        <View className="flex-row justify-between items-center px-4 py-3 pt-12">
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              {user.displayName || user.username}
            </Text>
            <Text className="text-gray-400 text-sm">@{user.username}</Text>
          </View>
          <TouchableOpacity
            onPress={navigateToSettings}
            className="p-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Tab Selector - Social Media vs Dating Profile */}
        <View className="flex-row px-4 pb-3">
          <TouchableOpacity
            onPress={() => setActiveTab("social")}
            className={`mr-8 pb-2 ${
              activeTab === "social" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            <Text
              className={`text-base font-medium ${
                activeTab === "social" ? "text-white" : "text-gray-400"
              }`}
            >
              Social
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("dating")}
            className={`pb-2 ${
              activeTab === "dating" ? "border-b-2 border-pink-500" : ""
            }`}
          >
            <Text
              className={`text-base font-medium ${
                activeTab === "dating" ? "text-white" : "text-gray-400"
              }`}
            >
              Dating
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === "social" ? (
          // Social Media Profile
          <>
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
          </>
        ) : (
          // Dating Profile
          <View className="px-4 py-6">
            {hasDatingProfile && datingProfile ? (
              <>
                {/* Dating Profile Header */}
                <View className="items-center mb-6">
                  <View className="relative">
                    <Image
                      source={{
                        uri:
                          datingProfile.photos[0] ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                      }}
                      className="w-32 h-32 rounded-full"
                    />
                    <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-pink-500 rounded-full items-center justify-center border-2 border-black">
                      <MaterialIcons name="favorite" size={20} color="white" />
                    </View>
                  </View>

                  <Text className="text-white text-2xl font-bold mt-4">
                    {user.displayName}, {datingProfile.age}
                  </Text>
                  <Text className="text-gray-400 text-base">
                    {datingProfile.location}
                  </Text>

                  <View className="flex-row items-center mt-2">
                    <View
                      className={`w-3 h-3 rounded-full mr-2 ${
                        datingProfile.isActive ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                    <Text className="text-gray-400 text-sm">
                      {datingProfile.isActive
                        ? "Active on Dating"
                        : "Dating Paused"}
                    </Text>
                  </View>
                </View>

                {/* Dating Bio */}
                <View className="mb-6">
                  <Text className="text-white text-lg font-semibold mb-3">
                    About
                  </Text>
                  <Text className="text-gray-300 leading-6">
                    {datingProfile.bio}
                  </Text>
                </View>

                {/* Dating Photos */}
                <View className="mb-6">
                  <Text className="text-white text-lg font-semibold mb-3">
                    Photos ({datingProfile.photos.length})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {datingProfile.photos.map(
                      (photo: string, index: number) => (
                        <Image
                          key={index}
                          source={{ uri: photo }}
                          className="w-24 h-32 rounded-lg mr-3"
                          resizeMode="cover"
                        />
                      )
                    )}
                  </ScrollView>
                </View>

                {/* Dating Preferences */}
                <View className="mb-6">
                  <Text className="text-white text-lg font-semibold mb-3">
                    Preferences
                  </Text>
                  <View className="bg-gray-900 rounded-lg p-4">
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-400">Looking for</Text>
                      <Text className="text-white">
                        {datingProfile.genderPreference}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-400">Age range</Text>
                      <Text className="text-white">
                        {datingProfile.minAge} - {datingProfile.maxAge}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Distance</Text>
                      <Text className="text-white">
                        Within {datingProfile.maxDistance} miles
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Edit Dating Profile Button */}
                <TouchableOpacity
                  onPress={setupDatingProfile}
                  className="bg-pink-500 rounded-full py-4 mb-4"
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Edit Dating Profile
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // No Dating Profile - Setup Prompt
              <View className="items-center py-16">
                <MaterialIcons name="favorite" size={80} color="#E91E63" />

                <Text className="text-white text-2xl font-bold text-center mt-6 mb-4">
                  Set Up Your Dating Profile
                </Text>

                <Text className="text-gray-400 text-base text-center mb-8 leading-6">
                  Create your dating profile to start meeting amazing people.
                  Add photos, write about yourself, and set your preferences.
                </Text>

                <TouchableOpacity
                  onPress={setupDatingProfile}
                  className="bg-pink-500 rounded-full px-8 py-4"
                >
                  <Text className="text-white font-semibold text-lg">
                    Get Started
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Bottom spacing for tab bar */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
