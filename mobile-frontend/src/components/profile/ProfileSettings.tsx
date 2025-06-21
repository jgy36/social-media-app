// src/components/profile/ProfileSettings.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from 'react-native';
import { getSavedPosts } from "@/api/posts";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Post from "@/components/feed/Post";
import { PostType } from "@/types/post";

interface ProfileSettingsProps {
  onLogout: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onLogout }) => {
  const user = useSelector((state: RootState) => state.user);
  const [savedPosts, setSavedPosts] = useState<PostType[]>([]);

  useEffect(() => {
    if (user.token) {
      getSavedPosts().then(setSavedPosts);
    }
  }, [user.token]);

  const renderPost = ({ item: post }: { item: PostType }) => {
    // Ensure all required fields have the correct types for the Post component
    const postWithDefaults = {
      ...post,
      isLiked: post.isLiked ?? false, // Use false as default if undefined
      commentsCount: post.commentsCount ?? 0, // Use 0 as default if undefined
    };

    return (
      <View className="mb-4">
        <Post post={postWithDefaults} />
      </View>
    );
  };

  return (
    <View className="mt-6 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Settings</Text>

      <Pressable
        onPress={onLogout}
        className="bg-red-500 rounded-lg px-4 py-3 mb-6"
      >
        <Text className="text-white font-medium text-center">Logout</Text>
      </Pressable>

      {/* Saved Posts */}
      <View className="mt-6">
        <Text className="text-xl font-bold text-black dark:text-white mb-4">Saved Posts</Text>
        {savedPosts.length === 0 ? (
          <Text className="text-gray-600 dark:text-gray-400">No saved posts yet.</Text>
        ) : (
          <FlatList
            data={savedPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileSettings;