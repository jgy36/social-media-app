// src/components/profile/ProfileHeader.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { router } from 'expo-router';
import SettingsDropdown from "./SettingsDropdown";
import UserStats from "./UserStats";
import { getFollowStatus, checkAccountPrivacy } from "@/api/users";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";
import { getUserData } from "@/utils/tokenUtils";
import { Button } from "@/components/ui/button";
import FollowButton from "./FollowButton";
import MessageButton from "./MessageButton";

interface UserData {
  displayName?: string;
  // Add other properties as needed
}

const ProfileHeader = () => {
  const user = useSelector((state: RootState) => state.user);
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;
  
  const [displayName, setDisplayName] = useState<string>("");
  const [joinDate, setJoinDate] = useState<string | null>(null);
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postCount: 0,
    isFollowing: false,
  });
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [profileImageSrc, setProfileImageSrc] = useState<string | null>(null);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);

  // Load display name with proper async handling
  useEffect(() => {
    const loadDisplayName = async () => {
      if (user.displayName) {
        setDisplayName(user.displayName);
      } else {
        try {
          const userData = await getUserData();
          if (userData.displayName) {
            setDisplayName(userData.displayName);
          } else if (user.username) {
            setDisplayName(user.username);
          } else {
            setDisplayName("Guest");
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          setDisplayName(user.username || "Guest");
        }
      }
    };

    loadDisplayName();
  }, [user.displayName, user.username]);

  // Initialize profile image
  useEffect(() => {
    if (user.profileImageUrl) {
      setProfileImageSrc(getProfileImageUrl(user.profileImageUrl, user.username));
    }
  }, [user.profileImageUrl, user.username]);

  // Handle stats changes
  const handleStatsChange = (newFollowersCount: number, newFollowingCount: number) => {
    setStats((prevStats) => ({
      ...prevStats,
      followersCount: newFollowersCount,
      followingCount: newFollowingCount,
    }));
  };

  // Handle follow change
  const handleFollowChange = (isFollowing: boolean, followerCount: number) => {
    setStats((prevStats) => ({
      ...prevStats,
      followersCount: followerCount,
      isFollowing: isFollowing,
    }));
  };

  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString()
    : "Unknown";

  const navigateToEditProfile = () => {
    router.push('/settings?tab=profile');
  };

  const navigateToLogin = () => {
    const redirect = `profile/${user.username}`;
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <View className="flex-col md:flex-row items-center md:items-start gap-6 p-4">
      {/* Avatar */}
      <View className="flex-shrink-0">
        <View className="relative">
          <Image
            source={{
              uri: profileImageSrc || getProfileImageUrl(user.profileImageUrl, user.username)
            }}
            className="h-24 w-24 rounded-full border-2 border-blue-200"
          />
          {/* Add edit button for own profile */}
          {isAuthenticated && user.id === currentUser.id && (
            <TouchableOpacity 
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg"
              onPress={navigateToEditProfile}
            >
              <MaterialIcons name="edit" size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Info */}
      <View className="flex-1 text-center md:text-left">
        <Text className="text-2xl font-bold text-black dark:text-white">{displayName}</Text>
        <View className="flex-row items-center justify-center md:justify-start gap-2">
          <Text className="text-gray-500 dark:text-gray-400">@{user.username || "unknown"}</Text>
          {isPrivateAccount && (
            <View className="flex-row items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              <MaterialIcons name="lock" size={12} color="#6b7280" />
              <Text className="text-xs text-gray-600 dark:text-gray-400">Private Account</Text>
            </View>
          )}
        </View>

        {user.bio ? (
          <Text className="mt-2 text-gray-700 dark:text-gray-300">{user.bio}</Text>
        ) : (
          isAuthenticated && user.id === currentUser.id && (
            <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
              No bio added yet.
            </Text>
          )
        )}

        {/* User Stats */}
        {user.id && (
          <UserStats
            userId={user.id}
            postsCount={stats.postCount}
            followersCount={stats.followersCount}
            followingCount={stats.followingCount}
            className="mt-3 justify-center md:justify-start"
            onFollowChange={handleStatsChange}
          />
        )}

        {/* Join date */}
        <View className="flex-row items-center mt-2 justify-center md:justify-start">
          <MaterialIcons name="event" size={16} color="#6b7280" />
          <Text className="text-gray-600 dark:text-gray-400 ml-1">Joined {formattedJoinDate}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex items-center gap-2">
        {isAuthenticated && user.id === currentUser.id ? (
          <SettingsDropdown />
        ) : isAuthenticated && user.id !== currentUser.id ? (
          <View className="flex-col gap-2">
            {user.id && (
              <FollowButton
                userId={user.id}
                initialIsFollowing={stats.isFollowing}
                isPrivateAccount={isPrivateAccount}
                onFollowChange={handleFollowChange}
              />
            )}
            {user.id && (
              <MessageButton
                username={user.username || ""}
                userId={user.id}
                variant="outline"
              />
            )}
          </View>
        ) : (
          <Button onPress={navigateToLogin}>
            Log in to interact
          </Button>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;