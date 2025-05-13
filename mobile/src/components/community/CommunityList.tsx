import { MaterialIcons } from '@expo/vector-icons';
// src/components/community/CommunityList.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";

import { Button } from "@/components/ui/button";
import {
  getAllCommunities,
  joinCommunity,
  leaveCommunity,
} from "@/api/communities";
import { updateUserCommunities } from "@/redux/slices/communitySlice";
import CommunityCard from "./CommunityCard";
import JoinedCommunityCard from "./JoinedCommunityCard";
import CommunitySearch from "./CommunitySearch";

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  trending?: boolean;
  category?: string;
  color?: string;
  isJoined?: boolean;
}

const CommunityList = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinedStatus, setJoinedStatus] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const userCommunities = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  const isAuthenticated = !!user.token;

  const fetchCommunities = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllCommunities();
      const withTrending = data.map((community, index) => ({
        ...community,
        trending: index < 2,
      }));

      setCommunities(withTrending);
      setFilteredCommunities(withTrending);

      const statusMap: Record<string, boolean> = {};
      withTrending.forEach((community) => {
        statusMap[community.id] = userCommunities.includes(community.id);
      });
      setJoinedStatus(statusMap);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [userCommunities]);

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(
        (community) =>
          community.name.toLowerCase().includes(query.toLowerCase()) ||
          community.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!isAuthenticated) {
      navigation.navigate('Login', { 
        redirect: `community/${communityId}`
      });
      return;
    }

    const isCurrentlyJoined = joinedStatus[communityId];

    // Optimistic update
    setJoinedStatus((prev) => ({
      ...prev,
      [communityId]: !isCurrentlyJoined,
    }));

    try {
      let success: boolean;

      if (isCurrentlyJoined) {
        const response = await leaveCommunity(communityId);
        success = response.success;
        if (success) {
          dispatch(
            updateUserCommunities(
              userCommunities.filter((id) => id !== communityId)
            )
          );
        }
      } else {
        const response = await joinCommunity(communityId);
        success = response.success;
        if (success) {
          dispatch(updateUserCommunities([...userCommunities, communityId]));
        }
      }

      if (!success) {
        // Revert on failure
        setJoinedStatus((prev) => ({
          ...prev,
          [communityId]: isCurrentlyJoined,
        }));
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);
      setJoinedStatus((prev) => ({
        ...prev,
        [communityId]: isCurrentlyJoined,
      }));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  if (loading && !refreshing) {
    return (
      <View className="p-4">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="h-24 w-full bg-gray-200 rounded-lg mb-4 animate-pulse" />
        ))}
      </View>
    );
  }

  return (
    <ScrollView 
      className="p-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <CommunitySearch onSearch={handleSearch} />

      {error && (
        <View className="bg-red-100 p-3 rounded-md text-red-700 mb-4">
          <Text>{error}</Text>
        </View>
      )}

      <View className="space-y-3">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={() => handleJoinCommunity(community.id)}
              isJoined={joinedStatus[community.id] || false}
            />
          ))
        ) : (
          <View className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <Text className="text-lg font-medium mb-2">No Communities Found</Text>
            <Text className="text-gray-500 mb-4">
              No communities available right now
            </Text>
            <Button
              onPress={() => navigation.navigate('CreateCommunity')}
            >
              Create a Community
            </Button>
          </View>
        )}
      </View>

      {/* Your Communities Section */}
      {isAuthenticated && (
        <View className="mt-8">
          <Text className="text-sm font-medium text-gray-500 mb-3">
            YOUR COMMUNITIES
          </Text>

          {Object.entries(joinedStatus).filter(([, isJoined]) => isJoined).length > 0 ? (
            <View className="space-y-3">
              {communities
                .filter((community) => joinedStatus[community.id])
                .map((community) => (
                  <JoinedCommunityCard
                    key={`joined-${community.id}`}
                    community={community}
                    onLeave={() => handleJoinCommunity(community.id)}
                  />
                ))}
            </View>
          ) : (
            <View className="text-center py-8">
              <Text className="text-gray-500">
                You haven't joined any communities yet
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default CommunityList;