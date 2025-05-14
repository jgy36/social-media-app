import { MaterialIcons } from '@expo/vector-icons';
// src/screens/community/CommunitiesListScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import axios from "axios";

import { joinCommunity, leaveCommunity } from "@/redux/slices/communitySlice";

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  isJoined: boolean;
  color?: string;
  trending?: boolean;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const CommunitiesListScreen = () => {
  const navigation = useNavigation();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user);
  const joinedCommunityIds = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  const isAuthenticated = !!currentUser.token;
  const userRole = useSelector((state: RootState) => state.user.role);
  const isAdmin = userRole === "ADMIN";

  const handleCreateButtonClick = () => {
    if (isAdmin) {
      (navigation as any).navigate('CreateCommunity');
    } else {
      Alert.alert(
        "Permission Denied",
        "Only administrator accounts can create new communities."
      );
    }
  };

  const fetchCommunities = async () => {
    try {
      console.log("Fetching communities as public endpoint");
      const response = await axios.get<Community[]>(
        `${API_BASE_URL}/communities`
      );

      console.log("Communities data received:", response.data);

      // Mark top 2 communities as trending
      const communitiesWithTrending = response.data.map(
        (community, index) => ({
          ...community,
          trending: index < 2,
          // Set isJoined based on Redux state
          isJoined: joinedCommunityIds.includes(community.id),
        })
      );

      setCommunities(communitiesWithTrending);
      setFilteredCommunities(communitiesWithTrending);
      setError(null);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities. Please try again later.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchCommunities().finally(() => setIsLoading(false));
  }, [joinedCommunityIds]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCommunities();
    setIsRefreshing(false);
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to join communities", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => (navigation as any).navigate('Login') }
      ]);
      return;
    }

    try {
      const community = communities.find((c) => c.id === communityId);
      if (!community) return;

      // Update local state optimistically
      setCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined,
              members: c.isJoined ? c.members - 1 : c.members + 1,
            };
          }
          return c;
        })
      );

      setFilteredCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined,
              members: c.isJoined ? c.members - 1 : c.members + 1,
            };
          }
          return c;
        })
      );

      if (community.isJoined) {
        // Leave community
        await axios.delete(`${API_BASE_URL}/communities/${communityId}/leave`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        dispatch(leaveCommunity(communityId));
      } else {
        // Join community
        await axios.post(
          `${API_BASE_URL}/communities/${communityId}/join`,
          {},
          {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          }
        );
        dispatch(joinCommunity(communityId));
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);
      
      // Revert local state if API call fails
      setCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined,
              members: !c.isJoined ? c.members - 1 : c.members + 1,
            };
          }
          return c;
        })
      );

      setFilteredCommunities((prevCommunities) =>
        prevCommunities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              isJoined: !c.isJoined,
              members: !c.isJoined ? c.members - 1 : c.members + 1,
            };
          }
          return c;
        })
      );

      Alert.alert("Error", "Failed to update community membership");
    }
  };

  const navigateToCommunity = (communityId: string) => {
    console.log(`Navigating to community: ${communityId}`);
    (navigation as any).navigate('CommunityDetail', { id: communityId });
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading communities...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-background">
        <View className="p-6">
          <View className="bg-white dark:bg-gray-900 p-6 rounded-lg">
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text className="text-red-500 font-medium text-lg mb-2">Error</Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-4">{error}</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-blue-500 px-4 py-2 rounded-lg items-center"
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const renderCommunityCard = ({ item: community }: { item: Community }) => (
    <TouchableOpacity
      onPress={() => navigateToCommunity(community.id)}
      className="mb-4 mx-4"
    >
      <View
        className="bg-white dark:bg-gray-900 rounded-lg p-6 border-l-4"
        style={{
          borderLeftColor: community.color || "#3B82F6",
        }}
      >
        {/* Top row with name and join button */}
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-medium text-gray-900 dark:text-white flex-1 pr-2" numberOfLines={1}>
            {community.name}
          </Text>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleJoinCommunity(community.id);
            }}
            className={`px-4 py-2 rounded-lg ${
              community.isJoined 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'bg-blue-500'
            }`}
          >
            <Text className={`font-medium ${
              community.isJoined 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-white'
            }`}>
              {community.isJoined ? "Joined" : "Join"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trending badge */}
        {community.trending && (
          <View className="mb-3">
            <View className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full flex-row items-center self-start">
              <MaterialIcons name="trending-up" size={12} color="#F97316" />
              <Text className="text-orange-800 dark:text-orange-200 text-xs font-medium ml-1">Trending</Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View className="mb-3">
          <Text className="text-sm text-gray-600 dark:text-gray-400" numberOfLines={2}>
            {community.description}
          </Text>
        </View>

        {/* Members count */}
        <View className="flex-row items-center">
          <MaterialIcons name="group" size={16} color="#6B7280" />
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {community.members.toLocaleString()} members
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">Communities</Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Join discussions with like-minded individuals
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateButtonClick}
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1">Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredCommunities.length > 0 ? (
        <FlatList
          data={filteredCommunities}
          renderItem={renderCommunityCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center py-12 px-4">
          <MaterialIcons name="group" size={64} color="#6B7280" />
          <Text className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Communities Found</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-4">
            There are no communities available
          </Text>
          <TouchableOpacity
            onPress={handleCreateButtonClick}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Create a Community</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CommunitiesListScreen;