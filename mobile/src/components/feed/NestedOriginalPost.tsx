// src/components/feed/NestedOriginalPost.tsx
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { PostType } from "@/types/post";
import { getPostById } from "@/api/posts";
import { Heart, MessageCircle } from "react-native-vector-icons/Feather";
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
  const navigation = useNavigation();

  // Direct API fetch function with improved error handling
  const directFetchPost = async (id: number): Promise<PostType | null> => {
    try {
      console.log(`NestedOriginalPost - Direct API call to fetch post ${id}`);
      
      // Make sure we add a cache-busting parameter to avoid cached responses
      const timestamp = new Date().getTime();
      const response = await apiClient.get(`/posts/${id}?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log("NestedOriginalPost - Direct API response:", response.data);
      
      // Validate the response data
      if (!response.data || !response.data.id) {
        console.error("NestedOriginalPost - Invalid response data:", response.data);
        return null;
      }
      
      return response.data;
    } catch (err) {
      console.error("NestedOriginalPost - Direct API error:", err);
      return null;
    }
  };

  useEffect(() => {
    // Log when the component mounts with the postId
    console.log(`NestedOriginalPost - Component mounted with postId: ${postId}, type: ${typeof postId}`);
    
    // Validate postId - enhanced validation logic
    if (!postId || isNaN(Number(postId)) || postId <= 0) {
      console.error(`NestedOriginalPost - Invalid postId: ${postId}`);
      setError(`Invalid post ID: ${postId}`);
      setLoading(false);
      return;
    }

    const fetchOriginalPost = async () => {
      console.log(`NestedOriginalPost - Starting to fetch original post with ID: ${postId}`);
      setLoading(true);
      setError(null);
      
      try {
        // Try standard API call first with more detailed logging
        console.log("NestedOriginalPost - Attempting standard API call");
        let post = await getPostById(Number(postId));
        
        // If that fails, try direct API call as fallback
        if (!post) {
          console.log("NestedOriginalPost - Standard API call failed, trying direct fetch");
          post = await directFetchPost(Number(postId));
        }

        console.log("NestedOriginalPost - Fetch result:", post);
        
        if (post) {
          setOriginalPost(post);
          console.log("NestedOriginalPost - Successfully set original post data");
        } else {
          console.error(`NestedOriginalPost - Could not fetch original post with ID: ${postId}`);
          throw new Error("Failed to retrieve original post");
        }
      } catch (err) {
        console.error(`NestedOriginalPost - Error fetching post ${postId}:`, err);
        setError(`Could not load the original post: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOriginalPost();
  }, [postId]);

  // Display loading state
  if (loading) {
    return (
      <View className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
        <View className="flex-row space-x-3">
          <View className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-8" />
          <View className="flex-1 space-y-2">
            <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
            <View className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          </View>
        </View>
        <ActivityIndicator size="small" color="gray" className="mt-2" />
      </View>
    );
  }

  // Display error state
  if (error || !originalPost) {
    return (
      <View className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {error || "The original post could not be loaded"}
        </Text>
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
    navigation.navigate('Profile', { username: authorName });
  };

  const handlePostPress = () => {
    navigation.navigate('PostDetail', { postId: originalPost.id });
  };

  // Finally, render the original post in nested format
  return (
    <TouchableOpacity
      onPress={handlePostPress}
      className="border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 p-3 mt-2"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-2 mb-2">
        <TouchableOpacity onPress={handleAuthorPress}>
          <AuthorAvatar
            username={authorName}
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAuthorPress}>
          <Text className="font-medium text-gray-900 dark:text-white">
            @{authorName}
          </Text>
        </TouchableOpacity>
      </View>
      <Text className="text-gray-900 dark:text-white">{postContent}</Text>

      {/* Simplified stats from original post */}
      <View className="flex-row items-center gap-4 mt-2">
        <View className="flex-row items-center gap-1">
          <Heart name="heart" size={12} color="gray" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">{originalPost.likes || 0}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MessageCircle name="message-circle" size={12} color="gray" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">{originalPost.commentsCount || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NestedOriginalPost;