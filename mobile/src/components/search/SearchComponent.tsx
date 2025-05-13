import { MaterialIcons } from '@expo/vector-icons';
// src/components/search/SearchComponent.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, FlatList, Text } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSearchAll } from "@/hooks/useApi";
import { debounce } from "lodash";

interface SearchResult {
  id: string | number;
  type: "user" | "community" | "hashtag";
  name: string;
  username?: string;
  description?: string;
  members?: number;
  followers?: number;
  postCount?: number;
}

interface SearchComponentProps {
  initialQuery?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigation = useNavigation();
  const { execute: searchAll } = useSearchAll();

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);

    try {
      const searchResults = await searchAll(searchQuery);
      
      if (Array.isArray(searchResults)) {
        const transformedResults: SearchResult[] = searchResults.map((item) => ({
          id: item.id || "",
          type: item.type as "user" | "community" | "hashtag",
          name: item.name || item.username || item.tag || "",
          username: item.username,
          description: item.description || item.bio || "",
          members: item.members,
          followers: item.followersCount,
          postCount: item.postCount || item.count,
        }));
        setResults(transformedResults);
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const debouncedSearch = debounce(performSearch, 300);

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    setShowResults(false);
    
    switch (result.type) {
      case "user":
        const username = result.username && !result.username.includes(" ")
          ? result.username
          : result.id;
        navigation.navigate('Profile', { username });
        break;
      case "community":
        navigation.navigate('Community', { id: result.id });
        break;
      case "hashtag":
        const hashtagId = typeof result.name === "string" && result.name.startsWith("#")
          ? result.name.substring(1)
          : result.name;
        navigation.navigate('Hashtag', { id: hashtagId });
        break;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-5 w-5 text-blue-500" />;
      case "community":
        return <Users className="h-5 w-5 text-green-500" />;
      case "hashtag":
        return <Hash className="h-5 w-5 text-purple-500" />;
      default:
        return <Search className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-100"
      onPress={() => handleSelectResult(item)}
    >
      <View className="mr-3">{getIcon(item.type)}</View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{item.name}</Text>
        {item.description && (
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="relative">
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
        <Search className="h-4 w-4 text-gray-500 mr-2" />
        <TextInput
          placeholder="Search users, communities, hashtags..."
          value={query}
          onChangeText={setQuery}
          onFocus={() => setShowResults(true)}
          className="flex-1 text-gray-900"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.trim() !== "" && (
          <TouchableOpacity onPress={clearSearch}>
            <X className="h-4 w-4 text-gray-500" />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (query.trim() !== "" || results.length > 0) && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          {isSearchLoading ? (
            <View className="p-4">
              <Text className="text-center text-gray-500">Searching...</Text>
            </View>
          ) : results.length === 0 ? (
            <View className="p-4">
              <Text className="text-center text-gray-500">No results found</Text>
            </View>
          ) : (
            <FlatList
              data={results.slice(0, 10)}
              renderItem={renderSearchResult}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 300 }}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default SearchComponent;