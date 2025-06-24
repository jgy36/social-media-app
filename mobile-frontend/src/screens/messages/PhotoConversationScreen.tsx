// src/screens/messages/PhotoConversationScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getPhotoMessageConversation } from "@/api/photoMessages";
import { users } from "@/api";

interface PhotoMessage {
  id: number;
  sender: {
    id: number;
    username: string;
    displayName: string;
  };
  recipient: {
    id: number;
    username: string;
    displayName: string;
  };
  photoUrl: string;
  sentAt: string;
  expiresAt: string;
  isViewed: boolean;
  viewCount: number;
  maxViews: number;
}

const PhotoConversationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: number };
  const currentUser = useSelector((state: RootState) => state.user);

  const [messages, setMessages] = useState<PhotoMessage[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversation();
    loadOtherUserInfo();
  }, []);

  const loadConversation = async () => {
    try {
      const conversation = await getPhotoMessageConversation(userId);
      setMessages(conversation);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOtherUserInfo = async () => {
    try {
      // You'll need to implement this API call to get user info
      // const userInfo = await users.getUserById(userId);
      // setOtherUser(userInfo);

      // Placeholder for now
      setOtherUser({
        id: userId,
        username: `user${userId}`,
        displayName: `User ${userId}`,
      });
    } catch (error) {
      console.error("Failed to load user info:", error);
    }
  };

  const handlePhotoPress = (message: PhotoMessage) => {
    if (message.recipient.id === currentUser.id && !isExpired(message)) {
      // This is a message sent to us and it's not expired
      navigation.navigate("PhotoViewer", { photoMessageId: message.id });
    } else if (isExpired(message)) {
      Alert.alert("Expired", "This photo message has expired");
    } else {
      Alert.alert("Sent", "You sent this photo");
    }
  };

  const isExpired = (message: PhotoMessage) => {
    return new Date() > new Date(message.expiresAt);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const renderMessage = ({ item: message }: { item: PhotoMessage }) => {
    const isSentByMe = message.sender.id === currentUser.id;
    const expired = isExpired(message);

    return (
      <View
        className={`flex-row mb-4 ${
          isSentByMe ? "justify-end" : "justify-start"
        }`}
      >
        {!isSentByMe && (
          <Image
            source={{
              uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.username}`,
            }}
            className="w-8 h-8 rounded-full mr-2 mt-1"
          />
        )}

        <TouchableOpacity
          onPress={() => handlePhotoPress(message)}
          className="max-w-xs"
        >
          <View
            className={`w-32 h-48 rounded-lg overflow-hidden ${
              expired
                ? "bg-gray-800"
                : isSentByMe
                ? "bg-blue-500"
                : "bg-red-500"
            }`}
          >
            {expired ? (
              <View className="flex-1 items-center justify-center">
                <MaterialIcons name="timer-off" size={32} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs mt-2">Expired</Text>
              </View>
            ) : !message.isViewed && !isSentByMe ? (
              <View className="flex-1 items-center justify-center">
                <MaterialIcons name="photo" size={32} color="white" />
                <Text className="text-white text-xs mt-2 font-semibold">
                  TAP TO VIEW
                </Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center relative">
                <MaterialIcons name="photo" size={32} color="white" />
                <Text className="text-white text-xs mt-2">
                  {isSentByMe
                    ? message.isViewed
                      ? "Viewed"
                      : "Sent"
                    : `${message.viewCount}/${message.maxViews}`}
                </Text>
              </View>
            )}
          </View>

          <Text
            className={`text-xs mt-1 ${
              isSentByMe ? "text-right text-gray-400" : "text-gray-400"
            }`}
          >
            {formatTime(message.sentAt)}
          </Text>
        </TouchableOpacity>

        {isSentByMe && (
          <Image
            source={{
              uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
            }}
            className="w-8 h-8 rounded-full ml-2 mt-1"
          />
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <MaterialIcons name="photo-camera" size={80} color="#6B7280" />
      <Text className="text-white text-xl font-semibold mt-6 mb-2">
        No Photos Yet
      </Text>
      <Text className="text-gray-400 text-base text-center px-8 leading-6">
        Send a photo to start your conversation! Photos disappear after being
        viewed.
      </Text>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("PhotoCamera", { recipientId: userId })
        }
        className="bg-pink-500 rounded-full px-6 py-3 mt-6"
      >
        <Text className="text-white font-semibold">Take Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Image
            source={{
              uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                otherUser?.username || "default"
              }`,
            }}
            className="w-10 h-10 rounded-full mr-3"
          />

          <View className="flex-1">
            <Text className="text-white font-semibold text-lg">
              {otherUser?.displayName || otherUser?.username || "User"}
            </Text>
            <Text className="text-gray-400 text-sm">
              Tap photos to view • Photos disappear after viewing
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PhotoCamera", { recipientId: userId })
          }
          className="w-10 h-10 bg-pink-500 rounded-full items-center justify-center ml-2"
        >
          <MaterialIcons name="camera-alt" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Loading conversation...</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              padding: 16,
              flexGrow: 1,
            }}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            inverted={messages.length > 0} // Show newest at bottom
          />
        )}
      </View>

      {/* Bottom Info */}
      <View className="px-4 py-2 border-t border-gray-800">
        <Text className="text-center text-gray-500 text-xs">
          Photos disappear after 24 hours • Screenshots notify sender
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PhotoConversationScreen;
