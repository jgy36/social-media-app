// src/components/messages/MessageNotificationIndicator.tsx
import { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MessageSquare } from "react-native-vector-icons/Feather";
import { getUnreadMessagesCount } from "@/api/messages";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface MessageNotificationIndicatorProps {
  className?: string;
  showCount?: boolean;
}

const MessageNotificationIndicator = ({
  className,
  showCount = true,
}: MessageNotificationIndicatorProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const count = await getUnreadMessagesCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch on mount and set poll interval
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadCount();

    // Poll every minute for new messages
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  // Don't show anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View className={`relative ${className || ""}`}>
      <MessageSquare name="message-square" size={24} color="gray" />
      {showCount && !loading && unreadCount > 0 && (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
      {loading && (
        <View className="absolute -top-1 -right-1">
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}
    </View>
  );
};

export default MessageNotificationIndicator;
