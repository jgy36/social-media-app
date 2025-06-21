// src/components/feed/NestedOriginalPost.tsx
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { PostType } from "@/types/post";
import { getPostById } from "@/api/posts";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import { apiClient } from "@/api/apiClient";

interface NestedOriginalPostProps {
  postId: number;
}

const NestedOriginalPost: React.FC<NestedOriginalPostProps> = ({ postId }) => {
  const [originalPost, setOriginalPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use navigation hook with error handling
  let navigation: any = null;
  try {
    navigation = useNavigation<any>();
  } catch (error) {
    console.warn(
      "Navigation context not available in NestedOriginalPost component"
    );
  }

  // Direct API fetch function with improved error handling
  const directFetchPost = async (id: number): Promise<PostType | null> => {
    try {
      console.log(`NestedOriginalPost - Direct API call to fetch post ${id}`);

      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/posts/${id}?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log("NestedOriginalPost - Direct API response:", response.data);

      if (!response.data || !response.data.id) {
        console.error(
          "NestedOriginalPost - Invalid response data:",
          response.data
        );
        return null;
      }

      const postData: PostType = {
        ...response.data,
        commentsCount: response.data.commentsCount || 0,
        likes: response.data.likes || 0,
      };

      return postData;
    } catch (err) {
      console.error("NestedOriginalPost - Direct API error:", err);
      return null;
    }
  };

  useEffect(() => {
    console.log(
      `NestedOriginalPost - Component mounted with postId: ${postId}, type: ${typeof postId}`
    );

    if (!postId || isNaN(Number(postId)) || postId <= 0) {
      console.error(`NestedOriginalPost - Invalid postId: ${postId}`);
      setError(`Invalid post ID: ${postId}`);
      setLoading(false);
      return;
    }

    const fetchOriginalPost = async () => {
      console.log(
        `NestedOriginalPost - Starting to fetch original post with ID: ${postId}`
      );
      setLoading(true);
      setError(null);

      try {
        console.log("NestedOriginalPost - Attempting standard API call");
        let rawPost = await getPostById(Number(postId));

        let post: PostType | null = null;
        if (rawPost) {
          post = {
            ...rawPost,
            commentsCount:
              typeof rawPost.commentsCount === "number"
                ? rawPost.commentsCount
                : 0,
            likes: typeof rawPost.likes === "number" ? rawPost.likes : 0,
          } as PostType;
        }

        if (!post) {
          console.log(
            "NestedOriginalPost - Standard API call failed, trying direct fetch"
          );
          post = await directFetchPost(Number(postId));
        }

        console.log("NestedOriginalPost - Fetch result:", post);

        if (post) {
          setOriginalPost(post);
          console.log(
            "NestedOriginalPost - Successfully set original post data"
          );
        } else {
          console.error(
            `NestedOriginalPost - Could not fetch original post with ID: ${postId}`
          );
          throw new Error("Failed to retrieve original post");
        }
      } catch (err) {
        console.error(
          `NestedOriginalPost - Error fetching post ${postId}:`,
          err
        );
        setError(
          `Could not load the original post: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOriginalPost();
  }, [postId]);

  // Display loading state
  if (loading) {
    return (
      <View className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 mt-3">
        <View className="flex-row space-x-3">
          <View className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-8" />
          <View className="flex-1 space-y-2">
            <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
            <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          </View>
        </View>
        <View className="items-center mt-3">
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      </View>
    );
  }

  // Display error state
  if (error || !originalPost) {
    return (
      <View className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 mt-3">
        <View className="flex-row items-center">
          <MaterialIcons name="error-outline" size={20} color="#EF4444" />
          <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {error || "The original post could not be loaded"}
          </Text>
        </View>
      </View>
    );
  }

  // Extract author name safely
  const authorName =
    typeof originalPost.author === "string"
      ? originalPost.author
      : originalPost.author &&
        typeof originalPost.author === "object" &&
        "username" in (originalPost.author as any)
      ? String((originalPost.author as any).username)
      : "Unknown User";

  // Extract content safely
  const postContent =
    typeof originalPost.content === "string"
      ? originalPost.content
      : originalPost.content
      ? JSON.stringify(originalPost.content)
      : "";

  const handleAuthorPress = () => {
    if (navigation) {
      navigation.navigate("Profile", { username: authorName });
    }
  };

  const handlePostPress = () => {
    if (navigation) {
      navigation.navigate("PostDetail", { postId: originalPost.id });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePostPress}
      className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 mt-3 shadow-sm"
      activeOpacity={0.7}
      disabled={!navigation}
    >
      {/* Original post header */}
      <View className="flex-row items-center mb-3">
        <TouchableOpacity onPress={handleAuthorPress} disabled={!navigation}>
          <AuthorAvatar username={authorName} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAuthorPress}
          className="ml-2"
          disabled={!navigation}
        >
          <Text className="font-medium text-gray-900 dark:text-white">
            @{authorName}
          </Text>
        </TouchableOpacity>
        <View className="ml-2 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
          <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Original
          </Text>
        </View>
      </View>

      {/* Original post content */}
      <Text className="text-gray-900 dark:text-white leading-relaxed mb-3">
        {postContent}
      </Text>

      {/* Stats from original post */}
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center">
          <MaterialIcons name="favorite-border" size={14} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {originalPost.likes || 0}
          </Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="chat-bubble-outline" size={14} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {originalPost.commentsCount || 0}
          </Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="schedule" size={14} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {new Date(originalPost.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NestedOriginalPost;
