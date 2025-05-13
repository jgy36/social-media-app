// src/components/notifications/NotificationDisplay.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Notification } from '@/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, Heart, UserPlus, AtSign, Bell, Mail,
  Globe, MessageCircle, CheckCircle, XCircle 
} from 'react-native-vector-icons/Feather';

interface NotificationDisplayProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ 
  notification, 
  onPress 
}) => {
  // Format time since notification
  const timeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "a while ago";
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    const iconProps = { size: 20 };
    
    switch (notification.notificationType) {
      case 'comment_created':
      case 'comment_reply':
        return <MessageSquare name="message-square" color="#3B82F6" {...iconProps} />;
      case 'like':
        return <Heart name="heart" color="#EF4444" {...iconProps} />;
      case 'mention':
        return <AtSign name="at-sign" color="#8B5CF6" {...iconProps} />;
      case 'follow':
        return <UserPlus name="user-plus" color="#10B981" {...iconProps} />;
      case 'follow_request':
        return <UserPlus name="user-plus" color="#F59E0B" {...iconProps} />;
      case 'follow_request_approved':
        return <CheckCircle name="check-circle" color="#10B981" {...iconProps} />;
      case 'follow_request_rejected':
        return <XCircle name="x-circle" color="#6B7280" {...iconProps} />;
      case 'direct_message':
        return <Mail name="mail" color="#6366F1" {...iconProps} />;
      case 'community_update':
        return <Globe name="globe" color="#0D9488" {...iconProps} />;
      default:
        return <Bell name="bell" color="#6B7280" {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className="py-3 px-4 border-b border-gray-200 dark:border-gray-700"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View className="mr-3 mt-1">
          {getIcon()}
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-900 dark:text-white">
            {notification.message}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {timeAgo(notification.createdAt)}
          </Text>
        </View>
        {!notification.read && (
          <View className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-2" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationDisplay;