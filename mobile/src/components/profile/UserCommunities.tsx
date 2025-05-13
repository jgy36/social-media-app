import { MaterialIcons } from '@expo/vector-icons';
// src/components/profile/UserCommunities.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from '@react-navigation/native';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import { getAllCommunities } from "@/api/communities";

interface Community {
  id: string;
  name: string;
  members: number;
  color?: string;
}

// Custom Skeleton component
const SkeletonCard = () => (
  <View className="mb-3 p-3 rounded-md bg-gray-50 dark:bg-gray-800">
    <View className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
    <View className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
  </View>
);

const UserCommunities = () => {
  const [communityDetails, setCommunityDetails] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<any>>();

  const joinedCommunityIds = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  const featuredCommunityIds = useSelector(
    (state: RootState) => state.communities.featuredCommunities
  );

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      if (joinedCommunityIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allCommunities = await getAllCommunities();

        // Filter to joined communities
        const joinedCommunities = allCommunities
          .filter((community) => joinedCommunityIds.includes(community.id))
          .map((community) => ({
            id: community.id,
            name: community.name,
            members: community.members,
            color: community.color,
          }));

        setCommunityDetails(joinedCommunities);
      } catch (error) {
        console.error("Error fetching community details:", error);

        // Fallback if API fails
        setCommunityDetails(
          joinedCommunityIds.map((id) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            members: 0,
            color: "#333333",
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityDetails();
  }, [joinedCommunityIds]);

  // Navigate to communities (handle different possible route names)
  const navigateToCommunities = () => {
    try {
      (navigation as any).navigate('Community');
    } catch (error) {
      // Try alternative route names if 'Community' doesn't work
      try {
        (navigation as any).navigate('Communities');
      } catch {
        console.error('Could not navigate to communities page');
      }
    }
  };

  const navigateToCommunityDetail = (communityId: string) => {
    try {
      (navigation as any).navigate('CommunityDetail', { id: communityId });
    } catch (error) {
      // Try alternative route names
      try {
        (navigation as any).navigate('Community', { id: communityId });
      } catch {
        console.error('Could not navigate to community detail');
      }
    }
  };

  // If no communities, display a message
  if (!loading && joinedCommunityIds.length === 0) {
    return (
      <View className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg">
        <View className="flex-row items-center mb-4">
          <MaterialIcons name="group" size={20} color="#6b7280" />
          <Text className="text-xl font-semibold text-black dark:text-white">
            Your Communities
          </Text>
        </View>
        <View className="items-center py-4">
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-3">
            You haven't joined any communities yet.
          </Text>
          <Pressable
            onPress={navigateToCommunities}
            className="bg-blue-500 rounded-lg px-4 py-2"
          >
            <Text className="text-white font-medium">Browse Communities</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Display top 5 communities
  const displayCommunities = communityDetails
    // Prioritize featured communities
    .sort((a, b) => {
      const aFeatured = featuredCommunityIds.includes(a.id);
      const bFeatured = featuredCommunityIds.includes(b.id);

      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return 0;
    })
    // Limit to first 5
    .slice(0, 5);

  const renderCommunity = ({ item: community }: { item: Community }) => (
    <Pressable
      onPress={() => navigateToCommunityDetail(community.id)}
      className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 flex-row justify-between items-center mb-3"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: community.color || "#3b82f6",
      }}
    >
      <View>
        <Text className="font-medium text-black dark:text-white">
          {community.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="group" size={12} color="#6b7280" />
          <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">
            {community.members.toLocaleString()} members
          </Text>
        </View>
      </View>

      <MaterialIcons name="open-in-new" size={16} color="#6b7280" />
    </Pressable>
  );

  return (
    <View className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="group" size={20} color="#6b7280" />
        <Text className="text-xl font-semibold text-black dark:text-white ml-2">
          Your Top Communities
        </Text>
      </View>

      {loading ? (
        <View>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <>
          <FlatList
            data={displayCommunities}
            renderItem={renderCommunity}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />

          {/* Link to view all communities if more than 5 */}
          {joinedCommunityIds.length > 5 && (
            <View className="items-center mt-4">
              <Pressable
                onPress={navigateToCommunities}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full"
              >
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  View all {joinedCommunityIds.length} communities
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default UserCommunities;