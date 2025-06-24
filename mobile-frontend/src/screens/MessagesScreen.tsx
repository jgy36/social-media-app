// src/screens/MessagesScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  getUnreadPhotoMessages,
  getPhotoMessageConversations,
} from "@/api/photoMessages";
import { getUserMatches } from "@/api/dating";
import { PhotoMessage } from "@/api/photoMessages";

interface PhotoMessageConversation {
  userId: number;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  unreadCount: number;
  lastMessageAt: string;
}

const MessagesScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const [unreadMessages, setUnreadMessages] = useState<PhotoMessage[]>([]);
  const [conversations, setConversations] = useState<
    PhotoMessageConversation[]
  >([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load unread photo messages
      const unread = await getUnreadPhotoMessages();
      setUnreadMessages(unread);

      // Load conversations
      const convos = await getPhotoMessageConversations();
      setConversations(convos);

      // Load matches for sending photos
      const userMatches = await getUserMatches();
      setMatches(userMatches);
    } catch (error) {
      console.error("Failed to load messages data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => {
    navigation.navigate("PhotoCamera");
  };

  const openPhotoMessage = (photoMessage: PhotoMessage) => {
    navigation.navigate("PhotoViewer", { photoMessageId: photoMessage.id });
  };

  const openConversation = (userId: number) => {
    navigation.navigate("PhotoConversation", { userId });
  };

  const renderUnreadMessage = ({ item }: { item: PhotoMessage }) => (
    <TouchableOpacity
      className="items-center mr-4"
      onPress={() => openPhotoMessage(item)}
    >
      {/* Red Square for Unread */}
      <View className="w-16 h-16 bg-red-500 rounded-lg items-center justify-center mb-2 relative">
        <MaterialIcons name="photo" size={24} color="white" />

        {/* Sender Avatar (small overlay) */}
        <View className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-black">
          <Image
            source={{
              uri:
                item.sender.profileImageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sender.username}`,
            }}
            className="w-full h-full rounded-full"
          />
        </View>
      </View>

      <Text
        className="text-white text-xs text-center max-w-16"
        numberOfLines={1}
      >
        {item.sender.displayName || item.sender.username}
      </Text>
    </TouchableOpacity>
  );

  const renderConversation = ({ item }: { item: PhotoMessageConversation }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-800"
      onPress={() => openConversation(item.userId)}
    >
      {/* Profile Image */}
      <Image
        source={{
          uri:
            item.profileImageUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
        }}
        className="w-12 h-12 rounded-full mr-3"
      />

      {/* Conversation Info */}
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">
          {item.displayName || item.username}
        </Text>
        <Text className="text-gray-400 text-sm">
          {item.unreadCount > 0
            ? `${item.unreadCount} new photo${item.unreadCount > 1 ? "s" : ""}`
            : "Tap to send a photo"}
        </Text>
      </View>

      {/* Unread Indicator */}
      {item.unreadCount > 0 && (
        <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {item.unreadCount > 9 ? "9+" : item.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMatch = ({ item }: { item: any }) => {
    // Determine which user is the other person
    const otherUser = item.user1.id === user.id ? item.user2 : item.user1;

    return (
      <TouchableOpacity
        className="items-center mr-4"
        onPress={() => openConversation(otherUser.id)}
      >
        {/* Match Avatar */}
        <View className="w-16 h-16 rounded-full border-2 border-pink-500 p-1 mb-2">
          <Image
            source={{
              uri:
                otherUser.profileImageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.username}`,
            }}
            className="w-full h-full rounded-full"
          />
        </View>

        <Text
          className="text-white text-xs text-center max-w-16"
          numberOfLines={1}
        >
          {otherUser.displayName || otherUser.username}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading messages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <Text className="text-xl font-bold text-white">Snap</Text>

        <TouchableOpacity
          onPress={openCamera}
          className="w-10 h-10 bg-pink-500 rounded-full items-center justify-center"
        >
          <MaterialIcons name="camera-alt" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Unread Photo Messages */}
        {unreadMessages.length > 0 && (
          <View className="py-4">
            <Text className="text-white font-semibold text-lg px-4 mb-3">
              Unread Snaps
            </Text>
            <FlatList
              data={unreadMessages}
              renderItem={renderUnreadMessage}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Matches (for sending photos) */}
        {matches.length > 0 && (
          <View className="py-4 border-b border-gray-800">
            <Text className="text-white font-semibold text-lg px-4 mb-3">
              Your Matches
            </Text>
            <FlatList
              data={matches}
              renderItem={renderMatch}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Photo Message Conversations */}
        <View className="py-4">
          <Text className="text-white font-semibold text-lg px-4 mb-3">
            Conversations
          </Text>

          {conversations.length === 0 ? (
            <View className="items-center py-8">
              <MaterialIcons name="photo-camera" size={48} color="#6B7280" />
              <Text className="text-gray-400 text-base mt-4 text-center px-8">
                No conversations yet. Send a photo to your matches to get
                started!
              </Text>

              <TouchableOpacity
                onPress={openCamera}
                className="bg-pink-500 rounded-full px-6 py-3 mt-4"
              >
                <Text className="text-white font-semibold">Take Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={conversations}
              renderItem={renderConversation}
              keyExtractor={(item) => item.userId.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MessagesScreen;
