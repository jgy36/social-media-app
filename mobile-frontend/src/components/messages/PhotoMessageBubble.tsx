// src/components/messages/PhotoMessageBubble.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface PhotoMessageBubbleProps {
  message: any;
  isFromCurrentUser: boolean;
  onPress: () => void;
}

const PhotoMessageBubble: React.FC<PhotoMessageBubbleProps> = ({
  message,
  isFromCurrentUser,
  onPress,
}) => {
  const isExpired = new Date() > new Date(message.expiresAt);
  const isUnread = !message.isViewed && !isFromCurrentUser;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-3 ${isFromCurrentUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`w-32 h-48 rounded-lg overflow-hidden ${
          isExpired
            ? "bg-gray-800"
            : isUnread
            ? "bg-red-500"
            : isFromCurrentUser
            ? "bg-blue-500"
            : "bg-gray-700"
        }`}
      >
        {isExpired ? (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="timer-off" size={32} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs mt-2">Expired</Text>
          </View>
        ) : isUnread ? (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="photo" size={32} color="white" />
            <Text className="text-white text-xs mt-2 font-semibold">
              TAP TO VIEW
            </Text>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <MaterialIcons name="photo" size={32} color="white" />
            <Text className="text-white text-xs mt-2">
              {isFromCurrentUser ? "Sent" : "Viewed"}
            </Text>
          </View>
        )}
      </View>

      <Text className="text-gray-400 text-xs mt-1">
        {new Date(message.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  );
};

export default PhotoMessageBubble;
