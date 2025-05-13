// src/components/profile/FollowRequests.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient } from '@/api/apiClient';

interface FollowRequest {
  id: number;
  userId: number;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  requestedAt: string;
}

const FollowRequests = () => {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const fetchFollowRequests = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<FollowRequest[]>('/follow/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching follow requests:', error);
      setError('Failed to load follow requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await apiClient.post(`/follow/requests/${requestId}/approve`);
      
      // Update local state by removing the approved request
      setRequests(prev => prev.filter(request => request.id !== requestId));
      
      Alert.alert(
        "Follow request approved",
        "This user can now see your posts and activity"
      );
    } catch (error) {
      console.error('Error approving follow request:', error);
      Alert.alert(
        "Error",
        "Failed to approve follow request"
      );
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await apiClient.post(`/follow/requests/${requestId}/reject`);
      
      // Update local state by removing the rejected request
      setRequests(prev => prev.filter(request => request.id !== requestId));
      
      Alert.alert(
        "Follow request rejected",
        "This user won't be able to see your posts"
      );
    } catch (error) {
      console.error('Error rejecting follow request:', error);
      Alert.alert(
        "Error",
        "Failed to reject follow request"
      );
    }
  };

  const navigateToProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const renderRequest = ({ item: request }: { item: FollowRequest }) => (
    <View className="flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
      <Pressable 
        className="flex-row items-center gap-3 flex-1"
        onPress={() => navigateToProfile(request.username)}
      >
        <Image
          source={{ 
            uri: request.profileImageUrl || 
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.username}` 
          }}
          className="w-12 h-12 rounded-full"
        />
        <View>
          <Text className="font-medium text-black dark:text-white">
            {request.displayName || request.username}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            @{request.username}
          </Text>
        </View>
      </Pressable>
      
      <View className="flex-row gap-2">
        <Pressable 
          onPress={() => handleApprove(request.id)}
          className="bg-blue-500 rounded-lg px-3 py-2 flex-row items-center gap-1"
        >
          <MaterialIcons name="person-add" size={16} color="white" />
          <Text className="text-white font-medium">Approve</Text>
        </Pressable>
        
        <Pressable 
          onPress={() => handleReject(request.id)}
          className="bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2 flex-row items-center gap-1"
        >
          <MaterialIcons name="person-remove" size={16} color="#6b7280" />
          <Text className="text-gray-700 dark:text-gray-300 font-medium">Reject</Text>
        </Pressable>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="p-4 bg-white dark:bg-gray-900 rounded-lg">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-black dark:text-white">
            Follow Requests
          </Text>
        </View>
        <View className="flex-row items-center justify-center py-6">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="ml-2 text-gray-600 dark:text-gray-400">Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4 bg-white dark:bg-gray-900 rounded-lg">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-black dark:text-white">
            Follow Requests
          </Text>
        </View>
        <View className="flex-row items-center justify-center py-6">
          <MaterialIcons name="error-outline" size={24} color="#dc2626" />
          <Text className="ml-2 text-red-600 dark:text-red-400">{error}</Text>
        </View>
        <Pressable 
          onPress={fetchFollowRequests}
          className="mt-4 bg-blue-500 rounded-lg px-4 py-2 items-center"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="p-4 bg-white dark:bg-gray-900 rounded-lg">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="person-add" size={20} color="#6b7280" />
          <Text className="text-lg font-semibold text-black dark:text-white">
            Follow Requests
          </Text>
          {requests.length > 0 && (
            <View className="bg-blue-500 rounded-full w-6 h-6 items-center justify-center ml-2">
              <Text className="text-white text-xs font-semibold">
                {requests.length}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {requests.length === 0 ? (
        <View className="items-center py-8">
          <MaterialIcons name="people-outline" size={48} color="#9ca3af" />
          <Text className="text-center text-gray-600 dark:text-gray-400 mt-2">
            No pending follow requests
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
};

export default FollowRequests;