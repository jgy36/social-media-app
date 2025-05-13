import { MaterialIcons } from '@expo/vector-icons';
// src/screens/community/CommunitiesListScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { joinCommunity, leaveCommunity } from "@/redux/slices/communitySlice";
import LoadingState from "@/components/ui/LoadingState";

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
      router.push("/community/create");
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
        { text: "Login", onPress: () => router.push("/login") }
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
    router.push(`/community/${communityId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <LoadingState message="Loading communities..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-background">
        <View className="max-w-6xl mx-auto p-6">
          <Card className="shadow-md">
            <CardContent className="p-4">
              <Text className="text-destructive font-medium text-lg mb-2">Error</Text>
              <Text className="mb-4">{error}</Text>
              <Button onPress={handleRefresh} className="mt-2">
                <Text>Retry</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </View>
    );
  }

  const renderCommunityCard = ({ item: community }: { item: Community }) => (
    <TouchableOpacity
      onPress={() => navigateToCommunity(community.id)}
      className="mb-4"
    >
      <Card
        className="shadow-sm border-l-4 mx-2"
        style={{
          borderLeftColor: community.color || "var(--primary)",
        }}
      >
        <CardContent className="p-6">
          {/* Top row with name and join button */}
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-lg font-medium flex-1 pr-2" numberOfLines={1}>
              {community.name}
            </Text>

            <Button
              variant={community.isJoined ? "outline" : "default"}
              size="sm"
              onPress={(e) => {
                e.stopPropagation();
                handleJoinCommunity(community.id);
              }}
            >
              <Text>{community.isJoined ? "Joined" : "Join"}</Text>
            </Button>
          </View>

          {/* Trending badge */}
          {community.trending && (
            <View className="mb-2">
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                <Text>Trending</Text>
              </Badge>
            </View>
          )}

          {/* Description */}
          <View className="mb-2">
            <Text className="text-sm text-muted-foreground" numberOfLines={2}>
              {community.description}
            </Text>
          </View>

          {/* Members count */}
          <View className="flex-row items-center">
            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {community.members.toLocaleString()} members
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Communities</Text>
            <Text className="text-muted-foreground">
              Join discussions with like-minded individuals
            </Text>
          </View>

          <Button onPress={handleCreateButtonClick}>
            <Plus className="h-4 w-4 mr-2" />
            <Text>Create</Text>
          </Button>
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
          />
        ) : (
          <View className="flex-1 justify-center items-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <Text className="text-lg font-medium mb-2 text-foreground">No Communities Found</Text>
            <Text className="text-muted-foreground mb-4">
              There are no communities available
            </Text>
            <Button onPress={handleCreateButtonClick}>
              <Text>Create a Community</Text>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};

export default CommunitiesListScreen;