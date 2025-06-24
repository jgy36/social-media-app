// src/screens/ExploreScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSearchAll } from "@/hooks/useApi";
import { searchHashtags } from "@/api/search";
import { ApiSearchResult } from "@/types/search";

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "trending" | "people" | "hashtags"
  >("trending");
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([]);

  const { loading: searchLoading, execute: search } = useSearchAll();

  useEffect(() => {
    // Load trending hashtags on mount
    loadTrendingHashtags();
  }, []);

  const loadTrendingHashtags = async () => {
    try {
      const hashtags = await searchHashtags(""); // Get trending hashtags
      setTrendingHashtags(hashtags.slice(0, 10)); // Top 10
    } catch (error) {
      console.error("Failed to load trending hashtags:", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      const results = await search(query);
      setSearchResults(results || []);
    } else {
      setSearchResults([]);
    }
  };

  const renderSearchResult = ({ item }: { item: ApiSearchResult }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-800"
      onPress={() => {
        if (item.type === "user") {
          navigation.navigate("UserProfile", { username: item.username || "" });
        } else if (item.type === "hashtag") {
          navigation.navigate("Hashtag", { tag: item.title || "" });
        } else if (item.type === "community") {
          navigation.navigate("CommunityDetail", {
            id: item.id?.toString() || "",
          });
        }
      }}
    >
      {/* Avatar/Icon */}
      <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center mr-3">
        {item.type === "user" && item.profileImageUrl ? (
          <Image
            source={{ uri: item.profileImageUrl }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <MaterialIcons
            name={
              item.type === "user"
                ? "person"
                : item.type === "hashtag"
                ? "tag"
                : item.type === "community"
                ? "group"
                : "search"
            }
            size={24}
            color="#9CA3AF"
          />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{item.title}</Text>
        {item.subtitle && (
          <Text className="text-gray-400 text-sm mt-1">{item.subtitle}</Text>
        )}
        <Text className="text-gray-500 text-xs mt-1 capitalize">
          {item.type}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  const renderTrendingHashtag = (hashtag: string) => (
    <TouchableOpacity
      key={hashtag}
      className="bg-gray-800 rounded-full px-4 py-2 mr-2 mb-2"
      onPress={() => navigation.navigate("Hashtag", { tag: hashtag })}
    >
      <Text className="text-white text-sm">#{hashtag}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-800">
        <Text className="text-xl font-bold text-white mb-4">Explore</Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-900 rounded-full px-4 py-3">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            placeholder="Search users, hashtags, communities..."
            placeholderTextColor="#6B7280"
            className="flex-1 ml-3 text-white text-base"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {searchQuery.length > 0 ? (
          // Search Results
          <View className="flex-1">
            <Text className="text-gray-400 text-sm px-4 py-2">
              {searchLoading
                ? "Searching..."
                : `${searchResults.length} results`}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          // Explore Content
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Tab Selector */}
            <View className="flex-row px-4 py-3 border-b border-gray-800">
              {["trending", "people", "hashtags"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab as any)}
                  className={`mr-6 pb-2 ${
                    activeTab === tab ? "border-b-2 border-pink-500" : ""
                  }`}
                >
                  <Text
                    className={`text-base font-medium capitalize ${
                      activeTab === tab ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Trending Hashtags */}
            {activeTab === "trending" && (
              <View className="p-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  Trending Now
                </Text>
                <View className="flex-row flex-wrap">
                  {trendingHashtags.map(renderTrendingHashtag)}
                </View>
              </View>
            )}

            {/* Suggested People */}
            {activeTab === "people" && (
              <View className="p-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  People You May Know
                </Text>
                <Text className="text-gray-400 text-center py-8">
                  Coming soon! We'll suggest people based on your interests.
                </Text>
              </View>
            )}

            {/* Popular Hashtags */}
            {activeTab === "hashtags" && (
              <View className="p-4">
                <Text className="text-white text-lg font-semibold mb-4">
                  Popular Hashtags
                </Text>
                <View className="flex-row flex-wrap">
                  {trendingHashtags.map(renderTrendingHashtag)}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ExploreScreen;
