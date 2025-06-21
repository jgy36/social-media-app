// src/components/feed/PostList.tsx
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Post from "./Post";
import { PostType } from "@/types/post";
import { MaterialIcons } from "@expo/vector-icons";
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
  const [noJoinedCommunities, setNoJoinedCommunities] =
    useState<boolean>(false);

  const token = useSelector((state: RootState) => state.user.token);

  // Get joined communities from Redux
  const joinedCommunities = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );

  const loadPosts = useCallback(
    async (isRefresh = false) => {
      // If we're on protected tabs with no auth, show appropriate message instead of redirecting
      if (
        (!token && activeTab === "following") ||
        (!token && activeTab === "communities")
      ) {
        setLoading(false);
        setRefreshing(false);

        if (activeTab === "following") {
          setNotFollowingAnyone(true);
        } else if (activeTab === "communities") {
          setNoJoinedCommunities(true);
        }
        return;
      }

      if (!isRefresh) setLoading(true);
      setError(null);

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
        const data = await posts.getPosts(endpoint);

        const isFallbackData =
          data.length > 0 &&
          data.some((post) => post.author === "NetworkIssue");

        if (isFallbackData) {
          setError("Connection issue detected. Showing cached content.");
        }

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
    },
    [activeTab, token, joinedCommunities]
  );

  useEffect(() => {
    loadPosts();
  }, [activeTab, token, loadPosts]);

  const handleRetry = () => {
    loadPosts();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };

  const renderPost = ({ item }: { item: PostType }) => (
    <Post key={item.id} post={item} />
  );

  const renderError = () => (
    <View className="mx-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
      <View className="flex-row items-start">
        <MaterialIcons name="warning" size={20} color="#F59E0B" />
        <View className="flex-1 ml-3">
          <Text className="text-yellow-800 dark:text-yellow-200 font-medium">
            Connection Issue
          </Text>
          <Text className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
            {error}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRetry}
          className="bg-yellow-100 dark:bg-yellow-800/50 px-3 py-2 rounded-lg"
        >
          <View className="flex-row items-center">
            <MaterialIcons name="refresh" size={16} color="#D97706" />
            <Text className="text-yellow-800 dark:text-yellow-200 text-sm ml-1 font-medium">
              Retry
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    let message = "No posts available in your feed.";
    let actionText = "Refresh Feed";
    let icon = "post-add";

    // Show login message for protected tabs when not authenticated
    if (!token && (activeTab === "following" || activeTab === "communities")) {
      message = "Please log in to view this content";
      actionText = "Login Required";
      icon = "login";
    } else if (activeTab === "following" && notFollowingAnyone) {
      message = "Follow users or join communities to see posts here";
      actionText = "Explore";
      icon = "explore";
    } else if (activeTab === "communities" && noJoinedCommunities) {
      message = "Join communities to see posts here";
      actionText = "Browse Communities";
      icon = "group-add";
    }

    return (
      <View className="mx-4 my-8 bg-white dark:bg-gray-900 rounded-2xl p-8 items-center shadow-sm border border-gray-200 dark:border-gray-700">
        <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
          <MaterialIcons name={icon as any} size={32} color="#6B7280" />
        </View>

        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
          {!token && (activeTab === "following" || activeTab === "communities")
            ? "Login Required"
            : "No Posts Yet"}
        </Text>

        <Text className="text-gray-500 dark:text-gray-400 mb-6 text-center leading-relaxed">
          {message}
        </Text>

        {/* Only show retry button if authenticated or if not on protected tabs */}
        {(token ||
          (activeTab !== "following" && activeTab !== "communities")) && (
          <TouchableOpacity
            onPress={handleRetry}
            className="bg-blue-500 dark:bg-blue-600 px-6 py-3 rounded-xl flex-row items-center shadow-sm"
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text className="text-white font-medium ml-2">{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLoadingState = () => (
    <View className="mx-4 my-8 items-center">
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-8 items-center shadow-sm border border-gray-200 dark:border-gray-700">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
          Loading posts...
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Error message at the top */}
      {error && renderError()}

      {loading && !refreshing ? (
        renderLoadingState()
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
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 100, // Add bottom padding for navigation
          }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={5}
          windowSize={10}
        />
      )}
    </View>
  );
};

export default PostList;
