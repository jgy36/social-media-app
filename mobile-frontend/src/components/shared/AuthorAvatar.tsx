import React, { useState, useEffect } from "react";
import { View, Image, Text } from "react-native";
import axios from "axios";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";

interface AuthorAvatarProps {
  username: string;
  size?: number;
  className?: string;
  onPress?: () => void;
}

const AuthorAvatar: React.FC<AuthorAvatarProps> = ({
  username,
  size = 32,
  className = "",
  onPress,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setIsLoading(false);
        return;
      }

      const defaultImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      setImageUrl(defaultImage);

      try {
        const API_BASE_URL =
          process.env.EXPO_PUBLIC_API_BASE_URL ||
          "http://192.168.137.1:8080/api";
        const response = await axios.get(
          `${API_BASE_URL}/users/profile/${username}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        const profile = response.data;

        if (profile.profileImageUrl) {
          const processedUrl = getProfileImageUrl(
            profile.profileImageUrl,
            username
          );
          setImageUrl(processedUrl);
        }
      } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleImageError = () => {
    setError(true);
    setImageUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`);
  };

  return (
    <View
      className={`rounded-full overflow-hidden border border-border/30 ${className}`}
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <View className="w-full h-full bg-primary/10 items-center justify-center">
          <Text className="text-primary text-xs font-semibold">
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
};

export default AuthorAvatar;
