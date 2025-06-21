// src/screens/SavedPostsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { getSavedPosts } from "@/api/posts";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";

const SavedPostsScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved posts
  const loadSavedPosts = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    
    try {
      const data = await getSavedPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load saved posts:", err);
      setError("Failed to load saved posts. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSavedPosts();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedPosts(true);
  };

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack();
  };

  // Render post item
  const renderPost = ({ item }: { item: PostType }) => (
    <Post 
      key={item.id} 
      post={{ ...item, isSaved: true }}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <MaterialIcons name="bookmark-outline" size={64} color="#6B7280" />
      <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
        No saved posts yet
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
        When you save posts, they'll appear here for you to read later.
        Click the Save button on any post to add it to your saved collection.
      </Text>
    </View>
  );

  // Render error state
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
        onPress={() => loadSavedPosts()}
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
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} className="mr-4">
              <MaterialIcons name="arrow-back" size={24} color="gray" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <MaterialIcons name="bookmark" size={24} color="#3B82F6" />
              <Text className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
                Saved Posts
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            disabled={loading || refreshing}
            className="p-2"
          >
            <MaterialIcons 
              name="refresh" 
              size={24} 
              color={loading || refreshing ? "#6B7280" : "#3B82F6"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading saved posts...</Text>
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

export default SavedPostsScreen;