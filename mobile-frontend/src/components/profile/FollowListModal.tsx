import { MaterialIcons } from "@expo/vector-icons";
// src/components/profile/FollowListModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { getUserFollowers, getUserFollowing } from "@/api/users";
import FollowButton from "@/components/profile/FollowButton";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Define your navigation params type if you haven't already
type RootStackParamList = {
  Profile: { username: string };
  // Add other screens here as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface User {
  id: number;
  username: string;
  isFollowing: boolean;
  profileImage?: string;
  displayName?: string;
  bio?: string;
}

interface FollowListModalProps {
  userId: number;
  listType: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// Simple skeleton loader component
const SkeletonLoader = () => (
  <View className="flex-row items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
    {/* Profile image skeleton */}
    <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />

    {/* Text content skeleton */}
    <View className="flex-1 gap-2">
      <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-20" />
    </View>

    {/* Follow button skeleton */}
    <View className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
  </View>
);

const FollowListModal = ({
  userId,
  listType,
  isOpen,
  onClose,
  title,
}: FollowListModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<NavigationProp>();
  const currentUserId = useSelector((state: RootState) => state.user.id);

  // Load users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;

      setLoading(true);
      setError(null);

      try {
        let userData: User[] = [];

        if (listType === "followers") {
          userData = (await getUserFollowers(userId, 1)) as User[];
        } else {
          userData = (await getUserFollowing(userId)) as User[];
        }

        setUsers(userData);
      } catch (err) {
        console.error(`Error fetching ${listType}:`, err);
        setError(`Failed to load ${listType}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, listType]);

  // Handle when someone is followed/unfollowed
  const handleFollowChange = (userId: number, isFollowing: boolean) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isFollowing } : user
      )
    );
  };

  // Handle navigation to a user profile
  const navigateToProfile = (username: string) => {
    navigation.navigate("Profile", { username });
    onClose();
  };

  // Generate modal title
  const modalTitle =
    title || `${listType === "followers" ? "Followers" : "Following"}`;

  const renderUser = ({ item: user }: { item: User }) => (
    <View className="flex-row items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
      <Pressable
        className="flex-row items-center gap-3 flex-1"
        onPress={() => navigateToProfile(user.username)}
      >
        <Image
          source={{
            uri:
              user.profileImage ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1">
          <Text className="font-medium text-black dark:text-white">
            {user.displayName || user.username}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            @{user.username}
          </Text>
        </View>
      </Pressable>

      {user.id !== currentUserId && (
        <FollowButton
          userId={user.id}
          initialIsFollowing={user.isFollowing}
          size="sm"
          onFollowChange={(isFollowing) =>
            handleFollowChange(user.id, isFollowing)
          }
        />
      )}
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80%]">
              {/* Header */}
              <View className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <View>
                  <Text className="text-lg font-semibold text-black dark:text-white">
                    {modalTitle}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {listType === "followers"
                      ? "People who follow this account"
                      : "People this account follows"}
                  </Text>
                </View>

                <Pressable onPress={onClose} className="p-2">
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </Pressable>
              </View>

              {/* Content */}
              {loading ? (
                <View>
                  {[...Array(5)].map((_, i) => (
                    <SkeletonLoader key={i} />
                  ))}
                </View>
              ) : error ? (
                <View className="flex-1 items-center justify-center p-8">
                  <Text className="text-red-600 dark:text-red-400 text-center mb-2">
                    {error}
                  </Text>
                  <Pressable
                    onPress={() => setLoading(true)}
                    className="px-4 py-2 bg-blue-500 rounded-lg"
                  >
                    <Text className="text-white">Try Again</Text>
                  </Pressable>
                </View>
              ) : users.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                  <Text className="text-gray-600 dark:text-gray-400 text-center">
                    {listType === "followers"
                      ? "No followers yet"
                      : "Not following anyone yet"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={users}
                  renderItem={renderUser}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FollowListModal;
