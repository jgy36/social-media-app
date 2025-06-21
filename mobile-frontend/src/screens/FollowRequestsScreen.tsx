// src/screens/FollowRequestsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import {
  getFollowRequests,
  approveFollowRequest,
  rejectFollowRequest,
  type FollowRequest,
} from "@/api/followRequests";

const FollowRequestsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setError(null);
      const data = await getFollowRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching follow requests:", err);
      setError("Could not load follow requests");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: number) => {
    try {
      await approveFollowRequest(requestId);
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error("Error accepting follow request:", err);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectFollowRequest(requestId);
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error("Error rejecting follow request:", err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const renderRequest = ({ item }: { item: FollowRequest }) => (
    <View className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center">
        <AuthorAvatar username={item.username} size={48} />

        <View className="flex-1 ml-3">
          <Text className="font-semibold text-gray-900 dark:text-white">
            {item.displayName || item.username}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            @{item.username}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(item.requestedAt).toLocaleDateString()}
          </Text>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleReject(item.id)}
            className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-gray-700 dark:text-gray-300 font-medium">
              Decline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAccept(item.id)}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <MaterialIcons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Follow Requests
          </Text>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">
            Loading requests...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-center text-lg font-medium mt-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchRequests()}
            className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <MaterialIcons name="person-add" size={64} color="#6B7280" />
          <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
            No Pending Requests
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
            When someone requests to follow your private account, their requests
            will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default FollowRequestsScreen;
