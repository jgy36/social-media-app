// src/components/feed/PostList.tsx
import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Post from "./Post";
import { PostType } from "@/types/post";
import { RefreshCw } from "react-native-vector-icons/Feather";
import { posts } from "@/api";

interface PostListProps {
  activeTab: "for-you" | "following" | "communities";
}

const PostList: React.FC<PostListProps> = ({ activeTab }) => {
  const [postData, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notFollowingAnyone, setNotFollowingAnyone] = useState<boolean>(false);
  const [noJoinedCommunities, setNoJoinedCommunities] = useState<boolean>(false);
  
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.user.token);
  
  // Get joined communities from Redux
  const joinedCommunities = useSelector((state: RootState) => state.communities.joinedCommunities);

  // Use a callback to avoid recreation of this function on each render
  const loadPosts = useCallback(async (isRefresh = false) => {
    // If we're on protected tabs with no auth, just return early without setting loading
    if ((!token && activeTab === "following") || (!token && activeTab === "communities")) return;

    if (!isRefresh) setLoading(true);
    setError(null);

    // Properly format endpoints with leading slash
    let endpoint;
    if (activeTab === "for-you") {
      endpoint = "/posts/for-you";
    } else if (activeTab === "following") {
      endpoint = "/posts/following";
    } else {
      endpoint = "/posts/communities";
    }

    try {
      console.log(`Fetching posts from endpoint: ${endpoint}`);
      // Use our new API function
      const data = await posts.getPosts(endpoint);

      // Check if we received fallback data vs actual data
      const isFallbackData =
        data.length > 0 && data.some((post) => post.author === "NetworkIssue");

      if (isFallbackData) {
        // Show connection issue warning but still display fallback data
        setError("Connection issue detected. Showing cached content.");
      }

      // Set states for empty feed messages based on the active tab
      if (activeTab === "following" && data.length === 0) {
        setNotFollowingAnyone(joinedCommunities.length === 0);
      } else {
        setNotFollowingAnyone(false);
      }

      if (activeTab === "communities" && data.length === 0) {
        setNoJoinedCommunities(joinedCommunities.length === 0);
      } else {
        setNoJoinedCommunities(false);
      }

      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, token, joinedCommunities]);

  // Trigger post loading when tab changes or on component mount
  useEffect(() => {
    // Redirect to landing page if not authenticated for protected tabs
    if (!token && (activeTab === "following" || activeTab === "communities")) {
      console.warn("No auth token found! Redirecting to landing page...");
      navigation.navigate('Landing');
      return;
    }

    loadPosts();
  }, [activeTab, token, navigation, loadPosts]);

  // Handle retry action
  const handleRetry = () => {
    loadPosts();
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };

  if (!token && (activeTab === "following" || activeTab === "communities")) return null;

  const renderPost = ({ item }: { item: PostType }) => (
    <Post key={item.id} post={item} />
  );

  const renderError = () => (
    <View className="p-4 bg-yellow-50 dark:bg-yellow-900 mx-4 rounded-xl mb-4 flex-row items-center">
      <View className="flex-1">
        <Text className="text-yellow-800 dark:text-yellow-300">{error}</Text>
      </View>
      <TouchableOpacity
        onPress={handleRetry}
        className="ml-2 bg-yellow-200 dark:bg-yellow-800 px-3 py-1 rounded-md"
      >
        <View className="flex-row items-center">
          <RefreshCw name="refresh-cw" size={16} color="#92400e" className="mr-2" />
          <Text className="text-yellow-800 dark:text-yellow-300">Retry</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    let message = "No posts available in your feed.";
    
    if (activeTab === "following" && notFollowingAnyone) {
      message = "Follow a user or join a community to see posts here";
    } else if (activeTab === "communities" && noJoinedCommunities) {
      message = "Join a community to see posts here";
    }

    return (
      <View className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl mx-4 my-8 items-center">
        <Text className="text-gray-500 dark:text-gray-400 mb-4 text-center">{message}</Text>
        <TouchableOpacity 
          onPress={handleRetry} 
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-md flex-row items-center"
        >
          <RefreshCw name="refresh-cw" size={16} color="gray" className="mr-2" />
          <Text className="text-gray-700 dark:text-gray-300">Refresh Feed</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* Error message at the top */}
      {error && renderError()}

      {loading && !refreshing ? (
        <View className="my-6 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-500 dark:text-gray-400">Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={postData}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3B82F6']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100, // Add bottom padding for navigation
          }}
          ItemSeparatorComponent={() => <View className="h-4" />}
        />
      )}
    </View>
  );
};

export default PostList;