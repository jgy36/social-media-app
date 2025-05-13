// components/community/CommunityTabs.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Post from "@/components/feed/Post";
import { PostType } from "@/types/post";

interface CommunityTabsProps {
  posts: PostType[];
}

const CommunityTabs = ({ posts }: CommunityTabsProps) => {
  const [activeTab, setActiveTab] = useState("posts");

  // Sort posts based on active tab
  const getSortedPosts = () => {
    if (activeTab === "hot") {
      return [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (activeTab === "trending") {
      return [...posts].sort((a, b) => {
        const aComments = a.commentsCount ?? 0;
        const bComments = b.commentsCount ?? 0;
        return bComments - aComments;
      });
    }
    return posts;
  };

  const sortedPosts = getSortedPosts();

  const tabs = [
    { id: "posts", label: "Posts", icon: "chatbubble-outline" },
    { id: "hot", label: "Hot", icon: "flame-outline" },
    { id: "trending", label: "Trending", icon: "trending-up-outline" },
  ];

  const renderPost = ({ item }: { item: PostType }) => {
    // Ensure required properties are present for the Post component
    const postWithDefaults = {
      ...item,
      isLiked: item.isLiked || false,
      author: item.author || 'Unknown User',
      likes: item.likes || 0,
      commentsCount: item.commentsCount || 0,
      createdAt: item.createdAt || new Date().toISOString(),
    };

    return <Post key={item.id} post={postWithDefaults} />;
  };

  return (
    <View className="flex-1">
      {/* Tab Headers */}
      <View className="flex-row bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 flex-row items-center justify-center py-4 ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500"
                  : ""
              }`}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.id ? "#3B82F6" : "#6B7280"} 
                style={{ marginRight: 8 }} 
              />
              <Text 
                className={`font-medium ${
                  activeTab === tab.id 
                    ? "text-blue-500" 
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {sortedPosts.length > 0 ? (
          <FlatList
            data={sortedPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        ) : (
          <EmptyState
            icon={<Ionicons name="chatbubble-outline" size={48} color="#6B7280" />}
            title={
              activeTab === "trending" 
                ? "No trending posts yet" 
                : activeTab === "hot"
                ? "No hot posts yet"
                : "No posts yet"
            }
            description={
              activeTab === "trending"
                ? "Posts with the most comments will appear here."
                : activeTab === "hot"
                ? "Popular posts will appear here."
                : "Be the first to post in this community!"
            }
          />
        )}
      </View>
    </View>
  );
};

// Helper component for empty states
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const EmptyState = ({ icon, title, description, buttonText, onButtonPress }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center py-8 px-4">
    <View className="mb-4">
      {icon}
    </View>
    <Text className="text-lg font-medium text-gray-900 dark:text-white mb-1 text-center">
      {title}
    </Text>
    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
      {description}
    </Text>
    {buttonText && onButtonPress && (
      <TouchableOpacity 
        className="mt-4 bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-md"
        onPress={onButtonPress}
      >
        <Text className="text-white font-medium">{buttonText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default CommunityTabs;