// src/screens/HashtagScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import { getPostsByHashtag } from "@/api/posts";

const HashtagScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tag } = route.params as { tag: string };
  
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "trending">("recent");

  // Format hashtag for display
  const displayTag = tag?.startsWith('#') ? tag : `#${tag}`;
  const apiTag = tag?.startsWith('#') ? tag.substring(1) : tag;

  useEffect(() => {
    if (!apiTag) return;

    const fetchHashtagData = async (isRefresh = false) => {
      if (!isRefresh) setIsLoading(true);
      setError(null);

      try {
        // Fetch posts with this hashtag
        const postsData = await getPostsByHashtag(apiTag);
        
        // Sort posts based on current preference
        const sortedPosts = [...postsData];
        if (sortBy === "trending") {
          sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        } else {
          sortedPosts.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
        }
        
        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching hashtag posts:", err);
        setError("Failed to load posts for this hashtag");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    };

    fetchHashtagData();
  }, [apiTag, sortBy]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Re-fetch data by triggering useEffect
    const timer = setTimeout(() => {
      // This will re-trigger the useEffect
      setIsLoading(true);
    }, 100);
    return () => clearTimeout(timer);
  };

  const renderPost = ({ item }: { item: PostType }) => {
    // Ensure isLiked is always a boolean for the Post component
    const postWithDefaults = {
      ...item,
      isLiked: item.isLiked || false,
      commentsCount: item.commentsCount || 0,
    };
    return <Post key={item.id} post={postWithDefaults} />;
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <MaterialIcons name="tag" size={64} color="#6B7280" />
      <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
        No posts found
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
        Be the first to post with the {displayTag} hashtag!
      </Text>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
      >
        <Text className="text-white font-medium">Back to Feed</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <MaterialIcons name="error-outline" size={64} color="#EF4444" />
      <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
        Error Loading Posts
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
        {error}
      </Text>
      <TouchableOpacity
        onPress={handleRefresh}
        className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
      >
        <Text className="text-white font-medium">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={handleBack} className="mr-4">
              <MaterialIcons name="arrow-back" size={24} color="gray" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <MaterialIcons name="tag" size={24} color="#3B82F6" />
              <Text className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
                {displayTag}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isLoading || refreshing}
            className="p-2"
          >
            <MaterialIcons 
              name="refresh" 
              size={24} 
              color={isLoading || refreshing ? "#6B7280" : "#3B82F6"} 
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="article" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600 dark:text-gray-400">
              {posts.length} posts
            </Text>
          </View>

          {/* Sort Options */}
          <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-lg">
            <TouchableOpacity
              onPress={() => setSortBy("recent")}
              className={`px-3 py-2 rounded-lg ${
                sortBy === "recent" ? 'bg-blue-500' : ''
              }`}
            >
              <Text className={`text-sm font-medium ${
                sortBy === "recent" ? 'text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortBy("trending")}
              className={`px-3 py-2 rounded-lg ${
                sortBy === "trending" ? 'bg-blue-500' : ''
              }`}
            >
              <Text className={`text-sm font-medium ${
                sortBy === "trending" ? 'text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                Popular
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading posts...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : posts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{
            paddingVertical: 16,
          }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default HashtagScreen;