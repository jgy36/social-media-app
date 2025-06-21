// src/components/community/CommunityPostForm.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { createCommunityPost } from "@/api/communities";

interface CommunityPostFormProps {
  communityId: string;
  isJoined: boolean;
  onPostCreated: () => void;
}

const CommunityPostForm = ({
  communityId,
  isJoined,
  onPostCreated,
}: CommunityPostFormProps) => {
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation<any>(); // Fix navigation typing

  // Get auth state from Redux
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;

  // Submit a new post to the community
  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !isAuthenticated) return;

    setIsSubmitting(true);

    try {
      const newPost = await createCommunityPost(communityId, newPostContent);

      if (newPost) {
        // Clear the input
        setNewPostContent("");

        // Notify parent component to refresh posts
        onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is authenticated and joined - show post form
  if (isAuthenticated && isJoined) {
    return (
      <View className="bg-white dark:bg-gray-800 m-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
        <View className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Post
          </Text>
        </View>
        <View className="p-4">
          <View className="space-y-4">
            <TextInput
              placeholder="What's on your mind?"
              multiline
              numberOfLines={5}
              value={newPostContent}
              onChangeText={setNewPostContent}
              className="min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              textAlignVertical="top"
              editable={!isSubmitting}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={handleSubmitPost}
                disabled={isSubmitting || !newPostContent.trim()}
                className={`flex-row items-center px-4 py-2 rounded-md ${
                  isSubmitting || !newPostContent.trim()
                    ? "bg-gray-300 dark:bg-gray-600"
                    : "bg-blue-500 dark:bg-blue-600"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white">Posting...</Text>
                  </>
                ) : (
                  <Text className="text-white font-medium">Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // If user is authenticated but not joined
  if (isAuthenticated && !isJoined) {
    return (
      <View className="bg-gray-50 dark:bg-gray-900 m-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <View className="p-4 text-center">
          <Text className="mb-2 text-gray-700 dark:text-gray-300">
            Join this community to post and participate in discussions
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Community", { id: communityId })
            }
            className="flex-row items-center justify-center bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-md"
          >
            <Feather
              name="users"
              size={16}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-medium">Join Community</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If user is not authenticated
  return (
    <View className="bg-gray-50 dark:bg-gray-900 m-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
      <View className="p-4 text-center">
        <Text className="mb-2 text-gray-700 dark:text-gray-300">
          Sign in to join the community and participate in discussions
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Login", {
              redirect: encodeURIComponent(`/community/${communityId}`),
            })
          }
          className="bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-md"
        >
          <Text className="text-white font-medium">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommunityPostForm;
