// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { getUnifiedSearchResults } from "@/api/search";
import { SearchResult } from "@/types/search";
import AuthorAvatar from "@/components/shared/AuthorAvatar";

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Calculate counts for each tab
  const tabCounts = {
    all: results.length,
    user: results.filter(r => r.type === "user").length,
    community: results.filter(r => r.type === "community").length,
    hashtag: results.filter(r => r.type === "hashtag").length,
    post: results.filter(r => r.type === "post").length,
  };

  // Perform search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await getUnifiedSearchResults(query);
      
      // Transform results to match the SearchResult interface
      const transformedResults: SearchResult[] = searchResults.map((result) => {
        const baseResult: SearchResult = {
          id: result.id || result.username || result.tag || 0,
          type: result.type,
          name: result.name || result.username || result.tag || "",
          username: result.username,
        };

        switch (result.type) {
          case "user":
            return {
              ...baseResult,
              description: result.bio || `@${result.username || baseResult.name}`,
              followers: result.followersCount || 0,
            };
          case "community":
            return {
              ...baseResult,
              description: result.description || "",
              members: result.members || 0,
            };
          case "hashtag":
            const tagName = result.tag || result.name || "";
            return {
              ...baseResult,
              name: tagName.startsWith("#") ? tagName : `#${tagName}`,
              description: `${result.count || result.postCount || 0} posts with this hashtag`,
              postCount: result.count || result.postCount || 0,
            };
          case "post":
            return {
              ...baseResult,
              content: result.content || "",
              author: result.author || result.username || "Unknown",
              timestamp: result.createdAt
                ? new Date(result.createdAt).toLocaleDateString()
                : "",
            };
          default:
            return baseResult;
        }
      });

      setResults(transformedResults);
    } catch (error) {
      console.error("Error performing search:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter results based on active tab
  const filteredResults = activeTab === "all" 
    ? results 
    : results.filter((result) => result.type === activeTab);

  // Handle result press
  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case "user":
        (navigation as any).navigate('Profile', { username: result.username || result.name });
        break;
      case "community":
        (navigation as any).navigate('CommunityDetail', { id: result.id });
        break;
      case "hashtag":
        const tag = result.name.startsWith('#') ? result.name.substring(1) : result.name;
        (navigation as any).navigate('Hashtag', { tag });
        break;
      case "post":
        (navigation as any).navigate('PostDetail', { postId: result.id });
        break;
    }
  };

  // Render search result item
  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      onPress={() => handleResultPress(item)}
      className="bg-white dark:bg-gray-900 p-4 border-b border-gray-100 dark:border-gray-700"
    >
      <View className="flex-row items-center">
        {/* Icon or Avatar */}
        <View className="mr-3">
          {item.type === "user" ? (
            <AuthorAvatar username={item.username || item.name} size={40} />
          ) : item.type === "community" ? (
            <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
              <MaterialIcons name="group" size={24} color="white" />
            </View>
          ) : item.type === "hashtag" ? (
            <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
              <MaterialIcons name="tag" size={24} color="white" />
            </View>
          ) : (
            <View className="w-10 h-10 bg-purple-500 rounded-full items-center justify-center">
              <MaterialIcons name="article" size={24} color="white" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white">
            {item.name}
          </Text>
          {item.description && (
            <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.content && (
            <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1" numberOfLines={2}>
              {item.content}
            </Text>
          )}
          
          {/* Stats */}
          <View className="flex-row mt-2">
            {item.type === "user" && item.followers !== undefined && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.followers} followers
              </Text>
            )}
            {item.type === "community" && item.members !== undefined && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.members} members
              </Text>
            )}
            {item.type === "hashtag" && item.postCount !== undefined && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.postCount} posts
              </Text>
            )}
            {item.type === "post" && item.timestamp && (
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.timestamp}
              </Text>
            )}
          </View>
        </View>

        <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  // Tab component
  const TabButton = ({ id, label, count }: { id: string; label: string; count: number }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(id)}
      className={`flex-1 py-3 items-center ${
        activeTab === id ? 'border-b-2 border-blue-500' : ''
      }`}
    >
      <Text className={`font-medium ${
        activeTab === id ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
      }`}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const handleRefresh = () => {
    if (searchQuery.trim()) {
      setRefreshing(true);
      performSearch(searchQuery).finally(() => setRefreshing(false));
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Search</Text>
        
        {/* Search Input */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3">
          <MaterialIcons name="search" size={24} color="#6B7280" />
          <TextInput
            className="flex-1 py-3 px-3 text-gray-900 dark:text-white"
            placeholder="Search for users, communities, hashtags..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="clear" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      {searchQuery.length > 0 && (
        <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row">
            <TabButton id="all" label="All" count={tabCounts.all} />
            <TabButton id="user" label="Users" count={tabCounts.user} />
            <TabButton id="community" label="Communities" count={tabCounts.community} />
            <TabButton id="hashtag" label="Hashtags" count={tabCounts.hashtag} />
            <TabButton id="post" label="Posts" count={tabCounts.post} />
          </View>
        </View>
      )}

      {/* Results */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="search" size={48} color="#6B7280" />
            <Text className="mt-4 text-gray-500 dark:text-gray-400">Searching...</Text>
          </View>
        ) : searchQuery.length > 0 ? (
          filteredResults.length > 0 ? (
            <FlatList
              data={filteredResults}
              renderItem={renderResultItem}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 items-center justify-center p-8">
              <MaterialIcons name="search-off" size={48} color="#6B7280" />
              <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                No results found
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                Try adjusting your search or browse different categories
              </Text>
            </View>
          )
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <MaterialIcons name="search" size={48} color="#6B7280" />
            <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
              Search for anything
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
              Find users, communities, hashtags, and posts
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchScreen;