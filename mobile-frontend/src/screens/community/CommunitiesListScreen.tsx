import { MaterialIcons } from "@expo/vector-icons";
// src/screens/community/CommunitiesListScreen.tsx - Modern X-style Design
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
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

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.137.1:8080/api";

const CommunitiesListScreen = () => {
  const navigation = useNavigation();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    []
  );
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
      (navigation as any).navigate("CreateCommunity");
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
      const communitiesWithTrending = response.data.map((community, index) => ({
        ...community,
        trending: index < 2,
        // Set isJoined based on Redux state
        isJoined: joinedCommunityIds.includes(community.id),
      }));

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
        { text: "Login", onPress: () => (navigation as any).navigate("Login") },
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
    (navigation as any).navigate("CommunityDetail", { id: communityId });
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#1d9bf0" />
        <Text className="mt-4 text-gray-400 text-sm">
          Loading communities...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-black">
        <View className="p-6">
          <View className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
            <MaterialIcons name="error-outline" size={32} color="#ef4444" />
            <Text className="text-red-400 font-medium text-base mb-2">
              Error
            </Text>
            <Text className="text-gray-300 mb-4 text-sm">{error}</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-blue-600 px-4 py-2 rounded-lg items-center"
            >
              <Text className="text-white font-medium text-sm">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const renderCommunityCard = ({ item: community }: { item: Community }) => (
    <TouchableOpacity
      onPress={() => navigateToCommunity(community.id)}
      className="border-b border-gray-800 px-4 py-4"
    >
      <View className="flex-row justify-between items-start">
        {/* Left content */}
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <Text className="text-white font-semibold text-base flex-1">
              {community.name}
            </Text>
            {/* Trending badge */}
            {community.trending && (
              <View className="bg-orange-600 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-white text-xs font-medium">Trending</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text
            className="text-gray-300 text-sm mb-2 leading-5"
            numberOfLines={2}
          >
            {community.description}
          </Text>

          {/* Members count */}
          <View className="flex-row items-center">
            <MaterialIcons name="group" size={14} color="#71767b" />
            <Text className="text-gray-400 text-xs ml-1">
              {community.members.toLocaleString()} members
            </Text>
          </View>
        </View>

        {/* Right side - Join button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleJoinCommunity(community.id);
          }}
          className="border border-gray-600 px-4 py-1.5 rounded-full"
          style={{
            backgroundColor: community.isJoined ? "#1d9bf0" : "transparent",
            borderColor: community.isJoined ? "#1d9bf0" : "#536471",
          }}
        >
          <Text
            className="font-medium text-sm"
            style={{
              color: community.isJoined ? "#ffffff" : "#ffffff",
            }}
          >
            {community.isJoined ? "Joined" : "Join"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black">
      {/* Header - X-style */}
      <View className="bg-black/95 backdrop-blur-md pt-12 pb-4 px-4 border-b border-gray-800">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">Communities</Text>
            <Text className="text-gray-400 text-sm">
              Join discussions with like-minded individuals
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateButtonClick}
            className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center"
          >
            <MaterialIcons name="add" size={18} color="white" />
            <Text className="text-white font-medium ml-1 text-sm">Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredCommunities.length > 0 ? (
        <FlatList
          data={filteredCommunities}
          renderItem={renderCommunityCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#71767b"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center py-12 px-4">
          <MaterialIcons name="group" size={48} color="#71767b" />
          <Text className="text-lg font-medium text-white mb-2">
            No Communities Found
          </Text>
          <Text className="text-gray-400 text-center mb-4 text-sm">
            There are no communities available
          </Text>
          <TouchableOpacity
            onPress={handleCreateButtonClick}
            className="bg-blue-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-medium text-sm">
              Create a Community
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CommunitiesListScreen;
