// components/shared/UserAvatar.tsx
import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";

// Cache for profile image URLs to avoid repeated API calls
const profileImageCache: Record<string, string> = {};

interface UserAvatarProps {
  username: string;
  profileImageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  onPress?: () => void;
  className?: string;
}

const UserAvatar = ({
  username,
  profileImageUrl = null,
  size = "md",
  onPress,
  className = "",
}: UserAvatarProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Determine size class
  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return { width: 24, height: 24 };
      case "md":
        return { width: 32, height: 32 };
      case "lg":
        return { width: 48, height: 48 };
      case "xl":
        return { width: 96, height: 96 };
      default:
        return { width: 32, height: 32 };
    }
  };

  const sizeStyle = getSizeStyle();
  const sizeClass = `w-${size === 'sm' ? '6' : size === 'md' ? '8' : size === 'lg' ? '12' : '24'} h-${size === 'sm' ? '6' : size === 'md' ? '8' : size === 'lg' ? '12' : '24'}`;

  useEffect(() => {
    // If we already have a profile image URL, use it
    if (profileImageUrl) {
      setImageUrl(getProfileImageUrl(profileImageUrl, username));
      return;
    }

    // Check cache first
    if (profileImageCache[username]) {
      setImageUrl(profileImageCache[username]);
      return;
    }

    // No need to fetch for avatar if we're using the default
    if (!username) {
      setImageUrl(null);
      return;
    }

    // Otherwise let's use the default avatar
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    setImageUrl(defaultAvatar);
    profileImageCache[username] = defaultAvatar;
  }, [username, profileImageUrl]);

  const handleError = () => {
    console.log(`Avatar image load failed for ${username}`);
    setError(true);

    // Try direct URL if available
    if (profileImageUrl) {
      const fullUrl = getFullImageUrl(profileImageUrl);
      setImageUrl(fullUrl);
      profileImageCache[username] = fullUrl;
    } else {
      // Fall back to default avatar
      const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      setImageUrl(fallbackUrl);
      profileImageCache[username] = fallbackUrl;
    }
  };

  if (loading) {
    return <Skeleton className={`${sizeClass} rounded-full ${className}`} />;
  }

  const AvatarContent = () => {
    if (imageUrl) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={sizeStyle}
          className="rounded-full"
          onError={handleError}
        />
      );
    } else {
      return (
        <View 
          style={sizeStyle}
          className={`bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center`}
        >
          <Text className="text-blue-600 dark:text-blue-400 font-semibold">
            {username ? username.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
      );
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`${sizeClass} rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
        style={sizeStyle}
      >
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`${sizeClass} rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
      style={sizeStyle}
    >
      <AvatarContent />
    </View>
  );
};

export default UserAvatar;